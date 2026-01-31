import { Generated, Insertable, Selectable, Updateable } from "kysely";
import { z } from "zod";

const isoDateStringSchema = z.string().refine(
  (val) => {
    return !isNaN(Date.parse(val));
  },
  {
    message: "Invalid ISO date string",
  },
);

export const profileSchema = z.object({
  id: z.number(),
  name: z.string(),
  birthdate: isoDateStringSchema,
  description: z.string(),
  hobbies: z.string(),
  picturePath: z.string().nullable(),
  createdAt: isoDateStringSchema,
  updatedAt: isoDateStringSchema,
  deletedAt: isoDateStringSchema.nullable(),
});

export type Profile = z.infer<typeof profileSchema>;

export type ProfileDb = Omit<Profile, "id" | "createdAt" | "updatedAt"> & {
  id: Generated<number>;
  updatedAt: Generated<string>;
  createdAt: Generated<string>;
};

export type SelectProfileDb = Selectable<ProfileDb>;
export type InsertProfileDb = Insertable<ProfileDb>;
export type UpdateProfileDb = Updateable<ProfileDb>;

export const updateProfileSchema = profileSchema
  .pick({
    name: true,
    birthdate: true,
    description: true,
    hobbies: true,
  })
  .partial();

export type UpdateProfile = z.infer<typeof updateProfileSchema>;
