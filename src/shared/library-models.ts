import { z } from 'zod';

const libraryEntryType = z.enum([
  'sticker',
  'A7',
  'A6',
  'A5',
  'A4',
  'series',
  'gift-paper',
  'birthday',
  'special',
  'game',
  'A2',
  'paper-relief',
  'post-it',
  'rectangular-memo',
  'square-memo',
  'quardiddl-card',
  'letter-paper',
  'stamp',
  'paper-bag-A5',
  'paper-bag-A4',
  'paper-bag-expo',
  'bag-small',
  'bag-large',
  'bag-mega',
  'bag-plastic',
  'postal-card',
  'towel'
]);

export const libraryEntrySchema = z.object({
  id: z.string(),
  name: z.string(),
  type: libraryEntryType,
  imagePath: z.string()
});

export type LibraryEntry = z.infer<typeof libraryEntrySchema>;
