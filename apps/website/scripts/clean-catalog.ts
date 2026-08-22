/**
 * Turns the desktop's `diddls.json` + the unzipped images into
 * `apps/website/data/catalog.json`, the web's canonical catalog source (spec §7).
 *
 * Repeatable: re-run it whenever the desktop catalog gains entries. **Array order
 * is the id contract** — `id = index + 1`, append-only forever. Edit entries in
 * place; never reorder or remove one, or every user's list items point at the
 * wrong diddl.
 *
 * 550 of the 3,913 entries name an image that is not in `diddl-images.zip` — the
 * desktop has the same gap, since the zip is its only image source. Those entries
 * are kept (dropping them would break the id contract) with their `imagePath`
 * intact and null dimensions where none could be measured.
 *
 *   bun run --filter @diddl/website catalog:clean
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { imageSize } from "image-size";

import { diddlTypeSchema } from "../src/shared/diddl-models";
import { cleanDiddlName, toPosixPath } from "./catalog-rules";

const websiteRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_JSON = join(websiteRoot, "../desktop-app/src/main/database/diddls.json");
const IMAGES_DIR = join(websiteRoot, "public/diddls");
const OUTPUT_JSON = join(websiteRoot, "data/catalog.json");

type SourceDiddl = {
  name: string;
  type: string;
  imagePath: string;
  imageWidth: number | null;
  imageHeight: number | null;
};

type CatalogDiddl = {
  id: number;
  name: string;
  type: string;
  imagePath: string;
  imageWidth: number | null;
  imageHeight: number | null;
};

const source: SourceDiddl[] = JSON.parse(readFileSync(SOURCE_JSON, "utf8"));

const unknownTypes: string[] = [];
const missingImages: string[] = [];
const unmeasurable: string[] = [];
let backfilled = 0;

const catalog: CatalogDiddl[] = source.map((entry, index) => {
  const id = index + 1;
  const imagePath = toPosixPath(entry.imagePath);
  const absolutePath = join(IMAGES_DIR, imagePath);
  const imageExists = existsSync(absolutePath);

  if (!imageExists) {
    missingImages.push(`${id}\t${imagePath}`);
  }

  if (!diddlTypeSchema.safeParse(entry.type).success) {
    unknownTypes.push(`${id}\t${entry.type}`);
  }

  let { imageWidth, imageHeight } = entry;
  if ((imageWidth == null || imageHeight == null) && imageExists) {
    const measured = imageSize(readFileSync(absolutePath));
    imageWidth = measured.width;
    imageHeight = measured.height;
    backfilled++;
  }

  if (imageWidth == null || imageHeight == null) {
    unmeasurable.push(`${id}\t${imagePath}`);
  }

  return {
    id,
    name: cleanDiddlName(entry.name),
    type: entry.type,
    imagePath,
    imageWidth: imageWidth ?? null,
    imageHeight: imageHeight ?? null,
  };
});

// An unknown type is a hard stop: it would fail the `diddl_type` enum on load,
// and it means the desktop catalog grew a type the web schema does not know.
if (unknownTypes.length > 0) {
  console.error(`unknown diddl types (id, type):\n${unknownTypes.join("\n")}`);
  process.exit(1);
}

writeFileSync(OUTPUT_JSON, `${JSON.stringify(catalog, null, 2)}\n`);

console.log(`wrote ${catalog.length} entries to data/catalog.json`);
console.log(`  ${backfilled} dimensions backfilled from the image files`);
console.log(`  ${missingImages.length} entries name an image absent from public/diddls/`);
console.log(`  ${unmeasurable.length} entries have no dimensions and no file to measure`);
