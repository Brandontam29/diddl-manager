# Clerk auth: provider, sign-in/up routes, server middleware

Type: task
Status: resolved
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

## Answer

Done, and verified end to end in a real browser against **both** the dev server and the
production build — twice, because the first pass shipped a bug that every static check
passed (see below).

**Files added**

- `src/lib/clerk.ts` — the single browser Clerk instance behind `loadClerk()`. Dynamic
  import, lazily constructed, so nothing Clerk-related is touched during SSR.
- `src/lib/clerk-provider.tsx` — the thin hand-rolled Solid provider ADR 0001 calls for:
  loads ClerkJS on mount, republishes `clerk.user` through a signal via
  `clerk.addListener`, exposes `useClerk()`.
- `src/components/ClerkMount.tsx` — mounts any Clerk prebuilt component onto a ref.
  Reused by sign-in, sign-up, and later `mountUserProfile` in Settings.
- `src/routes/sign-in.$.tsx`, `src/routes/sign-up.$.tsx` — splat routes (Clerk owns
  sub-paths like `#/factor-two`), with `validateSearch` for the `redirect` param.
- `src/routes/_authed.tsx` — `ssr: false` pathless layout; `beforeLoad` awaits
  `loadClerk()` and throws `redirect` to `/sign-in/$` with `redirect=<href>`.
- `src/routes/_authed.app.tsx` — placeholder `/app` that renders the user id from the
  authed server function. "Port components/ui and the Library page" replaces it.
- `src/server/auth.ts` — `authedMiddleware`: `@clerk/backend` `authenticateRequest()`
  over `getRequest()`, `context.userId`, throws `UnauthorizedError`.
- `src/server/errors.ts` — `UnauthorizedError`. `NotFoundError` lands with the handlers.
- `src/server/session.ts` — `getSignedInUserId`, the liveness check.

`ClerkProvider` wraps `props.children` in `__root.tsx`.

### The bug the checks did not catch

The first implementation built clean, typechecked clean, and was **broken in the
browser**: every page threw `CLERK_SECRET_KEY is not set` client-side. `src/server/auth.ts`
read `process.env.CLERK_SECRET_KEY` at module scope, and while TanStack Start's compiler
strips server-function _handler bodies_ from the client bundle, it keeps the module shell —
so the guard shipped to the browser as `if(!{}.CLERK_SECRET_KEY) throw ...` and threw on
every load. Confirmed by grepping `.output/public/` for `CLERK_SECRET_KEY`, not just by
reading the source.

Fixed by building the Clerk client lazily inside `getClerkClient()`. The production client
bundle is now clean of both `CLERK_SECRET_KEY`/`createClerkClient` and the secret's value —
asserted by grep after the build. **Any future server module must read its env inside a
function, never at module scope.**

### Clerk 6.29 no longer mounts its UI implicitly

Second failure: the sign-in page rendered blank, console warning "Clerk was not loaded with
Ui components". In clerk-js 6.29 the prebuilt UI is an explicit `load()` option — the
research note's `new Clerk(key); await clerk.load(); clerk.mountSignIn(el)` is the older
API. The UI comes from a separate package:

```ts
const [{ Clerk }, { ui }] = await Promise.all([
  import("@clerk/clerk-js/no-rhc"),
  import("@clerk/ui/no-rhc"),
]);
await clerk.load({ ui });
```

`@clerk/ui@1.30.6` is now an explicit dependency. Both use their **`/no-rhc`** builds: the
default builds fetch UI components from Clerk's CDN at runtime and that lazy chunk load
does not survive bundling here (no CDN request was even attempted). `/no-rhc` bundles them,
which also removes a runtime dependency on Clerk's CDN for the Vercel deploy.

**Verified** (Playwright, dev server and `node .output/server/index.mjs`, email+password
against a throwaway `+clerk_test` user since deleted — user count back to 1):

1. signed-out `/app` → `/sign-in?redirect=%2Fapp`
2. sign-in (email, password, then the dev instance's emailed code) → lands on `/app`
3. `/app` renders `Signed in as user_3IId…` — the id came from `@clerk/backend` reading
   the `__session` cookie inside the server function
4. survives a reload

**Facts later tickets depend on**

- **`authedMiddleware` is the composition point for every server function** (ticket 24):
  `createServerFn({method}).middleware([authedMiddleware]).handler(({context}) => …)` with
  `context.userId` typed as the Clerk id.
- `authorizedParties` is deliberately unset — the production origin is unknown until the
  Vercel project exists. **Ticket 28 should set it**, per the research's subdomain-cookie
  warning.
- A Clerk `handshake` status is treated as unauthenticated; the client's Clerk instance
  refreshes and the call retries. No redirect roundtrip from a server function.
- The dev instance requires an emailed code after password on first sign-in. `+clerk_test`
  addresses accept `424242` — the way to script a signed-in browser session in future.
- Clerk's error surface at the route level is unstyled: TanStack warned "error wasn't
  caught by any route". The `/app` `errorComponent` in "Port components/ui and the Library
  page" should cover `UnauthorizedError`.
- Bundle cost: `clerk.no-rhc` is an 804KB lazy chunk, and the bundled UI drags in a 476KB
  `Web3SolanaWalletButtons` chunk for wallet sign-in this app will never use. Both are
  separate lazy chunks, not in the 180KB entry — worth revisiting only if first paint on
  `/sign-in` disappoints.
- `let node!: HTMLDivElement` (the common Solid ref idiom) fails this repo's oxlint
  `no-unassigned-vars`. Use a `createSignal` callback ref instead.
- `/sign-in` and `/sign-up` render without a trailing splat segment, so plain
  `<Link to="/sign-in">` works for the landing page CTAs (ticket 27).

## Review follow-up (2026-08-22)

A two-axis review (standards + spec) found no hard violations but four fixes, all
applied in the follow-up commit:

- **Open redirect closed** — `?redirect=` was an unvalidated `z.string()` handed to
  Clerk's `forceRedirectUrl`. Now `src/lib/auth-redirect.ts` accepts only an in-app path
  (`/` but not `//`) and silently drops anything else.
- **Sign-up keeps the return URL** — the Answer above overstated "splat routes … with
  `validateSearch`": only `/sign-in/$` had it. Both routes now validate the same schema
  and forward `redirect` to each other (`signUpUrl` / `signInUrl`), so a visitor bounced
  from `/app/lists/123` lands there whichever form they use.
- **Error `code` does not cross the wire** — TanStack Start serialises thrown errors to
  `{ message }`; `src/server/errors.ts` now says so. Client error boundaries (tickets 25/26)
  must match on message or status, not `instanceof`/`.code`.
- Naming: `MountProps` → `ClerkMountProps`, `ClerkStore` → `ClerkContextValue`; the
  redundant initial `setUser` before `addListener` removed; ADR 0001 amended to record
  `@clerk/ui`.

Still deferred: `authorizedParties` in `authedMiddleware` must be set when the
production origin exists — see ticket 28.
