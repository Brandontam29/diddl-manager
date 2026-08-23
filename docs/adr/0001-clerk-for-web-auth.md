# Clerk for web app auth

The web app (`apps/website`) uses Clerk for authentication, even though the rest of
the data stack is Neon. Neon's own auth product was considered first but rejected:
Neon has already deprecated one auth offering ("Legacy Neon Auth", Stack-Auth-based,
closed to new projects) and its successor is beta, so the auth provider was chosen
for stability over stack purity. Clerk has no official Solid SDK — integration is
vanilla `@clerk/clerk-js` (prebuilt components mounted from a thin hand-rolled Solid
provider) plus `@clerk/backend` `authenticateRequest()` in server middleware; the
community Solid packages are unmaintained (one npm repo link is repojacked) and are
deliberately not dependencies.

## Consequences

- No local users table and no webhooks: app tables scope rows by a `user_id text`
  column taken from server-side auth, and the profile row is lazy-upserted on first
  authenticated request. User data soft-deletes; nothing cascades from Clerk.
- Swapping providers later means touching the provider layer and re-mapping
  `user_id` values — meaningful cost once real users exist.

## Amendment (2026-08-22)

`@clerk/ui` joins `@clerk/clerk-js` as a direct dependency: from clerk-js 6.29 the
prebuilt components live in that package and must be passed to `clerk.load({ ui })`,
otherwise `mountSignIn` no-ops. Both are used via their `/no-rhc` builds so the UI is
bundled instead of fetched from Clerk's CDN at runtime. Still vanilla Clerk — no
community Solid wrapper.
