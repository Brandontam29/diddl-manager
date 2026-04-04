import { v } from 'convex/values';
import { internalMutation } from '../_generated/server';

// Internal mutation — called only from seedCatalogChunk action
// ctx.db.insert() is allowed here (mutations can write to DB directly)
export const insertCatalogChunk = internalMutation({
	args: {
		items: v.array(
			v.object({
				type: v.string(),
				number: v.number(),
				name: v.optional(v.string()),
				imagePath: v.optional(v.string())
			})
		)
	},
	handler: async (ctx, args) => {
		for (const item of args.items) {
			await ctx.db.insert('catalogItems', {
				type: item.type,
				number: item.number,
				name: item.name,
				imagePath: item.imagePath,
				imageStorageIds: [] // No images in Phase 1 — future-ready array starts empty
			});
		}
		return { inserted: args.items.length };
	}
});

// Internal mutation for seeding diddlTypes table
export const insertDiddlTypes = internalMutation({
	args: {
		types: v.array(
			v.object({
				slug: v.string(),
				displayName: v.string(),
				sortOrder: v.number()
			})
		)
	},
	handler: async (ctx, args) => {
		for (const diddlType of args.types) {
			await ctx.db.insert('diddlTypes', {
				slug: diddlType.slug,
				displayName: diddlType.displayName,
				sortOrder: diddlType.sortOrder
			});
		}
		return { inserted: args.types.length };
	}
});
