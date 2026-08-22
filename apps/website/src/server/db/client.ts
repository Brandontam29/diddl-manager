import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

export type Db = ReturnType<typeof createDb>;

/**
 * Neon over HTTP — one round trip per query, no connection pooling to manage,
 * which is what the serverless runtime on Vercel wants (spec §9).
 *
 * Handlers take `(db, userId, input)` so tests can pass a db bound to the Neon
 * `test` branch; `getDb()` is the runtime's lazily-created singleton.
 */
export function createDb(connectionString: string) {
  return drizzle(neon(connectionString), { schema, casing: "snake_case" });
}

let db: Db | undefined;

export function getDb(): Db {
  if (!db) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set");
    }
    db = createDb(connectionString);
  }
  return db;
}
