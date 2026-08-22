# Clerk auth: provider, sign-in/up routes, server middleware

Type: task
Status: open
Blocked by: 20 (closed 2026-08-21 — unblocked)

## Question

Implement spec.md §4: the hand-rolled Solid Clerk provider over `@clerk/clerk-js`, `/sign-in/$` and `/sign-up/$` routes mounting the prebuilt components, the `_authed` pathless layout under `/app` (`ssr: false`, `beforeLoad` redirect with `redirect` search param), and the `@clerk/backend` `authenticateRequest()` server-function middleware exposing `ctx.userId` and throwing UNAUTHORIZED. HITL: the user creates the Clerk development instance and supplies the keys for `.env.local`.

Done when: A signed-out visit to `/app` redirects to sign-in; after email or Google sign-in `/app` renders with the user's id visible from a trivial authed server function.
