/**
 * One-off migration of a user's desktop data into their web account (spec §8).
 * Reads the desktop `db.sqlite3` read-only, validates everything up front, and
 * writes sections → lists → items in a single Postgres transaction, so a failure
 * anywhere leaves the account untouched.
 *
 *   DATABASE_URL_UNPOOLED='<direct string>' \
 *     bun run --filter @diddl/website import:desktop -- --db ./db.sqlite3 --user user_xxx [--dry-run]
 *
 * Uses `drizzle-orm/neon-serverless` (WebSocket) rather than the app's neon-http
 * client because HTTP has no interactive transactions. Bun ships a global
 * `WebSocket`, so no `ws` shim is needed.
 */
import { Database } from "bun:sqlite";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";

import { Pool } from "@neondatabase/serverless";
import { and, eq, isNull, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-serverless";

import type { Db } from "../src/server/db/client";
import * as schema from "../src/server/db/schema";
import { listItems, lists, listSections } from "../src/server/db/schema";
import { ensureDefaultSection } from "../src/server/handlers/sections";
import { diddlSchema } from "../src/shared/diddl-models";
import {
  buildImportPlan,
  DEFAULT_SECTION,
  type ImportPlan,
  readDesktopSnapshot,
} from "./import-desktop-rules";

const ITEM_CHUNK_SIZE = 500;

const { values: args } = parseArgs({
  options: {
    db: { type: "string" },
    user: { type: "string" },
    "dry-run": { type: "boolean", default: false },
  },
  strict: true,
});

if (!args.db || !args.user) {
  console.error(
    "usage: bun run scripts/import-desktop.ts --db <path> --user <clerk_user_id> [--dry-run]",
  );
  process.exit(2);
}
const dbPath = args.db;
const userId = args.user;
const dryRun = args["dry-run"];

const connectionString = process.env.DATABASE_URL_UNPOOLED;
if (!connectionString) {
  throw new Error("DATABASE_URL_UNPOOLED is not set");
}

// 1. Desktop side: read, normalize, validate — all before touching Postgres.
const catalogPath = join(dirname(fileURLToPath(import.meta.url)), "../data/catalog.json");
const catalog = diddlSchema.array().parse(JSON.parse(readFileSync(catalogPath, "utf8")));
const catalogImages = new Map(catalog.map((diddl) => [diddl.id, diddl.imagePath]));

const sqlite = new Database(dbPath, { readonly: true });
const snapshot = readDesktopSnapshot(sqlite);
sqlite.close();
console.log(
  `desktop: ${snapshot.sections.length} sections, ${snapshot.lists.length} lists, ${snapshot.items.length} items, ${snapshot.diddls.length} diddls`,
);

const plan = buildImportPlan(snapshot, catalogImages);
printPlan(plan);

// 2. Web side: the account must be empty (spec §8 preflight).
const pool = new Pool({ connectionString });
const db = drizzle(pool, { schema, casing: "snake_case" });

try {
  const violations = [...plan.violations, ...(await preflight())];
  if (violations.length > 0) {
    console.error(`\n${violations.length} violation(s) — nothing written:`);
    for (const violation of violations) console.error(`  - ${violation}`);
    process.exit(1);
  }

  if (dryRun) {
    console.log("\ndry run: no rows written");
    printSummary(plan);
    process.exit(0);
  }

  // 3. One transaction: sections, then lists (ids remapped), then items.
  await db.transaction(async (tx) => {
    // Same query builder as neon-http for the plain select/insert the helper uses;
    // the two drivers differ only in batch/transaction support.
    const defaultSection = await ensureDefaultSection(tx as unknown as Db, userId);

    const sectionIds = new Map<number | typeof DEFAULT_SECTION, number>([
      [DEFAULT_SECTION, defaultSection.id],
    ]);
    for (const section of plan.sections) {
      const [inserted] = await tx
        .insert(listSections)
        .values({
          userId,
          name: section.name,
          position: section.position,
          isDefault: false,
          createdAt: section.createdAt,
          updatedAt: section.updatedAt,
        })
        .returning({ id: listSections.id });
      if (!inserted) throw new Error(`failed to insert section ${section.desktopId}`);
      sectionIds.set(section.desktopId, inserted.id);
    }

    const listIds = new Map<number, number>();
    for (const list of plan.lists) {
      const sectionId = sectionIds.get(list.section);
      if (sectionId === undefined) {
        throw new Error(
          `list ${list.desktopId} points at unmapped section ${String(list.section)}`,
        );
      }
      const [inserted] = await tx
        .insert(lists)
        .values({
          userId,
          sectionId,
          name: list.name,
          color: list.color,
          position: list.position,
          createdAt: list.createdAt,
          updatedAt: list.updatedAt,
        })
        .returning({ id: lists.id });
      if (!inserted) throw new Error(`failed to insert list ${list.desktopId}`);
      listIds.set(list.desktopId, inserted.id);
    }

    const itemRows = plan.items.map((item) => {
      const listId = listIds.get(item.desktopListId);
      if (listId === undefined) {
        throw new Error(`item points at unmapped list ${item.desktopListId}`);
      }
      return {
        userId,
        listId,
        diddlId: item.diddlId,
        quantity: item.quantity,
        isDamaged: item.isDamaged,
        isIncomplete: item.isIncomplete,
      };
    });
    for (let start = 0; start < itemRows.length; start += ITEM_CHUNK_SIZE) {
      await tx.insert(listItems).values(itemRows.slice(start, start + ITEM_CHUNK_SIZE));
    }
  });

  console.log("\nimport committed");
  printSummary(plan);
  await printAccountCounts();
} finally {
  await pool.end();
}

async function preflight(): Promise<string[]> {
  const [[existingLists], [existingSections]] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(lists)
      .where(eq(lists.userId, userId)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(listSections)
      .where(and(eq(listSections.userId, userId), eq(listSections.isDefault, false))),
  ]);
  const problems: string[] = [];
  if ((existingLists?.count ?? 0) > 0) {
    problems.push(`preflight: account ${userId} already has ${existingLists?.count} list(s)`);
  }
  if ((existingSections?.count ?? 0) > 0) {
    problems.push(
      `preflight: account ${userId} already has ${existingSections?.count} non-default section(s)`,
    );
  }
  return problems;
}

function printPlan(p: ImportPlan) {
  console.log(
    `skipped (soft-deleted or orphaned): ${p.skipped.sections} sections, ${p.skipped.lists} lists, ${p.skipped.items} items`,
  );
  if (p.remappedListIds.length > 0) {
    console.log(
      `lists moved to the Default Section (null/deleted/missing desktop section): ${p.remappedListIds.join(", ")}`,
    );
  }
}

function printSummary(p: ImportPlan) {
  console.log(
    `${dryRun ? "would import" : "imported"}: ${p.sections.length} sections (+ Default Section reused), ${p.lists.length} lists, ${p.items.length} items`,
  );
}

async function printAccountCounts() {
  const [sections, userLists, items] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(listSections)
      .where(and(eq(listSections.userId, userId), isNull(listSections.deletedAt))),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(lists)
      .where(and(eq(lists.userId, userId), isNull(lists.deletedAt))),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(listItems)
      .where(eq(listItems.userId, userId)),
  ]);
  console.log(
    `account now holds ${sections[0]?.count ?? 0} sections, ${userLists[0]?.count ?? 0} lists, ${items[0]?.count ?? 0} items`,
  );
}
