Project guidelines:

- use bun for the package manager
- when installing new packages, use `bun add` instead of manually editing the package.json file
- use modern svelte and sveltekit patterns and primitives
- avoid `as any` at all costs, try to infer types from functions as much as possible
- when defining convex actions, queries, and mutations that are exposed to the client use the `authed` setup in `src/convex/authed`
- when defining convex actions, queries, and mutations that are called from the backend use the `private` setup in `src/convex/private`
- use effect v4 for all backend code
- use the convex service for calling convex queries, actions, and mutations from the backend
- use tailwindcss for styling whenever possible, only resort to custom css if needed
- every svelte component should have `lang="ts"`
- after making changes to convex, run `bun run convex:gen` to generate the new api
- run `bun run lint` to check for linting errors, `bun run format`, and `bun run check` to check for errors after making changes

<!-- GSD:project-start source:PROJECT.md -->

## Project

**Diddl Manager**

A web application for Diddl collectors to browse a master catalog of ~10,000 Diddl products and manage personal collection lists. Users track what they own, the condition of each item, quantities, and completion status. The app works as a full trial for guests (localStorage), with Clerk auth to persist data to Convex.

**Core Value:** Users can browse the Diddl catalog by type and manage their collection lists — tracking what they have, its condition, and what they're missing. Catalog browsing and list management are equally critical; one is useless without the other.

### Constraints

- **Tech stack**: SvelteKit, Tailwind, Convex, Effect v4, Clerk (already established)
- **Package manager**: Bun
- **Image storage**: Convex file storage for product images
- **Catalog size**: ~10,000 items — pagination by type in groups of 100
- **Image schema**: Currently 1 image per product, schema must be ready for multiple images
- **Svelte**: Modern Svelte 5 patterns, all components with `lang="ts"`
- **Backend**: Effect v4 for all backend code, ConvexService for backend Convex calls
- **Convex functions**: authed setup for client-facing, private setup for backend-only
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->

## Technology Stack

## Languages

- TypeScript 5.9.3 - Full codebase including frontend components, Svelte files, and backend functions
- JavaScript - Build configuration and linting setup files

## Runtime

- Node.js (via Bun or standard Node.js environments)
- Bun - Primary package manager for the project
- Lockfile: Present (managed via Bun)

## Frameworks

- SvelteKit 2.50.2 - Full-stack web framework
- Svelte 5.51.0 - UI component framework with runes support
- Vite 7.3.1 - Build tool and dev server
- Convex 1.33.0 - Backend platform providing real-time database and serverless functions
- Effect 4.0.0-beta.31 - Functional effect system for type-safe backend code
- @effect/platform-node 4.0.0-beta.31 - Node.js platform layer for Effect
- Clerk 6.3.0 (@clerk/clerk-js, @clerk/ui, @clerk/backend) - Authentication and user management
- TailwindCSS 4.1.18 - Utility-first CSS framework
- @tailwindcss/vite 4.1.18 - Vite plugin for TailwindCSS
- @tailwindcss/typography 0.5.19 - Typography plugin for styled content
- Svelte-check 4.4.2 - Svelte component type checking
- SvelteKit sync utilities - Type generation for routes and configuration

## Key Dependencies

- convex-helpers 0.1.114 - Utilities for custom function wrappers and authentication patterns
- convex-svelte 0.0.12 - Svelte integration for Convex client
- convex-vite-plugin 0.4.0 - Vite plugin for local Convex development
- ESLint 9.39.2 - JavaScript/TypeScript linting
- eslint-config-prettier 10.1.8 - Disables ESLint rules that conflict with Prettier
- eslint-plugin-svelte 3.14.0 - ESLint plugin for Svelte files
- typescript-eslint 8.54.0 - TypeScript support for ESLint
- Prettier 3.8.1 - Code formatter
- prettier-plugin-svelte 3.4.1 - Svelte support for Prettier
- prettier-plugin-tailwindcss 0.7.2 - TailwindCSS class sorting in Prettier
- @sveltejs/adapter-vercel 6.3.1 - Vercel adapter for SvelteKit production builds
- vite-plugin-devtools-json 1.0.0 - Development tools integration

## Configuration

- Environment variables loaded from `.env` files (see `.env.example`)
- Required variables:
- Local development uses `USE_LOCAL_CONVEX=true` to run Convex locally on port 3210
- Optional `RESET_LOCAL_BACKEND=true` to reset local Convex database on startup
- `vite.config.ts` - Vite configuration with Tailwind, SvelteKit, and Convex local plugin support
- `svelte.config.js` - SvelteKit configuration using Vercel adapter with experimental remote functions
- `tsconfig.json` - TypeScript compiler options with strict mode enabled
- `eslint.config.js` - ESLint flat config with TypeScript, Svelte, and Prettier support
- `.prettier` configuration inherited from Prettier defaults with Svelte and TailwindCSS plugins

## Platform Requirements

- Bun (primary) or Node.js with npm/yarn (alternative)
- Docker (optional, for running Convex dashboard via `convex:dash` script)
- Git for version control
- Vercel - Deployed using SvelteKit Vercel adapter
- Convex cloud deployment - Backend functions and database
- Clerk cloud instance - User authentication and management

## Build Scripts

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

## Naming Patterns

- Svelte components: PascalCase `.svelte` (e.g., `PageError.svelte`, `ConvexWrapper.svelte`)
- TypeScript files: camelCase `.ts` or `.svelte.ts` (e.g., `convex-env.ts`, `clerk.svelte.ts`)
- Route files: `+page.svelte`, `+layout.svelte`, `+layout.ts` (SvelteKit convention)
- Remote functions: `{name}.remote.ts` (e.g., `demo.remote.ts`)
- Backend modules: split by auth pattern - `authed/`, `private/` directories in `src/convex/`
- Utility services: `{service}.ts` in `src/lib/services/` (e.g., `convex.ts`, `clerk.ts`)
- Stores: `{store}.svelte.ts` in `src/lib/stores/` (e.g., `clerk.svelte.ts`)
- camelCase for all function names
- Setter functions use `set{Name}` pattern (e.g., `setClerkContext`, `setInternalGetClerkContext`)
- Getter functions use `get{Name}` pattern (e.g., `getClerkContext`)
- Event handlers use `handle{Action}` pattern (e.g., `handleSubmit`, `handleDelete`, `handleEdit`)
- Utility functions use verb-first naming (e.g., `formatDate`, `conferenceStatus`, `serializeUnknown`)
- camelCase for all variables and constants
- boolean flags use `is{Adjective}` or `{verb}ing` pattern (e.g., `isClerkLoaded`, `showForm`)
- State variables in Svelte use `$state()` or `$derived.by()` (Svelte 5 pattern)
- Type-guarded variables include type hints (e.g., `editingId = $state<Id<'conferences'> | null>(null)`)
- PascalCase for all type and interface names
- Error classes extend `Data.TaggedError` with suffix `Error` (e.g., `ConvexError`, `ClerkError`)
- Service classes extend `ServiceMap.Service` with suffix `Service` (e.g., `ConvexPrivateService`, `ClerkService`)
- Custom function types use descriptive names with `Runner` suffix (e.g., `PrivateQueryRunner`)
- Generic types use uppercase (e.g., `Args`, `Result`, `Type`)

## Code Style

- Tool: Prettier 3.8.1
- Tabs: enabled (useTabs: true)
- Single quotes: enforced
- Print width: 100 characters
- Trailing commas: disabled (trailingComma: none)
- Tailwind class sorting: enabled via `prettier-plugin-tailwindcss`
- Tool: ESLint 9.39.2 with TypeScript ESLint 8.54.0
- Config: `eslint.config.js` (flat config format)
- Rules include: Prettier integration, Svelte plugin, TypeScript recommended, no-undef disabled
- Special handling for `.svelte` files with TypeScript parser
- TypeScript 5.9.3
- Strict mode: enabled
- Module resolution: bundler
- Force consistent casing: enabled
- Allow JS checking: enabled with checkJs
- Rewrite relative import extensions: enabled

## Import Organization

- `$lib`: points to `src/lib/`
- `$app`: points to SvelteKit's internal modules
- `$env`: points to environment variables (static/public or static/private)
- `@`: alias configured in vite.config.ts pointing to `src/`

## Error Handling

- All custom errors extend `Data.TaggedError` from Effect library
- Error structure includes: `message`, `kind`, `traceId` (UUID), `timestamp`, and optional `cause`
- Example: `ConvexError` in `src/lib/services/convex.ts` includes operation type and function name
- Services define specific error types (e.g., `ConvexError`, `ClerkError`, `GenericError`)
- Backend errors wrapped in `Effect.Effect` types with error as second type parameter
- Server-side handler `effectRunner` in `src/lib/runtime.ts` processes Effect failures
- Logged errors include serialization of underlying Error causes (stack, message)
- Client receives sanitized error objects: `{ message, kind, timestamp, traceId }`
- Used for sequential Effect operations with `yield*` syntax
- Example in `src/lib/remote/demo.remote.ts` and `src/lib/services/clerk.ts`

## Logging

- Backend logging via `console.error()` in error paths
- Log structured objects with consistent properties
- Include traceId, kind, timestamp for all significant operations
- Serialized error causes to avoid circular references
- Client-side errors logged with context (operation type, function name, component path)
- Log statements at error points in Effect runtime handler

## Comments

- Comment on `authed` vs `private` function setup (see `src/convex/authed/helpers.ts` and `src/convex/private/helpers.ts`)
- Brief line comments explaining non-obvious logic (e.g., date conversions)
- No JSDoc/TSDoc comments observed in codebase; types are inferred from function signatures
- File-level comments explain intent (e.g., "authed" queries called from client vs "private" queries from backend)
- Implementation details left to code clarity

## Function Design

- Functions kept concise (5-20 lines typical)
- Complex logic broken into smaller utilities (e.g., `serializeUnknown`, `formatDate`, `conferenceStatus`)
- Use object destructuring for function arguments when multiple params needed
- Type parameters explicit for generic functions
- Example: `{ func, args }` object pattern in query/mutation runners
- Functions return `Effect.Effect<Result, Error, Services>` for backend operations
- Svelte components return JSX-like render output via `{@render children()}`
- Page components return undefined (implicit SvelteKit pattern)
- Type-safe returns with explicit Result type parameters

## Module Design

- Named exports for functions and classes
- Default export for Svelte components (implicit)
- Service classes exported as classes (not singletons)
- Layer static properties for dependency injection
- Not extensively used; imports directly reference files
- Example: `import { getClerkContext } from '$lib/stores/clerk.svelte'` (no barrel file)
- Services use Effect `Layer` pattern for dependency injection
- Services created via `Layer.sync()` or `Layer.mergeAll()`
- Runtime instantiation via `ManagedRuntime.make(appLayer)` in `src/lib/runtime.ts`

## Svelte Component Patterns

- Always use `<script lang="ts">` (TypeScript required)
- Modern Svelte 5 runes: `$state()`, `$derived.by()`, `$effect()`, `onMount()`
- Props via `let { prop } = $props()` in layout components
- Context via `createContext()` and getter/setter functions
- Tailwind CSS classes exclusively (see `prettier-plugin-tailwindcss` integration)
- Custom CSS only when Tailwind insufficient
- Layout CSS in `src/routes/layout.css`
- Event handling: `on:submit={handleSubmit}`
- Class binding: built into Tailwind
- Conditional rendering: `{#if condition} {:else}`
- List rendering: `{#each items as item}`
- Keyed blocks: `{@key editingId}`
- Lifecycle: use Svelte 5 effects and onMount

## Convex Function Patterns

- `authed/` functions: client-side queries/mutations, protected by Clerk JWT token
- `private/` functions: backend-only, protected by `CONVEX_PRIVATE_BRIDGE_KEY`
- Both use custom function wrappers from `convex-helpers/server/customFunctions`
- Use `v` (convex/values) for all args validation
- Optional fields: `v.optional(v.type())`
- ID references: `v.id('tableName')`
- String, number, boolean directly: `v.string()`, `v.number()`, `v.boolean()`

## Backend Service Patterns

- Services extend `ServiceMap.Service<Service, Definition>()`
- Layer created via `Layer.sync()` with implementation
- Used via `yield* ServiceName` in Effect.gen blocks
- Service defines query/mutation/action runners
- Runners return `Effect.Effect<Result, ConvexError, never>`
- Error handling wraps promises with error constructor
- Type-safe through generic type parameters
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

## Pattern Overview

- Monolithic repository with client (SvelteKit) and backend (Convex) colocated
- Server-side Effect (v4) runtime for composable error handling and dependency injection
- Dual auth system: Clerk for user identity, Convex API key for private backend access
- Real-time reactive queries via WebSocket, imperative mutations via client
- Tagged error types (ConvexError, ClerkError, GenericError) flowing through Effect chains

## Layers

- Purpose: Interactive UI for conference management, user authentication via Clerk
- Location: `src/routes/**/*.svelte`, `src/lib/components/**`
- Contains: Svelte components, reactive queries via `useQuery()`, imperative mutations via `useConvexClient()`
- Depends on: Clerk UI, Convex client, convex-svelte
- Used by: End users
- Purpose: Server-side logic, remote functions, request validation, effect orchestration
- Location: `src/lib/remote/**/*.remote.ts`, `src/routes/**/*.ts` (server +page.ts, +layout.ts)
- Contains: Remote functions using SvelteKit's `query()`, Effect generators, error handling
- Depends on: ClerkService, ConvexPrivateService, runtime (Effect layer)
- Used by: Client-side code fetching data, route handlers
- Purpose: Database operations, data validation, real-time subscriptions
- Location: `src/convex/**`
- Contains: Schema definitions, authed queries/mutations, private backend functions
- Depends on: Clerk JWT validation (for authed), API key validation (for private)
- Used by: Client directly (authed functions), SvelteKit server (private functions)
- Purpose: Encapsulated, composable effects for external integrations
- Location: `src/lib/services/**`
- Contains: ConvexPrivateService, ClerkService (ServiceMap.Service instances)
- Depends on: HTTP clients (ConvexHttpClient, @clerk/backend), environment variables
- Used by: Remote functions via Effect.gen() chains
- Purpose: Client-side reactive state for UI
- Location: `src/lib/stores/*.svelte.ts`
- Contains: ClerkStore (Svelte 5 runes-based state), Clerk listener subscriptions
- Depends on: Clerk JS SDK
- Used by: Components and wrappers for auth context

## Data Flow

- Clerk user/session state maintained in `ClerkStore` singleton (initialized in `ClerkWrapper`)
- State is reactive via Svelte 5 runes (`$state`)
- Components access via `getClerkContext()` to subscribe to changes
- Convex queries are real-time subscriptions (auto-update when data changes)

## Key Abstractions

- Purpose: Protect Convex functions that require user identity
- Examples: `src/convex/authed/conferences.ts`, `src/convex/authed/demo.ts`
- Pattern: Wrapper using `customQuery()` from `convex-helpers` that validates `ctx.auth.getUserIdentity()` before handler execution; throws if identity is null
- Purpose: Protect Convex functions called only from SvelteKit backend
- Examples: `src/convex/private/demo.ts`
- Pattern: Wrapper that validates `apiKey` argument against `CONVEX_PRIVATE_BRIDGE_KEY` environment variable; called via ConvexPrivateService
- Purpose: Typed Effect service for backend-to-Convex communication with error handling
- Location: `src/lib/services/convex.ts`
- Pattern: ServiceMap.Service with three methods (query, mutation, action) that wrap ConvexHttpClient calls, inject API key, and catch errors into ConvexError instances
- Purpose: Typed Effect service for backend auth validation
- Location: `src/lib/services/clerk.ts`
- Pattern: ServiceMap.Service with `validateAuth(event)` method that calls Clerk backend API, returns User or throws ClerkError
- Purpose: SvelteKit `query()` functions that compose services and return JSON to client
- Location: `src/lib/remote/**/*.remote.ts`
- Pattern: Use `Effect.gen()` to yield services, `effectRunner` to execute, handle errors via SvelteKit's `error()` function
- Purpose: Execute an Effect chain, logging failures, mapping errors to SvelteKit responses
- Location: `src/lib/runtime.ts`
- Pattern: Takes an Effect, runs it via `ManagedRuntime`, extracts failure cause, logs tagged errors, returns `error(status, publicError)` or result value

## Entry Points

- Location: `src/routes/+layout.svelte`
- Triggers: Every page navigation
- Responsibilities: Wraps app in HTML shell, loads favicon
- Location: `src/routes/app/+layout.svelte`
- Triggers: Navigation to `/app/**` routes
- Responsibilities: Wraps children in ClerkWrapper (auth UI) and ConvexWrapper (WebSocket setup)
- Location: `src/routes/app/+page.svelte`
- Triggers: User navigates to `/app`
- Responsibilities: Renders conference list via `useQuery()`, handles create/update/delete mutations, displays Clerk user button
- Location: `src/routes/app/references/+page.svelte`
- Triggers: User navigates to `/app/references`
- Responsibilities: Demonstrates all integration patterns (client queries, mutations, remote functions, error handling)
- Location: `src/routes/+page.svelte`
- Triggers: User navigates to `/`
- Responsibilities: Demo page that calls `remoteDemoQuery()`, links to `/app`

## Error Handling

- **Effect.gen() for composition**: Errors thrown in Effect chains bubble up; caught by `effectRunner` which inspects cause, logs, extracts first error, returns `error()` response
- **Catch and rethrow**: ConvexPrivateService and ClerkService catch promise rejections, construct tagged error instances with traceId and timestamp
- **Client-side try/catch**: Components wrap mutations in try/catch, display error messages directly (example: `/app/references/+page.svelte` line 34)
- **Async boundary fallback**: `<svelte:boundary>` with `failed` snippet uses `PageError` component to parse `isHttpError()` and display App.Error shape (message, kind, timestamp, traceId)

## Cross-Cutting Concerns

- Convex schema defines allowed fields and types (`src/convex/schema.ts`)
- Convex function args validated via `v.string()`, `v.number()`, etc. in handler definitions
- Client-side UI form validation (HTML5 required attributes)
- **Clerk JWT**: Client sends via `ConvexWrapper.setAuth()` → `convex.setAuth(getClerkAuthToken)` callback
- **API key**: SvelteKit backend adds `CONVEX_PRIVATE_BRIDGE_KEY` to private function args
- **Request validation**: `ClerkService.validateAuth(event)` checks session cookie/JWT from request object
- TypeScript strict mode throughout
- Convex API generated to `src/convex/_generated/api.d.ts` (run `bun run convex:gen` after schema changes)
- Svelte components tagged with `lang="ts"`
- Effect service types use generics for input/output
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.

<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.

<!-- GSD:profile-end -->
