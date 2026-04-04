# Phase 03 Validation

Phase 03 introduces the first user-data migration path in the app. Validation must prove that auth wiring does not break guest mode and that migration only clears guest storage after a fully preserved outcome.

## Required Commands

- If any `src/convex/**` file changed: `bun run convex:gen`
- Always run: `bun run lint`
- Always run: `bun run format`
- Always run: `bun run check`

Recommended chained form:

```bash
bun run convex:gen && bun run lint && bun run format && bun run check
```

Use the chained form for Plans `03-01` and any later plan that also changes Convex code. For UI/store-only plans, omit `bun run convex:gen`.

## Verification Map

| Plan    | Focus                                                                                    | Automated verification                                                  |
| ------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `03-01` | Migration contract, schema, authed CRUD, backend preflight                               | `bun run convex:gen && bun run lint && bun run format && bun run check` |
| `03-02` | Landing page, Clerk shell, reusable auth UI                                              | `bun run lint && bun run format && bun run check`                       |
| `03-03` | Shared store contract, guest store upgrade, Convex store, client migration orchestration | `bun run lint && bun run format && bun run check`                       |
| `03-04` | Route/dialog rewiring, store switching, D-13 prompt placements                           | `bun run lint && bun run format && bun run check`                       |
| `03-05` | Final automated + manual validation sweep                                                | `bun run lint && bun run format && bun run check`                       |

## Manual Scenarios

1. Guest persistence:
   Start in `/app` as a guest, create a list, add items, refresh, and confirm the list survives with the same localStorage shape.
2. Provider availability and sign-up:
   Open the Clerk modal and confirm both Email+Password and Google OAuth are available. Complete at least one sign-up path and confirm the account reaches `/app`.
3. Successful migration:
   Sign in with an account that has room under the D-15 three-list cap. Confirm the result behaves as `fully_migrated`, authenticated lists render, and guest storage is only cleared after success.
4. Idempotent replay:
   Repeat sign-in with the same already-migrated guestSessionId and confirm the result behaves as `already_migrated` with no duplicate lists or items.
5. Blocked migration:
   Use an account where adding required guest lists would exceed the authed cap, or seed an unresolved catalog reference. Confirm the result behaves as `partial_or_retry_needed`, the UI does not claim success, and guest storage remains intact.
6. Retryable failure:
   Simulate a transient network/backend failure. Confirm retry/backoff occurs, the user sees a non-destructive message, and guest storage is preserved if the flow does not reach a safe clear state.
7. Session persistence and sign-out:
   Refresh after a successful sign-in and confirm AUTH-05 still holds. Sign out and confirm redirect to `/`.

## Storage Expectations

- Guest payload key remains `diddl-guest-data`.
- The idempotency/session key remains stable until a safe-clear outcome.
- `diddl-guest-data` must never be cleared on `partial_or_retry_needed`.
