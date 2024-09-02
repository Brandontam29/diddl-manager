import { z } from 'zod';

const DISALLOWED_WORDS = ['catherine-cai', 'list-tracker', 'tracker-list'];

export const listNameSchema = z
  .string()
  .min(3, { message: 'The string must be at least 3 characters long.' })
  .max(20, { message: 'The string must be at most 20 characters long.' })
  .refine((value) => !DISALLOWED_WORDS.includes(value.toLowerCase()), {
    message: 'The string cannot be one of the disallowed words.'
  })
  .transform((val) => val.trim());

export const listItemSchema = z.object({
  id: z.string(),
  isDamaged: z.boolean().default(false),
  isCompleteSet: z.boolean().default(true),
  count: z.number().positive().default(1)
});

export type ListItem = z.infer<typeof listItemSchema>;

const isoDateStringSchema = z.string().refine(
  (val) => {
    return !isNaN(Date.parse(val));
  },
  {
    message: 'Invalid ISO date string'
  }
);

export const trackerListItemSchema = z.object({
  id: z.string(),
  name: listNameSchema,
  filePath: z.string(),
  createdAt: isoDateStringSchema.default(new Date().toISOString()),
  lastModified: isoDateStringSchema.default(new Date().toISOString()),
  deletedAt: isoDateStringSchema.nullable().default(null)
});

export type TrackerListItem = z.infer<typeof trackerListItemSchema>;
