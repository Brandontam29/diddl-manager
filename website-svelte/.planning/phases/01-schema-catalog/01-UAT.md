---
status: testing
phase: 01-schema-catalog
source: 01-01-SUMMARY.md, 01-02-SUMMARY.md, 01-03-SUMMARY.md, 01-04-SUMMARY.md, 01-05-SUMMARY.md
started: 2026-04-03T03:00:00Z
updated: 2026-04-03T03:00:00Z
---

## Current Test

number: 1
name: Cold Start Smoke Test
expected: |
Kill any running dev server. Start fresh with `bun run dev`. The app boots without errors. Navigate to `/app/catalog` — the page loads without crashing (may be empty if not seeded yet).
awaiting: user response

## Tests

### 1. Cold Start Smoke Test

expected: Kill any running dev server. Start fresh with `bun run dev`. The app boots without errors. Navigate to `/app/catalog` — the page loads without crashing (may be empty if not seeded yet).
result: [pending]

### 2. Catalog Seed Endpoint

expected: POST to `/app/catalog/seed` with the correct SEED_SECRET header triggers seeding. Items from `catalog.json` are chunked and written to Convex. No errors returned.
result: [pending]

### 3. Sidebar Shows Diddl Types

expected: After seeding, the catalog sidebar lists all Diddl product types. Each type shows a name and item count. Clicking a type filters the catalog view.
result: [pending]

### 4. Catalog Grid Displays Items

expected: When a type is selected, the main area shows a responsive grid of catalog item cards. Each card displays the item number and name. The grid adapts to different screen widths.
result: [pending]

### 5. Pagination by Number Range

expected: Sidebar shows number ranges (groups of 100) under each type. Clicking a range updates the URL query params (`type`, `from`, `to`) and the grid shows only items in that range.
result: [pending]

### 6. Lazy Image Loading

expected: Catalog item images only load when scrolled into view. Scrolling down the grid triggers image loading for newly visible cards (check network tab or observe loading behavior).
result: [pending]

### 7. Loading and Error States

expected: While catalog data is loading, a loading indicator is shown. If a query fails, an error state is displayed instead of a blank page.
result: [pending]

## Summary

total: 7
passed: 0
issues: 0
pending: 7
skipped: 0
blocked: 0

## Gaps

[none yet]
