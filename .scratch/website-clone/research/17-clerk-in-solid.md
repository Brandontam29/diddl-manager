# 17 — Clerk in a Solid / TanStack Start (Solid) app

Researched 2026-08-20 against clerk.com docs, the npm registry, and GitHub.

## Decisive summary

- **There is no official Clerk SDK for Solid or for TanStack Start (Solid).** Clerk's official surface covers Next.js, Astro, Nuxt, React Router, **TanStack React Start** (React-only, peers on `react` + `@tanstack/react-start`), React, Vue, Expo, plain JavaScript, and backend SDKs. Nothing for SolidJS.
- **The supported, framework-agnostic path is vanilla ClerkJS (`@clerk/clerk-js`) on the client + `@clerk/backend` in server functions.** Both are first-party, actively released (clerk-js 6.29.2 published 2026-08-18; backend 3.16.9), and cover everything this app needs: mounting prebuilt `<SignIn/>`/`<SignUp/>`/`<UserButton/>` without React, session cookies, and `authenticateRequest()` verification server-side. **Recommend this path.**
- The community `clerk-solidjs` package works but is risky: last npm release **2025-01-07** (19+ months ago), pins `@clerk/backend` ^1.x (two majors behind), and peers on **SolidStart** (`@solidjs/start`), not TanStack Start. A one-person beta port `clerk-solidjs-tanstack-start` (v0.0.3, Nov 2025) exists but is explicitly "not recommended for production". Treat both as reference code, not dependencies.
- **Google OAuth works out of the box in development** via Clerk's shared preconfigured credentials; production requires your own Google Cloud OAuth client (consent screen, redirect URI, "In production" publishing status). Email+password is a dashboard toggle, no code beyond the prebuilt components.
- **No local users table needed.** Clerk's own guidance is to skip user sync when you don't display _other_ users' data: store app rows keyed by the Clerk user ID (`text`, e.g. `user_2abc...`) and skip webhooks. For Diddl (per-user collections + one profile row), webhooks are skippable; the only nicety they'd add is cleanup on `user.deleted`.
- **Pricing (2026):** Clerk now bills on **Monthly Retained Users (MRU)** — users who return ≥24 h after signup — not MAU. Free tier: 50,000 MRUs. Pro: $25/mo ($20 annual), 50,000 MRUs included, $0.02/MRU overage. A hobby-scale app stays free indefinitely.

---

## 1. Official SDK coverage and the vanilla ClerkJS path

**Coverage.** Clerk's quickstart matrix lists full-stack SDKs for Next.js, Astro, Nuxt, React Router, and **TanStack React Start**; frontend SDKs for React, Vue, Expo, Chrome extension, Android, iOS, and plain **JavaScript**. No SolidJS entry anywhere; the only TanStack Start SDK is the React one.
Source: https://clerk.com/docs/quickstarts/overview

`@clerk/tanstack-react-start` is hard-locked to React — peer deps are `react`, `react-dom`, `@tanstack/react-start`, `@tanstack/react-router` (v1.5.5 on npm). It cannot be used from the Solid flavor.
Source: https://registry.npmjs.org/@clerk%2Ftanstack-react-start/latest

**Vanilla ClerkJS.** `@clerk/clerk-js` is the framework-agnostic browser SDK every framework SDK wraps. Install via npm (bundler) or CDN script tag, then:

```js
import { Clerk } from "@clerk/clerk-js";
const clerk = new Clerk(PUBLISHABLE_KEY);
await clerk.load(/* options */);
if (clerk.isSignedIn) clerk.mountUserButton(el);
else clerk.mountSignIn(el); // also mountSignUp, mountUserProfile, openSignIn, ...
```

The prebuilt components are mounted imperatively onto DOM nodes — no React involved — which drops cleanly into a Solid component via a `ref` + `onMount`/`onCleanup` (unmount with the matching `unmount*` methods).
Source: https://clerk.com/docs/quickstarts/javascript

**Version/stability:** latest is **6.29.2, published 2026-08-18** — active weekly release cadence (canary/snapshot tags dated 2026-08-19). This is Clerk's core bundle, as stable as Clerk itself.
Source: https://registry.npmjs.org/@clerk%2Fclerk-js

**Session/token handling:** ClerkJS maintains a short-lived (60-second) session JWT in the `__session` cookie on the app's domain and auto-refreshes it every ~50 s against Clerk's Frontend API; a long-lived HttpOnly `__client` cookie on the FAPI domain holds the underlying session. Same-origin requests to your server functions therefore carry the token automatically in the cookie; for cross-origin calls use `clerk.session.getToken()` and send `Authorization: Bearer <jwt>`.
Sources: https://clerk.com/docs/how-clerk-works/overview , https://clerk.com/docs/backend-requests/overview

## 2. Community package `clerk-solidjs` (and successors)

- **`clerk-solidjs`** (npm): community port of `@clerk/clerk-react` for SolidJS/SolidStart by Ian Pascoe / Spirit-Led Software. Latest **2.0.10, published 2025-01-07** — no release in 19+ months as of 2026-08-20. Peer deps: `solid-js >=1`, **`@solidjs/start >=1`**, `@solidjs/router >=0.14` — i.e. its SSR/server half targets SolidStart, not TanStack Start. It bundles `@clerk/backend` **^1.21.4** and `@clerk/shared` ^2.x, both now two major versions behind current (backend 3.16.9).
  Source: https://registry.npmjs.org/clerk-solidjs
- **Repo status:** the canonical repo is now **`spiritledsoftware/clerk-solidjs`** (50 stars, 25 open issues, not archived; last pushes 2026-05-02 "chore: release / upgrade dependencies" per commit log — but nothing published to npm since 2.0.10). Caution: the _old_ org path `spirit-led-software/clerk-solidjs` — which is still what the npm package's bug-tracker URL points at — is now an unrelated 0-star repo described as "Proof of Concept", a repojacked name. Trust only the `spiritledsoftware` org.
  Sources: https://api.github.com/repos/spiritledsoftware/clerk-solidjs , https://api.github.com/repos/spirit-led-software/clerk-solidjs
- **TanStack Start (Solid) fork:** **`clerk-solidjs-tanstack-start`** v0.0.3 (published 2025-11-20) by birkskyum wraps `clerk-solidjs` for TanStack Solid Start; peers `@tanstack/solid-router ^1.132`, `@tanstack/solid-start ^1.132`, `solid-js ^1.9.10`; provides `createClerkHandler`. README: beta, "not recommended to use it in production just yet". 0 stars, single author, one release. Useful as a _reference implementation_ for wiring ClerkJS + `@clerk/backend` into TanStack Solid Start, not as a dependency.
  Sources: https://registry.npmjs.org/clerk-solidjs-tanstack-start , https://github.com/birkskyum/clerk-solidjs-tanstack-start

**Verdict:** don't take either community package as a dependency; both lag Clerk's majors and have bus-factor ~1. Vanilla `@clerk/clerk-js` + a thin hand-rolled Solid context (~100 lines, crib from clerk-solidjs) is the durable path.

## 3. Server-side verification with `@clerk/backend`

`@clerk/backend` (latest **3.16.9**, Node >=20.9) is runtime-agnostic and is what you call inside TanStack Start server functions / middleware.

```ts
import { createClerkClient } from "@clerk/backend";
const clerk = createClerkClient({ secretKey, publishableKey });
const state = await clerk.authenticateRequest(request, {
  authorizedParties: ["https://your-app.com"],
});
// state.isAuthenticated, state.status: 'signed-in' | 'signed-out' | 'handshake'
// state.toAuth().userId -> Clerk user id for DB scoping
```

- **What it reads:** the `__session` cookie (same-origin browser requests) or the `Authorization: Bearer` header. Under SSR / server functions, forward the incoming request's **Cookie header** (at minimum `__session`) — in TanStack Start expose the request via `getWebRequest()` inside a server function or wrap routes in middleware that runs `authenticateRequest` once and injects `{ userId }` into context.
- **Verification modes:** networkless JWT verification when you supply `jwtKey` (PEM public key from the dashboard); otherwise it fetches JWKS with `secretKey` (cached). Set `authorizedParties` to defend against subdomain cookie attacks.
- **Machine vs session tokens:** `acceptsToken` defaults to `'session_token'` (browser users). `'api_key'`, `'oauth_token'`, `'m2m_token'`, or `'any'` are for service-to-service auth — irrelevant for this app; leave the default so machine tokens are rejected.
- `'handshake'` status means the SDK needs a redirect roundtrip to FAPI to refresh an expired token — the framework SDKs' middleware handles this; a hand-rolled middleware should treat it as unauthenticated-with-redirect.

Source: https://clerk.com/docs/references/backend/authenticate-request (plus https://registry.npmjs.org/@clerk%2Fbackend/latest for version/engines)

## 4. Email+password and Google flows

- **Email+password:** enabled as an instance setting in the Clerk dashboard; the prebuilt `mountSignIn`/`mountSignUp` components render it with no extra code (verification emails included).
- **Google in development:** yes — "For development instances, Clerk uses preconfigured shared OAuth credentials and redirect URIs — no other configuration is needed." Toggle Google on and it works; no Google Cloud project required.
- **Google in production:** you must supply your own Google Cloud OAuth client ID/secret, configure the Authorized Redirect URI Clerk gives you, set up the OAuth consent screen, and push the Google app's publishing status to "In production" (Google review of name/logo/scopes) so users don't hit warning screens.

Source: https://clerk.com/docs/authentication/social-connections/google

## 5. Database linkage (Neon + Drizzle), webhooks vs no sync

Clerk's own guidance: **avoid a local users table when you can** — "If you can access the necessary data directly from the Clerk session token, you can achieve strong consistency while avoiding the overhead of maintaining a separate user table." Syncing via webhooks is recommended mainly for **social features** where you must display _other_ users' data (Clerk's Frontend API only exposes the current user, and Backend API calls are rate-limited). Webhook delivery is explicitly **not guaranteed** and is eventually consistent, so a webhook-synced users table needs retry/reconciliation machinery.
Source: https://clerk.com/docs/webhooks/sync-data

**Recommended pattern for Diddl:**

- Every app table gets a `user_id: text` column holding the Clerk user id (`user_...`), taken **only** from server-side `authenticateRequest()` — never from the client. Index it; filter every query by it. No FK target needed since there's no users table (Clerk is the source of truth; a Postgres FK to an external system is impossible anyway).
- The 1:1 `profiles` table is just another such table with `user_id text primary key` — **create it lazily** (upsert on first authenticated request / first profile edit) instead of via a `user.created` webhook. That removes the webhook endpoint, Svix signature verification, and out-of-order-delivery handling entirely.
- Small per-user flags (<1.2 KB) can alternatively live in Clerk `publicMetadata` embedded in the session token, but the app's profile row in Postgres is the better home since it joins with collection data.
- **Skippable:** `user.created` (lazy upsert covers it), `user.updated` (name/avatar read live from Clerk on the client). **Optional later:** a `user.deleted` webhook — or a periodic cleanup job — to purge rows for deleted accounts; nothing breaks without it, orphan rows are just dead weight.
  Source: https://clerk.com/docs/webhooks/sync-data

## 6. Pricing (checked 2026-08-20)

Clerk has moved from MAU to **Monthly Retained Users (MRU)** billing: "a user only counts as retained if they return to your app at least 24 hours after signing up."

- **Free:** 50,000 MRUs per app.
- **Pro (first paid tier):** $25/mo ($20/mo billed annually), 50,000 MRUs included, then $0.02/MRU with volume discounts; the paid tier is for pro features (e.g. removing Clerk branding), not capacity, at this scale.

Source: https://clerk.com/pricing

---

## Bottom line for the wayfinder

Use **`@clerk/clerk-js` directly** in the Solid frontend (mount prebuilt components in a small hand-rolled Solid provider; crib structure from `spiritledsoftware/clerk-solidjs` and `birkskyum/clerk-solidjs-tanstack-start` without depending on them), and **`@clerk/backend`'s `authenticateRequest()`** in TanStack Start server middleware, forwarding the request cookies and reading `userId` from `toAuth()`. Scope Drizzle tables by a plain `user_id text` column, lazy-upsert the profile row, and ship with **zero webhooks**. Dev-mode Google needs no Google Cloud setup; budget one production chore for real Google OAuth credentials. Cost: $0.
