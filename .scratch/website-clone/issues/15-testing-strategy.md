# Testing strategy

Type: grilling
Status: open
Blocked by: 09, 11

## Question

Decide the test surface for `apps/website`, mirroring the desktop app's shape where
it fits (bun test units at `test:unit`, Playwright at `test:e2e`):

- Which desktop unit tests port (e.g. `list-models.test.ts` zod rules) and what new
  units the server functions need (authorization scoping is the critical one:
  user A cannot touch user B's lists).
- E2e: Playwright against a local server + Neon branch database, or skip e2e for v1?
- Whether tests gate CI (extends the wiring from "Dev workflow, CI, and deployment
  config", issue 14).

Blocked on the API surface (issue 09) and route/UI plan (issue 11) since those define
what there is to test.
