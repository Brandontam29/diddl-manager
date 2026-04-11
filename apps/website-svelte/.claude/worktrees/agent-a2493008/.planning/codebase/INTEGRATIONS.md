# External Integrations

**Analysis Date:** 2026-04-02

## APIs & External Services

**Convex Backend:**

- Convex - Backend-as-a-service platform for database, real-time sync, and serverless functions
  - SDK/Client: `convex@1.33.0`
  - Connection: `PUBLIC_CONVEX_URL` (production) or local `http://localhost:3210` (development)
  - HTTP Client: `ConvexHttpClient` from `convex/browser`
  - Auth: JWT token from Clerk validated by Convex auth config

**Clerk Authentication:**

- Clerk - User authentication and identity management
  - Frontend SDK: `@clerk/clerk-js@6.3.0`
  - Backend SDK: `@clerk/backend@3.2.0`
  - UI Components: `@clerk/ui@1.2.1`
  - Auth Method: JWT-based, Clerk token issued and validated in Convex
  - Config: `src/convex/auth.config.ts` - Registers Clerk as JWT provider
  - Env vars: `PUBLIC_CLERK_PUBLISHABLE_KEY` (public), `CLERK_SECRET_KEY` (private), `CLERK_JWT_ISSUER_DOMAIN`

## Data Storage

**Databases:**

- Convex Database
  - Type: Real-time document database provided by Convex
  - Connection: Via Convex HTTP client at `PUBLIC_CONVEX_URL`
  - Client: `ConvexHttpClient` from `convex/browser` package
  - Schema: `src/convex/schema.ts` - Defines `conferences` table with fields: `name`, `location`, `startDate`, `endDate`, `description`
  - Access: Through Convex queries and mutations in `src/convex/authed/` (client-exposed) and `src/convex/private/` (backend-only)

**File Storage:**

- Local filesystem only
- No external file storage integration detected

**Caching:**

- None - Convex provides built-in real-time caching and sync

## Authentication & Identity

**Auth Provider:**

- Clerk - Custom OAuth and multi-factor authentication provider
  - Implementation: JWT-based integration with Convex
  - Client-side: Clerk token obtained via `getToken({ template: 'convex' })`
  - Server-side: Clerk backend SDK validates authentication in `src/lib/services/clerk.ts`
  - Location:
    - Client config: `src/lib/wrappers/ClerkWrapper.svelte` - Sets up Clerk context and auth token provider
    - Server config: `src/lib/services/clerk.ts` - Effect-based ClerkService with `validateAuth` function using `@clerk/backend`
    - Convex config: `src/convex/auth.config.ts` - Registers Clerk JWT issuer domain

**Session Management:**

- Clerk manages session tokens
- Convex validates JWT in auth config using `CLERK_JWT_ISSUER_DOMAIN`

## Monitoring & Observability

**Error Tracking:**

- None detected

**Logs:**

- Console logging only (via `$inspect()` in Svelte)
- Backend logging can be added via Effect's logging utilities

## CI/CD & Deployment

**Hosting:**

- Vercel - Primary deployment target for SvelteKit
- Adapter: `@sveltejs/adapter-vercel@6.3.1`

**CI Pipeline:**

- None detected - Linting and type checking available locally via npm scripts

**Backend Deployment:**

- Convex Cloud - Managed deployment of Convex functions and database
- Local development: Local Convex instance via `convex-vite-plugin` on port 3210

## Environment Configuration

**Required env vars:**

- `CONVEX_DEPLOYMENT` - Convex project deployment ID (production)
- `PUBLIC_CONVEX_URL` - Public Convex endpoint (production)
- `PUBLIC_CONVEX_SITE_URL` - Convex site proxy URL (production)
- `CONVEX_PRIVATE_BRIDGE_KEY` - Secret key for backend-to-Convex private function calls
- `CLERK_JWT_ISSUER_DOMAIN` - Clerk JWT issuer domain for Convex auth validation
- `PUBLIC_CLERK_PUBLISHABLE_KEY` - Public Clerk publishable key (frontend)
- `CLERK_SECRET_KEY` - Clerk secret key (backend)

**Development env vars:**

- `USE_LOCAL_CONVEX=true` - Enable local Convex instance via Vite plugin
- `RESET_LOCAL_BACKEND=true` - Reset local Convex database on server start (optional)

**Secrets location:**

- `.env` (not committed) - Local development secrets
- `.env.example` - Template of required variables
- Vercel deployment secrets - Set in project settings
- Convex cloud environment - Via deployment dashboard

## Webhooks & Callbacks

**Incoming:**

- None detected

**Outgoing:**

- None detected

## Data Flow

**Client → Server:**

1. Client makes request via `convex-svelte` hooks
2. Clerk provides JWT token via `getToken({ template: 'convex' })`
3. Convex client includes token in request headers
4. Convex validates JWT against Clerk issuer domain
5. Authed query/mutation in `src/convex/authed/` executes with user identity

**Backend (SvelteKit) → Convex:**

1. SvelteKit server uses `ConvexHttpClient` from `src/lib/services/convex.ts`
2. Requests include `CONVEX_PRIVATE_BRIDGE_KEY` in args
3. Private functions in `src/convex/private/` validate API key before executing
4. Results returned to SvelteKit route handler

**Frontend Authentication Flow:**

1. User loads site, ClerkWrapper mounts
2. Clerk initializes and loads user session
3. ConvexWrapper mounts, calls `setupConvex()` with Convex URL
4. Convex client configured with `setAuth()` callback to Clerk token provider
5. On query/mutation, Clerk token automatically injected
6. Convex validates token, allows authenticated operations

## Service Configuration

**Local Development (USE_LOCAL_CONVEX=true):**

- Convex functions run locally via `convex-vite-plugin`
- `PUBLIC_CONVEX_URL` set to `http://localhost:3210`
- `PUBLIC_CONVEX_SITE_URL` set to `http://localhost:3211`
- Environment variables for Clerk passed to local Convex instance via `vite.config.ts`

**Production (Hosted):**

- Convex deployment ID from `CONVEX_DEPLOYMENT`
- Convex HTTP endpoint from cloud
- Clerk configuration from cloud instance
- SvelteKit deployed to Vercel

---

_Integration audit: 2026-04-02_
