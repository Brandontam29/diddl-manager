# SolidJS v2 / SolidStart v2 Landscape (as of 2026-08-19)

## Decision summary

**Build the web app on Solid 1.x + SolidStart 2 (stable). Do not build on Solid 2.**

- **SolidJS 2.0 is NOT stable.** It is at `2.0.0-rc.1`, published 2026-08-19 on the `next` npm tag. `latest` is `1.9.15`. RC means "API frozen, but bugs expected" per the core team ([npm dist-tags](https://www.npmjs.com/package/solid-js?activeTab=versions), [v2.0.0 RC announcement](https://github.com/solidjs/solid/discussions/2995)).
- **SolidStart 2.0 IS stable** — `2.0.2` on `latest` (2.0.0 shipped 2026-08-04) — **but it is explicitly built for Solid v1, not Solid 2**. Its own dependency is `solid-js ^1.9.14` and it peers `@solidjs/router >=0.16.0 <2.0.0-0`. Quote from the announcement: "SolidStart v2 is built for Solid v1, giving existing applications a modern, stable foundation today … we can carry this foundation forward as we move towards Solid v2 in future releases." No timeline for a Solid-2-compatible Start ([announcement](https://github.com/solidjs/solid-start/discussions/2281), [release](https://github.com/solidjs/solid-start/releases)).
- **Ecosystem support for Solid 2 is embryonic**: Kobalte's first Solid-2 build is a 4-day-old alpha; @dnd-kit/solid, lucide-solid, and all current @solid-primitives releases peer on Solid 1 only. Even if Solid 2 went stable tomorrow, this app's UI stack couldn't follow.
- **Recommended stack today**: `solid-js ^1.9.15`, `@solidjs/start ^2.0.2`, `@solidjs/router ^1.0.0`, Vite 8, Node 24+, Tailwind 4 via `@tailwindcss/vite ^4.3` (Vite 8 supported, Vite 9 not yet), plus the same UI libs the desktop app already uses. This is the officially recommended path and maximizes code reuse from `apps/desktop-app` (Solid 1.9 codebase).
- **Later v2 upgrade**: real work (Solid 2 is an async-first rewrite with many removed/renamed APIs) but deliberately supported — official migration guide + `solid-migration-assistant` codemod exist, and 1.x is still receiving releases (1.9.15 two days ago, 1.10 beta in progress). Gated anyway on a future SolidStart release; details below.

---

## 1. Release status and versions (npm, checked 2026-08-19 via `npm view`)

### solid-js — [npm](https://www.npmjs.com/package/solid-js?activeTab=versions)

| tag      | version        | published  |
| -------- | -------------- | ---------- |
| `latest` | **1.9.15**     | 2026-08-17 |
| `next`   | **2.0.0-rc.1** | 2026-08-19 |
| `beta`   | 1.10.0-beta.0  | 2026-01-26 |

v2 timeline: `2.0.0-experimental.0` 2025-02-13 → 16 experimental releases → `2.0.0-beta.0` 2026-03-03 → 34 betas → `2.0.0-rc.0` 2026-08-12 → `2.0.0-rc.1` 2026-08-19. The 1.x line is still actively maintained in parallel (1.9.12–1.9.15 all shipped in 2026; 1.10.0-beta exists).

Stability guarantee per the team: the RC's API is frozen but "Release Candidate means the API is frozen but not that there won't be bugs"; they are asking ecosystem maintainers to migrate now and report issues ([RC discussion #2995](https://github.com/solidjs/solid/discussions/2995), [releases](https://github.com/solidjs/solid/releases)). InfoQ's coverage of the beta likewise frames it as a ground-up async rework still stabilizing ([InfoQ, May 2026](https://www.infoq.com/news/2026/05/solidjs-2-async/)).

### @solidjs/start — [npm](https://www.npmjs.com/package/@solidjs/start?activeTab=versions)

| tag                  | version   | published  |
| -------------------- | --------- | ---------- |
| `latest`             | **2.0.2** | 2026-08-19 |
| (first v2 stable)    | 2.0.0     | 2026-08-04 |
| previous stable line | 1.3.2     | 2026-02-24 |

**Key subtlety: "SolidStart v2" and "Solid v2" are unrelated version bumps.** SolidStart 2.x:

- depends directly on `solid-js ^1.9.14` (Solid **1**), `vite-plugin-solid ^2.11.13`, `@solidjs/meta ^0.29.4`
- peers: `@solidjs/router >=0.16.0 <2.0.0-0` (router v2 is excluded), `vite ^8 || ^9`
- requires **Node.js 24+** and **Vite 8** (Environment API + Rolldown); **Vinxi is gone** — config moves from `app.config.ts` to `vite.config.ts` ([v2 announcement](https://github.com/solidjs/solid-start/discussions/2281), [migration guide](https://docs.solidjs.com/solid-start/v2/migrating-from-v1))
- server functions (`"use server"`) remain, with improved serialization/error handling; under the hood it now uses h3 v2/srvx instead of the Vinxi/Nitro stack (per its dependency list on npm).

### @solidjs/router — [npm](https://www.npmjs.com/package/@solidjs/router?activeTab=versions)

| tag      | version       | notes                                                                                 |
| -------- | ------------- | ------------------------------------------------------------------------------------- |
| `latest` | **1.0.0**     | peers `solid-js ^1.8.6` — the Solid-1 router, first stable 1.0                        |
| `next`   | 2.0.0-next.17 | peers `solid-js ^2.0.0-rc.1` + `@solidjs/web ^2.0.0-rc.1` — Solid-2 only, pre-release |

So the pairing is: **Solid 1.9 + Router 1.0 + Start 2.0 (all stable)** vs **Solid 2.0-rc + Router 2.0-next (no Start at all)**.

## 2. What breaks in Solid 2 (headline changes vs 1.x)

Sources: [RC announcement / release notes](https://github.com/solidjs/solid/discussions/2995), [Road to 2.0 discussion #2425](https://github.com/solidjs/solid/discussions/2425), [Lexlohr, "What is new in solid-js@2.0"](https://dev.to/lexlohr/what-is-new-in-solid-js20-11hk), [InfoQ](https://www.infoq.com/news/2026/05/solidjs-2-async/).

- **Async-first reactivity**: `createResource` is **removed**; async values flow through ordinary memos (`createMemo(() => fetch(...))`) with new `<Loading>` / `<Reveal>` boundaries replacing `<Suspense>` / `<SuspenseList>`. New `createOptimistic()` / `action()` for mutations; `isPending()`, `latest()`, `flush()` utilities. Signal propagation is batched/asynchronous by default.
- **Removed primitives**: `batch`, `startTransition`/`useTransition`, `on`, `createComputed`, `produce`, `createMutable`, `use:` directives, `classList`, `/*@once*/`.
- **`createEffect` signature change**: split form separating tracked deps from the side-effect — `createEffect(deps, fn)` instead of one tracking closure.
- **Stores**: setters receive a mutable draft (`setState(s => { s.todos[id].done = true })`); `unwrap()` → `snapshot()`; `reconcile(next, "id")` keyed; new `createProjection()`.
- **Renames**: `onMount` → `onSettled`; `mergeProps`/`splitProps` → `merge`/`omit`; context object is its own provider (`<Theme value>`), `useContext` throws when missing.
- **Package restructure**: reactive core → `@solidjs/signals`; DOM runtime → `@solidjs/web`; stores folded into `solid-js`; server functions in `@solidjs/web/server-functions`; `vite-plugin-solid` renamed `@solidjs/vite-plugin`; compiler rewritten from Babel to Rust/OXC.
- **Router**: Router 2.0-next targets the new core (`@solidjs/web`); Router 1.0 is the Solid-1 router. **Server functions in a full-stack app remain a SolidStart feature; Start for Solid 2 is "future releases"** ([Start v2 announcement](https://github.com/solidjs/solid-start/discussions/2281)).

Migration tooling: official migration guide + `solid-migration-assistant` codemod ([RC notes](https://github.com/solidjs/solid/discussions/2995)).

## 3. Library compatibility with Solid 2 (peer deps checked on npm, 2026-08-19)

| Library                                                                                                                   | Latest stable        | `solid-js` peer range                           | Solid 2 status                                                                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------- | -------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@kobalte/core`                                                                                                           | 0.13.13 (2026-08-10) | `^1.9.8`                                        | **Alpha only**: `2.0.0-alpha.0` (2026-08-13) pins `solid-js@2.0.0-rc.0` + `@solidjs/web@2.0.0-rc.0` ([npm](https://www.npmjs.com/package/@kobalte/core?activeTab=versions))                                                           |
| `@tanstack/solid-form`                                                                                                    | 1.33.5               | `>=1.9.9`                                       | No declared v2 support; TanStack's Solid-2 blog names only Router/Start/Query ([blog](https://tanstack.com/blog/tanstack-start-solid-v2))                                                                                             |
| `@tanstack/solid-table`                                                                                                   | 9.1.2                | `>=1.3`                                         | Loose range, no v2 statement; untested on 2.x                                                                                                                                                                                         |
| `@tanstack/solid-query`                                                                                                   | (not used here)      | —                                               | Solid 2 beta/RC support shipped ([TanStack blog, Apr 2026](https://tanstack.com/blog/tanstack-start-solid-v2))                                                                                                                        |
| `@dnd-kit/solid`                                                                                                          | 0.5.0                | `^1.8.0`                                        | **Solid 1 only** ([npm](https://www.npmjs.com/package/@dnd-kit/solid))                                                                                                                                                                |
| `lucide-solid`                                                                                                            | 1.33.0               | `^1.4.7`                                        | **Solid 1 only** ([npm](https://www.npmjs.com/package/lucide-solid))                                                                                                                                                                  |
| `solid-icons`                                                                                                             | 1.2.0                | `*`                                             | Nominally any version; no v2 testing signal ([npm](https://www.npmjs.com/package/solid-icons))                                                                                                                                        |
| `motion`                                                                                                                  | 13.1.0 (app on 12.x) | n/a — peers are `react` (optional)              | The app uses the framework-agnostic `motion` (vanilla) API, so Solid version is irrelevant ([npm](https://www.npmjs.com/package/motion))                                                                                              |
| `@tailwindcss/vite`                                                                                                       | 4.3.3                | n/a — peers `vite ^5.2 \|\| ^6 \|\| ^7 \|\| ^8` | Tailwind 4 is Solid-agnostic. Works with SolidStart 2 **on Vite 8** (Vite 9 not yet in range) ([npm](https://www.npmjs.com/package/@tailwindcss/vite))                                                                                |
| `@solid-primitives/*` (e.g. `storage` 4.4.0, and the `intersection-observer`/`media`/`scheduled` packages this repo uses) | current              | `^1.6.x`–`^1.9.x`                               | **Solid 1 only** today; Solid-2 pre-releases of the community primitives are being prepared ([Lexlohr](https://dev.to/lexlohr/what-is-new-in-solid-js20-11hk), [primitives.solidjs.community](https://primitives.solidjs.community/)) |

Bottom line: of the stack this app needs, only TanStack Query and Kobalte-alpha have any Solid-2 artifacts, and none are stable. Several `>=` peer ranges would _install_ against a hypothetical `solid-js@2.0.0` but nothing here has been tested against the new reactivity semantics (async signals, removed `createResource`, etc.), which are behavioral, not just type-level.

## 4. Recommended stack for the web app + future upgrade cost

### Build now (all stable, all mutually compatible)

| Package                                 | Version                                                           |
| --------------------------------------- | ----------------------------------------------------------------- |
| `solid-js`                              | ^1.9.15                                                           |
| `@solidjs/start`                        | ^2.0.2 (Node 24+, `vite.config.ts`)                               |
| `@solidjs/router`                       | ^1.0.0 (desktop app is on 0.15 — API-compatible line, minor bump) |
| `vite`                                  | ^8 (not 9, for Tailwind plugin compat)                            |
| `@tailwindcss/vite` / `tailwindcss`     | ^4.3                                                              |
| `@kobalte/core`                         | ^0.13.13                                                          |
| `@tanstack/solid-form`                  | ^1.33                                                             |
| `@tanstack/solid-table`                 | ^9                                                                |
| `@dnd-kit/solid`                        | ^0.5                                                              |
| `lucide-solid`, `solid-icons`, `motion` | current                                                           |
| `@solid-primitives/*`                   | current                                                           |

This is essentially the desktop app's renderer stack (`apps/desktop-app/package.json`: solid-js ^1.9.11, Kobalte ^0.13.11, Tailwind ^4.2, motion ^12) hoisted into SolidStart 2 — maximum component reuse, zero API translation.

### How painful is the later Solid 2 upgrade?

Moderate-to-significant, but bounded and well-supported:

1. **Blocked on SolidStart anyway.** A SolidStart-on-Solid-2 release is only promised for "future releases" with no date ([announcement](https://github.com/solidjs/solid-start/discussions/2281)). Until it ships, a SolidStart app _cannot_ move to Solid 2 regardless of app-code readiness — so there is no cost to waiting.
2. **App code**: mechanical renames (`onMount`→`onSettled`, `splitProps`→`omit`, `classList`→`class`, Suspense→Loading) are covered by the official `solid-migration-assistant` codemod. Real thought needed for: any `createResource` → async-memo rewrites, `createEffect` split-signature, `batch`/`on`/`produce` usages, and the shift to asynchronous signal propagation (timing-sensitive code). The desktop codebase is idiomatic Solid 1, which is exactly what the migration guide targets.
3. **Libraries**: the gating factor. Kobalte, dnd-kit, lucide-solid, and solid-primitives all need their own Solid-2 releases; Kobalte's alpha (published the day after solid-js RC) shows maintainers are moving. Expect the ecosystem to be upgrade-ready months after solid-js 2.0 stable, roughly alongside the Solid-2 SolidStart.
4. **Mitigation while building now**: keep data fetching behind thin wrappers (few `createResource` call sites), avoid `createComputed`/`produce`/`use:` directives and `classList` (use `clsx`/`class` — the app already does), and prefer `@solid-primitives` wrappers over hand-rolled effects so upgrades ride on library releases.

## Method note

Versions, dist-tags, publish dates, and peer ranges were read directly from the npm registry via `npm view` on 2026-08-19 (registry data is authoritative here; some web mirrors of release notes mis-state years). Release-note content was verified against the solidjs/solid and solidjs/solid-start GitHub repos.

## Sources

- https://www.npmjs.com/package/solid-js?activeTab=versions (dist-tags: latest 1.9.15, next 2.0.0-rc.1)
- https://www.npmjs.com/package/@solidjs/start?activeTab=versions (latest 2.0.2)
- https://www.npmjs.com/package/@solidjs/router?activeTab=versions (latest 1.0.0, next 2.0.0-next.17)
- https://github.com/solidjs/solid/releases — v2.0.0 RC "The Big \<Reveal\>", v2.0.0 Beta "The \<Suspense\> is Over"
- https://github.com/solidjs/solid/discussions/2995 — Solid v2.0.0 RC announcement
- https://github.com/solidjs/solid/discussions/2425 — The Road to 2.0
- https://github.com/solidjs/solid-start/discussions/2281 — SolidStart v2 announcement ("built for Solid v1")
- https://docs.solidjs.com/solid-start/v2/migrating-from-v1 — SolidStart v1→v2 migration guide
- https://tanstack.com/blog/tanstack-start-solid-v2 — TanStack Router/Start/Query Solid 2 beta support
- https://dev.to/lexlohr/what-is-new-in-solid-js20-11hk — Solid 2.0 API change rundown
- https://www.infoq.com/news/2026/05/solidjs-2-async/ — SolidJS 2.0 beta coverage
- https://primitives.solidjs.community/ — Solid Primitives
- npm pages for @kobalte/core, @tanstack/solid-form, @tanstack/solid-table, @dnd-kit/solid, lucide-solid, solid-icons, motion, @tailwindcss/vite, @solid-primitives/storage (peer ranges as tabulated above)
