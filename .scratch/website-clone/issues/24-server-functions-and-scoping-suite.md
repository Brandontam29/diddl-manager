# Server functions and the authorization-scoping suite

Type: task
Status: open
Blocked by: 21, 23

## Question

Implement spec.md §5 and §10: all 16 handlers as plain `(db, userId, input)` functions in `apps/website/src/server/`, wrapped by `createServerFn` + auth middleware + zod validators (GET for reads, POST for mutations, NOT*FOUND-style errors, `getProfile` lazy-upserting profile + Default Section). Integration suite against the Neon `test` branch: for every handler, user A vs user B's rows; lazy-upsert test; the structural 'userId is the second parameter' test; per-file `test*<uuid>`users with`afterAll`cleanup;`test/setup.ts`that throws without`DATABASE_URL`. Wire `db:migrate`(test branch) +`test:website`into ci.yaml using the`TEST_DATABASE_URL(\_UNPOOLED)` secrets (HITL: user adds the GitHub secrets).

Done when: Integration suite passes locally and in CI on main; every handler has a scoping test.
