# Assemble the locked spec

Type: grilling
Status: closed (2026-08-21)
Assignee: BrandonTam29
Blocked by: 05, 06, 07, 08, 09, 10, 11, 12, 14, 15, 18

## Question

Fold every decision on the map into the single locked spec that is this effort's
destination — likely `.scratch/website-clone/spec.md` plus an openspec change
(`openspec/changes/`) if that matches how implementation will run. The spec must let
implementation start with zero open questions: stack versions, schema, auth design,
API surface, route/UI plan, image hosting, seeding, deployment config, and the
personal-data migration runbook. Close out any fog left in the map's
"Not yet specified" — by then it should be sharp enough to either decide inline here
or spawn one last ticket.

## Answer

**2026-08-21 — resolved.** Every blocker was already closed and "Not yet specified"
was empty, so there was nothing left to decide — this ticket is pure assembly.

- The locked spec is [`spec.md`](../spec.md): eleven sections (scope, stack,
  schema, auth, server-function API, routes & UI port, images & seeding,
  personal-data runbook, env/CI/Vercel, testing, suggested build order) that
  restate each closed ticket's answer at implementation resolution and link back
  to the tickets for reasoning. Inconsistencies found while folding: none that
  change a decision — the sole naming drift (map gist `apps/data-migrations/
sqlite-to-neon.ts` in a stale local copy vs the ticket's
  `apps/website/scripts/import-desktop.ts`) resolves in the ticket's favour.
- **No openspec change was created.** `openspec/` no longer exists in the repo
  (the last archived change was removed in 73eb2e1), so an openspec proposal is a
  choice for whoever starts implementation — `spec.md` §11 gives the build order
  an `opsx:propose` or plain PR sequence would follow.

With this ticket closed the map has no open tickets and no fog: the destination is
reached and implementation can start from `spec.md` with zero open questions.
