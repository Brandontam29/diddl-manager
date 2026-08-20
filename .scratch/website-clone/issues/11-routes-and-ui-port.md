# Route map & UI port plan

Type: grilling
Status: open
Blocked by: 05

## Question

(2026-08-20: framework redirected to TanStack Start (Solid) — the route tree below
is TanStack Router file routes; specifics come from issue 05 once issue 16 lands.)

Plan the web route tree and the port of the desktop renderer
(`apps/desktop-app/src/renderer/src/`). Decide:

- Routes: library/catalog browse, lists index, list detail, profile, sign-in/up,
  landing — mapped from the desktop's @solidjs/router pages; which are SSR'd vs
  client-heavy (drag-and-drop list editing).
- Which of `components/ui` and `features/*` port as-is, which need SSR-safe rewrites
  (intersection-observer virtualization of the 2,800-image grid, media queries,
  canvas-confetti, motion animations), and what replaces desktop-only chrome
  (custom taskbars/window controls → normal web header/nav).
- How client state (`createDiddlStore`, selected indices, ui-state) maps to web:
  URL state vs stores.
- Versions and any library substitutions come from "Lock framework versions"
  (issue 05).

Consider a /prototype spike if the grid or list-editing interaction feels uncertain —
that would spawn as a new prototype ticket, not extend this one.
