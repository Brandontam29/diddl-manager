# Auth architecture

Type: grilling
Status: resolved
Blocked by: 02, 17

## Question

Given the findings of "Neon Auth outside React" (issue 02): decide the concrete auth
design —

- Sign-up/sign-in flows (email+password and Google) in SolidStart: hosted pages,
  REST-driven custom pages, or an alternative auth library if Neon Auth proved too
  React-bound.
- Session validation in server functions: middleware shape, where the user id comes
  from, cookie/JWT handling under SSR.
- The user identity row app tables reference (`neon_auth.users_sync` vs own `users`
  table), and how profile (name, birthdate, description, hobbies, picture) relates
  to the auth user.
- Route protection: which routes are public (landing/sign-in) vs authed.

## Answer

User accepted the research recommendation (2026-08-19). Neon Auth (Managed Better
Auth) with the Better Auth Solid bindings:

- **SDK**: `better-auth/solid` + `better-auth/solid-start` speaking to the hosted
  Neon Auth service (protocol-compatible); `@neondatabase/auth` vanilla/server
  toolkit where lower-level access is needed.
- **Sessions**: first-party session cookies via a catch-all auth API route
  (`/api/auth/*` proxy), validated server-side with `getSession()` from request
  headers inside server functions — chosen over stateless JWT/jose because it's
  simpler and sessions are revocable. JWKS verification stays available if an edge
  case needs it.
- **Flows**: email + password and Google OAuth; sign-in/up pages are hand-written
  Solid forms (the prebuilt UI package is React-only).
- **Identity**: app tables foreign-key to `neon_auth."user"(id)` (uuid, no sync
  lag). The app's `profiles` table is 1:1 with that id; auth user carries
  email/credentials, profile carries name/birthdate/description/hobbies/picture.
- **Route protection**: landing, sign-in, sign-up public; everything else requires a
  session (middleware redirect), and every server function independently rejects
  unauthenticated calls.
- **Fallback** if the beta SDK disappoints: self-hosted Better Auth on Neon
  Postgres — same protocol, hosting change only.

## Comments

**2026-08-20 — REOPENED, answer above superseded.** When grilled on Neon Auth's
product-churn risk, the user chose **Clerk** instead. Now blocked by the new
research ticket "Clerk in a Solid / TanStack Start app" (issue 17). Still to decide
once research lands: session validation in server functions, Solid-compatible
sign-in UI (Clerk's prebuilt components are React), how app tables reference the
Clerk user id (no local auth table — likely a text `user_id` column, no FK), and
webhook/user-sync needs. Settled regardless of provider: email + Google (user can
hand-provision Google OAuth credentials if needed); public routes =
landing/sign-in/sign-up; every server function rejects unauthenticated calls;
account deletion is **soft delete** (no cascade) per the data-model ticket.

**2026-08-20 — RESOLVED (final), Clerk design locked** as researched in issue 17:

- Client: vanilla `@clerk/clerk-js` mounting Clerk's prebuilt sign-in/up components
  inside a thin hand-rolled Solid provider (no community packages in production —
  reference code only; note the repojacked `clerk-solidjs` repo link on npm).
- Server: `@clerk/backend` `authenticateRequest()` in middleware for every server
  function, reading the forwarded `__session` cookie; session-token default.
- Data: no local users table, no webhooks — app tables scope by a `user_id text`
  column from server-side auth; the profile row lazy-upserts on first authenticated
  request.
- Flows: email + password and Google. Clerk dev instance's shared Google OAuth for
  development; the user hand-provisions a verified Google client for production.
- Route protection: landing/sign-in/sign-up public; everything else requires a
  session; account deletion is soft delete.
- Recorded as ADR: `docs/adr/0001-clerk-for-web-auth.md`.
