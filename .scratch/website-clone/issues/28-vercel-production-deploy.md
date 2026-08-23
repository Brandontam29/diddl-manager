# Vercel project, production Neon, first deploy

Type: task
Status: open
Blocked by: 22, 26, 27

## Question

HITL task per spec.md §9: create the Vercel project linked to the repo (Root Directory `apps/website`, install `bun install --frozen-lockfile`, the Ignored Build Step command, Production env = Neon `main` + Clerk production keys, Preview env = Neon `dev` + Clerk dev keys); create the Clerk production instance with a hand-provisioned Google OAuth client; run `db:migrate` and `load-catalog` against Neon `main` from the dev machine; merge to deploy. Consider the /wizard skill for the dashboard steps.

Done when: Production URL serves the landing page, sign-up works, Library shows the catalog; the answer records the production URL and where keys live.

Also (from the 2026-08-22 review of ticket 23): set `authorizedParties: [<production origin>]` in `authedMiddleware` (`apps/website/src/server/auth.ts`) once the Vercel domain exists — until then a token minted for another origin on the same Clerk instance would verify.
