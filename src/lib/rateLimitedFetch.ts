const REQUEST_TIMEOUT_MS = 15_000;

export const rateLimitedFetch: typeof fetch = (input, init) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const signal = init?.signal;

  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener('abort', () => controller.abort(), { once: true });
    }
  }

  return fetch(input, {
    ...init,
    cache: 'no-store',
    signal: controller.signal,
  }).finally(() => clearTimeout(timeout));
};
