import { z } from 'zod';

export const diddlTypeSchema = z.enum([
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

export type DiddlType = z.infer<typeof diddlTypeSchema>;

export const diddlSchema = z.object({
	id: z.number(),
	name: z.string(),
	type: diddlTypeSchema,
	release_date: z.date(),
	edition: z.string(),
	imagePath: z.string(),
	imageWidth: z.number().nullable().optional(),
	imageHeight: z.number().nullable().optional()
});

export type Diddl = z.infer<typeof diddlSchema>;
