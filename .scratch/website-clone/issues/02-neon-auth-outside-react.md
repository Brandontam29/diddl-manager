# Neon Auth outside React

Type: research
Status: resolved

## Question

Neon Auth's SDK story is React/Next-centric (built on Stack Auth). How do you
integrate it into a SolidStart app? Specifically:

- What Neon Auth actually provisions (users table in the Neon database? JWTs? session
  cookies?) and which parts are framework-agnostic.
- The non-React integration surface: REST API, `@stackframe/js` or equivalent
  framework-agnostic SDK, OAuth (Google) + email/password flows without React
  components.
- How to validate a session server-side in SolidStart server functions (JWKS, token
  verification, cookie handling under SSR).
- How Neon Auth exposes the user record for foreign keys from app tables
  (`neon_auth.users_sync` or equivalent — schema, sync latency caveats).
- If the integration is unreasonably rough: what the pragmatic alternative is while
  still using Neon as the database (e.g. Better Auth against Neon Postgres).

Primary sources: neon.tech docs, Stack Auth docs, their GitHub repos.

Feeds the "Auth architecture" decision (issue 06).

## Answer

Full findings: [research/02-neon-auth-outside-react.md](../research/02-neon-auth-outside-react.md)
(also on branch `research/neon-auth-outside-react`, commit b78999a).

The question's premise was stale: as of 2026, Neon Auth is no longer the Stack Auth
wrapper — it is **Managed Better Auth**, a hosted Better Auth service that writes
users/sessions directly into the database's `neon_auth` schema. (The Stack Auth
version is archived as "Legacy Neon Auth", closed to new projects.)

- SolidStart integration is reasonable: plain REST API plus framework-agnostic SDK
  entry points (`@neondatabase/auth/vanilla` and a Web-standards `./server` toolkit);
  since it speaks Better Auth's protocol, `better-auth/solid` +
  `better-auth/solid-start` also work directly.
- Server-side session validation: either proxy auth through a catch-all API route for
  first-party session cookies + `getSession()` with request headers, or stateless JWT
  verification via `jose` against `<NEON_AUTH_URL>/.well-known/jwks.json`
  (EdDSA, 15-minute tokens).
- App tables can foreign-key straight to `neon_auth."user"(id)` (uuid) with no sync
  latency — the old `users_sync` <1s-delay caveats were legacy-only.
- Only the prebuilt UI package is React-locked; sign-in/up forms are hand-written
  Solid. Fallback if the beta SDK disappoints: self-hosted Better Auth on Neon
  Postgres — a hosting decision, not a different stack.
