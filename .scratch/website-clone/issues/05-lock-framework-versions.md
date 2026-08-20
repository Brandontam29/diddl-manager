# Lock framework versions

Type: grilling
Status: resolved
Blocked by: 01, 16

## Question

Given the findings of "SolidStart v2 & SolidJS v2 status and library compatibility"
(issue 01): which exact SolidJS / SolidStart versions does the web app build on?
Adopt v2 (accepting beta churn and any library gaps), or start on current stable with
a planned v2 migration? Decide per-library substitutions for anything incompatible
(Kobalte, TanStack solid-form/table, dnd-kit).

The user's stated stack is "solid start v2, solidjs v2" — if research says that's not
viable, this ticket is where the fallback gets negotiated with them.

## Answer

User accepted the research recommendation (2026-08-19): SolidJS 2 is RC-only and no
SolidStart supports it, so the app builds on:

- `solid-js ^1.9.15` (stable), `@solidjs/start ^2.0.2`, `@solidjs/router ^1`,
  Vite 8 (not 9), Tailwind 4 via `@tailwindcss/vite`.
- Libraries carry over from the desktop app unchanged — Kobalte (stable, Solid 1),
  @tanstack/solid-form, @tanstack/solid-table, @dnd-kit/solid, lucide-solid,
  solid-icons, motion, @solid-primitives/\* — all peer on Solid 1.
- The Solid 2 migration is an explicitly deferred follow-up, gated on a
  Solid-2-compatible SolidStart release; it is bounded (official guide +
  `solid-migration-assistant` codemod; main removals: createResource, batch, on,
  produce; createEffect signature split). Avoid leaning on the removed APIs in new
  code where a v2-safe idiom exists.

## Comments

**2026-08-20 — REOPENED, answer above superseded.** During a grilling session the
user redirected the framework decision: **TanStack Start (Solid) with SolidJS v2**,
not SolidStart on Solid 1. Now blocked by the new research ticket
"TanStack Start (Solid) + SolidJS v2 viability" (issue 16). The open question
becomes: is TanStack Start + Solid 2 buildable today (peer deps, ecosystem), and if
not, which concession does the user prefer — Solid 1 under TanStack Start, or
Solid 2 with UI libraries replaced/rebuilt (Kobalte etc. still peer on Solid 1 per
issue 01)?

**2026-08-20 — RESOLVED (final).** Research (issue 16) showed TanStack Start 2 RC
does support Solid 2 RC, but the UI ecosystem (Kobalte, dnd-kit, lucide-solid,
primitives, Form/Table via prerelease semver) still requires Solid 1 — incompatible
with the settled "port the renderer" decision. The user chose concession path (a):

- **`solid-js ^1.9.15` + `@tanstack/solid-start ^1.168.46` +
  `@tanstack/solid-router ^1.170.29`** (stable line), Tailwind 4 via
  `@tailwindcss/vite`.
- Full desktop UI stack carries over: Kobalte, @tanstack/solid-form,
  @tanstack/solid-table, @dnd-kit/solid, lucide-solid, solid-icons, motion,
  @solid-primitives/\*.
- The Solid 2 + Start 2 migration is deferred until Solid 2 is stable and the
  ecosystem follows; same framework family, so it's incremental. Avoid
  Solid-2-removed APIs (createResource, batch, on, produce) in new code — the
  renderer port barely uses them (3 `on()` calls, zero createResource).
