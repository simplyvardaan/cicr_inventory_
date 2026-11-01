#!/usr/bin/env python3
"""Probe the local API surface and write redacted, bounded JSONL results.

The default target is the local development server. Requests are intentionally
validation-oriented and do not submit valid state-changing payloads.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


DEFAULT_BASE_URL = "http://127.0.0.1:3000"
DEFAULT_LOG = "SECURITY-AUDIT-ENDPOINTS.jsonl"
MAX_RESPONSE_BYTES = 16_384
REDACTED_HEADERS = {"authorization", "cookie", "set-cookie", "x-api-key"}
SECRET_PATTERN = re.compile(
    r"(?i)(bearer\s+|(?:password|token|secret|api[_-]?key)\s*[=:]\s*)[^\s,;\"}]+"
)

CASES: tuple[dict[str, Any], ...] = (
    {"name": "accounts-method-check", "method": "GET", "path": "/api/accounts"},
    {"name": "accounts-invalid-body", "method": "POST", "path": "/api/accounts", "body": {}},
    {"name": "database-unauthenticated-read", "method": "GET", "path": "/api/db?route=%2Frest%2Fv1%2Fprofiles"},
)


def redact(value: str) -> str:
    return SECRET_PATTERN.sub(r"\1[REDACTED]", value)


def response_headers(headers: Any) -> dict[str, str]:
    result: dict[str, str] = {}
    for key, value in headers.items():
        result[key.lower()] = "[REDACTED]" if key.lower() in REDACTED_HEADERS else redact(str(value))
    return result


def read_bounded(response: Any) -> str:
    content = response.read(MAX_RESPONSE_BYTES + 1)
    suffix = " [truncated]" if len(content) > MAX_RESPONSE_BYTES else ""
    return redact(content[:MAX_RESPONSE_BYTES].decode("utf-8", errors="replace")) + suffix


def run_case(base_url: str, case: dict[str, Any], timeout: float) -> dict[str, Any]:
    url = f"{base_url.rstrip('/')}{case['path']}"
    body = case.get("body")
    data = json.dumps(body).encode("utf-8") if body is not None else None
    headers = {"accept": "application/json"}
    if data is not None:
        headers["content-type"] = "application/json"
    request = Request(url, data=data, headers=headers, method=case["method"])
    started = time.monotonic()
    result: dict[str, Any] = {
        "case": case["name"],
        "method": case["method"],
        "url": url,
        "request_body": body,
        "started_at": datetime.now(timezone.utc).isoformat(),
    }
    try:
        with urlopen(request, timeout=timeout) as response:
            result.update(
                {
                    "status": response.status,
                    "headers": response_headers(response.headers),
                    "body": read_bounded(response),
                    "ok": True,
                }
            )
    except HTTPError as error:
        result.update(
            {
                "status": error.code,
                "headers": response_headers(error.headers),
                "body": read_bounded(error),
                "ok": False,
            }
        )
    except (TimeoutError, URLError, OSError) as error:
        result.update({"error": str(error), "ok": False})
    result["duration_ms"] = round((time.monotonic() - started) * 1000, 2)
    return result


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL)
    parser.add_argument("--log", type=Path, default=Path(DEFAULT_LOG))
    parser.add_argument("--timeout", type=float, default=5.0)
    parser.add_argument(
        "--allow-external",
        action="store_true",
        help="Permit a non-loopback base URL; use only with explicit authorization.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    base_url = args.base_url.rstrip("/")
    if not args.allow_external and not base_url.startswith(("http://127.0.0.1", "http://localhost", "http://[::1]")):
        print("Refusing non-local target without --allow-external.", file=sys.stderr)
        return 2
    if args.timeout <= 0:
        print("--timeout must be positive.", file=sys.stderr)
        return 2

    args.log.parent.mkdir(parents=True, exist_ok=True)
    with args.log.open("a", encoding="utf-8") as log:
        for case in CASES:
            result = run_case(base_url, case, args.timeout)
            log.write(json.dumps(result, sort_keys=True) + "\n")
            log.flush()
            print(f"{result['method']} {result['url']} -> {result.get('status', result.get('error'))}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
