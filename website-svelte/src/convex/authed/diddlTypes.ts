import { query } from '../_generated/server';

// Use plain query() — NOT authedQuery — so unauthenticated users can see the type tree
export const list = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query('diddlTypes').withIndex('by_sort_order').order('asc').collect();
	}
});
