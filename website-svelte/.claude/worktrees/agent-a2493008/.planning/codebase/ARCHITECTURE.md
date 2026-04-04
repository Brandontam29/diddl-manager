# Architecture

**Analysis Date:** 2026-04-02

## Pattern Overview

**Overall:** Full-stack SvelteKit + Convex with Effect-based backend service composition.

**Key Characteristics:**
- Monolithic repository with client (SvelteKit) and backend (Convex) colocated
- Server-side Effect (v4) runtime for composable error handling and dependency injection
- Dual auth system: Clerk for user identity, Convex API key for private backend access
- Real-time reactive queries via WebSocket, imperative mutations via client
- Tagged error types (ConvexError, ClerkError, GenericError) flowing through Effect chains

## Layers

**Client (Browser):**
- Purpose: Interactive UI for conference management, user authentication via Clerk
- Location: `src/routes/**/*.svelte`, `src/lib/components/**`
- Contains: Svelte components, reactive queries via `useQuery()`, imperative mutations via `useConvexClient()`
- Depends on: Clerk UI, Convex client, convex-svelte
- Used by: End users

**SvelteKit Server:**
- Purpose: Server-side logic, remote functions, request validation, effect orchestration
- Location: `src/lib/remote/**/*.remote.ts`, `src/routes/**/*.ts` (server +page.ts, +layout.ts)
- Contains: Remote functions using SvelteKit's `query()`, Effect generators, error handling
- Depends on: ClerkService, ConvexPrivateService, runtime (Effect layer)
- Used by: Client-side code fetching data, route handlers

**Convex Backend:**
- Purpose: Database operations, data validation, real-time subscriptions
- Location: `src/convex/**`
- Contains: Schema definitions, authed queries/mutations, private backend functions
- Depends on: Clerk JWT validation (for authed), API key validation (for private)
- Used by: Client directly (authed functions), SvelteKit server (private functions)

**Services (Effect Layer):**
- Purpose: Encapsulated, composable effects for external integrations
- Location: `src/lib/services/**`
- Contains: ConvexPrivateService, ClerkService (ServiceMap.Service instances)
- Depends on: HTTP clients (ConvexHttpClient, @clerk/backend), environment variables
- Used by: Remote functions via Effect.gen() chains

**State Management:**
- Purpose: Client-side reactive state for UI
- Location: `src/lib/stores/*.svelte.ts`
- Contains: ClerkStore (Svelte 5 runes-based state), Clerk listener subscriptions
- Depends on: Clerk JS SDK
- Used by: Components and wrappers for auth context

## Data Flow

**Client-Initiated Query (Real-time):**

1. Component calls `useQuery(api.authed.conferences.list, {})`
2. `convex-svelte` establishes WebSocket, attaches Clerk JWT via `ConvexWrapper.setAuth()`
3. Convex validates JWT, executes `authedQuery` handler in `src/convex/authed/conferences.ts`
4. Result streams back to client, component re-renders on data update

**Client-Initiated Mutation:**

1. Component calls `client.mutation(api.authed.conferences.create, args)`
2. Same JWT attachment via ConvexWrapper
3. Convex validates, executes `authedMutation` handler
4. Mutation completes, returns document ID or result
5. Component updates state or re-renders

**Server Remote Function (Private):**

1. Component awaits `remoteDemoQuery()` from `src/lib/remote/demo.remote.ts`
2. Remote function uses `Effect.gen()` to compose ConvexPrivateService
3. ConvexPrivateService wraps args with `CONVEX_PRIVATE_BRIDGE_KEY` API key
4. Calls `src/convex/private/demo.ts` (private function)
5. Convex validates API key, executes handler
6. Result returned to SvelteKit, rendered in component

**Server Auth Validation:**

1. Remote function calls `ClerkService.validateAuth(event)`
2. Service uses `@clerk/backend` to validate session cookie/JWT from request
3. On success, returns User object; on failure, throws ClerkError
4. Error caught by `effectRunner`, mapped to 401 response
5. Client receives error via `svelte:boundary` failed snippet

**State Management:**

- Clerk user/session state maintained in `ClerkStore` singleton (initialized in `ClerkWrapper`)
- State is reactive via Svelte 5 runes (`$state`)
- Components access via `getClerkContext()` to subscribe to changes
- Convex queries are real-time subscriptions (auto-update when data changes)

## Key Abstractions

**authedQuery / authedMutation:**
- Purpose: Protect Convex functions that require user identity
- Examples: `src/convex/authed/conferences.ts`, `src/convex/authed/demo.ts`
- Pattern: Wrapper using `customQuery()` from `convex-helpers` that validates `ctx.auth.getUserIdentity()` before handler execution; throws if identity is null

**privateQuery / privateMutation:**
- Purpose: Protect Convex functions called only from SvelteKit backend
- Examples: `src/convex/private/demo.ts`
- Pattern: Wrapper that validates `apiKey` argument against `CONVEX_PRIVATE_BRIDGE_KEY` environment variable; called via ConvexPrivateService

**ConvexPrivateService:**
- Purpose: Typed Effect service for backend-to-Convex communication with error handling
- Location: `src/lib/services/convex.ts`
- Pattern: ServiceMap.Service with three methods (query, mutation, action) that wrap ConvexHttpClient calls, inject API key, and catch errors into ConvexError instances

**ClerkService:**
- Purpose: Typed Effect service for backend auth validation
- Location: `src/lib/services/clerk.ts`
- Pattern: ServiceMap.Service with `validateAuth(event)` method that calls Clerk backend API, returns User or throws ClerkError

**Remote Functions:**
- Purpose: SvelteKit `query()` functions that compose services and return JSON to client
- Location: `src/lib/remote/**/*.remote.ts`
- Pattern: Use `Effect.gen()` to yield services, `effectRunner` to execute, handle errors via SvelteKit's `error()` function

**effectRunner:**
- Purpose: Execute an Effect chain, logging failures, mapping errors to SvelteKit responses
- Location: `src/lib/runtime.ts`
- Pattern: Takes an Effect, runs it via `ManagedRuntime`, extracts failure cause, logs tagged errors, returns `error(status, publicError)` or result value

## Entry Points

**Root Layout (`src/routes/+layout.svelte`):**
- Location: `src/routes/+layout.svelte`
- Triggers: Every page navigation
- Responsibilities: Wraps app in HTML shell, loads favicon

**App Layout (`src/routes/app/+layout.svelte`):**
- Location: `src/routes/app/+layout.svelte`
- Triggers: Navigation to `/app/**` routes
- Responsibilities: Wraps children in ClerkWrapper (auth UI) and ConvexWrapper (WebSocket setup)

**Conferences Page (`src/routes/app/+page.svelte`):**
- Location: `src/routes/app/+page.svelte`
- Triggers: User navigates to `/app`
- Responsibilities: Renders conference list via `useQuery()`, handles create/update/delete mutations, displays Clerk user button

**References Page (`src/routes/app/references/+page.svelte`):**
- Location: `src/routes/app/references/+page.svelte`
- Triggers: User navigates to `/app/references`
- Responsibilities: Demonstrates all integration patterns (client queries, mutations, remote functions, error handling)

**Home Page (`src/routes/+page.svelte`):**
- Location: `src/routes/+page.svelte`
- Triggers: User navigates to `/`
- Responsibilities: Demo page that calls `remoteDemoQuery()`, links to `/app`

## Error Handling

**Strategy:** Tagged error union (ConvexError | ClerkError | GenericError) flowing through Effect chains, caught and logged by `effectRunner`, converted to SvelteKit responses, rendered via `svelte:boundary` or PageError component.

**Patterns:**

- **Effect.gen() for composition**: Errors thrown in Effect chains bubble up; caught by `effectRunner` which inspects cause, logs, extracts first error, returns `error()` response
- **Catch and rethrow**: ConvexPrivateService and ClerkService catch promise rejections, construct tagged error instances with traceId and timestamp
- **Client-side try/catch**: Components wrap mutations in try/catch, display error messages directly (example: `/app/references/+page.svelte` line 34)
- **Async boundary fallback**: `<svelte:boundary>` with `failed` snippet uses `PageError` component to parse `isHttpError()` and display App.Error shape (message, kind, timestamp, traceId)

## Cross-Cutting Concerns

**Logging:** Structured logging in `effectRunner` (`src/lib/runtime.ts` lines 80-116): tagged error types logged with operation, function name, component path, and error cause

**Validation:** 
- Convex schema defines allowed fields and types (`src/convex/schema.ts`)
- Convex function args validated via `v.string()`, `v.number()`, etc. in handler definitions
- Client-side UI form validation (HTML5 required attributes)

**Authentication:**
- **Clerk JWT**: Client sends via `ConvexWrapper.setAuth()` → `convex.setAuth(getClerkAuthToken)` callback
- **API key**: SvelteKit backend adds `CONVEX_PRIVATE_BRIDGE_KEY` to private function args
- **Request validation**: `ClerkService.validateAuth(event)` checks session cookie/JWT from request object

**Type Safety:**
- TypeScript strict mode throughout
- Convex API generated to `src/convex/_generated/api.d.ts` (run `bun run convex:gen` after schema changes)
- Svelte components tagged with `lang="ts"`
- Effect service types use generics for input/output

---

*Architecture analysis: 2026-04-02*
