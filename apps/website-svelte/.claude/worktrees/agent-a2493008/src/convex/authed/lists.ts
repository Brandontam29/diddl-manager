import { v } from 'convex/values';
import type { Doc } from '../_generated/dataModel';
import { authedMutation, authedQuery } from './helpers';

function mapList(list: Doc<'lists'>) {
	return {
		id: list._id,
		name: list.name,
		color: list.color,
		createdAt: list._creationTime
	};
}

export const listByOwner = authedQuery({
	args: {},
	handler: async (ctx) => {
		const lists = await ctx.db
			.query('lists')
			.withIndex('by_owner', (q) => q.eq('ownerSubject', ctx.identity.subject))
			.order('asc')
			.collect();

		return lists.map(mapList);
	}
});

export const create = authedMutation({
	args: {
		name: v.string(),
		color: v.string()
	},
	handler: async (ctx, args) => {
		const existingLists = await ctx.db
			.query('lists')
			.withIndex('by_owner', (q) => q.eq('ownerSubject', ctx.identity.subject))
			.collect();

		if (existingLists.length >= 3) {
			throw new Error('Authenticated users can create up to 3 lists.');
		}

		const listId = await ctx.db.insert('lists', {
			name: args.name,
			color: args.color,
			ownerSubject: ctx.identity.subject
		});

		const createdList = await ctx.db.get(listId);
		if (createdList === null) {
			throw new Error('Created list could not be loaded.');
		}

		return mapList(createdList);
	}
});

export const update = authedMutation({
	args: {
		id: v.id('lists'),
		name: v.optional(v.string()),
		color: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const existingList = await ctx.db.get(args.id);
		if (existingList === null || existingList.ownerSubject !== ctx.identity.subject) {
			throw new Error('List not found.');
		}

		await ctx.db.patch(args.id, {
			name: args.name ?? existingList.name,
			color: args.color ?? existingList.color
		});

		const updatedList = await ctx.db.get(args.id);
		if (updatedList === null) {
			throw new Error('Updated list could not be loaded.');
		}

		return mapList(updatedList);
	}
});

export const remove = authedMutation({
	args: {
		id: v.id('lists')
	},
	handler: async (ctx, args) => {
		const existingList = await ctx.db.get(args.id);
		if (existingList === null || existingList.ownerSubject !== ctx.identity.subject) {
			throw new Error('List not found.');
		}

		const items = await ctx.db
			.query('listItems')
			.withIndex('by_list', (q) => q.eq('listId', args.id))
			.collect();

		for (const item of items) {
			await ctx.db.delete(item._id);
		}

		await ctx.db.delete(args.id);

		return { id: args.id };
	}
});
