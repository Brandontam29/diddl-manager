# Choose deployment platform

Type: grilling
Status: resolved
Blocked by: 16

## Question

Railway or Vercel (Cloudflare ruled out; re-opened 2026-08-20 from the earlier
Railway-first assumption). Decide using the Railway research (issue 03) and the
TanStack Start research (issue 16):

- Railway: persistent Node process, flat ~$5/mo Hobby, built-in CDN for the ~98MB
  `public/` image set, pooled-TCP Neon driver (`drizzle-orm/node-postgres`).
- Vercel: serverless functions (flips the Neon driver choice toward
  `@neondatabase/serverless`/HTTP), first-class CDN + zero-config previews, usage
  pricing.
- Which platform TanStack Start's build targets favor (from issue 16), and any
  Clerk deployment considerations (from issue 17).

Output: the platform, the Neon connection mode, and the `IMAGE_BASE_URL` value
scheme it implies.

## Answer

**2026-08-20 — user chose Vercel, free (Hobby) tier** (over the recommended
Railway).

- TanStack Start deploys on Vercel via the zero-config Nitro preset (first-class
  per issue 16).
- Neon connection mode flips to the serverless-friendly driver:
  `@neondatabase/serverless` over HTTP with `drizzle-orm/neon-http` for runtime;
  the direct (unpooled) TCP string remains for drizzle-kit migrations run locally/CI.
- Image serving is NOT settled by this choice: the user asked for a deeper
  exploration of image hosting under Vercel's free tier — see the reopened
  "Choose image hosting" (issue 07) and the new research ticket
  "Image hosting on Vercel free tier" (issue 19). Hobby-tier size/bandwidth/image-
  optimization limits may rule out the naive `public/` approach.
