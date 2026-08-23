import { and, eq, isNotNull, isNull } from "drizzle-orm";
import { z } from "zod";

import type { Db } from "../db/client";
import { listItems, listSections, lists, type ProfileRow, profiles } from "../db/schema";
import { NotFoundError } from "../errors";
import { ensureDefaultSection } from "./sections";

/**
 * `birthdate` is a Postgres `date`, so it travels as `YYYY-MM-DD` (or null to clear)
 * rather than the desktop's free-form ISO string.
 */
export const updateProfileInput = z.object({
  name: z.string().max(100).optional(),
  birthdate: z.iso.date().nullable().optional(),
  description: z.string().max(2000).optional(),
  hobbies: z.string().max(2000).optional(),
});

/**
 * The first authenticated call for a new account creates both the profile row and
 * the Default Section (spec §5) — there is no sign-up webhook (ADR 0001).
 *
 * A soft-deleted profile is revived here, *before* the Default Section is ensured,
 * so a returning user id is treated as a fresh sign-up: `deleteAccount` succeeded
 * but the client-side Clerk deletion did not, and the still-valid session must
 * not be locked out with "Profile not found" forever. The old Sections and Lists
 * stay soft-deleted; only the profile row (with its fields intact) comes back and
 * a new Default Section is created.
 */
export async function getProfile(db: Db, userId: string): Promise<ProfileRow> {
  await db.insert(profiles).values({ userId }).onConflictDoNothing({ target: profiles.userId });
  await db
    .update(profiles)
    .set({ deletedAt: null })
    .where(and(eq(profiles.userId, userId), isNotNull(profiles.deletedAt)));
  await ensureDefaultSection(db, userId);

  const [profile] = await db
    .select()
    .from(profiles)
    .where(and(eq(profiles.userId, userId), isNull(profiles.deletedAt)))
    .limit(1);
  if (!profile) throw new NotFoundError("Profile not found");
  return profile;
}

export async function updateProfile(
  db: Db,
  userId: string,
  input: z.infer<typeof updateProfileInput>,
): Promise<ProfileRow> {
  await getProfile(db, userId);
  const [updated] = await db
    .update(profiles)
    .set(input)
    .where(and(eq(profiles.userId, userId), isNull(profiles.deletedAt)))
    .returning();
  if (!updated) throw new NotFoundError("Profile not found");
  return updated;
}

export type DeleteAccountResult = {
  sections: number;
  lists: number;
  items: number;
  profile: boolean;
};

/**
 * Account deletion (spec §3, §4): the user's Sections, Lists and Profile are
 * soft-deleted (`deleted_at`), consistent with `deleteSection` / `deleteList`.
 * List Items have no `deleted_at` and are hard-deleted everywhere else (spec §3,
 * migration 004 parity), so they are hard-deleted here too — nothing could read
 * them once their Lists are gone.
 *
 * All four statements go in one `db.batch` — neon-http runs a batch as a single
 * transaction — so a failure part-way can never leave the items gone while the
 * account still looks intact. The client deletes the Clerk user afterwards;
 * nothing cascades from Clerk (ADR 0001). Idempotent: rows already soft-deleted
 * are left alone and a missing profile is not an error.
 */
export async function deleteAccount(db: Db, userId: string): Promise<DeleteAccountResult> {
  const deletedAt = new Date();

  const [items, deletedLists, sections, profile] = await db.batch([
    db.delete(listItems).where(eq(listItems.userId, userId)).returning({ id: listItems.id }),
    db
      .update(lists)
      .set({ deletedAt })
      .where(and(eq(lists.userId, userId), isNull(lists.deletedAt)))
      .returning({ id: lists.id }),
    db
      .update(listSections)
      .set({ deletedAt })
      .where(and(eq(listSections.userId, userId), isNull(listSections.deletedAt)))
      .returning({ id: listSections.id }),
    db
      .update(profiles)
      .set({ deletedAt })
      .where(and(eq(profiles.userId, userId), isNull(profiles.deletedAt)))
      .returning({ userId: profiles.userId }),
  ]);

  return {
    sections: sections.length,
    lists: deletedLists.length,
    items: items.length,
    profile: profile.length === 1,
  };
}
