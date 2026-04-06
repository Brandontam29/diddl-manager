# Codebase Concerns

**Analysis Date:** 2026-04-02

## Test Coverage Gaps

**No test suite exists:**

- What's not tested: Zero test files detected in codebase. All application logic, authentication flows, data mutations, and UI interactions are untested.
- Files: `src/**/*.ts`, `src/**/*.svelte` - entire codebase
- Risk: Changes to critical auth logic (Clerk validation, API key verification), Convex mutations, or Effect runtime handling could introduce bugs undetected. Form validation errors, data mutation failures, and business logic regressions would only be caught in production.
- Priority: **High** - This is a single-user application managing conference data. Test coverage would prevent data loss and security issues.

**Clerk auth errors in catch-all:**

- What's not tested: `ClerkService.validateAuth()` error handling is untested. Missing explicit test for cases where Clerk API fails, user ID lookup fails, or auth state is corrupted.
- Files: `src/lib/services/clerk.ts` (lines 26-67), `src/lib/stores/clerk.svelte.ts` (lines 46-59)
- Risk: Silent failures if Clerk API is down. The try/catch at line 46-59 in `clerk.svelte.ts` sets `isClerkLoaded = true` in both success and error cases (line 54 and 58), masking initialization failures.

**Mutation error handling gaps:**

- What's not tested: Client-side mutations (`handleSubmit`, `handleDelete` in `+page.svelte`) have no try/catch blocks.
- Files: `src/routes/app/+page.svelte` (lines 31-55, 67-69)
- Risk: Network failures or Convex errors during conference create/update/delete will throw uncaught errors, crashing the component or leaving the UI in an inconsistent state (e.g., `mutationLoading` flag never resets).

## Known Bugs

**Clerk initialization mask failure:**

- Symptoms: If Clerk fails to load due to network error or invalid config, UI still renders as loaded but `clerkContext.clerk.user` is null. Users see nothing happens when clicking auth buttons.
- Files: `src/lib/stores/clerk.svelte.ts` (lines 54-59)
- Trigger: Set invalid `PUBLIC_CLERK_PUBLISHABLE_KEY` or simulate network failure to Clerk APIs during `clerk.load()` call.
- Workaround: Check browser console for "Error loading Clerk" message; restart app.
- Fix approach: Remove duplicate `isClerkLoaded = true` in finally block (line 58). Only set to `true` on success (line 54). Add error UI state (e.g., `isClerkError` flag) to display error message to user.

**Form mutation errors cause silent failure:**

- Symptoms: Clicking "Create/Update/Delete" during form submission shows no feedback if network request fails. Button reverts to normal state but data isn't created/updated.
- Files: `src/routes/app/+page.svelte` (lines 31-55 for handleSubmit, lines 67-69 for handleDelete)
- Trigger: Disable network in DevTools, click "Add" button, observe button loading state stops but no error message appears.
- Workaround: Check browser console for error; manually refresh page to verify data wasn't created.
- Fix approach: Wrap mutation calls in try/catch. Display error toast/modal to user. Add optional error state: `mutationError = $state<string | null>(null)`.

**Mutation doesn't return ID on update/delete:**

- Symptoms: `update` mutation (line 37 in conferences.ts) doesn't return a value but frontend shows success message. `remove` mutation (line 44) also returns void.
- Files: `src/convex/authed/conferences.ts` (lines 24-45)
- Trigger: Update or delete a conference; observe browser console or compare with `create` mutation which returns ID.
- Risk: Frontend can't confirm operation completed or access new data. Difficult to track which mutation succeeded if multiple fire simultaneously.
- Fix approach: Return ID from update (return second param of ctx.db.patch) and delete (return deleted ID before calling delete) for consistency with create.

## Fragile Areas

**Clerk store initialization timing issue:**

- Files: `src/lib/stores/clerk.svelte.ts`, `src/lib/wrappers/ConvexWrapper.svelte`
- Why fragile: ConvexWrapper (line 6) calls `getClerkContext()` which throws if ClerkWrapper hasn't initialized the context. If ClerkWrapper and ConvexWrapper are ever reordered in layout, app crashes with "Clerk context not found".
- Safe modification: Add defensive check in `getClerkContext()` to return a fallback or init on-demand. Or explicitly document that ClerkWrapper must always come before ConvexWrapper.

**Date validation missing:**

- Files: `src/routes/app/+page.svelte` (lines 156-177, 31-55)
- Why fragile: Form accepts any date input. No validation that `endDate > startDate`. User can create conference where end is before start without error.
- Risk: Backend doesn't validate either (schema just accepts numbers). UI displays negative duration or confusing date ranges.
- Safe modification: Add client-side validation in `handleSubmit`: check `end > start` before submitting. Add Convex validation in schema or function.

**ConvexWrapper auth token may be null:**

- Files: `src/lib/wrappers/ConvexWrapper.svelte` (lines 8-14)
- Why fragile: `getClerkAuthToken` returns `null` if `currentSession` is null (line 9). Calling `convex.setAuth(getClerkAuthToken)` with null callback could cause WebSocket auth to fail silently.
- Risk: Queries/mutations fire without auth token. Depending on Convex permissions, requests either fail or execute without user identity context.
- Safe modification: Block Convex requests until session is available. Call `convex.setAuth()` only after `currentSession` is non-null.

**Effect runtime singleton:**

- Files: `src/lib/runtime.ts` (line 10)
- Why fragile: `ManagedRuntime` is created once at module load. If any Effect fails catastrophically (defect), runtime might enter bad state. No restart mechanism.
- Risk: A single defect in one Effect operation could poison all subsequent Effects in the app.
- Safe modification: Wrap `effectRunner` calls in try/catch at call sites. Consider creating runtime per-request instead of singleton (note: would change performance profile).

## Security Considerations

**API key exposed in browser error messages:**

- Risk: If Convex mutation fails, error is caught and displayed. Check if error messages leak `CONVEX_PRIVATE_BRIDGE_KEY`.
- Files: `src/routes/app/+page.svelte` (line 35), `src/lib/remote/demo.remote.ts` (lines 22-26)
- Current mitigation: `effectRunner` in `runtime.ts` sanitizes errors before sending to client (lines 68-78), stripping internal details.
- Recommendations: Verify in production that no sensitive config leaks in HTTP response bodies. Add test for error serialization.

**Private Convex bridge key validation:**

- Risk: `CONVEX_PRIVATE_BRIDGE_KEY` is a string comparison in `private/helpers.ts` (line 16). No rate limiting or attack detection if wrong key is guessed.
- Files: `src/convex/private/helpers.ts` (lines 13-21)
- Current mitigation: Key is environment variable, not in code. Convex HTTP client validates HTTPS.
- Recommendations: Use short-lived tokens (if Convex supports) instead of static API keys. Add rate limiting or request signing at HTTP layer.

**Clerk JWT validation depends on environment config:**

- Risk: `CLERK_JWT_ISSUER_DOMAIN` must match Clerk org setting exactly or auth silently fails.
- Files: `src/convex/auth.config.ts` (line 6)
- Current mitigation: Env var loaded from static config.
- Recommendations: Add startup check that validates JWT config against live Clerk API. Fail loudly if domain mismatch.

**No input sanitization on form fields:**

- Risk: Conference name, location, description are user-provided strings passed directly to Convex.
- Files: `src/routes/app/+page.svelte` (lines 15-19), `src/convex/authed/conferences.ts` (lines 11-22)
- Current mitigation: Convex schema validates type (`v.string()`) but not length or content.
- Recommendations: Add maxLength to form inputs. Add v.string({ maxSize }) in Convex schema.

## Performance Bottlenecks

**Unoptimized conference list rendering:**

- Problem: `conferences/+page.svelte` renders full list without pagination or virtualization. Each conference item runs `conferenceStatus()` function on every render.
- Files: `src/routes/app/+page.svelte` (lines 224-302)
- Cause: No pagination in `list` query. No memoization of `conferenceStatus` calculation.
- Improvement path: Implement cursor-based pagination in `api.authed.conferences.list`. Memoize status calculation or move to Convex query.

**Full list query on every component mount:**

- Problem: `useQuery(api.authed.conferences.list, {})` subscribes to entire table. With 10k conferences, this becomes slow.
- Files: `src/routes/app/+page.svelte` (line 10), `src/convex/authed/conferences.ts` (lines 4-9)
- Cause: Query collects all documents without filter or limit.
- Improvement path: Add filter/sort to query (e.g., by date range). Implement load-more pattern.

**Date conversion overhead:**

- Problem: Every conference item calls `formatDate()` twice (startDate, endDate). Function creates new Date object.
- Files: `src/routes/app/+page.svelte` (lines 71-77, 245-247)
- Cause: No memoization. Date conversions happen on every render.
- Improvement path: Pre-compute formatted dates in Convex or store as strings. Use Intl.DateTimeFormat singleton.

## Dependencies at Risk

**Effect framework beta version:**

- Risk: Using `effect@^4.0.0-beta.31` in production. Beta means API could change, bugs may exist, minimal long-term support guarantees.
- Files: `package.json` (line 52), used throughout `src/lib/runtime.ts`, `src/lib/services/*.ts`
- Impact: Breaking changes in next Effect release would require rewrite of entire error handling layer. Limited community support for beta issues.
- Migration plan: Monitor Effect stable release schedule. Consider pinning to exact version to avoid auto-upgrade. Plan for migration to v5 stable when available.

**@effect/platform-node also beta:**

- Risk: `@effect/platform-node@^4.0.0-beta.31` is also pre-release.
- Files: `package.json` (line 47), imported in `runtime.ts` (line 3)
- Impact: Same risk as Effect core. Node platform APIs might change.
- Migration plan: Lock to exact version until stable.

**Convex SDK pre-release features:**

- Risk: Using `convex@^1.33.0` with private bridge key pattern. If private queries/mutations API changes, code breaks.
- Files: `src/convex/private/helpers.ts`, `package.json` (line 48)
- Impact: Breaking changes in Convex could require refactoring all backend code.
- Migration plan: Subscribe to Convex breaking changes. Add integration tests that verify private/public function patterns still work.

**Unhandled peer dependency mismatches:**

- Risk: `convex-svelte` requires `convex@^1.10.0` and `svelte@^5.0.0`. Project uses `svelte@^5.51.0` (compatible) but future Svelte 6 could break.
- Files: `package.json` (dependencies and devDependencies)
- Impact: Major version bumps in either library could cause incompatibilities.
- Migration plan: Run `bun check` regularly. Subscribe to convex-svelte updates.

## Scaling Limits

**Single table design for multi-user:**

- Current capacity: `conferences` table has no user/org association. All authenticated users see and can modify all conferences.
- Limit: Breaks at first second user. Any user can delete any conference.
- Scaling path: Add `userId` field to conferences table. Add `ctx.identity.tokenIdentifier` check in mutations to ensure user owns conference. Add indexes on userId.

**No pagination - query scales linearly with data:**

- Current capacity: List query works fine with <100 conferences. After 1000, page load becomes noticeable.
- Limit: At 10k+ conferences, list query times out or becomes slow.
- Scaling path: Implement cursor-based pagination with LIMIT. Add filtering by date range.

**Static auth token per session:**

- Current capacity: Each browser session refreshes Clerk token on demand. Works for single user.
- Limit: No token revocation strategy. If token is compromised, it remains valid until expiry.
- Scaling path: Implement token refresh with short TTL. Add logout endpoint that invalidates server-side sessions.

## Missing Critical Features

**No user isolation:**

- Problem: Conferences aren't associated with users. Any authenticated user can see, edit, delete all conferences.
- Blocks: Multi-user usage, data privacy, multi-org support.
- Files: `src/convex/authed/conferences.ts`, `src/convex/schema.ts`

**No deletion confirmation:**

- Problem: Delete button removes conference immediately without warning.
- Blocks: Accidental deletions can't be recovered (no soft delete, no recovery).
- Files: `src/routes/app/+page.svelte` (line 278)

**No audit trail:**

- Problem: No record of who created/modified/deleted conferences or when.
- Blocks: Debugging, compliance, rollback of accidental changes.
- Files: Entire codebase

**No error recovery UI:**

- Problem: Mutation errors display in console but not to user. Form can't be retried.
- Blocks: Users don't know why action failed or if they should retry.
- Files: `src/routes/app/+page.svelte` (lines 31-55, 67-69)

**No offline support:**

- Problem: All data operations require live connection. Offline users can't view cached data.
- Blocks: Mobile usage, unreliable networks.

## Tech Debt

**Console.error for structured logging:**

- Issue: Using `console.error()` for all structured logs instead of proper logging service.
- Files: `src/lib/runtime.ts` (lines 82-115), `src/lib/stores/clerk.svelte.ts` (line 56)
- Impact: Logs don't go to log aggregation service. Can't search, alert, or analyze errors in production.
- Fix approach: Inject logger dependency into Effect services. Use pino/winston/winston instead of console.

**String error messages instead of error codes:**

- Issue: Error messages are human-readable strings. No machine-parseable error codes for client.
- Files: `src/convex/authed/helpers.ts` (line 11), `src/convex/private/helpers.ts` (line 17)
- Impact: Frontend can't distinguish error types (auth vs validation vs server error). Can't translate errors.
- Fix approach: Add error code constants (e.g., 'UNAUTHORIZED', 'VALIDATION_ERROR'). Return both code and message from server.

**Type casting with `unknown`:**

- Issue: Multiple `as unknown as` casts to satisfy Convex type system. Hides type safety issues.
- Files: `src/lib/services/convex.ts` (lines 96, 105-108, 116)
- Impact: Runtime type mismatches not caught at compile time. Future refactors could break silently.
- Fix approach: Improve Convex types or use Zod/effect/zod for runtime validation of function args.

**Svelte boundary with generic error handler:**

- Issue: Every async operation in component uses `<svelte:boundary>` with copy-paste error handling.
- Files: `src/routes/app/references/+page.svelte` (lines 163-180, 229-246)
- Impact: Boilerplate duplication. Error handling logic fragmented across components.
- Fix approach: Extract into reusable component: `<AsyncBoundary {promise}>`. DRY out error snippets.

**Environment variable validation happens at runtime:**

- Issue: Missing env vars are only caught when code path is executed, not at startup.
- Files: `src/lib/services/convex.ts` (line 2), `src/lib/services/clerk.ts` (line 1)
- Impact: Deployment could fail in production if env vars forgotten.
- Fix approach: Create `validateEnv()` function that runs on app startup and throws if critical vars missing.

---

_Concerns audit: 2026-04-02_
