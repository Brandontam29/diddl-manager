import { asc } from "drizzle-orm";

import type { Db } from "../db/client";
import { diddls } from "../db/schema";

/**
 * The whole Catalog (3,913 rows, no pagination — desktop parity, spec §5). Global
 * and read-only, so it is the one handler with no `userId`; the server-function
 * wrapper still sits behind auth because only the app ever asks for it.
 */
export async function getCatalog(db: Db) {
  return db.select().from(diddls).orderBy(asc(diddls.id));
}
