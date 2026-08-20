# SolidStart v2 & SolidJS v2 status and library compatibility

Type: research
Status: resolved

## Question

What is the actual release status of SolidJS v2 and SolidStart v2 as of August 2026 —
stable, beta, or vaporware? Specifically:

- Current published versions and stability guarantees; headline breaking changes from
  SolidJS 1.x / SolidStart 1.x (signals API, `createResource`, router, server functions).
- Compatibility of the desktop app's UI stack with SolidJS v2: Kobalte,
  TanStack solid-form, TanStack solid-table, @dnd-kit/solid, lucide-solid/solid-icons,
  motion, Tailwind 4 (via @tailwindcss/vite), @solid-primitives/\*.
- If v2 is not viable today: what the recommended current versions are and how painful
  a later v2 upgrade would be.

Primary sources: solidjs.com, start.solidjs.com, the GitHub repos/changelogs, library
repos' peer-dependency declarations.

Feeds the "Lock framework versions" decision (issue 05).

## Answer

Full findings: [research/01-solid-v2-landscape.md](../research/01-solid-v2-landscape.md)
(also on branch `research/solid-v2-landscape`, commit b9b20ab).

- **SolidJS 2.0 is not stable**: `2.0.0-rc.1` landed on the `next` tag 2026-08-19
  (betas since March 2026); `latest` is still 1.9.15. API frozen at RC, bugs
  expected, ecosystem migration just starting.
- **SolidStart 2.0 is stable** (2.0.0 on 2026-08-04, now 2.0.2) — but it is built
  for Solid **v1** (`solid-js ^1.9.14`, router <2, Vite 8, Vinxi removed). A
  Solid-2-compatible Start is only promised for "future releases", no date. A
  SolidStart app literally cannot run Solid 2 today.
- Ecosystem: Kobalte's only Solid-2 build is a days-old alpha pinned to rc.0;
  @dnd-kit/solid, lucide-solid, @tanstack/solid-form/table, and all
  @solid-primitives peer on Solid 1.
- Recommendation: build on `solid-js ^1.9.15` + `@solidjs/start ^2.0.2` +
  `@solidjs/router ^1` + Vite 8 + Tailwind 4 — essentially the desktop app's stack.
  The eventual Solid 2 migration is bounded (official guide +
  `solid-migration-assistant` codemod; main removals: createResource, batch, on,
  produce; createEffect signature split) and is gated on the future SolidStart
  release anyway.
