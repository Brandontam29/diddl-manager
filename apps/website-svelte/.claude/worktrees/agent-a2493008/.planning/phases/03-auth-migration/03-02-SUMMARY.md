---
phase: 03-auth-migration
plan: 02
subsystem: ui
tags: [clerk, sveltekit, landing-page, auth-shell, tailwind]
requires:
  - phase: 02-guest-list-mode
    provides: Guest list flows and layout patterns reused by the Phase 3 auth shell
provides:
  - Landing page at `/` with guest and Clerk sign-in entry points
  - Clerk appearance and redirect configuration for landing-first auth
  - Reusable `AppHeader`, `ShimmerGrid`, and `UpgradePrompt` shell components
affects: [phase-03-plan-03, phase-03-plan-04, auth-migration, landing-page]
tech-stack:
  added: []
  patterns: [Clerk modal auth from component actions, landing-page-first auth shell composition]
key-files:
  created:
    - src/lib/components/landing/FeatureCard.svelte
    - src/lib/components/landing/HeroActions.svelte
    - src/lib/components/landing/LandingHeader.svelte
    - src/lib/components/layout/AppHeader.svelte
    - src/lib/components/layout/ShimmerGrid.svelte
    - src/lib/components/layout/UpgradePrompt.svelte
  modified:
    - src/lib/stores/clerk.svelte.ts
    - src/routes/+page.svelte
    - .planning/phases/03-auth-migration/03-02-SUMMARY.md
key-decisions:
  - Clerk modal theming is driven from the app CSS variables so auth UI stays aligned with the stone palette.
  - The landing page owns the first sign-in experience while keeping guest entry one click away.
  - Clerk dashboard providers remain a manual external dependency, so Email + password and Google OAuth are documented explicitly in the summary.
patterns-established:
  - 'Landing auth actions: wrap `/` in `ClerkWrapper` and trigger Clerk modal flows from child components that consume Clerk context.'
  - 'Shared auth shell components: keep sign-in/sign-up triggers in reusable header and upgrade prompt components for later route wiring.'
requirements-completed: [AUTH-01, AUTH-02, AUTH-05]
duration: 9 min
completed: 2026-04-04
---

# Phase 3 Plan 2: Auth Shell Summary

**Landing-first Clerk auth shell with themed modal redirects, reusable header/prompt primitives, and a public `/` entry page**

## Performance

- **Duration:** 9 min
- **Started:** 2026-04-04T04:37:39Z
- **Completed:** 2026-04-04T04:46:39Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments

- Updated Clerk loading so sign-in lands in `/app`, sign-out returns to `/`, and the modal appearance maps to the app theme tokens.
- Replaced the placeholder root page with a real landing page that offers `Try as Guest` and modal `Sign In` entry points.
- Added reusable Phase 3 shell components for auth-aware app navigation, migration shimmer placeholders, and guest upgrade prompts.

## Task Commits

Each task was committed atomically:

1. **Task 1: Update Clerk configuration for Phase 3 auth behavior** - `6aebf06` (feat)
2. **Task 2: Build the landing page and shared auth UI components** - `1681ab9` (feat)

**Plan metadata:** recorded in the final docs completion commit for this plan

## Files Created/Modified

- `src/lib/stores/clerk.svelte.ts` - Clerk appearance mapping and landing-first redirect behavior
- `src/routes/+page.svelte` - Public landing page composition with hero, feature cards, and auth shell preview
- `src/lib/components/landing/LandingHeader.svelte` - Landing header with guest/app entry and authenticated user button support
- `src/lib/components/landing/HeroActions.svelte` - Clerk-aware landing CTA row for guest and sign-in actions
- `src/lib/components/landing/FeatureCard.svelte` - Reusable feature card used by the landing page
- `src/lib/components/layout/AppHeader.svelte` - Reusable auth-aware app header for later `/app` route wiring
- `src/lib/components/layout/ShimmerGrid.svelte` - Migration/loading placeholder grid for store switching
- `src/lib/components/layout/UpgradePrompt.svelte` - Inline guest upgrade prompt that opens Clerk sign-up directly

## Decisions Made

- Used `ClerkWrapper` directly on the root landing page instead of changing the root layout, which avoids disturbing the existing `/app` wrapper stack while still giving `/` access to Clerk context.
- Kept `AppHeader` reusable and separate from current route wiring so later Phase 3 plans can adopt it across `/app` routes without reworking the landing page implementation.
- Recorded Clerk provider requirements in the summary because the repo cannot enforce hosted dashboard settings.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Replaced the landing page global Clerk access shortcut with a context-backed CTA component**

- **Found during:** Task 2 (Build the landing page and shared auth UI components)
- **Issue:** Initial landing CTA wiring used a global `window.Clerk` shortcut that failed `svelte-check` type rules.
- **Fix:** Added `HeroActions.svelte` so the hero buttons run inside Clerk context and open the modal through the typed store instance.
- **Files modified:** `src/lib/components/landing/HeroActions.svelte`, `src/routes/+page.svelte`
- **Verification:** `bun run check`, targeted `bunx eslint ...`
- **Committed in:** `1681ab9` (part of Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** The fix kept the intended UX while making the landing auth actions type-safe and context-local.

## Issues Encountered

- `bun run lint` still fails on pre-existing repository issues outside this plan, including unused imports, `no-explicit-any`, missing `resolve()` usage, and other existing lint violations in catalog/list/reference files.
- `bun run check` passes for this plan's changes but still reports four existing warnings in list components unrelated to Phase 3 Plan 2.

## User Setup Required

- Clerk dashboard setup is still required outside the repo:
- Email + password must be enabled in Clerk.
- Google OAuth must be enabled in Clerk.
- Verify those providers in the Clerk dashboard before manual auth QA.

## Next Phase Readiness

- The landing page, modal auth entry points, and reusable auth shell primitives are ready for store-switching and migration orchestration in Plans 03-03 and 03-04.
- Full repository lint cannot be used as a green gate until the pre-existing ESLint issues are addressed.

## Known Stubs

None.

## Self-Check

PASSED

---

_Phase: 03-auth-migration_
_Completed: 2026-04-04_
