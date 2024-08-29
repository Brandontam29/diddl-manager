import { z } from 'zod';

export const wishlistItemSchema = z.object({
  id: z.string()
});

export type WishlistItem = z.infer<typeof wishlistItemSchema>;
