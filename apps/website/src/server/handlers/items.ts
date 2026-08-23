import { and, asc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { z } from "zod";

import { addListItemSchema, listItemFilterSchema } from "../../shared/list-models";
import type { Db } from "../db/client";
import { diddls, type ListItemRow, listItems } from "../db/schema";
import { NotFoundError } from "../errors";
import { findActiveList } from "./lists";

export const getListItemsInput = z.object({
  listId: z.number().int(),
  filters: listItemFilterSchema.optional(),
});
export const addListItemsInput = z.object({
  listId: z.number().int(),
  items: z.array(addListItemSchema).min(1),
});
export const removeListItemsInput = z.object({
  listId: z.number().int(),
  listItemIds: z.array(z.number().int()).min(1),
});
export const duplicateListItemInput = z.object({ listItemId: z.number().int() });
export const updateListItemsInput = z.object({
  listId: z.number().int(),
  listItemIds: z.array(z.number().int()).min(1),
  action: z.object({
    addQuantity: z.number().int().optional(),
    isDamaged: z.boolean().optional(),
    isIncomplete: z.boolean().optional(),
  }),
});

/** The list's items joined with their Catalog entry (the `JoinedListItem` shape), filterable. */
export async function getListItems(
  db: Db,
  userId: string,
  input: z.infer<typeof getListItemsInput>,
) {
  await findActiveList(db, userId, input.listId);
  const filters = input.filters ?? {};

  return db
    .select({
      listItemId: listItems.id,
      listId: listItems.listId,
      diddlId: listItems.diddlId,
      quantity: listItems.quantity,
      isDamaged: listItems.isDamaged,
      isIncomplete: listItems.isIncomplete,
      diddlName: diddls.name,
      diddlType: diddls.type,
      imagePath: diddls.imagePath,
      imageWidth: diddls.imageWidth,
      imageHeight: diddls.imageHeight,
    })
    .from(listItems)
    .innerJoin(diddls, eq(diddls.id, listItems.diddlId))
    .where(
      and(
        eq(listItems.userId, userId),
        eq(listItems.listId, input.listId),
        filters.type === undefined ? undefined : eq(diddls.type, filters.type),
        filters.isDamaged === undefined ? undefined : eq(listItems.isDamaged, filters.isDamaged),
        filters.isIncomplete === undefined
          ? undefined
          : eq(listItems.isIncomplete, filters.isIncomplete),
        filters.minCount === undefined ? undefined : gte(listItems.quantity, filters.minCount),
        filters.maxCount === undefined ? undefined : lte(listItems.quantity, filters.maxCount),
      ),
    )
    .orderBy(asc(listItems.diddlId), asc(listItems.id));
}

/** Batch insert; duplicates of one diddl in a list are allowed (parity). */
export async function addListItems(
  db: Db,
  userId: string,
  input: z.infer<typeof addListItemsInput>,
): Promise<ListItemRow[]> {
  await findActiveList(db, userId, input.listId);
  return db
    .insert(listItems)
    .values(input.items.map((item) => ({ ...item, userId, listId: input.listId })))
    .returning();
}

/** Hard delete, scoped by list and user; ids outside that scope are simply not counted. */
export async function removeListItems(
  db: Db,
  userId: string,
  input: z.infer<typeof removeListItemsInput>,
): Promise<{ removedCount: number }> {
  const removed = await db
    .delete(listItems)
    .where(
      and(
        eq(listItems.userId, userId),
        eq(listItems.listId, input.listId),
        inArray(listItems.id, input.listItemIds),
      ),
    )
    .returning({ id: listItems.id });
  return { removedCount: removed.length };
}

/** A copy of the item with quantity 1 and the same damaged/incomplete flags. */
export async function duplicateListItem(
  db: Db,
  userId: string,
  input: z.infer<typeof duplicateListItemInput>,
): Promise<ListItemRow> {
  const [source] = await db
    .select()
    .from(listItems)
    .where(and(eq(listItems.id, input.listItemId), eq(listItems.userId, userId)))
    .limit(1);
  if (!source) throw new NotFoundError("List item not found");

  const [copy] = await db
    .insert(listItems)
    .values({
      userId,
      listId: source.listId,
      diddlId: source.diddlId,
      quantity: 1,
      isDamaged: source.isDamaged,
      isIncomplete: source.isIncomplete,
    })
    .returning();
  if (!copy) throw new Error("Failed to duplicate the list item");
  return copy;
}

/**
 * Batch update: `addQuantity` is a delta (negative to decrement) and any item whose
 * quantity reaches zero is removed — desktop parity.
 */
export async function updateListItems(
  db: Db,
  userId: string,
  input: z.infer<typeof updateListItemsInput>,
): Promise<{ updatedCount: number; removedCount: number }> {
  const { addQuantity, isDamaged, isIncomplete } = input.action;
  const scope = and(
    eq(listItems.userId, userId),
    eq(listItems.listId, input.listId),
    inArray(listItems.id, input.listItemIds),
  );

  const updated = await db
    .update(listItems)
    .set({
      quantity: addQuantity === undefined ? undefined : sql`${listItems.quantity} + ${addQuantity}`,
      isDamaged,
      isIncomplete,
    })
    .where(scope)
    .returning({ id: listItems.id, quantity: listItems.quantity });

  const idsToRemove = updated.filter((row) => row.quantity <= 0).map((row) => row.id);
  if (idsToRemove.length > 0) {
    await db.delete(listItems).where(and(scope, inArray(listItems.id, idsToRemove)));
  }
  return { updatedCount: updated.length, removedCount: idsToRemove.length };
}
