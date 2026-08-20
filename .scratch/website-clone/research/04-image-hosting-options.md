# Image hosting options for the fixed Diddl catalog (~2,800 collectibles, ~4,055 JPGs, 98MB)

Research date: 2026-08-19. Context: SolidStart app on Railway + Neon Postgres (paths only, no blobs). Source asset: `apps/desktop-app/resources/diddl-images.zip` — 88.9MB zipped, 98.2MB / 4,055 files unpacked, average ~24KB per JPG, largest ~93KB. Catalog is effectively immutable.

## Decisive summary

**Recommended: Cloudflare R2 with a custom domain (Option 3), with a one-time `sharp` optimization pass folded into the seeding upload (Option 4 = yes, lightly).** At 98MB the entire catalog fits inside R2's always-free tier (10GB storage, 10M reads/month) and R2 charges **zero egress**, so the monthly cost is literally $0 while keeping ~100MB of binaries out of the git repo and out of every Railway deploy. Store only the relative path (`001_RARETES/A6_115.jpg`) in the Neon catalog table and derive the URL from an `IMAGE_BASE_URL` env var, so the provider stays swappable.

**Strong runner-up: commit the unpacked images to SolidStart's `public/` directory and enable Railway's built-in CDN (Option 1).** Railway now ships a free per-service CDN where cache hits cost no compute and no egress, which removes the classic objection to origin-served static files. It is the zero-new-accounts option; its only real costs are ~98MB of permanent git history and images baked into every deploy image. If you don't have a domain on Cloudflare (a prerequisite for R2 custom domains), this becomes the #1 pick.

**Skip: Railway volume (worst fit — manual population, one-service mount, no build-time access, zero benefit for immutable data), and S3/Bunny (both fine, both strictly dominated by R2 on price at this scale).**

Ranked: **1) R2 + custom domain → 2) `public/` + Railway CDN → 3) Bunny Storage + CDN → 4) S3 → 5) Railway volume.**

---

## Option 1 — Static files in SolidStart `public/`, served by the Node server on Railway

**How it works.** SolidStart serves files in `/public` at their exact relative path — `/public/images/logo.png` is reachable at `/images/logo.png`, with stable, non-hashed URLs (hashing only applies to _imported_ assets) ([SolidStart docs](https://docs.solidjs.com/solid-start/building-your-application/static-assets)). So `public/diddl-images/001_RARETES/A6_115.jpg` → `https://app.example.com/diddl-images/001_RARETES/A6_115.jpg`. The catalog table stores the relative path; the URL is `origin + "/diddl-images/" + path`.

**CDN/caching.** Railway has a built-in CDN, "available on all plans at no additional cost," off by default and enabled per service (dashboard toggle or `railway cdn enable --service web`). Static assets (identified by `Content-Type`, images included) are **cached by default even without Cache-Control headers**, falling back to a configurable default TTL (30 min–1 day, default 2h); origin `max-age`/`s-maxage` is honored, so setting a long `Cache-Control: public, max-age=31536000, immutable` on `/diddl-images/*` gives effectively permanent edge caching. Crucially: "A cache hit never reaches your service, so it uses none of your service's compute and doesn't incur network egress" ([Railway CDN docs](https://docs.railway.com/networking/cdn)). Caveat: no per-URL purge — fine here, the catalog never changes.

**Cost.** $0 extra on the Hobby plan ($5/mo incl. $5 usage credit). Cache misses bill egress at $0.05/GB ([Railway pricing](https://docs.railway.com/reference/pricing/plans)) — at ~24KB/image that's 0.12¢ per 1,000 uncached image loads; rounding error.

**Build/deploy impact.** ~98MB is copied into every build and deploy image. Not a blocker, but it slows every deploy slightly, forever, for assets that never change. A "fetch at build time" variant (download the zip from a GitHub Release in the build step, unzip into `public/`) keeps the repo light at the cost of an 89MB download per deploy and a slightly bespoke build script.

**Git repo weight.** ~98MB of JPEGs added to permanent history (JPEGs don't recompress in git packfiles). All files are far under GitHub's 100 MiB per-file block ([GitHub large-files docs](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github)) — note the existing 88.9MB zip is already close to that limit. Since the zip is already committed, adding the unpacked tree roughly doubles the repo's binary weight unless the zip is dropped from the web app's history.

**Upload pipeline.** None — `unzip` into `public/`, commit. Simplest possible.

## Option 2 — Railway volume populated once, served via a file route

**How it works.** Attach a volume to the web service, copy images in once, serve via a static/file route (or a Caddy/nginx sidecar — but "each service can only have a single volume" and volumes can't be shared across services, so a sidecar needs its own copy).

**Trade-offs.**

- **Population is the pain point:** volumes are not accessible at build time; you populate via `railway volume browse`/`railway volume files` in the CLI or a one-off script running inside the deployed service ([Railway volumes docs](https://docs.railway.com/reference/volumes)). That's a bespoke, undocumented-happy-path step for 4,055 files.
- **No replicas** with volumes, and redeploys cause brief downtime ([same docs](https://docs.railway.com/reference/volumes)).
- **Cost:** $0.15/GB/mo → ~$0.015/mo for 98MB, negligible ([pricing](https://docs.railway.com/reference/pricing/plans)). Hobby cap is 5GB.
- **Serving** still goes through your Node process (compute + $0.05/GB egress) unless Railway's CDN is enabled — and if you enable the CDN, you've reproduced Option 1 with extra steps.

**Verdict:** a volume buys mutability-without-redeploy, which this fixed catalog doesn't need. Strictly worse than Option 1 here.

## Option 3 — Object storage + CDN

**URL strategy for all providers:** store the zip-relative path in the Neon `catalog` table (it's already the natural key: `<category>/<file>.jpg`) and derive `IMAGE_BASE_URL + "/" + path` in the app. Never store absolute URLs — switching providers then means changing one env var, not a data migration.

### Cloudflare R2 — recommended

- **Storage:** $0.015/GB-mo, but the free tier includes **10 GB-month, 1M Class A writes, 10M Class B reads per month, forever** — the whole catalog (98MB, 4,055 objects) fits with ~99% headroom ([R2 pricing](https://developers.cloudflare.com/r2/pricing/)).
- **Egress: free.** This is R2's headline feature — no per-GB transfer charge regardless of volume ([R2 pricing](https://developers.cloudflare.com/r2/pricing/)).
- **CDN/caching:** the `r2.dev` public subdomain is "rate-limited and should only be used for development." Production wants a **custom domain**, which unlocks Cloudflare's cache, Cache Rules, and Smart Tiered Cache ([R2 public buckets](https://developers.cloudflare.com/r2/buckets/public-buckets/)). Images are cached by default; a Cache Rule can set a year-long edge TTL. **Prerequisite:** the domain (or a subdomain zone like `img.example.com`) must be on Cloudflare — the one real setup requirement.
- **Upload pipeline:** one-time `wrangler r2 object put` loop, `rclone copy`, or the S3-compatible API. ~10 lines of script.
- **Monthly cost: $0.** Deploys and git stay clean.

### Bunny (Storage + CDN)

- **Storage:** $0.01/GB standard tier, **$1/month minimum**; free traffic from Storage to Bunny CDN ([Bunny storage pricing](https://bunny.net/pricing/storage/)).
- **CDN:** $0.01/GB (EU/NA) on the standard network, also **$1/month minimum**, no request fees ([Bunny CDN pricing](https://bunny.net/pricing/cdn/)).
- Excellent DX (pull zones, FTP-style upload, built-in Bunny Optimizer available), but the minimums put the floor at ~$1–2/mo where R2 is $0, with no capability the catalog needs that R2 lacks.

### AWS S3

- **Storage:** $0.023/GB-mo first 50TB in us-east-1 → ~$0.002/mo ([S3 pricing](https://aws.amazon.com/s3/pricing/), tier structure confirmed by [CloudZero's 2026 guide](https://www.cloudzero.com/blog/s3-pricing/)).
- **Egress:** billed per GB after the first 100GB/month of AWS-wide free internet transfer ([S3 pricing](https://aws.amazon.com/s3/pricing/)) — a hobby app stays under 100GB, but it's an aggregate, revocable-feeling allowance rather than a design guarantee, and beyond it S3 egress (~$0.09/GB) is the most expensive of the group.
- **No CDN included** — production setups pair it with CloudFront (another service to configure), plus IAM/bucket-policy ceremony to make objects public. Most setup work for no advantage over R2 here.

## Option 4 — Fold image optimization into the one-time seeding pipeline?

**Yes, but keep it light — it's worth it precisely because the pipeline runs once.**

- The sources are already small scans (avg ~24KB, max ~93KB), so absolute savings are modest: WebP re-encoding typically yields 25–34% smaller files than equivalent-quality JPEG ([Google WebP study](https://developers.google.com/speed/webp/docs/webp_study)), i.e. 98MB → roughly 65–75MB. That won't change which pricing tier anything lands in.
- The **real win is thumbnails**: a collection-grid page can render hundreds of images at once; a ~320px WebP thumb set (likely ~5–10KB each) cuts grid payloads by an order of magnitude versus full scans. Generate `thumb/<path>.webp` alongside `full/<path>.webp` (or keep originals as `full/`).
- `sharp` does resize + WebP encode in a few lines and is the standard Node tool ([sharp docs](https://sharp.pixelplumbing.com/)); a 4,055-file pass runs in minutes on a laptop. WebP has universal browser support in 2026; AVIF adds encode time and a second variant for marginal extra savings at these dimensions — skip it.
- **Regenerate `imageWidth`/`imageHeight` during the pass** (sharp's `metadata()`/output info) and write them into the catalog seed, exactly as the desktop app stores them — the web UI needs intrinsic dimensions for layout-shift-free `<img width height>` rendering, and resizing invalidates the desktop app's stored values.
- Counterpoint honored: if you want to ship this week, uploading the originals untouched is completely fine at this scale — optimization can be re-run later since the pipeline is a script, not a migration.

## Ranked recommendation (hobby-scale, fixed catalog)

1. **Cloudflare R2 + custom domain.** $0/mo (free tier covers 100× this catalog), zero egress by design, real CDN via Cache Rules, keeps 98MB out of git and out of every deploy. One-time `rclone`/`wrangler` upload; catalog stores relative paths + `IMAGE_BASE_URL`. Requires a Cloudflare-managed domain.
2. **`public/` committed to the repo + Railway CDN enabled.** Zero new accounts, zero pipeline; Railway's free CDN makes cache hits cost no compute and no egress. Pay with ~98MB of permanent git history and heavier deploys. **Promote to #1 if no Cloudflare-managed domain exists.**
3. **Bunny Storage + CDN.** Great DX, but ~$1–2/mo of minimums to do what R2 does for $0.
4. **S3 (+ CloudFront).** Most configuration, most expensive egress model; no advantage at this scale.
5. **Railway volume.** Awkward one-off population, single-service mount, no build-time access, and it still needs the CDN toggle to avoid egress — all downside versus Option 1 for immutable data.

Either way: run the one-time `sharp` pass (max-dimension cap + WebP + 320px thumbs), refresh `imageWidth`/`imageHeight` in the seed, and store provider-relative paths in Neon.

## Sources

- Railway pricing (egress $0.05/GB, volumes $0.15/GB-mo, Hobby $5/mo): https://docs.railway.com/reference/pricing/plans
- Railway CDN (free, cache hits = no egress/compute, static assets cached by default): https://docs.railway.com/networking/cdn
- Railway volumes (limits, single-volume-per-service, CLI file management, caveats): https://docs.railway.com/reference/volumes
- Cloudflare R2 pricing (free tier 10GB / 10M reads, $0 egress): https://developers.cloudflare.com/r2/pricing/
- Cloudflare R2 public buckets (r2.dev dev-only, custom-domain caching): https://developers.cloudflare.com/r2/buckets/public-buckets/
- Bunny storage pricing ($0.01/GB, $1 minimum, free traffic to Bunny CDN): https://bunny.net/pricing/storage/
- Bunny CDN pricing ($0.01/GB EU-NA, $1 minimum, no request fees): https://bunny.net/pricing/cdn/
- AWS S3 pricing (GET $0.0004/1k, 100GB/mo free egress aggregate): https://aws.amazon.com/s3/pricing/
- S3 Standard tier rates ($0.023/GB first 50TB, us-east-1): https://www.cloudzero.com/blog/s3-pricing/
- SolidStart static assets (`public/` served at exact relative paths): https://docs.solidjs.com/solid-start/building-your-application/static-assets
- GitHub file size limits (100 MiB per-file block): https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github
- Google WebP compression study (25–34% smaller than JPEG): https://developers.google.com/speed/webp/docs/webp_study
- sharp (Node image resize/encode): https://sharp.pixelplumbing.com/
