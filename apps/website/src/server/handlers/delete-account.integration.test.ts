import { and, eq, isNotNull, isNull } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

import { cleanupUsers, createTestDb, testUserId } from "../../../test/db";
import { diddls, listItems, listSections, lists, profiles } from "../db/schema";
import { addListItems } from "./items";
import { createList } from "./lists";
import { deleteAccount, getProfile, updateProfile } from "./profile";
import { getSectionsWithLists } from "./sections";

const db = createTestDb();
const userA = testUserId();
const userB = testUserId();

let listB: Awaited<ReturnType<typeof createList>>;

beforeAll(async () => {
  const [diddl] = await db.select({ id: diddls.id }).from(diddls).limit(1);
  if (!diddl) throw new Error("The test branch has no catalog rows — run catalog:load first");

  for (const user of [userA, userB]) {
    await updateProfile(db, user, { name: user === userA ? "Alice" : "Bob" });
    const list = await createList(db, user, { name: "Favourites", diddlIds: [] });
    await addListItems(db, user, {
      listId: list.id,
      items: [{ diddlId: diddl.id, quantity: 1, isDamaged: false, isIncomplete: false }],
    });
    if (user === userB) listB = list;
  }
});
afterAll(() => cleanupUsers(db, [userA, userB]));

describe("deleteAccount", () => {
  test("soft-deletes A's sections, lists and profile, hard-deletes A's items, and leaves B alone", async () => {
    const result = await deleteAccount(db, userA);
    expect(result).toEqual({ sections: 1, lists: 1, items: 1, profile: true });

    // A: rows still exist but are stamped, items are gone.
    const aSections = await db.select().from(listSections).where(eq(listSections.userId, userA));
    expect(aSections).toHaveLength(1);
    expect(aSections.every((s) => s.deletedAt !== null)).toBe(true);
    const aLists = await db.select().from(lists).where(eq(lists.userId, userA));
    expect(aLists).toHaveLength(1);
    expect(aLists[0]!.deletedAt).not.toBeNull();
    expect(await db.select().from(listItems).where(eq(listItems.userId, userA))).toHaveLength(0);
    const [aProfile] = await db.select().from(profiles).where(eq(profiles.userId, userA));
    expect(aProfile?.deletedAt).not.toBeNull();

    // B: untouched.
    expect(
      await db
        .select()
        .from(listSections)
        .where(and(eq(listSections.userId, userB), isNotNull(listSections.deletedAt))),
    ).toHaveLength(0);
    expect(
      await db
        .select()
        .from(lists)
        .where(and(eq(lists.userId, userB), isNull(lists.deletedAt))),
    ).toHaveLength(1);
    expect(await db.select().from(listItems).where(eq(listItems.listId, listB.id))).toHaveLength(1);
    const bProfile = await getProfile(db, userB);
    expect(bProfile.name).toBe("Bob");
    expect(bProfile.deletedAt).toBeNull();

    const bSections = await getSectionsWithLists(db, userB);
    expect(bSections.flatMap((s) => s.lists).map((l) => l.id)).toEqual([listB.id]);
  });

  test("is idempotent — a second call finds nothing left to delete", async () => {
    const result = await deleteAccount(db, userA);
    expect(result).toEqual({ sections: 0, lists: 0, items: 0, profile: false });
  });
});
