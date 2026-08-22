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

/**
 * The 27 Diddl Types, in schema order — the source for the `diddl_type` pg enum.
 * Typed as a non-empty tuple because `pgEnum` requires at least one value.
 */
export const DIDDL_TYPES = diddlTypeSchema.options as [DiddlType, ...DiddlType[]];

export const diddlSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: diddlTypeSchema,
  imagePath: z.string(),
  imageWidth: z.number().nullable().optional(),
  imageHeight: z.number().nullable().optional(),
});

export type Diddl = z.infer<typeof diddlSchema>;
