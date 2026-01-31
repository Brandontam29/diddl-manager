import Database from "better-sqlite3";
import {
  CamelCasePlugin,
  Kysely,
  Migration,
  MigrationProvider,
  Migrator,
  ParseJSONResultsPlugin,
  SqliteDialect,
} from "kysely";
import { SerializePlugin } from "kysely-plugin-serialize";

import { type RawDatabase } from ".";
import { logging } from "../logging";
import { dbPath } from "../pathing";
import { AutoUpdatedAtPlugin } from "./auto-updated-at-plugin";
import { down as down0, up as up0 } from "./migrations/000_initial_schema";
import { down as down1, up as up1 } from "./migrations/001_seed_diddls";
import { down as down2, up as up2 } from "./migrations/002_profile";

export const initDb = () => {
  try {
    const nativeDb = new Database(dbPath());

    nativeDb.pragma("foreign_keys = ON");

    const db = new Kysely<RawDatabase>({
      dialect: new SqliteDialect({
        database: nativeDb,
      }),
      plugins: [
        new CamelCasePlugin(),
        new SerializePlugin(),
        new ParseJSONResultsPlugin(),
        new AutoUpdatedAtPlugin(),
      ],
    });

    return db;
  } catch (e) {
    logging.error(e);
    return null;
  }
};

// oxlint-disable-next-line no-explicit-any
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
  async getMigrations() {
    const migrations = {
      "000_initial_schema": {
        up: up0,
        down: down0,
      },
      "001_see_diddls": {
        up: up1,
        down: down1,
      },
      "002_profile": {
        up: up2,
        down: down2,
      },
    } as const satisfies Record<string, Migration>;

    return migrations;
  }
}
