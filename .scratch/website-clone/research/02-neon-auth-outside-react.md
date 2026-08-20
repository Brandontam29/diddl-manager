# Neon Auth outside React (SolidStart)

Researched 2026-08-19 against neon.com docs, Stack Auth docs, GitHub, and npm.

## Decisive summary

**The question's premise is outdated: Neon Auth is no longer built on Stack Auth.** As of 2026, "Neon Auth" is **Managed Better Auth** — a managed Better Auth (v1.4.18) service running in Neon's infrastructure, storing users/sessions/OAuth config directly in your database's `neon_auth` schema. The Stack Auth-based product is archived as "Legacy Neon Auth": _"no longer available for new projects but remains supported for existing users"_ ([legacy overview](https://neon.com/docs/auth/legacy/overview), [announcement blog](https://neon.com/blog/neon-auth-branchable-identity-in-your-database)).

This makes the SolidStart story much better than the question assumes:

1. **Framework-agnostic core.** The auth service is a plain REST API in front of your Postgres; anything that speaks HTTP works. Sessions are HTTP-only cookies + short-lived EdDSA JWTs verifiable via a standard JWKS endpoint.
2. **Non-React clients exist.** `@neondatabase/auth` ships `./vanilla` and framework-agnostic `./server` entry points (Web-standard `Request`/`Response`), and because the service _is_ Better Auth, plain `better-auth/client` — including its official **`better-auth/solid`** client and **`better-auth/solid-start`** server handler — can talk to it.
3. **Server-side validation in SolidStart** is either (a) proxy the auth API through a catch-all route so session cookies are first-party, then call `getSession()` with the request headers in server functions, or (b) verify the JWT with `jose` + `createRemoteJWKSet(<NEON_AUTH_URL>/.well-known/jwks.json)`.
4. **Foreign keys are first-class.** Auth tables live in _your_ database (`neon_auth."user"` with a `uuid` id); there is no webhook sync and no sync latency in the current product. Neon's own guides FK app tables to `neon_auth."user"(id)`.
5. **Verdict: integration is reasonable for Solid — no need to abandon Neon Auth.** The only React-locked piece is the prebuilt UI (`@neondatabase/auth-ui`), so you build your own Solid sign-in forms against SDK/REST calls. If you want zero coupling to Neon's beta SDK, self-hosted Better Auth on Neon Postgres is the fallback (see §5).

---

## 1. What Neon Auth provisions

Current product (Managed Better Auth):

- A managed auth service deployed in the same region as your compute; _"Your App (SDK) → HTTP requests → Managed Better Auth Service (REST API) → Your Neon Database (`neon_auth` schema)"_ ([authentication flow](https://neon.com/docs/auth/authentication-flow)).
- _"All authentication data is stored in the `neon_auth` schema. It's queryable with SQL and compatible with RLS policies"_ ([overview](https://neon.com/docs/auth/overview)). Core Better Auth tables: `user` (id, name, email, emailVerified, image, createdAt, updatedAt, role, banned, …), `session`, `account` (OAuth/credential accounts), `verification` ([overview](https://neon.com/docs/auth/overview), [authentication flow](https://neon.com/docs/auth/authentication-flow)).
- **Sessions:** the service sets an HTTP-only cookie `__Secure-neonauth.session_token` (opaque session id, not a JWT; Secure, HttpOnly, SameSite=None) ([authentication flow](https://neon.com/docs/auth/authentication-flow)).
- **JWTs:** the built-in JWT plugin issues 15-minute **EdDSA (Ed25519)** tokens (claims: `sub`, `email`, `role`, exp) with a public JWKS at `<NEON_AUTH_URL>/.well-known/jwks.json`; used natively by the Data API/RLS ([JWT plugin](https://neon.com/docs/auth/guides/plugins/jwt), [custom auth providers](https://neon.com/docs/data-api/custom-authentication-providers)).
- Every database branch gets its own isolated auth environment ([blog](https://neon.com/blog/neon-auth-branchable-identity-in-your-database)).
- **Framework-agnostic parts:** everything above — REST endpoints, cookies, JWT/JWKS, and the SQL schema. Only the UI components and the `next`/`react` SDK adapters are framework-specific.

Legacy product (Stack Auth-based), for reference: an external IdP synced user profiles by webhook into `neon_auth.users_sync` (id, name, email, created_at, updated_at, deleted_at soft-delete, raw_json), with <1 s async sync latency and "use LEFT JOIN" guidance ([legacy overview](https://neon.com/docs/auth/legacy/overview), [best-practices FAQ](https://neon.com/docs/neon-auth/best-practices), [legacy Drizzle guide](https://neon.com/docs/neon-auth/quick-start/drizzle)). Not available to new projects.

## 2. Non-React integration surface

- **REST API:** the service is _"a managed REST API service"_; endpoints follow Better Auth conventions, e.g. `{NEON_AUTH_URL}/auth/sign-in/email`, `{NEON_AUTH_URL}/auth/sign-up/email`, OAuth authorize/callback for social providers ([authentication flow](https://neon.com/docs/auth/authentication-flow)). _"You can integrate using any HTTP client; JavaScript isn't required"_ ([blog](https://neon.com/blog/neon-auth-branchable-identity-in-your-database)).
- **SDK entry points** (`@neondatabase/auth@0.5.0-beta`, per [npm](https://www.npmjs.com/package/@neondatabase/auth) exports map): `.`, `./vanilla`, `./vanilla/adapters`, `./server` (framework-agnostic, _"Web Standards only — it consumes `Request`/`Response`"_, exports `createAuthServer`, `handleAuthProxyRequest`, `processAuthMiddleware`), plus React/Next-specific `./react`, `./next`, `./ui/*` ([repo README](https://github.com/neondatabase/neon-js/tree/main/packages/auth)). The package is _"a wrapper around better-auth/client"_ adding session caching, cross-tab sync, token refresh, and Neon-specific token behaviors ([neon-auth vs better-auth](https://github.com/neondatabase/neon-js/blob/main/packages/auth/neon-auth_vs_better-auth.md)).
- **Better Auth clients:** `better-auth@1.7.1` exports `./solid`, `./solid-start`, `./client` (vanilla) ([npm registry](https://registry.npmjs.org/better-auth/latest), [Better Auth installation docs](https://www.better-auth.com/docs/installation) list react/vue/svelte/solid/vanilla clients). Since the managed service speaks Better Auth's protocol, these can target it; note Neon pins server-side Better Auth 1.4.18 and its wrapper adds behaviors plain `better-auth/client` lacks (e.g. automatic JWT extraction) ([comparison doc](https://github.com/neondatabase/neon-js/blob/main/packages/auth/neon-auth_vs_better-auth.md)).
- **Email/password without React:** plain method calls — `auth.signUp.email({email, password, name})`, `auth.signIn.email(...)` server-side ([Next.js API-only quickstart](https://neon.com/docs/auth/quick-start/nextjs-api-only)) or `authClient.signIn.email(...)` client-side; these are HTTP POSTs under the hood, callable from any framework.
- **Google OAuth:** enabled by default with Neon-provided shared dev credentials — _"you can start using Google sign-in immediately without any configuration"_; standard authorization-code flow, after which the service upserts `neon_auth.user` and stores tokens in `neon_auth.account` ([setup OAuth](https://neon.com/docs/auth/guides/setup-oauth), [authentication flow](https://neon.com/docs/auth/authentication-flow)). Trigger from Solid with `authClient.signIn.social({ provider: 'google' })` (Better Auth convention).
- **Hosted auth pages:** none in the current product. The prebuilt Sign In/Sign Up/Account views are **React-only** components in `@neondatabase/auth-ui` ([UI components reference](https://neon.com/docs/auth/reference/ui-components)). In Solid you write your own forms (small: email/password + one OAuth button).

## 3. Validating a session in SolidStart server functions

Two workable patterns:

**A. Cookie/session proxy (recommended for SSR).** Mirror the Next.js quickstart with SolidStart's file routes:

- Env: `NEON_AUTH_BASE_URL=https://ep-xxx.neonauth.<region>.aws.neon.tech/<db>/auth`, `NEON_AUTH_COOKIE_SECRET` (32+ chars) ([quickstart](https://neon.com/docs/auth/quick-start/nextjs-api-only)).
- Server instance: `createAuthServer` (or `createNeonAuth` in the Next wrapper) from `@neondatabase/auth/server`; mount its proxy in `src/routes/api/auth/[...path].ts` using `handleAuthProxyRequest` — the toolkit consumes standard `Request`/`Response`, which is exactly what SolidStart's API routes provide ([repo README](https://github.com/neondatabase/neon-js/tree/main/packages/auth)). Point the browser client's `baseURL` at `/api/auth` so the session cookie is first-party on your domain (avoids the SameSite=None third-party-cookie mode, which Safari blocks on non-HTTPS dev) ([quickstart](https://neon.com/docs/auth/quick-start/nextjs-api-only)).
- In a server function (`'use server'` / `query`), read the incoming request via `getRequestEvent()` and call the server instance's `getSession()` equivalent with those headers — same shape as Better Auth's `auth.api.getSession({ headers })`, which is how Better Auth's own [SolidStart integration](https://www.better-auth.com/docs/integrations/solid-start) works (`toSolidStartHandler(auth)` for the route + headers-based session lookup).

**B. Stateless JWT verification.** Get a token client-side (`authClient.token()` or the `set-auth-jwt` response header from `getSession()`), send it as `Authorization: Bearer`, verify in the server function:

```ts
import { jwtVerify, createRemoteJWKSet } from "jose";
const JWKS = createRemoteJWKSet(new URL(`${NEON_AUTH_URL}/.well-known/jwks.json`));
const { payload } = await jwtVerify(token, JWKS, { issuer: new URL(NEON_AUTH_URL).origin });
// payload.sub = user id
```

This is verbatim the pattern Neon documents for non-Next backends (Hono) ([JWT plugin](https://neon.com/docs/auth/guides/plugins/jwt), [Hono guide](https://neon.com/guides/react-neon-auth-hono)). Caveat from the docs: the JWT plugin _"is not a replacement for session management"_ — prefer pattern A for page SSR, pattern B for API-style server functions.

## 4. Referencing the auth user from app tables

- Auth tables are ordinary Postgres tables in your database, so plain FKs work. Neon's Hono guide defines `journal_entries.user_id uuid NOT NULL REFERENCES neon_auth."user"(id)` (Drizzle: `.references(() => userInNeonAuth.id)`) ([Hono guide](https://neon.com/guides/react-neon-auth-hono)).
- **No sync latency** in the current product — there is no webhook sync; the service writes `neon_auth.user` directly at sign-up (_"Your Neon database is the single source of truth for authentication data"_, [migration guide](https://neon.com/docs/auth/migrate/from-legacy-auth)). The <1 s latency / LEFT JOIN / soft-delete caveats apply only to the legacy `neon_auth.users_sync` table ([best practices](https://neon.com/docs/neon-auth/best-practices)).
- Practical caveats: the table name `user` is a reserved word — quote it (`neon_auth."user"`); id is `uuid`; choose `ON DELETE` behavior (CASCADE for owned data, SET NULL for content that should outlive the user — advice carried over from Neon's FAQ ([best practices](https://neon.com/docs/neon-auth/best-practices))). Schema mirrors Better Auth's core schema (`user`, `session`, `account`, `verification`) ([Better Auth docs via Neon overview](https://neon.com/docs/auth/overview)).

## 5. If you'd rather not fight the beta SDK

The pragmatic alternative is **self-hosted Better Auth on Neon Postgres**: install `better-auth` in the SolidStart app, point it at the Neon connection string (any Postgres driver/ORM), mount `toSolidStartHandler(auth)` in `routes/api/auth/[...auth].ts`, and use the official `better-auth/solid` client — first-party Solid support, full plugin ecosystem, latest version (1.7.1) instead of Neon's pinned 1.4.18, and no dependency on a beta wrapper SDK ([Better Auth SolidStart integration](https://www.better-auth.com/docs/integrations/solid-start), [Neon's own NextAuth/Neon Auth/Better Auth comparison](https://neon.com/guides/nextauth-neon-auth-better-auth-postgres)). You give up the managed pieces — per-branch auth isolation, shared dev Google OAuth credentials, native Data API JWT integration, and Neon running the auth service for you — and you own email delivery and OAuth app registration yourself. Given that Neon Auth _is_ managed Better Auth now, this is less an alternative stack than a hosting decision, and migrating between the two later is mostly config.

## Sources

- https://neon.com/docs/auth/overview — Managed Better Auth overview (schema, SDKs, REST)
- https://neon.com/docs/auth/legacy/overview — legacy Stack Auth-based Neon Auth, deprecation status
- https://neon.com/blog/neon-auth-branchable-identity-in-your-database — announcement, Better Auth foundation
- https://neon.com/docs/auth/authentication-flow — cookies, endpoints, OAuth flow, JWT claims
- https://neon.com/docs/auth/quick-start/nextjs-api-only — createNeonAuth, env vars, getSession, sign-in/up
- https://neon.com/docs/auth/guides/plugins/jwt — JWT plugin, JWKS URL, EdDSA, jose verification
- https://neon.com/guides/react-neon-auth-hono — non-Next backend validation + FK to neon_auth."user"
- https://neon.com/docs/auth/guides/setup-oauth — Google OAuth, shared dev credentials
- https://neon.com/docs/auth/reference/ui-components — React-only UI components
- https://neon.com/docs/auth/migrate/from-legacy-auth — migration, DB as source of truth
- https://neon.com/docs/neon-auth/best-practices — legacy users_sync FAQ (latency, FKs, soft deletes)
- https://neon.com/docs/neon-auth/quick-start/drizzle — legacy usersSync Drizzle helper
- https://github.com/neondatabase/neon-js/tree/main/packages/auth — SDK entry points, server toolkit
- https://github.com/neondatabase/neon-js/blob/main/packages/auth/neon-auth_vs_better-auth.md — wrapper vs plain better-auth/client
- https://www.npmjs.com/package/@neondatabase/auth — 0.5.0-beta exports (`./vanilla`, `./server`)
- https://www.better-auth.com/docs/integrations/solid-start — toSolidStartHandler
- https://www.better-auth.com/docs/installation — client list incl. Solid; better-auth 1.7.1 exports `./solid`, `./solid-start` (npm registry)
- https://neon.com/docs/data-api/custom-authentication-providers — Data API JWKS validation
