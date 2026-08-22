/**
 * The mechanical clean rules from spec §7, kept pure so they can be unit-tested
 * without the filesystem. Editorial renaming of the catalog's cryptic names is
 * out of scope — these rules are parity-or-better and nothing more.
 */

/**
 * `pani_001_sticker.jpg` → `Pani 001 sticker`.
 *
 * Strips the `.jpg` extension, turns runs of `_` and `-` into single spaces,
 * collapses whitespace, and capitalizes the first letter. Duplicate names are
 * kept as-is — a name is a caption here, not a key.
 */
export function cleanDiddlName(fileName: string): string {
  const withoutExtension = fileName.replace(/\.jpe?g$/i, "");
  const spaced = withoutExtension.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  if (spaced === "") {
    return withoutExtension.trim();
  }
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/** The desktop stores Windows-style paths; the web serves them under `VITE_IMAGE_BASE_URL`. */
export function toPosixPath(imagePath: string): string {
  return imagePath.replaceAll("\\", "/");
}
