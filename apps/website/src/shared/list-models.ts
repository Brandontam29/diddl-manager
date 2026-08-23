import { z } from "zod";

import { diddlTypeSchema } from "./diddl-models";

const isoDateStringSchema = z.string().refine(
  (val) => {
    return !isNaN(Date.parse(val));
  },
  {
    message: "Invalid ISO date string",
  },
);

const DISALLOWED_WORDS = ["catherine cai", "dick", "fuck", "satan"];

/**
 * List
 */
export const listNameSchema = z
  .string()
  .min(2, { message: "The string must be at least 3 characters long." })
  .max(20, { message: "The string must be at most 20 characters long." })
  .refine((value) => !DISALLOWED_WORDS.includes(value.toLowerCase()), {
    message: "The string cannot be one of the disallowed words.",
  })
  .transform((val) => val.trim());

/** The desktop palette: the only colours a List may carry (picker + server validation). */
export const LIST_COLORS = [
  "oklch(77.2% 0.142 5.8)",
  "oklch(82.7% 0.125 65.4)",
  "oklch(91.2% 0.187 101.3)",
  "oklch(86.3% 0.190 123.6)",
  "oklch(82.9% 0.123 160.8)",
  "oklch(80.3% 0.106 203.4)",
  "oklch(76.4% 0.131 260.4)",
  "oklch(74.3% 0.193 287.2)",
  "oklch(77.7% 0.204 305.7)",
  "oklch(78.2% 0.201 333.8)",
] as const;

export const listColorSchema = z.enum(LIST_COLORS);

export type ListColor = z.infer<typeof listColorSchema>;

export const listItemSchema = z.object({
  id: z.number(),
  listId: z.number(),
  diddlId: z.number(),

  isDamaged: z.boolean(),
  isIncomplete: z.boolean(),
  quantity: z.number().positive(),
});

export type ListItem = z.infer<typeof listItemSchema>;

/**
 * List Section
 */
export const listSectionNameSchema = z
  .string()
  .trim()
  .min(2, { message: "Section name must be at least 2 characters long." })
  .max(40, { message: "Section name must be at most 40 characters long." });

export const listSectionSchema = z.object({
  id: z.number(),
  name: listSectionNameSchema,
  position: z.number().nonnegative(),
  isDefault: z.boolean(),

  createdAt: isoDateStringSchema,
  updatedAt: isoDateStringSchema,
  deletedAt: isoDateStringSchema.nullable(),
});

export type ListSection = z.infer<typeof listSectionSchema>;

export const listSchema = z.object({
  id: z.number(),
  name: listNameSchema,
  color: z.string(),
  sectionId: z.number(),
  position: z.number().nonnegative(),

  createdAt: isoDateStringSchema,
  updatedAt: isoDateStringSchema,
  deletedAt: isoDateStringSchema.nullable(),
});

export type List = z.infer<typeof listSchema>;

export type ListSectionWithLists = ListSection & {
  lists: List[];
};

/**
 * List Item
 */
export const addListItemSchema = listItemSchema.omit({ id: true, listId: true }).extend({
  isDamaged: listItemSchema.shape.isDamaged.default(false),
  isIncomplete: listItemSchema.shape.isIncomplete.default(false),
  quantity: listItemSchema.shape.quantity.default(1),
});

export type AddListItem = Partial<z.infer<typeof addListItemSchema>> & { diddlId: number };

export const updateListItemSchema = listItemSchema
  .pick({
    quantity: true,
    isDamaged: true,
    isIncomplete: true,
  })
  .partial();

export type UpdateListItem = z.infer<typeof updateListItemSchema>;

/**
 * Joined List Item (listItem + diddl)
 */
export const joinedListItemSchema = z.object({
  listItemId: z.number(),
  listId: z.number(),
  diddlId: z.number(),
  quantity: z.number(),
  isDamaged: z.boolean(),
  isIncomplete: z.boolean(),
  diddlName: z.string(),
  diddlType: diddlTypeSchema,
  imagePath: z.string(),
  imageWidth: z.number().nullable().optional(),
  imageHeight: z.number().nullable().optional(),
});

export type JoinedListItem = z.infer<typeof joinedListItemSchema>;

export const listItemFilterSchema = z.object({
  type: diddlTypeSchema.optional(),
  isDamaged: z.boolean().optional(),
  isIncomplete: z.boolean().optional(),
  minCount: z.number().optional(),
  maxCount: z.number().optional(),
});

export type ListItemFilter = z.infer<typeof listItemFilterSchema>;
