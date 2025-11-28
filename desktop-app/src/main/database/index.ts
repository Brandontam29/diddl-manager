import { Kysely } from "kysely";
import { DiddlDb } from "../../shared/diddl-models";
import { initDb, migrateToLatest } from "./db";
import { ListDb, ListItemDb } from "../../shared";

export type RawDatabase = {
  diddl: DiddlDb;
  list: ListDb;
  listItem: ListItemDb;
};

export type MyDatabase = Kysely<RawDatabase>;

export { initDb, migrateToLatest };
