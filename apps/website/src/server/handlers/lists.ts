import { and, eq, inArray, isNull } from "drizzle-orm";
import { z } from "zod";

import { listNameSchema } from "../../shared/list-models";
import type { Db } from "../db/client";
import { type ListRow, listItems, lists } from "../db/schema";
import { BadRequestError, NotFoundError } from "../errors";
import { activeSectionIdsOf, ensureDefaultSection, maxListPosition } from "./sections";

/** Desktop palette; a new list takes the first colour no active list uses yet. */
export const LIST_COLORS = [
  "oklch(77.2% 0.142 5.8)",
  "oklch(82.7% 0.125 65.4)",
  "oklch(91.2% 0.187 101.3)",
  "oklch(86.3% 0.190 123.6)",
  "oklch(82.9% 0.123 160.8)",
  "oklch(80.3% 0.106 203.4)",
  "oklch(76.4% 0.131 260.4)",
  "oklch(74.3% 0.193 287.2)",
  "oklch(77.7% 0.204 305.7)",
  "oklch(78.2% 0.201 333.8)",
] as const;

export const createListInput = z.object({
  name: listNameSchema,
  diddlIds: z.array(z.number().int()).default([]),
});
export const deleteListInput = z.object({ listId: z.number().int() });
export const renameListInput = z.object({ listId: z.number().int(), name: listNameSchema });
export const updateListColorInput = z.object({
  listId: z.number().int(),
  color: z.string().min(1),
});
export const reorderListsInput = z.object({
  sections: z
    .array(z.object({ sectionId: z.number().int(), listIds: z.array(z.number().int()) }))
    .min(1),
});

/** The user's active list with this id, or NOT_FOUND — ownership and existence are one check. */
export async function findActiveList(db: Db, userId: string, listId: number): Promise<ListRow> {
  const [list] = await db
    .select()
    .from(lists)
    .where(and(eq(lists.id, listId), eq(lists.userId, userId), isNull(lists.deletedAt)))
    .limit(1);
  if (!list) throw new NotFoundError("List not found");
  return list;
}

/** New lists land at the end of the Default Section, optionally pre-filled with diddls (quantity 1). */
export async function createList(
  db: Db,
  userId: string,
  input: z.infer<typeof createListInput>,
): Promise<ListRow> {
  const existing = await db
    .select({ color: lists.color })
    .from(lists)
    .where(and(eq(lists.userId, userId), isNull(lists.deletedAt)));
  const usedColors = new Set(existing.map((row) => row.color));
  const color = LIST_COLORS.find((candidate) => !usedColors.has(candidate)) ?? LIST_COLORS[0];

  const defaultSection = await ensureDefaultSection(db, userId);
  const position = (await maxListPosition(db, userId, defaultSection.id)) + 1;

  const [created] = await db
    .insert(lists)
    .values({ userId, name: input.name, color, sectionId: defaultSection.id, position })
    .returning();
  if (!created) throw new Error("Failed to create the list");

  if (input.diddlIds.length > 0) {
    await db
      .insert(listItems)
      .values(input.diddlIds.map((diddlId) => ({ userId, listId: created.id, diddlId })));
  }
  return created;
}

/** Soft delete; items stay attached (parity — a deleted list keeps its rows). */
export async function deleteList(
  db: Db,
  userId: string,
  input: z.infer<typeof deleteListInput>,
): Promise<ListRow> {
  const [deleted] = await db
    .update(lists)
    .set({ deletedAt: new Date() })
    .where(and(eq(lists.id, input.listId), eq(lists.userId, userId), isNull(lists.deletedAt)))
    .returning();
  if (!deleted) throw new NotFoundError("List not found");
  return deleted;
}

/** List names are not unique (spec §3), so only the zod rules apply. */
export async function renameList(
  db: Db,
  userId: string,
  input: z.infer<typeof renameListInput>,
): Promise<ListRow> {
  const [updated] = await db
    .update(lists)
    .set({ name: input.name })
    .where(and(eq(lists.id, input.listId), eq(lists.userId, userId), isNull(lists.deletedAt)))
    .returning();
  if (!updated) throw new NotFoundError("List not found");
  return updated;
}

export async function updateListColor(
  db: Db,
  userId: string,
  input: z.infer<typeof updateListColorInput>,
): Promise<ListRow> {
  const [updated] = await db
    .update(lists)
    .set({ color: input.color })
    .where(and(eq(lists.id, input.listId), eq(lists.userId, userId), isNull(lists.deletedAt)))
    .returning();
  if (!updated) throw new NotFoundError("List not found");
  return updated;
}

/**
 * Full order of one or more sections — including cross-section moves: a list is
 * placed in whichever section's `listIds` names it. Sections and lists must all be
 * the user's active rows; lists not mentioned keep their current placement.
 */
export async function reorderLists(
  db: Db,
  userId: string,
  input: z.infer<typeof reorderListsInput>,
): Promise<{ updatedCount: number }> {
  const sectionIds = [...new Set(input.sections.map((section) => section.sectionId))];
  const ownedSections = await activeSectionIdsOf(db, userId, sectionIds);
  if (ownedSections.length !== sectionIds.length) throw new NotFoundError("Section not found");

  const listIds: number[] = [];
  const seen = new Set<number>();
  for (const section of input.sections) {
    for (const listId of section.listIds) {
      if (seen.has(listId))
        throw new BadRequestError("List order cannot contain duplicate list ids.");
      seen.add(listId);
      listIds.push(listId);
    }
  }
  if (listIds.length === 0) return { updatedCount: 0 };

  const ownedLists = await db
    .select({ id: lists.id })
    .from(lists)
    .where(and(eq(lists.userId, userId), isNull(lists.deletedAt), inArray(lists.id, listIds)));
  if (ownedLists.length !== listIds.length) throw new NotFoundError("List not found");

  const [first, ...rest] = input.sections.flatMap((section) =>
    section.listIds.map((listId, position) =>
      db
        .update(lists)
        .set({ sectionId: section.sectionId, position })
        .where(and(eq(lists.id, listId), eq(lists.userId, userId))),
    ),
  );
  if (!first) return { updatedCount: 0 };
  await db.batch([first, ...rest]);
  return { updatedCount: listIds.length };
}
