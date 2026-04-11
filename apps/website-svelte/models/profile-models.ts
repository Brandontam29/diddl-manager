import { z } from "zod";

export const profileSchema = z.object({
  id: z.number(),
  name: z.string(),
  birthdate: z.date(),
  description: z.string(),
  hobbies: z.string(),
  picturePath: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

export type Profile = z.infer<typeof profileSchema>;
