import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable("diddl")
    .ifNotExists()
    .addColumn("id", "integer", (col) => col.primaryKey())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("type", "text", (col) => col.notNull())
    .addColumn("image_path", "text")
    .addColumn("image_width", "integer")
    .addColumn("image_height", "integer")
    .execute();

  await db.schema
    .createTable("list")
    .ifNotExists()
    .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
    .addColumn("name", "text", (col) => col.notNull())

    .addColumn("created_at", "text", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("last_modified_at", "text", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("deleted_at", "text", (col) => col.defaultTo(null))
    .execute();

  await db.schema
    .createTable("list_item")
    .ifNotExists()
    .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
    .addColumn("list_id", "integer", (col) =>
      col.notNull().references("list.id").onDelete("cascade"),
    )
    .addColumn("diddl_id", "integer", (col) => col.notNull().references("diddl.id"))

    .addColumn("quantity", "integer", (col) => col.defaultTo(1))
    .addColumn("is_damaged", "boolean", (col) => col.defaultTo(false))
    .addColumn("is_incomplete", "boolean", (col) => col.defaultTo(false))
    .execute();

  await db.schema
    .createIndex("idx_list_item_unique")
    .on("list_item")
    .columns(["list_id", "diddl_id"])
    .unique()
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("diddl").execute();
  await db.schema.dropTable("list").execute();
  await db.schema.dropTable("list_item").execute();

  await db.schema.dropIndex("idx_list_item_unique").execute();
}
