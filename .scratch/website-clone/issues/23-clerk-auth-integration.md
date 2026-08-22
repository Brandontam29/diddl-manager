# Clerk auth: provider, sign-in/up routes, server middleware

Type: task
Status: open
Blocked by: 20 (closed 2026-08-21 — unblocked)

## Question

Implement spec.md §4: the hand-rolled Solid Clerk provider over `@clerk/clerk-js`, `/sign-in/$` and `/sign-up/$` routes mounting the prebuilt components, the `_authed` pathless layout under `/app` (`ssr: false`, `beforeLoad` redirect with `redirect` search param), and the `@clerk/backend` `authenticateRequest()` server-function middleware exposing `ctx.userId` and throwing UNAUTHORIZED. HITL: the user creates the Clerk development instance and supplies the keys for `.env.local`.

Done when: A signed-out visit to `/app` redirects to sign-in; after email or Google sign-in `/app` renders with the user's id visible from a trivial authed server function.

## Note (2026-08-22, from ticket 21)

The HITL blocker is already cleared: the Clerk development instance
`ins_3BtnTUqFdoe627hBbRItbNNMMfW` (`square-glider-56.clerk.accounts.dev`) exists and its
secret key authenticates against the Backend API; enabled strategies are email/password

- `oauth_google`, matching spec §4. Keys are in the gitignored
  `apps/website/.env.local` as `CLERK_SECRET_KEY` / `VITE_CLERK_PUBLISHABLE_KEY`. The
  `clerk` CLI is not logged in — it reads those keys keylessly — so `clerk auth login` +
  `clerk link` is needed only if instance config has to change.
