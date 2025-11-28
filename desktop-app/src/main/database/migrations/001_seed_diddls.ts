import { Kysely } from "kysely";
import diddls from "../diddls.json";

export async function up(db: Kysely<any>) {
  await db
    .insertInto("diddl")
    .values(
      diddls.map((diddl) => ({ ...diddl, imagePath: `app://diddl-images/${diddl.imagePath}` })),
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("diddl").execute();
  await db.schema
    .createTable("diddl")
    .ifNotExists()
    .addColumn("id", "integer", (col) => col.primaryKey())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("type", "text")
    .addColumn("image_path", "text")
    .addColumn("image_width", "integer", (col) => col.notNull())
    .addColumn("image_height", "integer", (col) => col.notNull())
    .execute();
}
