# 16 — TanStack Start (Solid) + SolidJS v2: viability check

Researched 2026-08-20 against npm registry, tanstack.com, and github.com/TanStack/router.

## Verdict

**Yes — buildable today, on RC bits.** TanStack Start's Solid flavor has an official v2 release-candidate line (`@tanstack/solid-start@2.0.0-rc.1`, published 2026-08-19) whose peer range is explicitly `solid-js >=2.0.0-0 <3.0.0` — i.e. the v2 line _requires_ Solid 2 and tracks its RCs same-day. TanStack has publicly supported Solid 2 in Router, Start, and Query since April 2026 and calls the RC "feature-complete / API stable". The catch is everything _around_ the framework: outside TanStack's own packages and a days-old Kobalte alpha (pinned to the wrong RC), the Solid UI ecosystem (dnd-kit, lucide-solid, solid-primitives, Ark/zag/corvu) still peers on Solid 1, and npm semver rules mean `>=1.x` ranges do **not** accept `2.0.0-rc.*` prereleases without `overrides`/`--legacy-peer-deps`. So: framework yes, ecosystem no — the decision reduces to the two concession paths in §7.

---

## 1. @tanstack/solid-start: versions and Solid 2 support

npm dist-tags as of 2026-08-20 ([registry](https://www.npmjs.com/package/@tanstack/solid-start)):

| tag      | version        | published      | solid-js peer                                                                                   |
| -------- | -------------- | -------------- | ----------------------------------------------------------------------------------------------- |
| `latest` | 1.168.46       | 2026-08-19     | `>=1.0.0` (but its dep `@tanstack/solid-router@1.170.29` peers `^1.9.10` → effectively Solid 1) |
| `rc`     | **2.0.0-rc.1** | **2026-08-19** | **`>=2.0.0-0 <3.0.0`**, plus `@solidjs/web >=2.0.0-0 <3.0.0`, `vite >=7.0.0`                    |
| `beta`   | 2.0.0-beta.31  | —              | Solid 2 betas                                                                                   |
| `alpha`  | 2.0.0-alpha.10 | —              | —                                                                                               |

- **Yes, a pre-release line supports solid-js 2.0.0-rc.x**: the entire 2.0.0-alpha/beta/rc line is Solid-2-only (the `-0` suffix in the range deliberately admits prereleases). `2.0.0-rc.1` depends on `@tanstack/solid-router@2.0.0-rc.1` + `@tanstack/solid-start-client/server@2.0.0-rc.1`. GitHub releases confirm the whole Solid v2 RC set shipped 2026-08-19 ([TanStack/router releases](https://github.com/TanStack/router/releases)) — the same day `solid-js@2.0.0-rc.1` hit npm's `next` tag.
- **Stability**: the docs overview states TanStack Start is a **Release Candidate**: "feature-complete and its API is considered stable", with v1 (of the branding; versions are 1.16x/2.x) anticipated soon ([overview](https://tanstack.com/start/latest/docs/framework/solid/overview)).
- Note the stable line's loose `solid-js >=1.0.0` peer on `@tanstack/solid-start` itself is misleading — the router peer (`^1.9.10`) pins the stable line to Solid 1 in practice.

## 2. TanStack's public statements on Solid 2

- Official blog, 2026-04-10: ["Solid 2.0 Beta Support in TanStack Router, Start, and Query"](https://tanstack.com/blog/tanstack-start-solid-v2) — support called "intentionally early"; TanStack APIs mostly unchanged, breaking changes come from Solid 2 itself; team commits to "close tracking from beta through stable release".
- [X announcement](https://x.com/tan_stack/status/2042691251707818362): "Solid 2.0 beta support is now available in TanStack Router, Start, and Query… you can start today."
- Cadence backs the commitment: `solid-js@2.0.0-rc.0` (2026-08-12) → TanStack rc.0 (2026-08-13); `solid-js@2.0.0-rc.1` (2026-08-19) → TanStack rc.1 (2026-08-19, hours later). No published date for stable.

## 3. @tanstack/solid-router

- `latest` **1.170.29**, peer `solid-js ^1.9.10` (Solid 1 only).
- `rc` **2.0.0-rc.1** (2026-08-19), peer `solid-js >=2.0.0-0 <3.0.0` + `@solidjs/web >=2.0.0-0 <3.0.0` (Solid 2 only). ([npm](https://www.npmjs.com/package/@tanstack/solid-router))
- Companion data layer: `@tanstack/solid-query@6.0.0-rc.0` peers `solid-js >=2.0.0-rc.0 <3.0.0` (Solid 2); `latest` 5.101.4 remains Solid 1. ([npm](https://www.npmjs.com/package/@tanstack/solid-query))

## 4. Server-function model (replaces SolidStart's query/action)

Sources: [server-functions](https://tanstack.com/start/latest/docs/framework/solid/guide/server-functions), [middleware](https://tanstack.com/start/latest/docs/framework/solid/guide/middleware), [server-routes](https://tanstack.com/start/latest/docs/framework/solid/guide/server-routes) (Solid docs are generated from the React originals in [TanStack/router `docs/start/framework/react/guide/`](https://github.com/TanStack/router/tree/main/docs/start/framework/react/guide)).

- **`createServerFn({ method?: 'GET'|'POST', strict? }).validator(fn).handler(async ({ data, context }) => …)`** — typed same-origin RPC endpoints; inputs/outputs must be serializable. Replaces SolidStart's `query()` (GET-ish reads) _and_ `action()` (mutations) with one primitive differentiated by `method`.
- **Reads**: call server fns directly from route `loader:`s (Router's caching/preloading replaces `createAsync` + `query` dedupe). **Mutations**: wrap with `useServerFn()` in components, fire from event handlers or TanStack Query mutations — there is no `useSubmission`/progressive-enhancement action form model; you pair with `@tanstack/solid-query` instead.
- **Control flow**: `throw redirect({ to })` / `throw notFound()` from inside handlers propagate to router navigation; thrown errors serialize to the client.
- **Middleware**: `createMiddleware()` in two kinds — _function middleware_ (wraps server fns, passes `context`) and _request middleware_ (HTTP-level); attachable per-fn, per-route, or globally via `src/start.ts` `requestMiddleware` (a `createCsrfMiddleware()` is auto-installed by default).
- **Server routes** (raw API endpoints): add a `server: { handlers: { GET, POST, … }, middleware: [...] }` property to `createFileRoute` in `src/routes/` — file conventions shared with the router (`routes/users/$id.ts` → `/users/$id`), handlers return `Response`.

## 5. Ecosystem re-check under Solid 2 RC (delta vs 2026-08-19)

Semver gotcha that frames all of this: a range like `>=1.6.0` **fails** against `2.0.0-rc.1` (npm excludes prereleases unless the range carries a prerelease on the same version tuple), but will **pass** once `solid-js@2.0.0` stable ships. So "Solid-1 peer" splits into two classes below.

| package                                   | latest / relevant version                                                                           | solid-js peer                       | Solid 2 RC installable?          | Solid 2 stable (formally)?                            |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------- | -------------------------------- | ----------------------------------------------------- |
| @kobalte/core                             | 0.13.13; **2.0.0-alpha.0** (2026-08-13, unchanged since yesterday)                                  | alpha pins **`2.0.0-rc.0` exactly** | only with override (rc.0 ≠ rc.1) | alpha won't match stable either — needs a new publish |
| @tanstack/solid-form                      | 1.33.5; 2.0.0-alpha.1 (2026-08-13; Form v2 alpha [announced 2026-08-14](https://tanstack.com/blog)) | both `>=1.9.5`                      | no (override needed)             | yes, range admits 2.0.0                               |
| @tanstack/solid-table                     | 9.1.2 (Table v9, blog 2026-08-06)                                                                   | `>=1.3`                             | no (override needed)             | yes, range admits 2.0.0                               |
| @dnd-kit/solid                            | 0.5.0                                                                                               | `^1.8.0`                            | no                               | **no** — caret cap at <2                              |
| lucide-solid                              | 1.33.0                                                                                              | `^1.4.7`                            | no                               | **no** — caret cap                                    |
| @solid-primitives/\* (e.g. storage 4.4.0) | —                                                                                                   | `^1.6.x` typical                    | no                               | **no** — caret caps                                   |
| @ark-ui/solid                             | 5.38.2                                                                                              | `>=1.6.0`                           | no (override needed)             | yes, formally                                         |
| @zag-js/solid                             | 1.43.1                                                                                              | `>=1.1.3`                           | no (override needed)             | yes, formally                                         |
| corvu                                     | 0.7.2                                                                                               | `^1.8`                              | no                               | no                                                    |
| @thisbeyond/solid-dnd                     | 0.7.5                                                                                               | `^1.5`                              | no                               | no                                                    |

Movement since 2026-08-19: **only TanStack moved** (solid-start/router rc.1 on 2026-08-19 ~22:00 UTC, solid-query 6.0.0-rc.0 line). Kobalte alpha is still the lone `2.0.0-alpha.0` from 2026-08-13, now mismatched against solid-js rc.1. "Formally yes" ≠ tested: none of Ark/zag/table/form have published Solid-2 test claims; caret-capped packages (`dnd-kit`, `lucide-solid`, `solid-primitives`, `corvu`) require actual releases before they work on Solid 2 at all.

## 6. Deployment (Railway node server, Vercel)

Source: [hosting guide](https://tanstack.com/start/latest/docs/framework/solid/guide/hosting) ([React original](https://github.com/TanStack/router/blob/main/docs/start/framework/react/guide/hosting.md)). Named targets include **Railway**, Vercel, Node.js/Docker, Cloudflare Workers, Netlify, Bun, Appwrite.

- **Railway / plain Node**: add `nitro()` from `nitro/vite` to `vite.config.ts` plugins (`[tanstackStart(), nitro(), viteSolid()]`); `vite build` emits a self-contained server bundle at `.output/server/index.mjs` (client assets in `dist/client`); start with `node .output/server/index.mjs`. That maps 1:1 onto Railway's build-command/start-command model — no adapter package needed.
- **Vercel**: follows Nitro's deployment integration — effectively zero-config on Vercel (Nitro's vercel preset selected automatically; one-click deploy supported).

## 7. Concession paths (if you refuse RC-grade risk)

**(a) TanStack Start on Solid 1 — the boring path, everything works.**
Exact pins: `solid-js@1.9.15` + `@tanstack/solid-start@1.168.46` + `@tanstack/solid-router@1.170.29` (+ `@tanstack/solid-query@5.101.4` if wanted). Whole UI ecosystem is compatible: `@kobalte/core@0.13.13`, `@dnd-kit/solid@0.5.0`, `lucide-solid@1.33.0`, `@tanstack/solid-form@1.33.5`, `@tanstack/solid-table@9.1.2`, `@solid-primitives/*`. Migration to the v2/Solid-2 line later is TanStack-sanctioned (v2 keeps TanStack APIs "mostly unchanged"; breaking changes come from Solid 2 itself).

**(b) Solid 2 RC now — framework fine, UI layer rebuilt.**
Pins: `solid-js@2.0.0-rc.1` + `@solidjs/web@2.0.0-rc.1` + `@tanstack/solid-start@2.0.0-rc.1` + `@tanstack/solid-router@2.0.0-rc.1` + `@tanstack/solid-query@6.0.0-rc.0`, `vite>=7`, `vite-plugin-solid@3.x-next`. Replacements:

- _Kobalte_ → `@kobalte/core@2.0.0-alpha.0` with an npm `override` forcing solid-js rc.1 (alpha is pinned to rc.0), or headless via `@zag-js/solid`/`@ark-ui/solid` under `--legacy-peer-deps` (formally compatible only at Solid 2 stable; runtime unverified), or hand-rolled primitives.
- _dnd-kit_ → **no Solid-2 option exists** (`@dnd-kit/solid ^1.8.0`, `@thisbeyond/solid-dnd ^1.5` both caret-capped). Realistic answer: hand-rolled pointer-events DnD, or the framework-agnostic `@dnd-kit/dom` core driven manually.
- _lucide-solid_ → drop for `unplugin-icons` (compiles to plain JSX SVG, framework-version-agnostic) or inline SVGs.
  Everything in this path lives behind `overrides`/`--legacy-peer-deps` until Solid 2 stable ships and vendors re-publish.

**Recommendation embedded in the data**: path (a) unless the app specifically needs Solid 2's async/derivation model — the framework layer for (b) is genuinely ready (TanStack tracks Solid RCs same-day), but every UI dependency in this project's stack is a casualty.
