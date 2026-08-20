# Image hosting options for the catalog

Type: research
Status: resolved

## Question

The catalog images are a fixed ~89MB zip (`apps/desktop-app/resources/diddl-images.zip`,
~2,800 images; desktop unpacks it at runtime). The user asked to explore the options
in detail for the Railway + SolidStart + Neon stack. Compare, with concrete
trade-offs (cost, cold-start/build impact, CDN behavior, git repo weight, upload
pipeline complexity):

- Static assets in the SolidStart `public/` directory, committed to the repo (or
  fetched at build time), served by the node server on Railway.
- A Railway volume populated once, served via a static route.
- Object storage + CDN: Cloudflare R2, S3, Bunny, etc. — including how image URLs
  would be stored/derived in the catalog table.
- Whether an image-optimization step (resize to actual display sizes, WebP/AVIF)
  is worth folding into the seeding pipeline; note desktop stores imageWidth/Height.

Note Neon itself does not serve blobs; the database stores paths/URLs only.

Primary sources: docs.railway.com, provider docs. Feeds the "Choose image hosting"
decision (issue 07) and the "Catalog seeding pipeline" decision (issue 10).

## Answer

Full findings: [research/04-image-hosting-options.md](../research/04-image-hosting-options.md)
(also on branch `research/image-hosting-options`, commit 0b47b8d).

Ranked recommendation for this hobby-scale, fixed catalog (98MB / ~4,055 JPGs):

1. **Cloudflare R2 behind a custom domain** — fits entirely in R2's always-free tier
   (10GB storage, 10M reads/mo) with zero egress: $0/month, keeps ~100MB of binaries
   out of git and out of every Railway deploy. Store relative paths in Neon; derive
   URLs from an `IMAGE_BASE_URL` env var.
2. **`public/` committed to the repo + Railway's free built-in CDN** — the winner if
   no domain sits on Cloudflare; cache hits cost no compute or egress.
3. Bunny, then S3 — fine but strictly dominated by R2 on price at this scale.
4. Railway volume — last: awkward one-off population, single-service mount, no
   advantage for immutable data.

A one-time `sharp` pass (WebP re-encode + 320px thumbnails, regenerating
imageWidth/imageHeight) is worth folding into the seeding pipeline — thumbnails are
the real win for grid pages, and the pass runs once in minutes.
