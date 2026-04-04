import { v } from 'convex/values';
import type { Doc, Id } from '../_generated/dataModel';
import { authedMutation, authedQuery } from './helpers';

async function requireOwnedList(ctx: Parameters<typeof listOwnershipGuard>[0], listId: Id<'lists'>) {
	return await listOwnershipGuard(ctx, listId);
}

async function listOwnershipGuard(
	ctx: {
		db: {
			get: (id: Id<'lists'>) => Promise<Doc<'lists'> | null>;
		};
		identity: {
			subject: string;
		};
	},
	listId: Id<'lists'>
) {
	const list = await ctx.db.get(listId);
	if (list === null || list.ownerSubject !== ctx.identity.subject) {
		throw new Error('List not found.');
	}

	return list;
}

function mapListItem(item: Doc<'listItems'>, catalogItem: Doc<'catalogItems'>) {
	return {
		id: item._id,
		listId: item.listId,
		catalogRef: {
			type: catalogItem.type,
			number: catalogItem.number
		},
		condition: item.condition,
		quantity: item.quantity,
		complete: item.complete,
		tags: item.tags
	};
}

export const byList = authedQuery({
	args: {
		listId: v.id('lists')
	},
	handler: async (ctx, args) => {
		await requireOwnedList(ctx, args.listId);

		const items = await ctx.db
			.query('listItems')
			.withIndex('by_list', (q) => q.eq('listId', args.listId))
			.order('asc')
			.collect();

		return await Promise.all(
			items.map(async (item) => {
				const catalogItem = await ctx.db.get(item.catalogItemId);
				if (catalogItem === null) {
					throw new Error('Catalog item not found.');
				}

				return mapListItem(item, catalogItem);
			})
		);
	}
});

export const addCatalogItems = authedMutation({
	args: {
		listId: v.id('lists'),
		refs: v.array(
			v.object({
				type: v.string(),
				number: v.number()
			})
		)
	},
	handler: async (ctx, args) => {
		await requireOwnedList(ctx, args.listId);

		const createdItems: Array<Doc<'listItems'>> = [];

		for (const ref of args.refs) {
			const catalogItem = await ctx.db
				.query('catalogItems')
				.withIndex('by_type_number', (q) =>
					q.eq('type', ref.type).eq('number', ref.number)
				)
				.unique();

			if (catalogItem === null) {
				throw new Error(`Catalog item not found for ${ref.type}:${ref.number}.`);
			}

			const itemId = await ctx.db.insert('listItems', {
				listId: args.listId,
				catalogItemId: catalogItem._id,
				condition: 'mint',
				quantity: 1,
				complete: true,
				tags: []
			});

			const createdItem = await ctx.db.get(itemId);
			if (createdItem === null) {
				throw new Error('Created list item could not be loaded.');
			}

			createdItems.push(createdItem);
		}

		return await Promise.all(
			createdItems.map(async (item) => {
				const catalogItem = await ctx.db.get(item.catalogItemId);
				if (catalogItem === null) {
					throw new Error('Catalog item not found.');
				}

				return mapListItem(item, catalogItem);
			})
		);
	}
});

export const update = authedMutation({
	args: {
		itemIds: v.array(v.id('listItems')),
		condition: v.optional(
			v.union(
				v.literal('mint'),
				v.literal('near_mint'),
				v.literal('good'),
				v.literal('poor'),
				v.literal('damaged')
			)
		),
		quantity: v.optional(v.number()),
		complete: v.optional(v.boolean())
	},
	handler: async (ctx, args) => {
		const updatedItems: Array<Doc<'listItems'>> = [];

		for (const itemId of args.itemIds) {
			const existingItem = await ctx.db.get(itemId);
			if (existingItem === null) {
				throw new Error('List item not found.');
			}

			await requireOwnedList(ctx, existingItem.listId);

			await ctx.db.patch(itemId, {
				condition: args.condition ?? existingItem.condition,
				quantity: args.quantity ?? existingItem.quantity,
				complete: args.complete ?? existingItem.complete
			});

			const updatedItem = await ctx.db.get(itemId);
			if (updatedItem === null) {
				throw new Error('Updated list item could not be loaded.');
			}

			updatedItems.push(updatedItem);
		}

		return await Promise.all(
			updatedItems.map(async (item) => {
				const catalogItem = await ctx.db.get(item.catalogItemId);
				if (catalogItem === null) {
					throw new Error('Catalog item not found.');
				}

				return mapListItem(item, catalogItem);
			})
		);
	}
});

export const remove = authedMutation({
	args: {
		itemIds: v.array(v.id('listItems'))
	},
	handler: async (ctx, args) => {
		for (const itemId of args.itemIds) {
			const existingItem = await ctx.db.get(itemId);
			if (existingItem === null) {
				throw new Error('List item not found.');
			}

			await requireOwnedList(ctx, existingItem.listId);
			await ctx.db.delete(itemId);
		}

		return { removedIds: args.itemIds };
	}
});

export const duplicate = authedMutation({
	args: {
		itemIds: v.array(v.id('listItems'))
	},
	handler: async (ctx, args) => {
		const duplicatedItems: Array<Doc<'listItems'>> = [];

		for (const itemId of args.itemIds) {
			const existingItem = await ctx.db.get(itemId);
			if (existingItem === null) {
				throw new Error('List item not found.');
			}

			await requireOwnedList(ctx, existingItem.listId);

			const duplicatedItemId = await ctx.db.insert('listItems', {
				listId: existingItem.listId,
				catalogItemId: existingItem.catalogItemId,
				condition: existingItem.condition,
				quantity: existingItem.quantity,
				complete: existingItem.complete,
				tags: existingItem.tags
			});

			const duplicatedItem = await ctx.db.get(duplicatedItemId);
			if (duplicatedItem === null) {
				throw new Error('Duplicated list item could not be loaded.');
			}

			duplicatedItems.push(duplicatedItem);
		}

		return await Promise.all(
			duplicatedItems.map(async (item) => {
				const catalogItem = await ctx.db.get(item.catalogItemId);
				if (catalogItem === null) {
					throw new Error('Catalog item not found.');
				}

				return mapListItem(item, catalogItem);
			})
		);
	}
});
