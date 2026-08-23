import { and, eq, isNull } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

import { cleanupUsers, createTestDb, testUserId } from "../../../test/db";
import { listSections, lists } from "../db/schema";
import { BadRequestError, ConflictError, NotFoundError } from "../errors";
import { createList } from "./lists";
import {
  createSection,
  deleteSection,
  ensureDefaultSection,
  getSectionsWithLists,
  renameSection,
  reorderSections,
} from "./sections";

const db = createTestDb();
const userA = testUserId();
const userB = testUserId();

let sectionB: Awaited<ReturnType<typeof createSection>>;

beforeAll(async () => {
  sectionB = await createSection(db, userB, { name: "B's section" });
});
afterAll(() => cleanupUsers(db, [userA, userB]));

describe("getSectionsWithLists", () => {
  test("creates the Default Section on first call and nests the user's lists", async () => {
    const list = await createList(db, userA, { name: "Alpha", diddlIds: [] });
    const sections = await getSectionsWithLists(db, userA);

    expect(sections).toHaveLength(1);
    expect(sections[0]).toMatchObject({ isDefault: true, userId: userA });
    expect(sections[0]?.lists.map((l) => l.id)).toEqual([list.id]);
  });

  test("never includes another user's sections or lists", async () => {
    await createList(db, userB, { name: "Beta", diddlIds: [] });
    const sections = await getSectionsWithLists(db, userA);
    expect(sections.every((s) => s.userId === userA)).toBe(true);
    expect(sections.flatMap((s) => s.lists).every((l) => l.userId === userA)).toBe(true);
    expect(sections.map((s) => s.id)).not.toContain(sectionB.id);
  });
});

describe("createSection", () => {
  test("appends after the user's existing sections", async () => {
    const created = await createSection(db, userA, { name: "Favourites" });
    expect(created).toMatchObject({ userId: userA, isDefault: false, position: 1 });
  });

  test("rejects a case-insensitive duplicate within the same user", async () => {
    await expect(createSection(db, userA, { name: "favourites" })).rejects.toBeInstanceOf(
      ConflictError,
    );
  });

  test("allows the same name for another user", async () => {
    const created = await createSection(db, userB, { name: "Favourites" });
    expect(created.userId).toBe(userB);
  });
});

describe("renameSection", () => {
  test("renames the user's own section", async () => {
    const own = await createSection(db, userA, { name: "Temp" });
    const renamed = await renameSection(db, userA, { sectionId: own.id, name: "Renamed" });
    expect(renamed.name).toBe("Renamed");
  });

  test("user A cannot rename user B's section", async () => {
    await expect(
      renameSection(db, userA, { sectionId: sectionB.id, name: "Hijacked" }),
    ).rejects.toBeInstanceOf(NotFoundError);
    const [row] = await db.select().from(listSections).where(eq(listSections.id, sectionB.id));
    expect(row?.name).toBe("B's section");
  });

  test("refuses to rename the default section", async () => {
    const def = await ensureDefaultSection(db, userA);
    await expect(
      renameSection(db, userA, { sectionId: def.id, name: "Other" }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });
});

describe("reorderSections", () => {
  test("applies a full permutation of the user's active sections", async () => {
    const before = await getSectionsWithLists(db, userA);
    const reversed = before.map((s) => s.id).reverse();
    await reorderSections(db, userA, { sectionIds: reversed });
    const after = await getSectionsWithLists(db, userA);
    expect(after.map((s) => s.id)).toEqual(reversed);
  });

  test("rejects an order that names another user's section", async () => {
    const own = (await getSectionsWithLists(db, userA)).map((s) => s.id);
    await expect(
      reorderSections(db, userA, { sectionIds: [...own, sectionB.id] }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });
});

describe("deleteSection", () => {
  test("soft-deletes, moves its lists to the default section, and renumbers", async () => {
    const doomed = await createSection(db, userA, { name: "Doomed" });
    const list = await createList(db, userA, { name: "Moving", diddlIds: [] });
    await db.update(lists).set({ sectionId: doomed.id, position: 0 }).where(eq(lists.id, list.id));

    const result = await deleteSection(db, userA, { sectionId: doomed.id });
    expect(result.movedListCount).toBe(1);

    const def = await ensureDefaultSection(db, userA);
    const [moved] = await db.select().from(lists).where(eq(lists.id, list.id));
    expect(moved?.sectionId).toBe(def.id);

    const remaining = await db
      .select({ position: listSections.position })
      .from(listSections)
      .where(and(eq(listSections.userId, userA), isNull(listSections.deletedAt)))
      .orderBy(listSections.position);
    expect(remaining.map((r) => r.position)).toEqual(remaining.map((_, i) => i));
  });

  test("user A cannot delete user B's section", async () => {
    await expect(deleteSection(db, userA, { sectionId: sectionB.id })).rejects.toBeInstanceOf(
      NotFoundError,
    );
    const [row] = await db.select().from(listSections).where(eq(listSections.id, sectionB.id));
    expect(row?.deletedAt).toBeNull();
  });

  test("refuses to delete the default section", async () => {
    const def = await ensureDefaultSection(db, userA);
    await expect(deleteSection(db, userA, { sectionId: def.id })).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });
});
