import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

import { cleanupUsers, createTestDb, testUserId } from "../../../test/db";
import { diddls, listItems, lists } from "../db/schema";
import { NotFoundError } from "../errors";
import {
  LIST_COLORS,
  createList,
  deleteList,
  renameList,
  reorderLists,
  updateListColor,
} from "./lists";
import { createSection, ensureDefaultSection, getSectionsWithLists } from "./sections";

const db = createTestDb();
const userA = testUserId();
const userB = testUserId();

let listB: Awaited<ReturnType<typeof createList>>;
let sectionB: Awaited<ReturnType<typeof createSection>>;
let diddlId: number;

beforeAll(async () => {
  listB = await createList(db, userB, { name: "B's list", diddlIds: [] });
  sectionB = await createSection(db, userB, { name: "B's section" });
  const [diddl] = await db.select({ id: diddls.id }).from(diddls).limit(1);
  if (!diddl) throw new Error("The test branch has no catalog rows — run catalog:load first");
  diddlId = diddl.id;
});
afterAll(() => cleanupUsers(db, [userA, userB]));

describe("createList", () => {
  test("lands in the user's default section with the first unused colour", async () => {
    const created = await createList(db, userA, { name: "First", diddlIds: [] });
    const def = await ensureDefaultSection(db, userA);
    expect(created).toMatchObject({
      userId: userA,
      sectionId: def.id,
      position: 0,
      color: LIST_COLORS[0],
    });

    const second = await createList(db, userA, { name: "Second", diddlIds: [] });
    expect(second).toMatchObject({ position: 1, color: LIST_COLORS[1] });
  });

  test("pre-fills items owned by the same user", async () => {
    const created = await createList(db, userA, { name: "Filled", diddlIds: [diddlId, diddlId] });
    const items = await db.select().from(listItems).where(eq(listItems.listId, created.id));
    expect(items).toHaveLength(2);
    expect(items.every((i) => i.userId === userA && i.quantity === 1)).toBe(true);
  });
});

describe("renameList / updateListColor", () => {
  test("update the user's own list", async () => {
    const own = await createList(db, userA, { name: "Old", diddlIds: [] });
    expect((await renameList(db, userA, { listId: own.id, name: "New" })).name).toBe("New");
    expect((await updateListColor(db, userA, { listId: own.id, color: "red" })).color).toBe("red");
  });

  test("user A cannot touch user B's list", async () => {
    await expect(
      renameList(db, userA, { listId: listB.id, name: "Hijacked" }),
    ).rejects.toBeInstanceOf(NotFoundError);
    await expect(
      updateListColor(db, userA, { listId: listB.id, color: "red" }),
    ).rejects.toBeInstanceOf(NotFoundError);
    const [row] = await db.select().from(lists).where(eq(lists.id, listB.id));
    expect(row).toMatchObject({ name: "B's list", color: LIST_COLORS[0] });
  });
});

describe("deleteList", () => {
  test("soft-deletes the user's own list and hides it from the sidebar", async () => {
    const own = await createList(db, userA, { name: "Gone", diddlIds: [] });
    const deleted = await deleteList(db, userA, { listId: own.id });
    expect(deleted.deletedAt).not.toBeNull();
    const ids = (await getSectionsWithLists(db, userA)).flatMap((s) => s.lists.map((l) => l.id));
    expect(ids).not.toContain(own.id);
    await expect(deleteList(db, userA, { listId: own.id })).rejects.toBeInstanceOf(NotFoundError);
  });

  test("user A cannot delete user B's list", async () => {
    await expect(deleteList(db, userA, { listId: listB.id })).rejects.toBeInstanceOf(NotFoundError);
    const [row] = await db.select().from(lists).where(eq(lists.id, listB.id));
    expect(row?.deletedAt).toBeNull();
  });
});

describe("reorderLists", () => {
  test("moves lists across the user's own sections", async () => {
    const target = await createSection(db, userA, { name: "Target" });
    const [one, two] = await Promise.all([
      createList(db, userA, { name: "One", diddlIds: [] }),
      createList(db, userA, { name: "Two", diddlIds: [] }),
    ]);
    await reorderLists(db, userA, {
      sections: [{ sectionId: target.id, listIds: [two.id, one.id] }],
    });
    const rows = await db.select().from(lists).where(eq(lists.sectionId, target.id));
    expect(rows.map((r) => [r.id, r.position]).sort((a, b) => a[1]! - b[1]!)).toEqual([
      [two.id, 0],
      [one.id, 1],
    ]);
  });

  test("user A cannot place lists into user B's section", async () => {
    const own = await createList(db, userA, { name: "Mine", diddlIds: [] });
    await expect(
      reorderLists(db, userA, { sections: [{ sectionId: sectionB.id, listIds: [own.id] }] }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  test("user A cannot move user B's list", async () => {
    const def = await ensureDefaultSection(db, userA);
    await expect(
      reorderLists(db, userA, { sections: [{ sectionId: def.id, listIds: [listB.id] }] }),
    ).rejects.toBeInstanceOf(NotFoundError);
    const [row] = await db.select().from(lists).where(eq(lists.id, listB.id));
    expect(row?.sectionId).not.toBe(def.id);
  });
});
