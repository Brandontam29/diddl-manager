import { Kysely, sql } from "kysely";

const DEFAULT_SECTION_NAME = "Unsectioned";

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable("list_section")
    .ifNotExists()
    .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("position", "integer", (col) => col.notNull())
    .addColumn("is_default", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("created_at", "text", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updated_at", "text", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("deleted_at", "text", (col) => col.defaultTo(null))
    .execute();

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_list_section_name_active
    ON list_section (lower(name))
    WHERE deleted_at IS NULL
  `.execute(db);

  const now = new Date().toISOString();
  const defaultSection = await db
    .insertInto("listSection")
    .values({
      name: DEFAULT_SECTION_NAME,
      position: 0,
      isDefault: true,
      createdAt: now,
      updatedAt: now,
    })
    .onConflict((oc) => oc.doNothing())
    .returning(["id"])
    .executeTakeFirst();

  const section =
    defaultSection ??
    (await db
      .selectFrom("listSection")
      .select(["id"])
      .where("isDefault", "=", true)
      .where("deletedAt", "is", null)
      .executeTakeFirstOrThrow());

  await db.schema
    .alterTable("list")
    .addColumn("section_id", "integer", (col) => col.references("list_section.id"))
    .execute();

  await db.schema
    .alterTable("list")
    .addColumn("position", "integer", (col) => col.notNull().defaultTo(0))
    .execute();

  const lists = await db
    .selectFrom("list")
    .select(["id"])
    .where("deletedAt", "is", null)
    .orderBy("updatedAt", "asc")
    .execute();

  for (const [position, list] of lists.entries()) {
    await db
      .updateTable("list")
      .set({ sectionId: section.id, position })
      .where("id", "=", list.id)
      .execute();
  }
}

export async function down(db: Kysely<any>) {
  await sql`DROP INDEX IF EXISTS idx_list_section_name_active`.execute(db);
  await db.schema.alterTable("list").dropColumn("section_id").execute();
  await db.schema.alterTable("list").dropColumn("position").execute();
  await db.schema.dropTable("list_section").ifExists().execute();
}
