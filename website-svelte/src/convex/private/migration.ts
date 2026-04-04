import { v } from 'convex/values';
import { internal } from '../_generated/api';
import { privateAction, privateQuery } from './helpers';

const guestListValidator = v.object({
	id: v.string(),
	name: v.string(),
	color: v.string(),
	createdAt: v.number()
});

const guestItemValidator = v.object({
	id: v.string(),
	listId: v.string(),
	catalogRef: v.object({
		type: v.string(),
		number: v.number()
	}),
	condition: v.union(
		v.literal('mint'),
		v.literal('near_mint'),
		v.literal('good'),
		v.literal('poor'),
		v.literal('damaged')
	),
	quantity: v.number(),
	complete: v.boolean(),
	tags: v.array(v.string())
});

// SvelteKit backend orchestration calls these private bridge functions through ConvexPrivateService.
export const preflightGuestMigration = privateQuery({
	args: {
		ownerSubject: v.string(),
		guestSessionId: v.string(),
		lists: v.array(guestListValidator),
		items: v.array(guestItemValidator)
	},
	handler: async (ctx, args) => {
		const preflight = await ctx.runQuery(
			internal.private.migrationInternals.preflightGuestMigrationInternal,
			args
		);

		return preflight.result;
	}
});

// SvelteKit backend orchestration calls these private bridge functions through ConvexPrivateService.
export const runGuestMigration = privateAction({
	args: {
		ownerSubject: v.string(),
		guestSessionId: v.string(),
		lists: v.array(guestListValidator),
		items: v.array(guestItemValidator)
	},
	handler: async (ctx, args) => {
		const preflight = await ctx.runQuery(
			internal.private.migrationInternals.preflightGuestMigrationInternal,
			args
		);

		if (preflight.result.status !== 'fully_migrated') {
			return preflight.result;
		}

		return await ctx.runMutation(internal.private.migrationInternals.applyGuestMigrationInternal, {
			ownerSubject: args.ownerSubject,
			guestSessionId: args.guestSessionId,
			listsProcessed: preflight.result.listsProcessed,
			itemsProcessed: preflight.result.itemsProcessed,
			creates: preflight.operations.creates,
			merges: preflight.operations.merges
		});
	}
});
