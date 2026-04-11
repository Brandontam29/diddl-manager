import { Generated, Insertable, Selectable, Updateable } from "kysely";
import { z } from "zod";

export const diddlTypeSchema = z.enum([
  "sticker",
  "A7",
  "A6",
  "A5",
  "A4",
  "series",
  "gift-paper",
  "birthday",
  "special",
  "game",
  "A2",
  "paper-relief",
  "post-it",
  "rectangular-memo",
  "square-memo",
  "quardiddl-card",
  "letter-paper",
  "stamp",
  "paper-bag-A5",
  "paper-bag-A4",
  "paper-bag-expo",
  "bag-small",
  "bag-large",
  "bag-mega",
  "bag-plastic",
  "postal-card",
  "towel",
]);

export type DiddlType = z.infer<typeof diddlTypeSchema>;

export const diddlSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: diddlTypeSchema,
  imagePath: z.string(),
  imageWidth: z.number().nullable().optional(),
  imageHeight: z.number().nullable().optional(),
});

export type Diddl = z.infer<typeof diddlSchema>;

export type DiddlDb = Omit<Diddl, "id"> & {
  id: Generated<number>;
};

export type SelectDiddlDb = Selectable<DiddlDb>;
export type InsertDiddlDb = Insertable<DiddlDb>;
export type UpdateDiddlDb = Updateable<DiddlDb>;
