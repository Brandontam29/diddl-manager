import { Kysely } from "kysely";

export async function up(db: Kysely<any>) {
  await db.schema
    .alterTable("list")
    .addColumn("color", "text", (col) => col.defaultTo("oklch(77.2% 0.142 5.8)"))
    .execute();

  await db
    .updateTable("list")
    .set({ color: "oklch(77.2% 0.142 5.8)" })
    .where("color", "is", null)
    .execute();
}

export async function down(db: Kysely<any>) {
  await db.schema.alterTable("list").dropColumn("color").execute();
}
