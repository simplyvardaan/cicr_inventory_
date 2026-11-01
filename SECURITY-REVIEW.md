# Security Review

## Scope

This focused review covered `./src`, including the authorization state used by
`src/context/AuthContext.tsx` and `src/components/dashboard/UserDashboard.tsx`.
The related server endpoint in `api/accounts.ts` was inspected to verify the
security boundary.

## Finding 1: User-controlled metadata can grant administrator access

- **Severity:** High
- **Confidence:** 9/10
- **Category:** Broken access control / privilege escalation
- **Affected source:** `src/context/AuthContext.tsx:862-869`,
  `src/components/dashboard/UserDashboard.tsx:43-50`, and
  `api/accounts.ts:21-35`

The client treats `user.user_metadata.role === 'admin'` as an administrator
signal. The server-side `requireAdmin` check also accepts the same
`user_metadata.role` value before consulting the `profiles` table. Because user
metadata is writable through the authenticated Supabase client, an ordinary
authenticated user may set their own metadata role to `admin`.

That crosses the authorization boundary into the service-role-backed account
management endpoint. The attacker can then invoke the `role`, `approve`, or
`reject` actions and modify other users' roles or account status.

### Preconditions

1. The attacker has any authenticated account.
2. The attacker updates their Supabase user metadata to `{ "role": "admin" }`.
3. The attacker sends a bearer-authenticated request to `/api/accounts`.

### Impact

An ordinary user can escalate to administrator privileges and perform account
management operations, including promoting other users and approving or
rejecting accounts.

### Recommended fix

Make the server-side profile or database authorization state the sole
authority. In `api/accounts.ts`, do not accept `user_metadata.role` as proof
of administrator access; require an approved `profiles.role = 'admin'` value,
preferably enforced through a trusted database function. Client-side
`isAdmin` checks should remain UI-only and must not be treated as
authorization.

### Validation needed

Confirm in the deployed Supabase project, using a disposable test account,
that ordinary users can call `auth.updateUser({ data: { role: 'admin' } })` and
that the deployed `/api/accounts` endpoint matches the reviewed implementation.
