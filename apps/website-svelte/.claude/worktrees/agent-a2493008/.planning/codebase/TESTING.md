# Testing Patterns

**Analysis Date:** 2025-04-02

## Test Framework

**Runner:**

- Not detected - No test framework configured
- No test scripts in `package.json`
- No jest.config.js, vitest.config.ts, or similar

**Assertion Library:**

- Not applicable - no test infrastructure present

**Run Commands:**

```bash
# No test commands available
# Current scripts: dev, build, preview, check, lint, format
```

## Test File Organization

**Location:**

- Not detected - No test files found in codebase
- No `.test.ts`, `.spec.ts`, `.test.svelte`, or `.spec.svelte` files

**Naming:**

- Not applicable

**Structure:**

- Not applicable

## Test Coverage

**Requirements:**

- None enforced - no test configuration or requirements detected

## Current Testing Reality

**Manual Testing Only:**
The project currently relies on:

- Type checking via `svelte-check` and `svelte-kit sync` (available via `bun run check`)
- Linting and formatting checks via `bun run lint` and `bun run format`
- No automated test suite

**Available Verification Commands:**

```bash
bun run check          # Type check and svelte validation
bun run check:watch   # Type checking in watch mode
bun run lint          # Prettier and ESLint validation
bun run format        # Auto-format with Prettier
```

## Recommended Testing Structure (If Implemented)

If testing is added in the future, follow these patterns based on codebase conventions:

**Test Framework Recommendation:**

- Vitest (modern, Vite-integrated)
- Jest as alternative (mature, widespread)

**File Organization:**

- Co-locate tests: `.test.ts` or `.test.svelte` alongside source files
- Example: `src/lib/services/convex.test.ts` next to `src/lib/services/convex.ts`
- Example: `src/routes/app/+page.test.svelte` next to `src/routes/app/+page.svelte`

**Test Structure Pattern:**

For service tests (Effect-based):

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { Effect, Exit } from "effect";
import { runtime } from "$lib/runtime";

describe("ConvexPrivateService", () => {
  it("should execute query with api key", async () => {
    const testEffect = Effect.gen(function* () {
      const convex = yield* ConvexPrivateService;
      const result = yield* convex.query({
        func: api.private.demo.privateDemoQuery,
        args: { username: "test" },
      });
      return result;
    });

    const exit = await runtime.runPromiseExit(testEffect);
    expect(Exit.isSuccess(exit)).toBe(true);
  });
});
```

For Svelte component tests:

```typescript
import { render, screen } from "vitest-svelte";
import PageError from "$lib/components/PageError.svelte";

describe("PageError", () => {
  it("should display error message", () => {
    const error = {
      message: "Test error",
      kind: "TestError",
      timestamp: Date.now(),
      traceId: "test-trace",
    };

    render(PageError, { props: { error } });
    expect(screen.getByText("Test error")).toBeInTheDocument();
  });
});
```

For route handlers:

```typescript
import { describe, it, expect } from "vitest";
import { effectRunner } from "$lib/runtime";

describe("remoteDemoQuery", () => {
  it("should return demo data", async () => {
    // Mock services as needed
    const result = await effectRunner(demoRemote);
    expect(result).toBeDefined();
  });
});
```

## Mocking Strategy (If Implemented)

**Services to Mock:**

- `ConvexPrivateService`: Mock HTTP client for predictable responses
- `ClerkService`: Mock Clerk authentication responses
- `ConvexHttpClient`: Intercept query/mutation/action calls

**Approach:**

```typescript
import { vi } from "vitest";

// Mock effect service
const mockConvexService = Layer.succeed(ConvexPrivateService, {
  query: vi.fn().mockResolvedValue({ test: "data" }),
  mutation: vi.fn().mockResolvedValue({ id: "123" }),
  action: vi.fn().mockResolvedValue({ result: true }),
});

// Mock environment variables
vi.stubEnv("CONVEX_PRIVATE_BRIDGE_KEY", "test-key");
vi.stubEnv("CLERK_SECRET_KEY", "test-secret");
```

**What to Mock:**

- External service calls (Convex, Clerk, HTTP requests)
- Environment variables
- Database operations
- Async dependencies

**What NOT to Mock:**

- Pure functions (`formatDate`, `conferenceStatus`)
- Type definitions and validation logic
- Local state management
- UI rendering (for integration tests)

## Error Handling in Tests

Expected error pattern from codebase:

```typescript
import { describe, it, expect } from "vitest";
import { Effect, Exit, Cause } from "effect";

describe("Error handling", () => {
  it("should catch ConvexError", async () => {
    const failingEffect = Effect.gen(function* () {
      const convex = yield* ConvexPrivateService;
      // Trigger error by invalid args
      yield* convex.query({
        func: api.private.demo.privateDemoQuery,
        args: {}, // Missing required username
      });
    });

    const exit = await runtime.runPromiseExit(failingEffect);
    expect(Exit.isFailure(exit)).toBe(true);

    // Check error structure
    const cause = exit.cause;
    const error = Cause.findErrorOption(cause);
    expect(error._tag).toBe("Some");
    expect(error.value).toBeInstanceOf(ConvexError);
  });
});
```

## Async Testing Pattern

For Effect-based async:

```typescript
it("should handle async queries", async () => {
  const effect = Effect.gen(function* () {
    const convex = yield* ConvexPrivateService;
    const result = yield* convex.query({
      func: api.private.demo.privateDemoQuery,
      args: { username: "async-test" },
    });
    return result;
  });

  const result = await runtime.runPromise(effect);
  expect(result).toBeDefined();
});
```

For promise-based Svelte stores:

```typescript
it("should load clerk on mount", async () => {
  const clerkStore = new ClerkStore();
  expect(clerkStore.isClerkLoaded).toBe(false);

  // Simulate mount lifecycle
  await vi.waitFor(() => {
    expect(clerkStore.isClerkLoaded).toBe(true);
  });
});
```

## Test Coverage Gaps (Current)

**Untested Areas:**

- All services in `src/lib/services/` (convex.ts, clerk.ts) - Critical
- All Convex functions in `src/convex/authed/` and `src/convex/private/` - Critical
- All Svelte components in `src/lib/components/` and routes - High
- Remote functions in `src/lib/remote/` - High
- Error handling and serialization in `src/lib/runtime.ts` - High
- Svelte store implementation in `src/lib/stores/clerk.svelte.ts` - Medium

**Why Important:**

- No automated verification of service integrations
- Error handling paths not validated
- Breaking changes in Clerk/Convex integration undetected
- Component rendering logic untested

**Priority for Implementation:**

1. Service layer tests (ConvexPrivateService, ClerkService) - blocks all features
2. Convex function tests - validates data mutations
3. Remote function tests - validates backend integration
4. Component tests - validates UI correctness

## Configuration Recommendations (If Testing Added)

**vitest.config.ts (if using Vitest):**

```typescript
import { defineConfig } from "vitest/config";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [sveltekit(), tailwindcss()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.ts", "src/**/*.svelte"],
      exclude: ["src/**/*.test.ts", "src/**/*.spec.ts", "src/**/_generated/**"],
    },
  },
});
```

**Test Setup File Pattern:**

```typescript
// src/test/setup.ts
import { vi } from "vitest";
import { config } from "@sveltejs/kit";

// Mock environment variables
vi.stubEnv("CONVEX_PRIVATE_BRIDGE_KEY", "test-key");
vi.stubEnv("CLERK_SECRET_KEY", "test-secret");
vi.stubEnv("PUBLIC_CLERK_PUBLISHABLE_KEY", "pk_test");
```

---

_Testing analysis: 2025-04-02_
