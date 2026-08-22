# Catalog images, clean script, and load script

Type: task
Status: resolved
Blocked by: 21 (closed 2026-08-22 — unblocked)

## Question

Implement spec.md §7: unzip `resources/diddl-images.zip` once into `apps/website/public/diddls/` (committed); `scripts/clean-catalog.ts` producing `apps/website/data/catalog.json` with the mechanical rules and the preserved array order (`id = index + 1`); `scripts/load-catalog.ts` upserting `diddls` over `DATABASE_URL_UNPOOLED`. Unit-test the clean rules.

Done when: `catalog.json` has 3,913 entries, every imagePath exists, no missing dimensions; `dev` and `test` branches hold 3,913 `diddls` rows; the commit lands via PR/Git integration only (never `vercel deploy`).

## Answer

Done, with one significant data finding that changed the done-when — see below.

**Images.** `apps/desktop-app/resources/diddl-images.zip` (4,055 entries, 98MB) unzipped
once into `apps/website/public/diddls/`, stripping the archive's top-level `diddl-images/`
directory so the paths in `diddls.json` resolve directly. 88 subdirectories, **3,955
files, 100MB** committed. All are `.jpg`.

**Scripts** in `apps/website/scripts/`:

- `catalog-rules.ts` — the mechanical clean rules as pure functions (`cleanDiddlName`,
  `toPosixPath`), split out so they unit-test without the filesystem.
- `catalog-rules.test.ts` — 9 tests over the rules. `vitest.config.ts`'s `include` was
  widened to `["src/**/*.test.ts", "scripts/**/*.test.ts"]` so tests under `scripts/` run.
- `clean-catalog.ts` — reads the desktop JSON + the unzipped images, writes
  `data/catalog.json` (3,913 entries, 652KB). `catalog:clean` script.
- `load-catalog.ts` — upserts `diddls` `ON CONFLICT (id) DO UPDATE` in chunks of 500 over
  `DATABASE_URL_UNPOOLED`, after asserting `id === index + 1` for every entry.
  `catalog:load` script.

**Loaded**: `dev` and `test` both hold **3,913 `diddls` rows**, ids 1–3913 contiguous, all
27 types present, 113 rows with null dimensions.

### The finding: 561 entries have no usable image

The ticket's done-when said "every imagePath exists, no missing dimensions". **Neither is
achievable**, and not because of anything this ticket did:

|                                                   | count |
| ------------------------------------------------- | ----- |
| catalog entries                                   | 3,913 |
| entries with a real, readable JPEG                | 3,352 |
| entries naming a file absent from the zip         | 550   |
| entries naming a file that was HTML, not a JPEG   | 11    |
| entries with no dimensions and no file to measure | 113   |

Checked and ruled out: it is **not** a case-sensitivity artifact of the Windows→Linux move
(0 of the 550 match any on-disk file case-insensitively) and **not** a path-separator bug.
The 11 "JPEGs" were each a ~206KB saved copy of `<title>Diddl - Offizielle Webseite</title>`
— scrape failures. They were **deleted**, since serving a 206KB HTML blob as an image is
worse than the file being absent; those 11 entries now behave like the other 550.

**This is pre-existing desktop parity, not a regression.** `diddl-images.zip` is the
desktop's only image source — `fixImages` (`src/main/diddl/router.ts`) deletes the images
directory and re-extracts the same zip, and there is no download path — so the desktop app
shows the same 561 broken images today.

**What this ticket did about it**, forced by decisions already locked rather than chosen
here: all 3,913 entries are kept with `imagePath` intact, because `id = index + 1` is
append-only ([Catalog seeding pipeline](10-catalog-seeding.md)) and
[Personal data migration plan](12-personal-data-migration.md) maps desktop ids straight
across — dropping an entry would repoint every one of the user's list items. Dimensions are
**null** where unknown and unmeasurable (the column is nullable), not fabricated as 0.
`clean-catalog.ts` therefore **reports** the missing-image count instead of failing on it;
it still hard-fails on an unknown `type`, which would break the enum on load.

The user-facing half — what the Library renders for an imageless diddl — is a real
decision and is **not** made here. It is
[Catalog entries with no image](30-missing-catalog-images.md), now blocking
[Port components/ui and the Library page](25-port-ui-and-library.md).

**Facts later tickets depend on**

- `public/diddls/` holds **603 image files no catalog entry references**, so some of the
  561 gaps may be recoverable by filename matching. That is editorial work of the kind
  ruled out of scope in [Catalog seeding pipeline](10-catalog-seeding.md); the count is
  recorded on ticket 30 so the option stays visible.
- `spec.md` §7 cites the source as `apps/desktop-app/src/main/diddl/diddls.json`; the real
  path is `apps/desktop-app/src/main/database/diddls.json`. Corrected in `spec.md`.
- `image-size@2.0.2` added as a devDependency for the dimension backfill — pure JS, no
  native build. Only 50 of the 163 dimension gaps were fillable; the other 113 have no file.
- `catalog.json` carries an explicit `id` field rather than leaving it implicit, so
  `load-catalog.ts` can assert the append-only contract instead of trusting array order.
- Re-running is safe and cheap: `catalog:clean` is deterministic, `catalog:load` upserts.
- The catalog rows are already in `dev` and `test`, so the scoping suite (issue 24) can
  reference real `diddl_id`s. `main` is still empty — issue 28 loads it at deploy time.
- This commit adds 100MB to the repo. Deploys must go through Git integration; never
  `vercel deploy` (spec §7, the 100MB CLI upload cap).
