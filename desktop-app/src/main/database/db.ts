import Database from "better-sqlite3";
import {
  Kysely,
  SqliteDialect,
  Migrator,
  MigrationProvider,
  Migration,
  CamelCasePlugin,
} from "kysely";

import { up as up0, down as down0 } from "./migrations/000_initial_schema";
import { up as up1, down as down1 } from "./migrations/001_seed_diddls";
import { dbPath } from "../pathing";
import { type RawDatabase } from ".";
import { SerializePlugin } from "kysely-plugin-serialize";
import { logging } from "../logging";

export const initDb = async () => {
  try {
    const nativeDb = new Database(dbPath());

    nativeDb.pragma("foreign_keys = ON");

    const db = new Kysely<RawDatabase>({
      dialect: new SqliteDialect({
        database: nativeDb,
      }),
      plugins: [new CamelCasePlugin(), new SerializePlugin()],
    });

    return db;
  } catch (e) {
    logging.error(e);
    return null;
  }
};

export const migrateToLatest = async (db: Kysely<any>) => {
  const migrator = new Migrator({
    db,
    provider: new MyStaticMigrationProvider(),
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === "Success") {
      console.log(`migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === "Error") {
      console.error(`failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error("failed to migrate");
    console.error(error);
    process.exit(1);
  }
};

class MyStaticMigrationProvider implements MigrationProvider {
  async getMigrations(): Promise<Record<string, Migration>> {
    return {
      "000_initial_schema": {
        up: up0,
        down: down0,
      },
      "001_see_diddls": {
        up: up1,
        down: down1,
      },
    };
  }
}
