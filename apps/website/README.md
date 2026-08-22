# @diddl/website

Multi-user web clone of the desktop app — TanStack Start (Solid), Neon Postgres
(Drizzle), Clerk, deployed on Vercel. Spec: `.scratch/website-clone/spec.md`.

```sh
cp .env.example .env.local   # fill in Neon `dev` + Clerk dev keys
bun run dev:website          # from the repo root
```

Deploys go through Vercel's Git integration only — never `vercel deploy` from a
machine (the `public/diddls/` image set exceeds the CLI upload cap).
