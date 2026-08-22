import { z } from "zod";

const isoDateStringSchema = z.string().refine(
  (val) => {
    return !isNaN(Date.parse(val));
  },
  {
    message: "Invalid ISO date string",
  },
);

/**
 * The desktop's `picturePath` is dropped on the web: the avatar is Clerk's
 * `imageUrl` (spec §3), so profiles carry no picture column.
 */
export const profileSchema = z.object({
  userId: z.string(),
  name: z.string(),
  birthdate: isoDateStringSchema,
  description: z.string(),
  hobbies: z.string(),
  createdAt: isoDateStringSchema,
  updatedAt: isoDateStringSchema,
  deletedAt: isoDateStringSchema.nullable(),
});

export type Profile = z.infer<typeof profileSchema>;

export const updateProfileSchema = profileSchema
  .pick({
    name: true,
    birthdate: true,
    description: true,
    hobbies: true,
  })
  .partial();

export type UpdateProfile = z.infer<typeof updateProfileSchema>;
