import { and, asc, eq, inArray, isNull, max, ne, sql } from "drizzle-orm";
import { z } from "zod";

import { listSectionNameSchema } from "../../shared/list-models";
import type { Db } from "../db/client";
import { type ListRow, type ListSectionRow, listSections, lists } from "../db/schema";
import { BadRequestError, ConflictError, NotFoundError } from "../errors";

export const DEFAULT_SECTION_NAME = "Unsectioned";

export type SectionWithLists = ListSectionRow & { lists: ListRow[] };

export const createSectionInput = z.object({ name: listSectionNameSchema });
export const renameSectionInput = z.object({
  sectionId: z.number().int(),
  name: listSectionNameSchema,
});
export const deleteSectionInput = z.object({ sectionId: z.number().int() });
export const reorderSectionsInput = z.object({ sectionIds: z.array(z.number().int()).min(1) });

/** Highest position among the user's active sections, `-1` when there are none. */
async function maxSectionPosition(db: Db, userId: string) {
  const [row] = await db
    .select({ max: max(listSections.position) })
    .from(listSections)
    .where(and(eq(listSections.userId, userId), isNull(listSections.deletedAt)));
  return row?.max ?? -1;
}

async function maxListPosition(db: Db, userId: string, sectionId: number) {
  const [row] = await db
    .select({ max: max(lists.position) })
    .from(lists)
    .where(and(eq(lists.userId, userId), eq(lists.sectionId, sectionId), isNull(lists.deletedAt)));
  return row?.max ?? -1;
}

/**
 * Every user owns exactly one Default Section ("Unsectioned"); it is created on
 * first contact and can be neither renamed nor deleted. Called by `getProfile`
 * (the lazy upsert, spec §5) and by anything that needs a home for lists.
 */
export async function ensureDefaultSection(db: Db, userId: string): Promise<ListSectionRow> {
  const [existing] = await db
    .select()
    .from(listSections)
    .where(
      and(
        eq(listSections.userId, userId),
        eq(listSections.isDefault, true),
        isNull(listSections.deletedAt),
      ),
    )
    .limit(1);
  if (existing) return existing;

  const position = (await maxSectionPosition(db, userId)) + 1;
  const [created] = await db
    .insert(listSections)
    .values({ userId, name: DEFAULT_SECTION_NAME, position, isDefault: true })
    .returning();
  if (!created) throw new Error("Failed to create the default section");
  return created;
}

async function assertSectionNameFree(db: Db, userId: string, name: string, excludeId?: number) {
  const [clash] = await db
    .select({ id: listSections.id })
    .from(listSections)
    .where(
      and(
        eq(listSections.userId, userId),
        isNull(listSections.deletedAt),
        sql`lower(${listSections.name}) = ${name.toLowerCase()}`,
        excludeId === undefined ? undefined : ne(listSections.id, excludeId),
      ),
    )
    .limit(1);
  if (clash) throw new ConflictError("A section with this name already exists.");
}

async function findActiveSection(db: Db, userId: string, sectionId: number) {
  const [section] = await db
    .select()
    .from(listSections)
    .where(
      and(
        eq(listSections.id, sectionId),
        eq(listSections.userId, userId),
        isNull(listSections.deletedAt),
      ),
    )
    .limit(1);
  if (!section) throw new NotFoundError("Section not found");
  return section;
}

/**
 * The sidebar's data in one shape: every active section with its active lists
 * nested, in display order. Two queries, one round-trip shape (spec §5).
 */
export async function getSectionsWithLists(db: Db, userId: string): Promise<SectionWithLists[]> {
  await ensureDefaultSection(db, userId);

  const [sections, userLists] = await db.batch([
    db
      .select()
      .from(listSections)
      .where(and(eq(listSections.userId, userId), isNull(listSections.deletedAt)))
      .orderBy(asc(listSections.position), asc(listSections.id)),
    db
      .select()
      .from(lists)
      .where(and(eq(lists.userId, userId), isNull(lists.deletedAt)))
      .orderBy(asc(lists.sectionId), asc(lists.position), asc(lists.updatedAt)),
  ]);

  return sections.map((section) => ({
    ...section,
    lists: userLists.filter((list) => list.sectionId === section.id),
  }));
}

export async function createSection(
  db: Db,
  userId: string,
  input: z.infer<typeof createSectionInput>,
): Promise<ListSectionRow> {
  await assertSectionNameFree(db, userId, input.name);
  const position = (await maxSectionPosition(db, userId)) + 1;
  const [created] = await db
    .insert(listSections)
    .values({ userId, name: input.name, position, isDefault: false })
    .returning();
  if (!created) throw new Error("Failed to create the section");
  return created;
}

export async function renameSection(
  db: Db,
  userId: string,
  input: z.infer<typeof renameSectionInput>,
): Promise<ListSectionRow> {
  const section = await findActiveSection(db, userId, input.sectionId);
  if (section.isDefault) throw new BadRequestError("The default section cannot be renamed.");
  await assertSectionNameFree(db, userId, input.name, input.sectionId);

  const [updated] = await db
    .update(listSections)
    .set({ name: input.name })
    .where(and(eq(listSections.id, input.sectionId), eq(listSections.userId, userId)))
    .returning();
  if (!updated) throw new NotFoundError("Section not found");
  return updated;
}

/**
 * Soft-deletes the section, moves its active lists to the end of the Default
 * Section, and renumbers the remaining sections 0..n (desktop parity).
 */
export async function deleteSection(
  db: Db,
  userId: string,
  input: z.infer<typeof deleteSectionInput>,
): Promise<{ movedListCount: number }> {
  const section = await findActiveSection(db, userId, input.sectionId);
  if (section.isDefault) throw new BadRequestError("The default section cannot be deleted.");

  const defaultSection = await ensureDefaultSection(db, userId);
  const movedLists = await db
    .select({ id: lists.id })
    .from(lists)
    .where(and(eq(lists.userId, userId), eq(lists.sectionId, section.id), isNull(lists.deletedAt)))
    .orderBy(asc(lists.position), asc(lists.updatedAt));
  const firstPosition = (await maxListPosition(db, userId, defaultSection.id)) + 1;

  const remaining = await db
    .select({ id: listSections.id })
    .from(listSections)
    .where(
      and(
        eq(listSections.userId, userId),
        isNull(listSections.deletedAt),
        ne(listSections.id, section.id),
      ),
    )
    .orderBy(asc(listSections.position), asc(listSections.id));

  await db.batch([
    db
      .update(listSections)
      .set({ deletedAt: new Date() })
      .where(and(eq(listSections.id, section.id), eq(listSections.userId, userId))),
    ...movedLists.map((list, offset) =>
      db
        .update(lists)
        .set({ sectionId: defaultSection.id, position: firstPosition + offset })
        .where(and(eq(lists.id, list.id), eq(lists.userId, userId))),
    ),
    ...remaining.map((row, position) =>
      db
        .update(listSections)
        .set({ position })
        .where(and(eq(listSections.id, row.id), eq(listSections.userId, userId))),
    ),
  ]);

  return { movedListCount: movedLists.length };
}

/** `sectionIds` must be exactly the user's active sections, in the new order. */
export async function reorderSections(
  db: Db,
  userId: string,
  input: z.infer<typeof reorderSectionsInput>,
): Promise<{ updatedCount: number }> {
  const active = await db
    .select({ id: listSections.id })
    .from(listSections)
    .where(and(eq(listSections.userId, userId), isNull(listSections.deletedAt)));

  const activeIds = new Set(active.map((row) => row.id));
  const requestedIds = new Set(input.sectionIds);
  if (
    requestedIds.size !== input.sectionIds.length ||
    activeIds.size !== requestedIds.size ||
    input.sectionIds.some((id) => !activeIds.has(id))
  ) {
    throw new BadRequestError("Section order must include every active section exactly once.");
  }

  const [first, ...rest] = input.sectionIds.map((sectionId, position) =>
    db
      .update(listSections)
      .set({ position })
      .where(and(eq(listSections.id, sectionId), eq(listSections.userId, userId))),
  );
  if (!first) return { updatedCount: 0 };
  await db.batch([first, ...rest]);
  return { updatedCount: input.sectionIds.length };
}

/** Exposed for the lists handlers, which share the same ownership rule. */
export { findActiveSection, maxListPosition };
export const activeSectionIdsOf = (db: Db, userId: string, ids: number[]) =>
  db
    .select({ id: listSections.id })
    .from(listSections)
    .where(
      and(
        eq(listSections.userId, userId),
        isNull(listSections.deletedAt),
        inArray(listSections.id, ids),
      ),
    );
