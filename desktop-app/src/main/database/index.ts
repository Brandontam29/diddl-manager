import { Kysely } from "kysely";

import { ListDb, ListItemDb } from "../../shared";
import { DiddlDb } from "../../shared/diddl-models";
import { initDb, migrateToLatest } from "./db";

export type RawDatabase = {
  diddl: DiddlDb;
  list: ListDb;
  listItem: ListItemDb;
};

export type MyDatabase = Kysely<RawDatabase>;

export { initDb, migrateToLatest };
