import { v } from 'convex/values';
import { internal } from '../_generated/api';
import { privateAction } from './helpers';

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
	handler: async (ctx, args): Promise<{ inserted: number }> => {
		return await ctx.runMutation(internal.private.seedMutations.insertCatalogChunk, {
			items: args.items
		});
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
	handler: async (ctx, args): Promise<{ inserted: number }> => {
		return await ctx.runMutation(internal.private.seedMutations.insertDiddlTypes, {
			types: args.types
		});
	}
});
