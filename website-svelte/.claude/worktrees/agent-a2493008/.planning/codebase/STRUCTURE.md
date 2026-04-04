# Codebase Structure

**Analysis Date:** 2026-04-02

## Directory Layout

```
website-svelte/
├── src/
│   ├── routes/                 # SvelteKit route pages and layouts
│   │   ├── +layout.svelte     # Root layout (HTML shell, favicon)
│   │   ├── +page.svelte       # Home page (demo, remote query)
│   │   ├── app/
│   │   │   ├── +layout.svelte # App wrapper (Clerk + Convex setup)
│   │   │   ├── +layout.ts     # Route config (ssr: false)
│   │   │   ├── +page.svelte   # Conferences list/CRUD
│   │   │   └── references/
│   │   │       └── +page.svelte # Pattern reference documentation
│   │   └── layout.css         # Global styles
│   ├── convex/                # Convex backend definitions
│   │   ├── _generated/        # Auto-generated API types (DO NOT EDIT)
│   │   │   ├── api.d.ts       # Function definitions for client import
│   │   │   ├── server.d.ts    # Server context types
│   │   │   └── dataModel.d.ts # Database table/document types
│   │   ├── authed/            # Client-facing, auth-protected functions
│   │   │   ├── helpers.ts     # authedQuery, authedMutation, authedAction wrappers
│   │   │   ├── demo.ts        # Demo authed query
│   │   │   └── conferences.ts # CRUD mutations/queries for conferences
│   │   ├── private/           # Backend-only, API-key protected
│   │   │   ├── helpers.ts     # privateQuery, privateMutation, privateAction wrappers
│   │   │   └── demo.ts        # Demo private query
│   │   ├── auth.config.ts     # Clerk JWT issuer config
│   │   ├── schema.ts          # Database schema (tables, fields)
│   │   └── tsconfig.json      # TypeScript config for Convex code
│   ├── lib/
│   │   ├── services/          # Effect service definitions (external integrations)
│   │   │   ├── convex.ts      # ConvexPrivateService: backend→Convex HTTP calls
│   │   │   └── clerk.ts       # ClerkService: backend auth validation
│   │   ├── remote/            # SvelteKit remote functions
│   │   │   └── demo.remote.ts # Demo queries using Effect + services
│   │   ├── stores/            # Reactive state (Svelte 5 runes)
│   │   │   └── clerk.svelte.ts # ClerkStore: user, session, org state
│   │   ├── components/        # Reusable Svelte components
│   │   │   └── PageError.svelte # Error display for async boundaries
│   │   ├── wrappers/          # Context providers
│   │   │   ├── ClerkWrapper.svelte # Initializes Clerk, provides context
│   │   │   └── ConvexWrapper.svelte # Sets up Convex client, attaches auth
│   │   ├── assets/            # Static assets
│   │   │   └── favicon.svg
│   │   ├── runtime.ts         # Effect runtime setup, effectRunner, error utilities
│   │   └── convex-env.ts      # Convex URL resolution (local vs hosted)
│   └── app.d.ts               # SvelteKit app type augmentation (App.Error interface)
├── models/                    # (Empty or future data models)
├── .planning/codebase/        # Generated analysis documents
├── convex.json                # Convex CLI config
├── tsconfig.json              # Root TypeScript config
├── package.json               # Dependencies and scripts
├── svelte.config.js           # SvelteKit config
└── vite.config.ts             # Vite bundler config
```

## Directory Purposes

**`src/routes/`:**
- Purpose: SvelteKit page and layout files (file-based routing)
- Contains: +page.svelte (pages), +layout.svelte (layouts), +page.ts (server loaders), +layout.ts (route config)
- Key files: `+layout.svelte` (root HTML shell), `app/+layout.svelte` (auth wrapper), `app/+page.svelte` (main app)

**`src/convex/`:**
- Purpose: Convex backend schema, auth config, and functions (client-facing and private)
- Contains: Schema definitions, function handlers, auth configuration
- Key files: `schema.ts` (database tables), `auth.config.ts` (Clerk JWT), `authed/` (public functions), `private/` (backend-only functions)

**`src/convex/_generated/`:**
- Purpose: Auto-generated type definitions from Convex schema and functions
- Contains: Type stubs for client imports, data model types
- Key files: `api.d.ts` (import this as `import { api } from 'path/to/_generated/api'`)
- **IMPORTANT:** Auto-generated; never edit directly. Regenerate after schema changes with `bun run convex:gen`

**`src/convex/authed/`:**
- Purpose: Functions that require user authentication (called from client)
- Contains: Wrapped queries/mutations using `authedQuery()`, `authedMutation()` helpers
- Pattern: Each handler receives `ctx` with identity, args validated via `v.*` validators
- Examples: `conferences.ts` (list/create/update/delete), `demo.ts` (demo query)

**`src/convex/private/`:**
- Purpose: Functions called only from SvelteKit backend via API key
- Contains: Wrapped queries/mutations using `privateQuery()`, `privateMutation()` helpers
- Pattern: Each handler receives `ctx`, validates `CONVEX_PRIVATE_BRIDGE_KEY` via helper
- Examples: `demo.ts` (demo query)

**`src/lib/`:**
- Purpose: Reusable code shared across routes (components, stores, services)
- Contains: Services (Effect), stores (state), components, wrappers, utilities
- Key files: `runtime.ts` (Effect setup), `convex-env.ts` (URL resolution), `app.d.ts` (types)

**`src/lib/services/`:**
- Purpose: Effect service definitions for external integrations
- Contains: ConvexPrivateService, ClerkService as ServiceMap.Service instances
- Pattern: Each service is a `Layer` factory that returns typed operation methods
- Usage: Composed in Effect.gen() chains, injected by ManagedRuntime

**`src/lib/remote/`:**
- Purpose: SvelteKit remote functions (server-side queries, called from components)
- Contains: Functions using SvelteKit's `query()` from `$app/server`, Effect.gen() chains
- Pattern: Each function yields services, returns JSON to client, errors caught by effectRunner
- Examples: `demo.remote.ts` (privateDemoQuery, authedDemoQuery)

**`src/lib/stores/`:**
- Purpose: Reactive client-side state
- Contains: Svelte 5 runes-based state classes and helpers
- Pattern: Extend state via `$state`, computed via `$derived`, effects via `$effect`
- Examples: `clerk.svelte.ts` (ClerkStore singleton with user/session/org)

**`src/lib/components/`:**
- Purpose: Reusable Svelte components
- Contains: UI components (buttons, forms, error displays)
- Examples: `PageError.svelte` (parses and displays App.Error)

**`src/lib/wrappers/`:**
- Purpose: Context-providing wrapper components
- Contains: Svelte components that set up providers and state
- Examples: `ClerkWrapper.svelte` (initializes Clerk), `ConvexWrapper.svelte` (sets up WebSocket)

## Key File Locations

**Entry Points:**
- `src/routes/+layout.svelte`: Root HTML shell, loaded for all routes
- `src/routes/app/+layout.svelte`: Wraps `/app/**` routes in auth/Convex context
- `src/routes/app/+page.svelte`: Main application UI (conferences list)
- `src/routes/app/references/+page.svelte`: Pattern reference page

**Configuration:**
- `convex.json`: Convex deployment URL, API credentials (checked into git, secrets in env)
- `tsconfig.json`: TypeScript compiler options
- `svelte.config.js`: SvelteKit adapter (Vercel), preprocessing
- `vite.config.ts`: Bundler config, Convex plugin

**Core Logic:**
- `src/lib/runtime.ts`: Effect runtime, effectRunner, error types (GenericError, ConvexError, ClerkError)
- `src/lib/services/convex.ts`: ConvexPrivateService (backend→Convex calls with error handling)
- `src/lib/services/clerk.ts`: ClerkService (backend auth validation)
- `src/lib/stores/clerk.svelte.ts`: ClerkStore (client-side auth state)
- `src/convex/authed/conferences.ts`: Conference CRUD mutations/queries

**Testing:**
- No test files detected in codebase (testing setup not implemented)

## Naming Conventions

**Files:**
- `.svelte` for Svelte components (e.g., `PageError.svelte`, `ConvexWrapper.svelte`)
- `.ts` for TypeScript utilities and scripts (e.g., `runtime.ts`, `convex.ts`)
- `.remote.ts` for SvelteKit remote functions (e.g., `demo.remote.ts`)
- `+page.svelte` for route pages (SvelteKit convention)
- `+layout.svelte` for layout wrappers (SvelteKit convention)
- `+layout.ts` for route config (SvelteKit convention)
- `schema.ts` for Convex data model definitions

**Directories:**
- `authed/` for client-facing Convex functions
- `private/` for backend-only Convex functions
- `_generated/` for auto-generated code (never edit)
- `src/routes/` follows URL structure (e.g., `app/references/+page.svelte` → `/app/references`)

**Functions:**
- camelCase for function names (e.g., `authedQuery`, `privateMutation`, `effectRunner`)
- Uppercase for class names (e.g., `ClerkStore`, `ConvexError`, `ClerkService`)
- Suffixed with `Service` for Effect service classes (e.g., `ConvexPrivateService`)

**Variables:**
- camelCase for variables and constants (e.g., `clerkContext`, `convex`, `CONVEX_URL`)
- UPPERCASE for environment variables (e.g., `CONVEX_PRIVATE_BRIDGE_KEY`, `PUBLIC_CLERK_PUBLISHABLE_KEY`)

**Types:**
- PascalCase for types and interfaces (e.g., `ClerkError`, `ConvexError`, `GenericError`)
- Suffixed with `Error` for error types
- Suffixed with `Service` for Effect service types

## Where to Add New Code

**New Feature (Conference Management):**
- Convex mutations: `src/convex/authed/conferences.ts` (add new mutation export)
- Convex queries: `src/convex/authed/conferences.ts` (add new query export)
- UI component: `src/routes/app/+page.svelte` (add form/list section)
- After changes: Run `bun run convex:gen` to regenerate types

**New External Service Integration:**
- Create service: `src/lib/services/newservice.ts` (extend ServiceMap.Service, define Layer)
- Add to runtime: `src/lib/runtime.ts` (merge layer into appLayer)
- Create error type: Define in service file (e.g., `NewServiceError extends Data.TaggedError`)
- Add to effectRunner: Handle error in logging and status code mapping
- Use in remote: `src/lib/remote/*.remote.ts` (yield* NewService in Effect.gen())

**New Route/Page:**
- Create layout: `src/routes/[section]/+layout.svelte` (wrap with wrappers if under `/app`)
- Create page: `src/routes/[section]/+page.svelte` (use useQuery/useConvexClient for Convex, await remote functions)
- Server loader: `src/routes/[section]/+page.ts` (optional, for load function or page config)

**New Component:**
- Create file: `src/lib/components/NewComponent.svelte` with `lang="ts"`
- Import in routes: `import NewComponent from '$lib/components/NewComponent.svelte'`
- Use Tailwind for styling, avoid custom CSS unless necessary

**Utilities/Helpers:**
- Shared helpers: `src/lib/` (create new .ts file, e.g., `formatters.ts`, `validators.ts`)
- Component utilities: `src/lib/components/` (if tightly coupled to components)

## Special Directories

**`src/convex/_generated/`:**
- Purpose: Auto-generated type stubs from Convex backend
- Generated: Yes (by `bun run convex:gen`)
- Committed: Yes (commit generated code to git)
- **Action required:** After modifying `schema.ts` or any function signature, run `bun run convex:gen` before committing

**`node_modules/`:**
- Purpose: Installed npm/bun dependencies
- Generated: Yes (from package.json + lockfile)
- Committed: No (use .gitignore)

**`.svelte-kit/`:**
- Purpose: SvelteKit build cache and generated types
- Generated: Yes (by `svelte-kit sync`)
- Committed: No (use .gitignore)

---

*Structure analysis: 2026-04-02*
