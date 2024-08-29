import { z } from 'zod';

export const acquiredItemSchema = z.object({
  id: z.string(),
  isDamaged: z.boolean(),
  isCompleteSet: z.boolean()
});

export type AcquiredItem = z.infer<typeof acquiredItemSchema>;
