import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { DIDDL_TYPES } from "../../shared/diddl-models";

export const diddlType = pgEnum("diddl_type", DIDDL_TYPES);

/** Timestamps shared by every user-owned, soft-deletable table. */
const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
};

/**
 * Catalog — global and read-only to users. Ids come from `data/catalog.json`
 * (`id = index + 1`), so there is no identity sequence.
 */
export const diddls = pgTable("diddls", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  type: diddlType("type").notNull(),
  imagePath: text("image_path").notNull(),
  imageWidth: integer("image_width"),
  imageHeight: integer("image_height"),
});

export const listSections = pgTable(
  "list_sections",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    position: integer("position").notNull(),
    isDefault: boolean("is_default").notNull().default(false),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("list_sections_user_id_name_active_idx")
      .on(table.userId, sql`lower(${table.name})`)
      .where(sql`${table.deletedAt} is null`),
  ],
);

export const lists = pgTable("lists", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id").notNull(),
  sectionId: integer("section_id")
    .notNull()
    .references(() => listSections.id),
  name: text("name").notNull(),
  color: text("color").notNull(),
  position: integer("position").notNull(),
  ...timestamps,
});

/**
 * Hard-deleted, and duplicates of the same diddl in one list are allowed
 * (desktop migration 004 parity) — hence no unique index on (list_id, diddl_id).
 */
export const listItems = pgTable("list_items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id").notNull(),
  listId: integer("list_id")
    .notNull()
    .references(() => lists.id, { onDelete: "cascade" }),
  diddlId: integer("diddl_id")
    .notNull()
    .references(() => diddls.id),
  quantity: integer("quantity").notNull().default(1),
  isDamaged: boolean("is_damaged").notNull().default(false),
  isIncomplete: boolean("is_incomplete").notNull().default(false),
});

/** Keyed by the Clerk user id. No picture column — the avatar is Clerk's `imageUrl`. */
export const profiles = pgTable("profiles", {
  userId: text("user_id").primaryKey(),
  name: text("name").notNull().default(""),
  birthdate: date("birthdate"),
  description: text("description").notNull().default(""),
  hobbies: text("hobbies").notNull().default(""),
  ...timestamps,
});

export type DiddlRow = typeof diddls.$inferSelect;
export type InsertDiddlRow = typeof diddls.$inferInsert;
export type ListSectionRow = typeof listSections.$inferSelect;
export type InsertListSectionRow = typeof listSections.$inferInsert;
export type ListRow = typeof lists.$inferSelect;
export type InsertListRow = typeof lists.$inferInsert;
export type ListItemRow = typeof listItems.$inferSelect;
export type InsertListItemRow = typeof listItems.$inferInsert;
export type ProfileRow = typeof profiles.$inferSelect;
export type InsertProfileRow = typeof profiles.$inferInsert;
