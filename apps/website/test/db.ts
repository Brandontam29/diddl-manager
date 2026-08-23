import { randomUUID } from "node:crypto";

import { inArray } from "drizzle-orm";

import { createDb, type Db } from "@/server/db/client";
import { listItems, listSections, lists, profiles } from "@/server/db/schema";

/** A db bound to the Neon `test` branch (`test/setup.ts` guarantees the env var). */
export function createTestDb(): Db {
  return createDb(process.env.DATABASE_URL!);
}

/** Random per-file user id; rows are found (and cleaned) by this prefix only. */
export function testUserId(): string {
  return `test_${randomUUID()}`;
}

/** Deletes everything the given users own — items → lists → sections → profiles (spec §10). */
export async function cleanupUsers(db: Db, userIds: string[]) {
  await db.delete(listItems).where(inArray(listItems.userId, userIds));
  await db.delete(lists).where(inArray(lists.userId, userIds));
  await db.delete(listSections).where(inArray(listSections.userId, userIds));
  await db.delete(profiles).where(inArray(profiles.userId, userIds));
}
