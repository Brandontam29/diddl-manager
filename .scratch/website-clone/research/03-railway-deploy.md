# Railway deployment for the SolidStart website + Neon Postgres

Researched 2026-08-19 against primary docs (docs.railway.com, neon.com, docs.solidjs.com, nitro.build, railpack.com, orm.drizzle.team, vercel.com).

## Decisive summary

- **Build target:** Use Nitro's `node-server` preset (SolidStart's Node deployment path). Output is a self-contained `.output/server/index.mjs`; start with `node .output/server/index.mjs`. It reads `PORT`/`HOST` from the environment (default 3000) and serves static assets from `.output/public` itself — exactly what Railway's injected `PORT` expects.
- **Railway build:** Railway's default builder is **Railpack** (zero-config). It detects a Node project from `package.json` and picks **Bun** as the package manager from `bun.lock`/`bun.lockb`. For our **shared Bun-workspaces monorepo** (root `bun.lock`, app at `apps/website`), do **not** set the service root directory to `apps/website`; build from the repo root with workspace-scoped commands (e.g. build `bun install && bun run --filter website build`, start `node apps/website/.output/server/index.mjs`) and set **watch paths** to `apps/website/**`. Railway's monorepo importer can auto-configure this.
- **Neon connection:** Use a **plain TCP driver (node-postgres `pg` or postgres.js) with Neon's `-pooler` connection string**, not `@neondatabase/serverless`. Neon explicitly recommends TCP drivers for long-running servers (Railway is named) as "the fastest and most efficient option"; the serverless HTTP/WebSocket driver is for ephemeral serverless/edge runtimes. Drizzle: `drizzle-orm/node-postgres` (or `drizzle-orm/postgres-js`) with `DATABASE_URL` = pooled string; run migrations against the **direct (non-pooler)** string.
- **Images (~89MB, fixed set):** No volume needed. Put them in the app's `public/` dir so they land in `.output/public` and are served (with compression) by the Nitro node server, baked into each deploy. Volumes exist ($0.15/GB-mo, one per service, brief downtime on redeploy, incompatible with replicas) but are for _mutable_ data — wrong tool for a fixed asset set.
- **Cost:** Hobby plan is $5/mo including $5 of usage (RAM $10/GB-mo, vCPU $20/mo, egress $0.05/GB). A small always-on SolidStart service typically fits in or near the included $5.
- **Vercel trade-off in one line:** Vercel gives zero-config Nitro deploys, a global CDN for the images, and ISR — but runs the server as serverless functions (cold-start/duration model) where Neon would push you toward the serverless driver; Railway gives a boring persistent Node process with real TCP pooling and predictable flat cost.

---

## 1. SolidStart on Railway

### Server preset and output

- SolidStart deploys through **Nitro**: "Nitro — offers portable multi-target deployment through presets." In SolidStart v1 the preset goes in `app.config.ts` (`server: { preset: ... }`, default is the Node preset); in v2 the Nitro deployment plugin is added after `solidStart()` in the Vite config and configured via the top-level `nitro` property. https://docs.solidjs.com/solid-start/v2/guides/deployment-plugins
- Nitro's **`node-server` preset** builds a "ready-to-run Node server" at `.output/server/index.mjs`, launched with `node .output/server/index.mjs`. It reads `PORT`/`NITRO_PORT` (default 3000) and `HOST`/`NITRO_HOST`, serves static assets from `.output/public`, and supports compression. A `node_cluster` preset exists for multi-core (`NITRO_CLUSTER_WORKERS`). https://nitro.build/deploy/runtimes/node

### Railpack detection and Bun

- Railway's build system is **Railpack**, "zero configuration" with overridable build/start commands; build layers are cached. https://docs.railway.com/guides/build-configuration
- Railpack detects a Node app from `package.json`; package manager priority: `packageManager` field → lockfiles, where "`bun.lockb` or `bun.lock`" selects **Bun** → `engines` → npm default. Build runs the `build` script; start command comes from the `start` script (then `main`, then `index.js/ts`). "Railpack automatically handles workspaces across all major package managers... npm, Bun, Yarn, pnpm, and Nx." https://railpack.com/languages/node
- Practical takeaway: give `apps/website/package.json` explicit `build` and `start` scripts (`start`: `node .output/server/index.mjs`) so detection is deterministic.

### Monorepo strategy (root bun.lock, app at apps/website)

- Railway distinguishes **isolated** monorepos (set service _root directory_; only that folder is deployed — this would strand the root `bun.lock` and workspace deps) from **shared** monorepos (build from root with workspace-scoped commands, e.g. `pnpm --filter backend start`, plus **watch paths** so unrelated changes don't trigger rebuilds). Bun workspaces with a root lockfile are the shared case. Railway's importer auto-detects workspaces and configures scoped commands/watch paths per deployable package. https://docs.railway.com/guides/monorepo
- Root directory defaults to `/`; watch paths use gitignore-style patterns. https://docs.railway.com/guides/build-configuration

### PORT binding and env vars

- "Your web server should bind to the host `0.0.0.0` and listen on the port specified by the `PORT` environment variable, which Railway automatically injects." The domain's _target port_ must match what the app listens on, else 502s. Nitro's node-server honors `PORT` automatically, so this is zero-config. https://docs.railway.com/guides/fixing-common-errors + https://nitro.build/deploy/runtimes/node
- Service env vars (e.g. `DATABASE_URL`) are set per service in Railway settings/dashboard and are available at build and runtime; reference them in code via `process.env`. https://docs.railway.com/guides/build-configuration (build config accepts env-var overrides such as `RAILPACK_*`)

## 2. Neon from Railway's long-lived process

- Neon's own decision guide: for **long-running servers ("Railway, Render, VPS, Docker")** use standard TCP drivers (`pg` / `postgres.js`) **with the pooled connection string** — pools persist across requests, "the fastest and most efficient option." `@neondatabase/serverless` (HTTP/WebSocket) is recommended only for ephemeral serverless/edge environments where TCP setup latency dominates. https://neon.com/docs/connect/choose-connection
- The `-pooler` hostname suffix routes through Neon's PgBouncer (up to 10,000 client connections; per-user/db `default_pool_size` is the real bottleneck). Use the **direct** (non-pooler) string for schema migrations, `CREATE INDEX CONCURRENTLY`, `LISTEN/NOTIFY`, temp tables. https://neon.com/docs/connect/choose-connection
- **Drizzle setup implied:**
  - Chosen path: `import { drizzle } from 'drizzle-orm/node-postgres'; const db = drizzle(process.env.DATABASE_URL)` (or `drizzle-orm/postgres-js`). Drizzle's Neon page itself points long-running servers at "node-postgres or Postgres.js drivers, as described in Neon's official Node.js docs."
  - Serverless alternative (not needed here): `drizzle-orm/neon-http` (single queries, no interactive transactions) or `drizzle-orm/neon-serverless` over WebSockets (needs `ws` + `bufferutil` on Node).
  - https://orm.drizzle.team/docs/connect-neon
- Env split: `DATABASE_URL` = pooled string for the app; `DIRECT_URL`-style unpooled string for `drizzle-kit` migrations.

## 3. Static assets, volumes, pricing

### Serving the ~89MB image set

- The Nitro node server serves everything in `.output/public` (populated from the app's `public/` dir) with compression support — so the fixed image set can simply ship inside the deploy image. https://nitro.build/deploy/runtimes/node
- Railway has no built-in CDN layer for app services; assets are served by your process and billed as egress at $0.05/GB. At ~89MB total (individual images far smaller), this is fine at hobby scale; add `Cache-Control` route rules if egress grows.

### Volumes (if we ever need mutable storage)

- One volume per service; mounted at a specified path. Sizes: Free/Trial 0.5GB, **Hobby 5GB**, Pro 50GB. Priced at **$0.15/GB/mo** (metered per-minute). Caveats: redeploys incur "a small amount of downtime" (two deployments can't mount the same volume), **replicas cannot be used with volumes**, no downsizing, possible permission issues for non-root containers. Not needed for a fixed asset set. https://docs.railway.com/reference/volumes
- 89MB fits even the free-tier 0.5GB volume, but baking assets into the build is simpler and avoids the redeploy-downtime and replica restrictions.

### Pricing basics

- Plans: Free $0, **Hobby $5/mo including $5 of usage**, Pro $20/mo, Enterprise custom. Usage rates: RAM $10/GB/mo ($0.000231/GB-min), CPU $20/vCPU/mo ($0.000463/vCPU-min), egress $0.05/GB, volumes $0.15/GB/mo. Trial accounts get a one-time $5 grant. https://docs.railway.com/reference/pricing/plans

## 4. Vercel instead?

- **Gain:** true zero-config — Vercel auto-detects Nitro/SolidStart, uses the `vercel` preset, puts static assets (our images) on its global CDN, and adds ISR, preview deployments per PR, Fluid compute, and observability out of the box. https://vercel.com/docs/frameworks/backend/nitro, https://vercel.com/changelog/zero-configuration-support-for-nitro
- **Give up:** the persistent Node process. Server routes "automatically become Vercel Functions" — an ephemeral compute model where Neon's guidance flips toward `@neondatabase/serverless` (HTTP/WebSocket) instead of a warm TCP pool, and long-lived in-process state/caching is off the table. https://vercel.com/docs/frameworks/backend/nitro + https://neon.com/docs/connect/choose-connection
- **Cost/ops shape:** Railway is flat-ish ($5 Hobby incl. usage, pay-per-resource beyond); Vercel Hobby is free but non-commercial with function/bandwidth limits, and its unit costs (function invocations, edge requests, bandwidth) are less predictable if the image-heavy site gets traffic. Railway also gives volumes and plain Docker-style services; Vercel does not.

## Recommended concrete setup

1. `apps/website`: Nitro deployment plugin (v2) or `server.preset: "node-server"` (v1 `app.config.ts`); scripts: `"build": "vinxi build"` (or `vite build`), `"start": "node .output/server/index.mjs"`.
2. Railway service on the repo (shared-monorepo mode): build `bun install --frozen-lockfile && bun run --filter website build`, start `node apps/website/.output/server/index.mjs`, watch path `apps/website/**`.
3. Env vars on the service: `DATABASE_URL` = Neon **pooled** (`...-pooler...`) string with `sslmode=require`; unpooled string reserved for drizzle-kit migrations.
4. Drizzle: `drizzle-orm/node-postgres` + `pg` Pool.
5. Images in `apps/website/public/…` — served by Nitro, no volume.
