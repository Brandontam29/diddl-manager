# Clerk in a Solid / TanStack Start app

Type: research
Status: resolved

## Question

The user chose **Clerk** for auth (replacing Neon Auth). Clerk's first-party SDKs
are React/Next-centric — establish the integration path for a Solid app on TanStack
Start:

- Official support: does Clerk ship anything for Solid or TanStack Start
  (@clerk/tanstack-react-start exists for React — is there a framework-agnostic
  path)? Status of ClerkJS (@clerk/clerk-js) vanilla: mounting sign-in/up components
  without React, session handling.
- Community package `clerk-solidjs` (or successors): maintenance status, Solid
  version support.
- Server-side: verifying Clerk sessions in server functions with @clerk/backend
  (authenticateRequest, JWKS) — cookie names, middleware shape, SSR token handling.
- Email + Google flows; whether Clerk's dev-instance OAuth works without the user
  provisioning Google credentials (production requirements noted separately —
  the user can hand-provision if needed).
- Database linkage: referencing the Clerk user id (text) from app tables with no
  local users table, and whether webhooks/user-sync to Neon are needed for this
  app's shape (profiles table keyed by Clerk user id).
- Pricing sanity check at hobby scale (free-tier MAU limits).

Primary sources: clerk.com docs, Clerk GitHub, npm.

Feeds "Auth architecture" (issue 06).

## Answer

Full findings: [research/17-clerk-in-solid.md](../research/17-clerk-in-solid.md)
(also on branch `research/clerk-in-solid`, commit 35e5d5e).

- **No official Clerk SDK for Solid or TanStack Start (Solid)** —
  `@clerk/tanstack-react-start` peers hard on React. Recommended path: vanilla
  `@clerk/clerk-js` (6.29.2, actively released) mounting the prebuilt sign-in/up
  components imperatively inside a thin hand-rolled Solid provider.
- **Server side**: `@clerk/backend` (3.16.9) `authenticateRequest()` in server
  middleware, reading the forwarded `__session` cookie; leave `acceptsToken` at its
  session-token default.
- **Community packages are reference code only**: `clerk-solidjs` (last release
  Jan 2025, pins backend ^1.x, targets SolidStart not TanStack) and beta
  `clerk-solidjs-tanstack-start` (v0.0.3, self-described not production-ready).
  Caution: the `clerk-solidjs` npm repo link now points at a repojacked
  "Proof of Concept" repo — the real one is `spiritledsoftware/clerk-solidjs`.
- **Google OAuth**: dev instances ship shared Google credentials with zero Google
  Cloud setup; production needs the user's own verified client (they've said they
  can hand-provision).
- **Database linkage**: skip a local users table and webhooks entirely — scope
  tables with a `user_id text` column taken from server-side auth, and lazy-upsert
  the profile row on first authenticated request.
- **Pricing**: MRU-based — free to 50k retained users, Pro at $25/mo.
