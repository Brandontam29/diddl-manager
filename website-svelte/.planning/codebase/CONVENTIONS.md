# Coding Conventions

**Analysis Date:** 2025-04-02

## Naming Patterns

**Files:**

- Svelte components: PascalCase `.svelte` (e.g., `PageError.svelte`, `ConvexWrapper.svelte`)
- TypeScript files: camelCase `.ts` or `.svelte.ts` (e.g., `convex-env.ts`, `clerk.svelte.ts`)
- Route files: `+page.svelte`, `+layout.svelte`, `+layout.ts` (SvelteKit convention)
- Remote functions: `{name}.remote.ts` (e.g., `demo.remote.ts`)
- Backend modules: split by auth pattern - `authed/`, `private/` directories in `src/convex/`
- Utility services: `{service}.ts` in `src/lib/services/` (e.g., `convex.ts`, `clerk.ts`)
- Stores: `{store}.svelte.ts` in `src/lib/stores/` (e.g., `clerk.svelte.ts`)

**Functions:**

- camelCase for all function names
- Setter functions use `set{Name}` pattern (e.g., `setClerkContext`, `setInternalGetClerkContext`)
- Getter functions use `get{Name}` pattern (e.g., `getClerkContext`)
- Event handlers use `handle{Action}` pattern (e.g., `handleSubmit`, `handleDelete`, `handleEdit`)
- Utility functions use verb-first naming (e.g., `formatDate`, `conferenceStatus`, `serializeUnknown`)

**Variables:**

- camelCase for all variables and constants
- boolean flags use `is{Adjective}` or `{verb}ing` pattern (e.g., `isClerkLoaded`, `showForm`)
- State variables in Svelte use `$state()` or `$derived.by()` (Svelte 5 pattern)
- Type-guarded variables include type hints (e.g., `editingId = $state<Id<'conferences'> | null>(null)`)

**Types:**

- PascalCase for all type and interface names
- Error classes extend `Data.TaggedError` with suffix `Error` (e.g., `ConvexError`, `ClerkError`)
- Service classes extend `ServiceMap.Service` with suffix `Service` (e.g., `ConvexPrivateService`, `ClerkService`)
- Custom function types use descriptive names with `Runner` suffix (e.g., `PrivateQueryRunner`)
- Generic types use uppercase (e.g., `Args`, `Result`, `Type`)

## Code Style

**Formatting:**

- Tool: Prettier 3.8.1
- Tabs: enabled (useTabs: true)
- Single quotes: enforced
- Print width: 100 characters
- Trailing commas: disabled (trailingComma: none)
- Tailwind class sorting: enabled via `prettier-plugin-tailwindcss`

**Linting:**

- Tool: ESLint 9.39.2 with TypeScript ESLint 8.54.0
- Config: `eslint.config.js` (flat config format)
- Rules include: Prettier integration, Svelte plugin, TypeScript recommended, no-undef disabled
- Special handling for `.svelte` files with TypeScript parser

**Language Settings:**

- TypeScript 5.9.3
- Strict mode: enabled
- Module resolution: bundler
- Force consistent casing: enabled
- Allow JS checking: enabled with checkJs
- Rewrite relative import extensions: enabled

## Import Organization

**Order:**

1. Node.js built-in modules (e.g., `import { randomUUID } from 'node:crypto'`)
2. Third-party packages (e.g., `import { Clerk } from '@clerk/clerk-js'`)
3. Environment variables (e.g., `import { PUBLIC_CLERK_PUBLISHABLE_KEY } from '$env/static/public'`)
4. SvelteKit utilities (e.g., `import { createContext, onMount } from 'svelte'`)
5. Local lib imports with `$` alias (e.g., `import { getClerkContext } from '$lib/stores/clerk.svelte'`)
6. Generated API imports (e.g., `import { api } from '../../convex/_generated/api'`)
7. Type imports for complex types (e.g., `import type { RequestEvent } from '@sveltejs/kit'`)

**Path Aliases:**

- `$lib`: points to `src/lib/`
- `$app`: points to SvelteKit's internal modules
- `$env`: points to environment variables (static/public or static/private)
- `@`: alias configured in vite.config.ts pointing to `src/`

## Error Handling

**Pattern: Tagged Errors with Effect:**

- All custom errors extend `Data.TaggedError` from Effect library
- Error structure includes: `message`, `kind`, `traceId` (UUID), `timestamp`, and optional `cause`
- Example: `ConvexError` in `src/lib/services/convex.ts` includes operation type and function name
- Services define specific error types (e.g., `ConvexError`, `ClerkError`, `GenericError`)

**Error Propagation:**

- Backend errors wrapped in `Effect.Effect` types with error as second type parameter
- Server-side handler `effectRunner` in `src/lib/runtime.ts` processes Effect failures
- Logged errors include serialization of underlying Error causes (stack, message)
- Client receives sanitized error objects: `{ message, kind, timestamp, traceId }`

**Try-Catch with Effect:**

```typescript
Effect.tryPromise({
  try: () => somePromise(),
  catch: (error) => new CustomError({ message: error.message, ... })
})
```

**Effect.gen for Composition:**

- Used for sequential Effect operations with `yield*` syntax
- Example in `src/lib/remote/demo.remote.ts` and `src/lib/services/clerk.ts`

## Logging

**Framework:** `console` (built-in)

**Patterns:**

- Backend logging via `console.error()` in error paths
- Log structured objects with consistent properties
- Include traceId, kind, timestamp for all significant operations
- Serialized error causes to avoid circular references
- Client-side errors logged with context (operation type, function name, component path)
- Log statements at error points in Effect runtime handler

**Logging Structure Example:**

```typescript
console.error('Convex error', {
	traceId: errorValue.traceId,
	kind: errorValue.kind,
	timestamp: errorValue.timestamp,
	operation: errorValue.operation,
	functionName: errorValue.functionName,
	message: errorValue.message,
	cause: serializeUnknown(errorValue.cause)
});
```

## Comments

**When to Comment:**

- Comment on `authed` vs `private` function setup (see `src/convex/authed/helpers.ts` and `src/convex/private/helpers.ts`)
- Brief line comments explaining non-obvious logic (e.g., date conversions)
- No JSDoc/TSDoc comments observed in codebase; types are inferred from function signatures

**Documentation Pattern:**

- File-level comments explain intent (e.g., "authed" queries called from client vs "private" queries from backend)
- Implementation details left to code clarity

## Function Design

**Size:**

- Functions kept concise (5-20 lines typical)
- Complex logic broken into smaller utilities (e.g., `serializeUnknown`, `formatDate`, `conferenceStatus`)

**Parameters:**

- Use object destructuring for function arguments when multiple params needed
- Type parameters explicit for generic functions
- Example: `{ func, args }` object pattern in query/mutation runners

**Return Values:**

- Functions return `Effect.Effect<Result, Error, Services>` for backend operations
- Svelte components return JSX-like render output via `{@render children()}`
- Page components return undefined (implicit SvelteKit pattern)
- Type-safe returns with explicit Result type parameters

## Module Design

**Exports:**

- Named exports for functions and classes
- Default export for Svelte components (implicit)
- Service classes exported as classes (not singletons)
- Layer static properties for dependency injection

**Barrel Files:**

- Not extensively used; imports directly reference files
- Example: `import { getClerkContext } from '$lib/stores/clerk.svelte'` (no barrel file)

**Service Initialization:**

- Services use Effect `Layer` pattern for dependency injection
- Services created via `Layer.sync()` or `Layer.mergeAll()`
- Runtime instantiation via `ManagedRuntime.make(appLayer)` in `src/lib/runtime.ts`

## Svelte Component Patterns

**Script Setup:**

- Always use `<script lang="ts">` (TypeScript required)
- Modern Svelte 5 runes: `$state()`, `$derived.by()`, `$effect()`, `onMount()`
- Props via `let { prop } = $props()` in layout components
- Context via `createContext()` and getter/setter functions

**Styling:**

- Tailwind CSS classes exclusively (see `prettier-plugin-tailwindcss` integration)
- Custom CSS only when Tailwind insufficient
- Layout CSS in `src/routes/layout.css`

**Directives:**

- Event handling: `on:submit={handleSubmit}`
- Class binding: built into Tailwind
- Conditional rendering: `{#if condition} {:else}`
- List rendering: `{#each items as item}`
- Keyed blocks: `{@key editingId}`
- Lifecycle: use Svelte 5 effects and onMount

## Convex Function Patterns

**Authentication Layers:**

- `authed/` functions: client-side queries/mutations, protected by Clerk JWT token
- `private/` functions: backend-only, protected by `CONVEX_PRIVATE_BRIDGE_KEY`
- Both use custom function wrappers from `convex-helpers/server/customFunctions`

**Function Definitions:**

```typescript
export const functionName = authedQuery({
	args: { field: v.type() },
	handler: async (ctx, args) => {
		// implementation
	}
});
```

**Type Validation:**

- Use `v` (convex/values) for all args validation
- Optional fields: `v.optional(v.type())`
- ID references: `v.id('tableName')`
- String, number, boolean directly: `v.string()`, `v.number()`, `v.boolean()`

## Backend Service Patterns

**Effect Services:**

- Services extend `ServiceMap.Service<Service, Definition>()`
- Layer created via `Layer.sync()` with implementation
- Used via `yield* ServiceName` in Effect.gen blocks

**Example Pattern (ConvexPrivateService):**

- Service defines query/mutation/action runners
- Runners return `Effect.Effect<Result, ConvexError, never>`
- Error handling wraps promises with error constructor
- Type-safe through generic type parameters

---

_Convention analysis: 2025-04-02_
