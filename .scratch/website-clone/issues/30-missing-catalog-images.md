# Catalog entries with no image

Type: grilling
Status: open
Blocked by: — (none; frontier)

## Question

Surfaced by [Catalog images, clean script, and load script](22-catalog-images-and-seed.md):
**561 of the 3,913 catalog entries (14%) have no usable image.** 550 name a file that is
simply not in `diddl-images.zip`, and 11 named a file that turned out to be a saved copy
of the Diddl homepage rather than a JPEG (those 11 were deleted). 113 of the 561 also have
no stored dimensions, so they are `null` in the DB.

This is **not a regression** — `diddl-images.zip` is the desktop's only image source
(`fixImages` just deletes and re-extracts the same zip), so the desktop shows the same
561 broken images today. Dropping the entries was never an option: `id = index + 1` is
append-only and the personal-data import (issue 29) maps desktop ids straight across.

Separately, `public/diddls/` holds **603 image files that no catalog entry references** —
so some of the 561 may exist under a different filename. Matching them up is editorial
work of the kind ruled out of scope in
[Catalog seeding pipeline](10-catalog-seeding.md), but the count is worth knowing.

Decide:

- What the Library and List views render for a diddl whose image is missing — a
  placeholder tile, the name alone, or the browser's broken-image default (desktop parity).
  This shapes the card component in [Port components/ui and the Library page](25-port-ui-and-library.md).
- Whether missing-image entries should be filterable or hidden in the Library, or always
  shown — they are real collectibles the user may own, so hiding them has a cost.
- Whether a `null` dimension needs a layout fallback (the desktop card sizes from
  `imageWidth`/`imageHeight`), or whether CSS aspect-ratio handles it.
- Whether recovering images from the 603 unreferenced files is worth its own later effort,
  or stays out of scope for good.
