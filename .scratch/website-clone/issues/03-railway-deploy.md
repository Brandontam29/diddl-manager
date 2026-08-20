# Railway deployment for SolidStart + Neon

Type: research
Status: resolved

## Question

How does a SolidStart app deploy on Railway, and how should it talk to Neon from
there? Specifically:

- SolidStart deployment preset for Railway (node server preset? nixpacks/railpack
  detection?), building with Bun in a Bun workspace monorepo (`apps/website` inside a
  root `bun.lock`), start command, port binding, env vars.
- Neon connection mode from Railway's long-lived Node process: plain `pg`/postgres.js
  over TCP with Neon's pooled connection string vs the `@neondatabase/serverless`
  HTTP driver — which fits a persistent server, and what Drizzle setup each implies.
- Railway static-asset behavior and volume support (context for the image-hosting
  decision), pricing basics for a hobby-scale app.
- Brief comparison with the Vercel fallback: what we'd give up or gain.

Primary sources: docs.railway.com, neon.tech docs, SolidStart deployment docs.

Feeds the "Choose image hosting" decision (issue 07) and deployment parts of the spec.

## Answer

Full findings: [research/03-railway-deploy.md](../research/03-railway-deploy.md)
(also on branch `research/railway-deploy`, commit 1bdcca7).

- SolidStart deploys to Railway as a plain Node process: build with Nitro's
  `node-server` preset to `.output/server/index.mjs`, start with `node`. It reads
  Railway's injected `PORT` natively and serves static assets from `.output/public`,
  so the fixed image set can ship inside the build — no volume needed (volumes are
  $0.15/GB-mo, one per service, redeploy downtime, no replicas).
- Railway's Railpack builder detects Bun from the root `bun.lock` and understands
  workspaces; for this shared monorepo, build from the repo root with
  workspace-scoped commands (`bun run --filter website build`) plus watch paths on
  `apps/website/**` — don't use the root-directory setting.
- Neon connection: use a TCP driver (`pg` / postgres.js) with the `-pooler`
  connection string via `drizzle-orm/node-postgres` — Neon's docs name Railway
  explicitly as this case. Keep the direct (unpooled) string for drizzle-kit
  migrations. `@neondatabase/serverless` is only for ephemeral serverless runtimes.
- Vs Vercel: gain CDN for images, ISR, zero-config previews; lose the persistent
  process (Vercel runs Nitro as serverless functions, flipping the Neon driver
  choice) and Railway's flat ~$5/mo Hobby cost shape.
