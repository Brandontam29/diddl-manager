# Image hosting on Vercel free tier

Type: research
Status: resolved

## Question

Deployment is now Vercel free (Hobby) tier (issue 18); Cloudflare is ruled out. The
fixed catalog is ~98MB / ~4,055 JPGs (~2,800 diddls), served as originals (no
re-encode — settled). Explore deeply where these images should live:

- **`public/` on Vercel**: Hobby-tier limits that could bite — total deployment
  size cap, per-file limits, CDN caching of static assets, the 100GB/mo fair-use
  bandwidth, build upload time with ~4k files, and whether ~98MB of static assets in
  a hobby deployment is actually within policy.
- **Vercel Image Optimization**: Hobby tier's source-image quota (historically
  1,000 source images/mo) vs our 4,055 images — is `next/image`-style optimization
  usable at all here, and what happens on quota exhaustion (does it fall back to
  serving originals)?
- **Vercel Blob**: free-tier storage/bandwidth allowances, URL shape, upload
  pipeline (one-time script), cost projection if the free allowance is exceeded.
- **Non-Cloudflare object storage with a workable free tier**: e.g. Supabase
  Storage, Backblaze B2 (note: B2's free egress rides Cloudflare peering — check if
  that conflicts with "no Cloudflare" in spirit), Bunny (cheap, not free), AWS S3
  free tier (12-month expiry). For each: free allowance vs our 98MB + hobby-scale
  bandwidth, and CDN behavior.
- **Git-based serving** (images committed to the repo, served via Vercel's CDN from
  `public/`) vs keeping the repo light — interaction with the monorepo and Vercel's
  build from a Bun workspace.

End with a ranked recommendation for Vercel Hobby with the no-Cloudflare
constraint, including the `IMAGE_BASE_URL` value each option implies.

Primary sources: vercel.com/docs (limits, image optimization, blob), provider docs.

Feeds the reopened "Choose image hosting" (issue 07) and "Catalog seeding pipeline"
(issue 10).

## Answer

Full findings: [research/19-vercel-image-hosting.md](../research/19-vercel-image-hosting.md)
(also on branch `research/vercel-image-hosting`, commit b06ff02).

Ranked recommendation:

1. **Commit the ~98MB / 4,055 JPGs into `apps/website/public/diddls/` and serve
   originals off Vercel's CDN**, `IMAGE_BASE_URL=/diddls`. Git-based Hobby deploys
   have no output-size cap this approaches (the 100MB limit applies only to CLI
   source uploads — so never deploy via local `vercel deploy`); Hobby includes
   100GB/mo Fast Data Transfer (~1,000 full-catalog downloads); static files are
   auto-cached on the CDN; plain `<img>` tags never touch the Image Optimization
   quota (now 5K/mo transformations — the 1,000-source-images cap was legacy
   pricing).
2. Vercel Blob — 98MB ≪ 1GB free storage, but only 10GB/mo transfer and a 30-day
   lockout on overage.
3. Disqualified/weak: Supabase (free projects pause after a week idle; its CDN is
   literally Cloudflare), Backblaze B2 (free egress rides the Cloudflare bandwidth
   alliance), AWS free tier (now self-expires in 6 months), Bunny ($1/mo, not free).
