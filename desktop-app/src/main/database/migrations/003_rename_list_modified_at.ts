import { Kysely } from "kysely";

export async function up(db: Kysely<any>) {
  await db.schema.alterTable("list").renameColumn("last_modified_at", "updated_at").execute();
}

export async function down(db: Kysely<any>) {
  await db.schema.alterTable("list").renameColumn("updated_at", "last_modified_at").execute();
}
