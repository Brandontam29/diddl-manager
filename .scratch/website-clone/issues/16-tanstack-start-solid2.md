# TanStack Start (Solid) + SolidJS v2 viability

Type: research
Status: resolved

## Question

The user has redirected the framework to **TanStack Start's Solid flavor running
SolidJS v2**. Establish whether that is buildable today (2026-08):

- @tanstack/solid-start: current version, stability (stable/beta/RC), and its
  solid-js peer-dependency range — does any released or pre-release version support
  solid-js 2.0.0-rc.x?
- TanStack's public statements/issues about Solid 2 support timelines.
- @tanstack/solid-router status and Solid 2 compatibility.
- Server-function story in TanStack Start (createServerFn, middleware) — what
  replaces the SolidStart `query`/`action` design assumed elsewhere on the map.
- Ecosystem check under Solid 2 RC (issue 01 found Kobalte at a days-old alpha and
  dnd-kit/lucide-solid/solid-primitives on Solid 1): has anything shifted, and does
  TanStack solid-form/solid-table (already in the desktop stack) run under Solid 2?
- Deployment: TanStack Start build targets for Railway (node server) and Vercel.
- If Solid 2 is not viable under TanStack Start today: the exact concessions —
  TanStack Start on Solid 1.9, or Solid 2 with which UI-library replacements.

Primary sources: tanstack.com docs, TanStack GitHub repos/releases, npm registry,
solidjs release notes.

Feeds "Lock framework versions" (issue 05) and "Choose deployment platform"
(issue 18).

## Answer

Full findings: [research/16-tanstack-start-solid2.md](../research/16-tanstack-start-solid2.md)
(also on branch `research/tanstack-start-solid2`, commit eabac90).

- **Buildable today, but only on RC-grade bits**: `@tanstack/solid-start@2.0.0-rc.1`
  and `@tanstack/solid-router@2.0.0-rc.1` (published 2026-08-19, hours after
  `solid-js@2.0.0-rc.1`) peer on `solid-js >=2.0.0-0 <3.0.0`; TanStack has
  officially supported Solid 2 across Router/Start/Query since April 2026;
  `@tanstack/solid-query@6.0.0-rc.0` is Solid-2-only.
- **The UI ecosystem is not there**: Kobalte's only Solid-2 build is the 2026-08-13
  alpha pinned to rc.0 (mismatched with rc.1); dnd-kit, lucide-solid,
  solid-primitives, corvu are caret-capped to Solid 1; looser `>=1.x` ranges
  (Ark UI, zag-js, TanStack Form/Table) reject 2.0.0-rc prereleases under npm
  semver until Solid 2 stable.
- **Concession paths**: (a) `solid-js@1.9.15` + `@tanstack/solid-start@1.168.46` +
  `@tanstack/solid-router@1.170.29` — full desktop UI stack ports intact;
  (b) Solid 2 RC + Start 2 RC with Kobalte alpha + npm overrides (or zag/Ark),
  hand-rolled drag-and-drop (no Solid-2 dnd-kit exists), unplugin-icons replacing
  lucide-solid.
- **Server functions**: `createServerFn` + middleware + server routes replace
  SolidStart's `query`/`action` design.
- **Deployment**: Railway (plain Node via nitro/vite, `node .output/server/index.mjs`)
  and Vercel (zero-config Nitro preset) are both first-class in either path.
