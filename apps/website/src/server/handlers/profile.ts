import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import type { Db } from "../db/client";
import { type ProfileRow, profiles } from "../db/schema";
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
 */
export async function getProfile(db: Db, userId: string): Promise<ProfileRow> {
  await db.insert(profiles).values({ userId }).onConflictDoNothing({ target: profiles.userId });
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
