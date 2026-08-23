import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

import { cleanupUsers, createTestDb, testUserId } from "../../../test/db";
import { diddls, listItems } from "../db/schema";
import { NotFoundError } from "../errors";
import {
  addListItems,
  duplicateListItem,
  getListItems,
  removeListItems,
  updateListItems,
} from "./items";
import { createList } from "./lists";

const db = createTestDb();
const userA = testUserId();
const userB = testUserId();

let listA: Awaited<ReturnType<typeof createList>>;
let listB: Awaited<ReturnType<typeof createList>>;
let itemB: Awaited<ReturnType<typeof addListItems>>[number];
let diddlId: number;
let otherDiddlId: number;

beforeAll(async () => {
  const rows = await db.select({ id: diddls.id }).from(diddls).limit(2);
  if (rows.length < 2)
    throw new Error("The test branch has no catalog rows — run catalog:load first");
  diddlId = rows[0]!.id;
  otherDiddlId = rows[1]!.id;
  listA = await createList(db, userA, { name: "A's list", diddlIds: [] });
  listB = await createList(db, userB, { name: "B's list", diddlIds: [] });
  [itemB] = (await addListItems(db, userB, {
    listId: listB.id,
    items: [{ diddlId, quantity: 3, isDamaged: false, isIncomplete: false }],
  })) as [typeof itemB];
});
afterAll(() => cleanupUsers(db, [userA, userB]));

describe("addListItems / getListItems", () => {
  test("adds a batch to the user's list and reads it back joined with the catalog", async () => {
    const added = await addListItems(db, userA, {
      listId: listA.id,
      items: [
        { diddlId, quantity: 2, isDamaged: true, isIncomplete: false },
        { diddlId: otherDiddlId, quantity: 1, isDamaged: false, isIncomplete: true },
      ],
    });
    expect(added).toHaveLength(2);
    expect(added.every((i) => i.userId === userA && i.listId === listA.id)).toBe(true);

    const items = await getListItems(db, userA, { listId: listA.id });
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({ diddlId, quantity: 2, isDamaged: true });
    expect(typeof items[0]?.diddlName).toBe("string");
    expect(typeof items[0]?.imagePath).toBe("string");
  });

  test("filters by flag and quantity", async () => {
    expect(
      await getListItems(db, userA, { listId: listA.id, filters: { isDamaged: true } }),
    ).toHaveLength(1);
    expect(
      await getListItems(db, userA, { listId: listA.id, filters: { minCount: 2 } }),
    ).toHaveLength(1);
    expect(
      await getListItems(db, userA, { listId: listA.id, filters: { maxCount: 1 } }),
    ).toHaveLength(1);
  });

  test("user A cannot read or add to user B's list", async () => {
    await expect(getListItems(db, userA, { listId: listB.id })).rejects.toBeInstanceOf(
      NotFoundError,
    );
    await expect(
      addListItems(db, userA, {
        listId: listB.id,
        items: [{ diddlId, quantity: 1, isDamaged: false, isIncomplete: false }],
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(await db.select().from(listItems).where(eq(listItems.listId, listB.id))).toHaveLength(1);
  });
});

describe("duplicateListItem", () => {
  test("copies the user's own item with quantity 1", async () => {
    const [source] = await getListItems(db, userA, {
      listId: listA.id,
      filters: { isDamaged: true },
    });
    const copy = await duplicateListItem(db, userA, { listItemId: source!.listItemId });
    expect(copy).toMatchObject({
      userId: userA,
      listId: listA.id,
      diddlId,
      quantity: 1,
      isDamaged: true,
    });
  });

  test("user A cannot duplicate user B's item", async () => {
    await expect(duplicateListItem(db, userA, { listItemId: itemB.id })).rejects.toBeInstanceOf(
      NotFoundError,
    );
    expect(await db.select().from(listItems).where(eq(listItems.listId, listB.id))).toHaveLength(1);
  });
});

describe("updateListItems", () => {
  test("applies flags and a quantity delta, removing items that hit zero", async () => {
    const items = await getListItems(db, userA, { listId: listA.id });
    const ids = items.map((i) => i.listItemId);
    const result = await updateListItems(db, userA, {
      listId: listA.id,
      listItemIds: ids,
      action: { addQuantity: -1, isIncomplete: true },
    });
    expect(result.updatedCount).toBe(ids.length);
    expect(result.removedCount).toBe(2); // the two quantity-1 items

    const remaining = await getListItems(db, userA, { listId: listA.id });
    expect(remaining).toHaveLength(1);
    expect(remaining[0]).toMatchObject({ quantity: 1, isIncomplete: true });
  });

  test("user A affects zero of user B's rows", async () => {
    const result = await updateListItems(db, userA, {
      listId: listB.id,
      listItemIds: [itemB.id],
      action: { addQuantity: -100 },
    });
    expect(result).toEqual({ updatedCount: 0, removedCount: 0 });
    const [row] = await db.select().from(listItems).where(eq(listItems.id, itemB.id));
    expect(row?.quantity).toBe(3);
  });
});

describe("removeListItems", () => {
  test("user A affects zero of user B's rows", async () => {
    const result = await removeListItems(db, userA, { listId: listB.id, listItemIds: [itemB.id] });
    expect(result.removedCount).toBe(0);
    expect(await db.select().from(listItems).where(eq(listItems.id, itemB.id))).toHaveLength(1);
  });

  test("removes the user's own items", async () => {
    const items = await getListItems(db, userA, { listId: listA.id });
    const result = await removeListItems(db, userA, {
      listId: listA.id,
      listItemIds: items.map((i) => i.listItemId),
    });
    expect(result.removedCount).toBe(items.length);
    expect(await getListItems(db, userA, { listId: listA.id })).toHaveLength(0);
  });
});
