import { v } from 'convex/values';
import { internal } from '../_generated/api';
import { privateAction, privateQuery } from './helpers';

// Called from SvelteKit seed route with pre-chunked data (100 items per call)
// Actions cannot write to DB directly — must use ctx.runMutation(internal.*)
export const seedCatalogChunk = privateAction({
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
	handler: async (ctx, args): Promise<{ inserted: number; updated: number }> => {
		return await ctx.runMutation(internal.private.seedMutations.insertCatalogChunk, {
			items: args.items
		});
	}
});

// Upload a single image to storage and link it to its catalog item
export const seedImageForItem = privateAction({
	args: {
		type: v.string(),
		number: v.number(),
		imageBytes: v.bytes()
	},
	handler: async (ctx, args): Promise<{ status: 'linked' | 'not_found' }> => {
		const blob = new Blob([args.imageBytes]);
		const storageId = await ctx.storage.store(blob);
		const result = await ctx.runMutation(internal.private.seedMutations.linkImageToItem, {
			type: args.type,
			number: args.number,
			storageId
		});
		return result;
	}
});

// Check if a catalog item already has images linked (used by CLI to skip)
export const checkItemHasImage = privateQuery({
	args: {
		type: v.string(),
		number: v.number()
	},
	handler: async (ctx, args): Promise<{ hasImage: boolean; exists: boolean }> => {
		const item = await ctx.db
			.query('catalogItems')
			.withIndex('by_type_number', (q) => q.eq('type', args.type).eq('number', args.number))
			.unique();
		if (!item) return { hasImage: false, exists: false };
		return { hasImage: item.imageStorageIds.length > 0, exists: true };
	}
});

// Called once to seed the diddlTypes table
export const seedDiddlTypes = privateAction({
	args: {
		types: v.array(
			v.object({
				slug: v.string(),
				displayName: v.string(),
				sortOrder: v.number()
			})
		)
	},
	handler: async (ctx, args): Promise<{ inserted: number; updated: number }> => {
		return await ctx.runMutation(internal.private.seedMutations.insertDiddlTypes, {
			types: args.types
		});
	}
});
