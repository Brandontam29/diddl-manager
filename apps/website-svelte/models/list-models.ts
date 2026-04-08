import { z } from 'zod';

export const listSchema = z.object({
	id: z.number(),
	name: z.string(),
	description: z.string(),
	color: z.string(),

	createdAt: z.date(),
	updatedAt: z.date(),
	deletedAt: z.date().nullable()
});

export const listItemSchema = z.object({
	id: z.number(),
	listId: z.number(),
	diddlId: z.number(),

	condition: z.enum(['mint', 'lightly used', 'used', 'damaged']),
	tags: z.string().array(),
	isComplete: z.boolean(),
	quantity: z.number().positive()
});
