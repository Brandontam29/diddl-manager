# 19 — Where should the ~4,055 JPGs (~98MB) live under Vercel Hobby?

Researched 2026-08-20 against primary sources (Vercel docs current as of 2026-06/07 updates, Supabase, Backblaze, AWS, bunny.net, GitHub docs).

## Decision summary

**Winner: commit the catalog into the website app's `public/` directory and let Vercel's CDN serve the originals as plain static files. `IMAGE_BASE_URL=/diddls` (same-origin path prefix), so URLs are `${IMAGE_BASE_URL}/${relativePath}`.**

Why it wins for this exact case:

- 98MB / 4,055 files is comfortably inside every relevant Hobby limit for **git-based** deployments: no documented cap on build _output_ size or file count, 45-minute build cap is nowhere near threatened, and static assets are auto-cached on Vercel's CDN with no per-request compute. ([limits](https://vercel.com/docs/limits), [cdn-cache](https://vercel.com/docs/caching/cdn-cache))
- Hobby includes **100 GB/month Fast Data Transfer** and **1M edge requests/month** — that's ~1,000 full-catalog downloads a month; hobby-scale traffic uses a rounding error of it. ([pricing](https://vercel.com/pricing), [fair use](https://vercel.com/docs/limits/fair-use-guidelines))
- Serving originals via `<img src>` never touches Vercel Image Optimization, so the 5K transformations/month Hobby quota is irrelevant — no quota-exhaustion failure mode at all. ([image pricing](https://vercel.com/docs/image-optimization/limits-and-pricing))
- Fixed catalog = no runtime writes, so Blob's operations/limits model and its **10 GB/month** transfer cap (10x tighter than Fast Data Transfer) buy nothing here.
- Every non-Vercel free option has a disqualifier: Supabase free projects **pause after 1 week of inactivity** and its CDN **is Cloudflare**; B2's free-egress story is built on the Cloudflare bandwidth alliance; AWS's free tier is now a 6-month credits program; Bunny isn't free.

**One hard caveat:** the Hobby CLI source-upload limit is **100 MB** — 98MB of images plus app source exceeds it. Deploy exclusively through the git integration (which this repo already does); never `vercel deploy` from a local checkout. ([limits#static-file-uploads](https://vercel.com/docs/limits))

Runner-up if the repo must stay light: **Vercel Blob public store** (98MB ≪ 1 GB free storage), `IMAGE_BASE_URL=https://<store-id>.public.blob.vercel-storage.com/diddls`.

---

## 1. Static `public/` on Vercel Hobby

**Deployment-size and file-count limits** ([vercel.com/docs/limits](https://vercel.com/docs/limits)):

- "Static File uploads: 100 MB (Hobby), 1 GB (Pro)" — but scoped: _"When using the **CLI** to deploy, the maximum size of the source files that can be uploaded is limited to 100 MB for Hobby."_ Git-integration deployments clone from GitHub inside the build container (32 GB disk) and are not subject to this upload path. Practical consequence: with ~98MB of JPGs in the repo, CLI deploys will fail on Hobby; git deploys are fine.
- Max **15,000 source files** per CLI deployment; again CLI-scoped. 4,055 files is under it anyway.
- Build _output_: "there is no upper limit for output files created during a build", only a warning that ~100,000+ output files slow builds; hard stop is the **45-minute build cap**. 4,055 output images is a non-event.
- Rate limits: 100 builds/hour, 100 deployments/day on Hobby — irrelevant here.

**CDN caching of static assets** ([vercel.com/docs/caching/cdn-cache](https://vercel.com/docs/caching/cdn-cache)):

- "Static files are **automatically cached on Vercel's global network** for the lifetime of the deployment after the first request", and unchanged files (same content hash) persist in cache across deployments. A fixed catalog is the best case: after first access per region, images are pure CDN hits.
- Cacheable-response ceiling is **10 MB** content length; the catalog averages ~24 KB/image (98MB / 4,055), so every file caches.
- "Vercel doesn't allow bypassing the cache for static files" — no accidental cache-busting.

**Bandwidth allowance** ([vercel.com/pricing](https://vercel.com/pricing), [fair-use guidelines](https://vercel.com/docs/limits/fair-use-guidelines)):

- Hobby includes **Fast Data Transfer: 100 GB/month** and **Edge Requests (CDN Requests): 1M/month**; the fair-use table lists the same numbers as "typical monthly usage" guidance. Static asset delivery bills against exactly these two meters ([manage-cdn-usage](https://vercel.com/docs/manage-cdn-usage)).
- Scale check: 100 GB / 98MB ≈ **~1,000 complete catalog downloads per month**; a typical browse session touching a few hundred thumbnails-worth of originals is single-digit MB.

**Policy / fair use** ([fair-use guidelines](https://vercel.com/docs/limits/fair-use-guidelines)):

- Hobby is restricted to **non-commercial personal use** — a personal diddl-collection catalog qualifies; no ads/donations/payments allowed.
- Serving your own site's images is ordinary static hosting; the guidelines target outliers and state Vercel reaches out before acting. Nothing in the usage table is approached here.

**Build/upload impact:** +98MB to each fresh clone in the build container and to first-time output upload; subsequent deploys re-use hashed unchanged assets in the CDN cache ([cdn-cache](https://vercel.com/docs/caching/cdn-cache)). Against a 45-minute cap this is seconds-to-low-tens-of-seconds of overhead.

## 2. Vercel Image Optimization on Hobby

([vercel.com/docs/image-optimization/limits-and-pricing](https://vercel.com/docs/image-optimization/limits-and-pricing))

- **The historical "1,000 source images/month" quota is legacy pricing** (kept only for pre-Feb-18-2025 Enterprise contracts; see [legacy pricing](https://vercel.com/docs/image-optimization/legacy-pricing)). Current Hobby quota: **5K image transformations/month, 300K image cache reads, 100K image cache writes**. Transformations are billed per cache MISS/STALE per unique (image, width, quality, format) key.
- **4,055 images vs the quota:** if the catalog were routed through the optimizer, a cold cache with even 2 variants per image (~8,110 transformations) would exceed 5K in month one.
- **Quota exhaustion on Hobby:** "New images will fail to optimize and instead return a runtime error response with **402 status code**… Previously optimized images have already been cached and will continue to work." You are **not** charged; Vercel emails as you approach limits.
- **Opting out entirely is supported and is the plan here:** optimization only runs when requests go through the optimization endpoint (e.g. `next/image` / `/_vercel/image`). This TanStack Start (Solid) app uses plain `<img>` tags to static URLs, so **zero** Image Optimization usage occurs; Vercel also documents disabling it per image or per project ([managing costs](https://vercel.com/docs/image-optimization/managing-image-optimization-costs)). Serving unoptimized originals from `public/` bills only Fast Data Transfer + Edge Requests.

## 3. Vercel Blob

([usage & pricing](https://vercel.com/docs/vercel-blob/usage-and-pricing), [overview](https://vercel.com/docs/vercel-blob), [pricing page](https://vercel.com/pricing), [GA changelog](https://vercel.com/changelog/vercel-blob-is-now-generally-available))

- **Hobby free allowance:** **1 GB storage** (GB-month average) and **10 GB/month Blob Data Transfer** ([vercel.com/pricing](https://vercel.com/pricing)). Simple operations (cache-MISS URL reads, `head()`) and advanced operations (`put()`, `list()`, `copy()`) also metered; blob URL hits additionally count as **Edge Requests** from the shared Hobby pool (1M/mo) at standard CDN rates.
- **Overage behavior on Hobby:** "You **will not pay for any additional usage**. However, you will not be able to access Vercel Blob if limits are exceeded… you will have to wait until 30 days have passed before using Blob storage again." That's a hard outage mode for the site's images — and 10 GB/month ≈ only ~100 full-catalog transfers.
- **Fit check:** 98MB ≪ 1 GB storage. CDN caches all blobs **up to 1 month by default** (`cacheControlMaxAge` configurable); cache HITs don't count as simple operations, so a fixed catalog mostly serves from cache.
- **URL shape:** `https://<store-id>.public.blob.vercel-storage.com/<pathname>` — docs example: `https://1sxstfwepd7zn41q.public.blob.vercel-storage.com/blob-oYnXSVczoLa9yBYMFJOSNdaiiervF5.png`. Uploading with explicit pathnames (no `addRandomSuffix`) preserves the catalog's relative paths, so `IMAGE_BASE_URL=https://<store-id>.public.blob.vercel-storage.com/diddls` works cleanly.
- **One-time upload pipeline:** a local script using `@vercel/blob` `put('diddls/<relativePath>', file, { access: 'public' })` with `BLOB_READ_WRITE_TOKEN` (the documented path for code running outside Vercel). 4,055 `put()` calls = 4,055 advanced operations, rate-limited at **900/min** on Hobby → ~5 minutes. `del()` is free if you need to redo it.
- **Cost if you outgrow Hobby:** Pro is $20/seat/mo, then usage from the Pro pricing example rates: storage ~$0.023/GB-month, Blob Data Transfer ~$0.05/GB (iad1), simple ops $0.40/1M, advanced ops $5.00/1M — at this catalog's scale, cents.

## 4. Non-Cloudflare object storage with free tiers

| Provider                                                                      | Free allowance                                                                                                                                                                                                                                                    | vs 98MB + hobby egress                                          | CDN                                                                                                                                                                                                                           | IMAGE_BASE_URL shape                                                  | Verdict                                                                                                                                                                                                 |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Supabase Storage** ([pricing](https://supabase.com/pricing))                | 1 GB file storage; **5 GB egress + 5 GB cached egress/mo**; 50 MB max file                                                                                                                                                                                        | Storage fine; egress ≈ 50–100 catalog-downloads/mo              | **Cloudflare CDN** ([Supabase CDN docs](https://supabase.com/docs/guides/storage/cdn/smart-cdn), [blog](https://supabase.com/blog/storage-image-resizing-smart-cdn): "distributed via Cloudflare CDN"; Smart CDN is Pro-only) | `https://<project-ref>.supabase.co/storage/v1/object/public/<bucket>` | **Disqualified twice**: free projects **pause after 1 week of inactivity** (images go dark), and delivery runs through Cloudflare — violates "no Cloudflare" in spirit                                  |
| **Backblaze B2** ([pricing](https://www.backblaze.com/cloud-storage/pricing)) | First 10 GB storage free; free egress up to **3x average monthly storage** → 3 × 0.098 GB ≈ **~0.3 GB/mo**, then $0.01/GB                                                                                                                                         | Storage fine; _direct_ free egress is tiny for a small store    | None built in; "unlimited free egress" only _through partner CDNs_: **Cloudflare**, Fastly, bunny.net, CacheFly… (the Bandwidth Alliance)                                                                                     | `https://f00x.backblazeb2.com/file/<bucket>`                          | **Flag: the free-egress pitch is Cloudflare-alliance-shaped** — using it as intended contradicts "no Cloudflare" in spirit; using it without a partner CDN means paid egress past ~0.3 GB/mo and no CDN |
| **AWS S3** ([aws.amazon.com/free](https://aws.amazon.com/free/))              | New accounts (post-July-2025 model): **$100 credits + up to $100 earned, 6-month free period; "the account closes on its own 6 months after you open it or when your credits run out"** unless converted to paid. Old 12-month 5 GB tier is gone for new accounts | Fine on paper, but the free account self-destructs in ≤6 months | None without adding CloudFront (more setup, another bill surface)                                                                                                                                                             | `https://<bucket>.s3.<region>.amazonaws.com`                          | **Disqualified** for permanent free hosting: 6-month expiry by design                                                                                                                                   |
| **bunny.net** ([pricing](https://bunny.net/pricing/))                         | **No free tier**; 14-day trial; **$1/month minimum**; CDN $0.01/GB (EU/NA); Bunny Storage ~$0.01/GB/mo                                                                                                                                                            | ~$1/mo total at this scale                                      | Real CDN (119 PoPs), the best non-Cloudflare pure-CDN option                                                                                                                                                                  | `https://<pullzone>.b-cdn.net`                                        | Best **paid** fallback; fails the "free" requirement                                                                                                                                                    |

## 5. Repo interaction (Bun workspaces monorepo)

- Layout: root `package.json` with `workspaces: ["apps/*"]`; the images would live at `apps/website/public/diddls/...` and ship in the build output of `bun run --filter website build`. Workspace filtering doesn't change what lands in `public/` output.
- **Git weight:** 98MB across 4,055 files (avg ~24 KB) is far below GitHub's per-file limits (warning at 50 MiB, hard block at 100 MiB) and well under the "ideally less than 1 GB" repo-size recommendation ([GitHub docs](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github)). No LFS needed — and _don't_ use LFS: Vercel would then need LFS support enabled and it complicates clones for zero benefit at this size.
- The catalog is fixed, so the 98MB is written to history **once**; clones carry it forever but it never grows. Vercel's build clone and output upload absorb it in seconds against the 45-minute cap ([limits](https://vercel.com/docs/limits)).
- Real tradeoffs of committing: every contributor clone is +98MB; the desktop-app/scrape workspaces drag the images along; CLI deploys are dead (100 MB Hobby source-upload cap). Tradeoffs of external storage instead: an upload pipeline, a second system that can lock you out (Blob 30-day suspension) or pause (Supabase), and env-var divergence between dev and prod.
- Dev/prod symmetry bonus for `public/`: locally `IMAGE_BASE_URL=/diddls` works with zero setup — the dev server serves the same files.

## Ranked recommendation

1. **Vercel `public/` static (WINNER).** Commit to `apps/website/public/diddls/`, deploy via git integration only. Zero external systems, originals byte-for-byte, automatic CDN caching for a fixed catalog, 100 GB/mo headroom ≈ 1,000 catalog-downloads, no Image-Optimization involvement, free forever within Hobby fair use (site must stay non-commercial). **`IMAGE_BASE_URL=/diddls`**, URL = `${IMAGE_BASE_URL}/${relativePath}` (same-origin; in dev it's the same path served by the dev server).
2. **Vercel Blob public store.** Keeps the repo light; 98MB ≪ 1 GB free; one-time ~5-minute upload script. Ranked below `public/` because transfer allowance is 10x smaller (10 GB/mo) and exhaustion means a 30-day Blob lockout — a real dark-images failure mode `public/` doesn't have. `IMAGE_BASE_URL=https://<store-id>.public.blob.vercel-storage.com/diddls`.
3. **bunny.net.** The best non-Cloudflare external CDN+storage, ~$1/mo — but not free, so it only enters if Vercel egress ever becomes a problem (it won't at hobby scale). `IMAGE_BASE_URL=https://<pullzone>.b-cdn.net`.
4. **Supabase Storage.** Free numbers look fine (1 GB / 5+5 GB egress) but free projects pause after 1 week of inactivity and delivery is Cloudflare-CDN-backed — violates the no-Cloudflare constraint in spirit.
5. **Backblaze B2.** 10 GB free storage, but meaningful free egress assumes a Cloudflare-alliance CDN in front; standalone free egress here is ~0.3 GB/mo with no CDN.
6. **AWS S3.** New free tier is a $100-credit, 6-month program after which the account closes unless you pay — structurally wrong for permanent free hosting.
