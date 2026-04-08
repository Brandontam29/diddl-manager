import { Kysely } from "kysely";

export async function up(db: Kysely<any>) {
  await db.schema.dropIndex("idx_list_item_unique").execute();
}

export async function down(db: Kysely<any>) {
  await db.schema
    .createIndex("idx_list_item_unique")
    .on("list_item")
    .columns(["list_id", "diddl_id"])
    .unique()
    .execute();
}
