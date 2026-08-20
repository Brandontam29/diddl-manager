# Choose image hosting

Type: grilling
Status: resolved
Blocked by: 03, 04, 19

## Question

Given "Railway deployment for SolidStart + Neon" (issue 03) and "Image hosting
options for the catalog" (issue 04): pick where the ~2,800 catalog images live and
how the app addresses them — static `public/`, Railway volume, or object storage +
CDN — plus whether the seeding pipeline resizes/re-encodes them. Output: the chosen
option, the URL scheme stored in / derived from the catalog table, and the one-time
upload/commit procedure.

## Answer

**Revised 2026-08-20** (first answer — R2 behind a Cloudflare domain — superseded:
the user ruled Cloudflare out entirely).

- Images ship as **static assets in the app's `public/` directory**, committed to
  the repo, served by the deployment platform's CDN (Railway's built-in CDN or
  Vercel's, per the "Choose deployment platform" decision, issue 18). This was the
  researched runner-up; at ~98MB the repo/deploy weight is acceptable.
- **Originals are used as-is** — the user judged them already small enough; no WebP
  re-encode, no thumbnail generation. Seeding only unpacks the zip into `public/`
  and records paths + dimensions.
- The catalog table stores **relative paths**; URLs derive from an `IMAGE_BASE_URL`
  env var (empty/`/` when self-served from `public/`), so a later move to object
  storage stays config-only.

## Comments

**2026-08-20 — REOPENED a second time.** The user chose **Vercel free tier** for
deployment (issue 18) and asked to "explore image hosting solutions more deeply"
for that context. The `public/`-on-platform-CDN answer above was reasoned for
Railway; Vercel Hobby's deployment-size, bandwidth, and image-optimization limits
need checking before it can stand. Blocked by the new research ticket
"Image hosting on Vercel free tier" (issue 19). Constraints that stand regardless:
no Cloudflare; originals used as-is; relative paths + `IMAGE_BASE_URL`.

**2026-08-20 — RESOLVED (final, third resolution)** per issue 19's research:

- Images committed to **`apps/website/public/diddls/`**, served as originals off
  Vercel's CDN; **`IMAGE_BASE_URL=/diddls`**.
- Accepted consequences: deploys must always go through Vercel's Git integration
  (local `vercel deploy` would hit the CLI's 100MB source-upload cap — a hard rule
  for the dev-workflow ticket, issue 14), and ~98MB of JPGs live permanently in git
  history.
- Escape hatch: the relative-path + `IMAGE_BASE_URL` scheme makes a later move to
  Vercel Blob or paid storage config-only if traffic outgrows Hobby's 100GB/mo.
