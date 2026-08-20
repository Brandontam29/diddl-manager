# Catalog seeding pipeline

Type: grilling
Status: resolved
Blocked by: 07, 08

## Question

Decide the one-time (re-runnable) pipeline that turns
`apps/desktop-app/src/main/diddl/diddls.json` + `resources/diddl-images.zip` into the
seeded Neon catalog and hosted images:

- Where the script lives (`apps/website` seed script vs `apps/data-migrations`, which
  already exists for such jobs) and how it runs (locally against the Neon connection
  string).
- Id stability: keep the desktop's diddl ids so personal-data migration (issue 12)
  can map list items across.
- Image step per "Choose image hosting" (issue 07): unpack, optionally
  resize/re-encode, upload/commit, and record dimensions (imageWidth/Height) needed
  by the UI.
- Idempotency/upsert behavior for future catalog corrections.

## Answer

**2026-08-20 — resolved.** Data facts that shaped it: `diddls.json` has **3,913**
entries (not ~2,800) with **no id field** (desktop ids are SQLite insertion order);
every name is an image filename ending `.jpg` (569 duplicates, mix of descriptive
German and opaque codes like `Msk5.jpg`); paths are Windows-style across 83
subdirs; 163 entries lack dimensions; 12 share an image path (legitimate).

The pipeline is **clean → load**, two scripts in `apps/website/scripts/`, per the
user's direction to clean the data and naming before it becomes catalog rows:

1. **Clean** (repeatable): reads the desktop's `diddls.json` (left untouched —
   desktop scope stays frozen) + the unzipped images; writes
   `apps/website/data/catalog.json`, the web's canonical catalog source.
   Mechanical rules only: strip `.jpg` extension; `_`/`-` runs → spaces; collapse
   whitespace; capitalize first letter; forward-slash `imagePath` and verify each
   file exists; backfill the 163 missing dimensions by reading the images; keep
   duplicate names (captions, not keys) and `type` as-is. **Array order is
   preserved** — the id contract is `id = index + 1`, append-only forever (edits in
   place, never reorder/remove), which keeps desktop→web id mapping intact for the
   personal-data migration.
2. **Load** (re-runnable): bun script against the unpooled `DATABASE_URL`; upserts
   rows `ON CONFLICT (id) DO UPDATE`. Images: one-time unzip of
   `diddl-images.zip` into `apps/website/public/diddls/` preserving the subdir
   structure, committed to git (per "Choose image hosting").

Deep renaming of cryptic catalog names (3,913 editorial decisions, human or
AI-assisted) is ruled **out of scope** — mechanical cleaning is parity-or-better,
and the append-only contract lets curation land later as a plain catalog update.
