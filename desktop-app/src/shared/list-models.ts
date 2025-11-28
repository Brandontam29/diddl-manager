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

const DISALLOWED_WORDS = ["catherine cai", "dick", "fuck", "satan"];

export const listNameSchema = z
  .string()
  .min(2, { message: "The string must be at least 3 characters long." })
  .max(20, { message: "The string must be at most 20 characters long." })
  .refine((value) => !DISALLOWED_WORDS.includes(value.toLowerCase()), {
    message: "The string cannot be one of the disallowed words.",
  })
  .transform((val) => val.trim());

export const listItemSchema = z.object({
  id: z.number(),
  listId: z.number(),
  diddlId: z.number(),

  isDamaged: z.boolean(),
  isIncomplete: z.boolean(),
  quantity: z.number().positive(),
});

export type ListItem = z.infer<typeof listItemSchema>;

export const listSchema = z.object({
  id: z.number(),
  name: listNameSchema,

  createdAt: isoDateStringSchema,
  lastModifiedAt: isoDateStringSchema,
  deletedAt: isoDateStringSchema.nullable(),
});

export type List = z.infer<typeof listSchema>;

export type ListDb = Omit<List, "id"> & {
  id: Generated<number>;
};

export type SelectListDb = Selectable<ListDb>;
export type InsertListDb = Insertable<ListDb>;
export type UpdateListDb = Updateable<ListDb>;

export const addListItemSchema = listItemSchema.omit({ id: true, listId: true }).extend({
  isDamaged: listItemSchema.shape.isDamaged.default(false),
  isIncomplete: listItemSchema.shape.isIncomplete.default(false),
  quantity: listItemSchema.shape.quantity.default(1),
});

export type AddListItem = Partial<z.infer<typeof addListItemSchema>> & { diddlId: number };

export type ListItemDb = Omit<ListItem, "id"> & {
  id: Generated<number>;
};

export type SelectListItemDb = Selectable<ListItemDb>;
export type InsertListItemDb = Insertable<ListItemDb>;
export type UpdateListItemDb = Updateable<ListItemDb>;

export const updateListItemSchema = listItemSchema
  .pick({
    quantity: true,
    isDamaged: true,
    isIncomplete: true,
  })
  .partial();

export type UpdateListItem = z.infer<typeof updateListItemSchema>;
