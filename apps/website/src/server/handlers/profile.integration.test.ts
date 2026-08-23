import { and, eq, isNull } from "drizzle-orm";
import { afterAll, describe, expect, test } from "vitest";

import { cleanupUsers, createTestDb, testUserId } from "../../../test/db";
import { listSections, profiles } from "../db/schema";
import { DEFAULT_SECTION_NAME } from "./sections";
import { getProfile, updateProfile } from "./profile";

const db = createTestDb();
const userA = testUserId();
const userB = testUserId();

afterAll(() => cleanupUsers(db, [userA, userB]));

describe("getProfile", () => {
  test("lazily creates the profile and the Default Section on first call", async () => {
    const before = await db.select().from(profiles).where(eq(profiles.userId, userA));
    expect(before).toHaveLength(0);

    const profile = await getProfile(db, userA);
    expect(profile).toMatchObject({ userId: userA, name: "", description: "", hobbies: "" });

    const sections = await db
      .select()
      .from(listSections)
      .where(and(eq(listSections.userId, userA), isNull(listSections.deletedAt)));
    expect(sections).toHaveLength(1);
    expect(sections[0]).toMatchObject({ name: DEFAULT_SECTION_NAME, isDefault: true, position: 0 });
  });

  test("is idempotent — a second call creates nothing new", async () => {
    await getProfile(db, userA);
    await getProfile(db, userA);
    expect(await db.select().from(profiles).where(eq(profiles.userId, userA))).toHaveLength(1);
    expect(await db.select().from(listSections).where(eq(listSections.userId, userA))).toHaveLength(
      1,
    );
  });

  test("only ever returns the caller's own profile", async () => {
    await updateProfile(db, userA, { name: "Alice" });
    const b = await getProfile(db, userB);
    expect(b.userId).toBe(userB);
    expect(b.name).toBe("");
  });
});

describe("updateProfile", () => {
  test("updates the caller's profile only", async () => {
    const updated = await updateProfile(db, userA, {
      name: "Alice",
      birthdate: "1990-05-04",
      hobbies: "diddls",
    });
    expect(updated).toMatchObject({ userId: userA, name: "Alice", birthdate: "1990-05-04" });

    const b = await getProfile(db, userB);
    expect(b.name).toBe("");
    expect(b.birthdate).toBeNull();
  });

  test("clears the birthdate with null", async () => {
    const updated = await updateProfile(db, userA, { birthdate: null });
    expect(updated.birthdate).toBeNull();
  });
});
