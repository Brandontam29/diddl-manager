import { internalMutation } from '../_generated/server';

// One-time migration: set status = "published" on all existing catalog items that lack a status field
export const backfillCatalogStatus = internalMutation({
	args: {},
	handler: async (ctx) => {
		const items = await ctx.db.query('catalogItems').collect();
		let updated = 0;
		for (const item of items) {
			if (!('status' in item) || item.status === undefined) {
				await ctx.db.patch(item._id, { status: 'published' as const });
				updated++;
			}
		}
		return { updated, total: items.length };
	}
});
