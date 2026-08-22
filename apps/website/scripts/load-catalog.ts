/**
 * Upserts `data/catalog.json` into the `diddls` table (spec §7). Re-runnable:
 * `ON CONFLICT (id) DO UPDATE`, so a catalog correction is just a re-run.
 *
 * Runs over the direct (unpooled) connection string, like every other script that
 * touches the database from a dev machine or CI.
 *
 *   DATABASE_URL_UNPOOLED='<direct string>' bun run --filter @diddl/website catalog:load
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { sql } from "drizzle-orm";

import { createDb } from "../src/server/db/client";
import { diddls, type InsertDiddlRow } from "../src/server/db/schema";
import { diddlSchema } from "../src/shared/diddl-models";

const CHUNK_SIZE = 500;

const connectionString = process.env.DATABASE_URL_UNPOOLED;
if (!connectionString) {
  throw new Error("DATABASE_URL_UNPOOLED is not set");
}

const catalogPath = join(dirname(fileURLToPath(import.meta.url)), "../data/catalog.json");
const catalog = diddlSchema.array().parse(JSON.parse(readFileSync(catalogPath, "utf8")));

// The append-only id contract, checked rather than assumed: a reorder would
// silently repoint every user's list items at the wrong diddl.
catalog.forEach((diddl, index) => {
  if (diddl.id !== index + 1) {
    throw new Error(`catalog.json is out of order: entry ${index} has id ${diddl.id}`);
  }
});

const db = createDb(connectionString);

const rows: InsertDiddlRow[] = catalog.map((diddl) => ({
  id: diddl.id,
  name: diddl.name,
  type: diddl.type,
  imagePath: diddl.imagePath,
  imageWidth: diddl.imageWidth ?? null,
  imageHeight: diddl.imageHeight ?? null,
}));

for (let start = 0; start < rows.length; start += CHUNK_SIZE) {
  const chunk = rows.slice(start, start + CHUNK_SIZE);
  await db
    .insert(diddls)
    .values(chunk)
    .onConflictDoUpdate({
      target: diddls.id,
      set: {
        name: sql`excluded.name`,
        type: sql`excluded.type`,
        imagePath: sql`excluded.image_path`,
        imageWidth: sql`excluded.image_width`,
        imageHeight: sql`excluded.image_height`,
      },
    });
  console.log(`upserted ${Math.min(start + CHUNK_SIZE, rows.length)}/${rows.length}`);
}

const counted = await db.select({ count: sql<number>`count(*)::int` }).from(diddls);
console.log(`diddls now holds ${counted[0]?.count ?? 0} rows`);
