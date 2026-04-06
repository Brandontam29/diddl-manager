import { v } from 'convex/values';
import { adminMutation, adminQuery } from './adminHelpers';

// Admin query: list all catalog items (any status), with optional type/status filters
export const listAll = adminQuery({
	args: {
		type: v.optional(v.string()),
		status: v.optional(v.union(v.literal('draft'), v.literal('published'), v.literal('archived')))
	},
	handler: async (ctx, args) => {
		const base = ctx.db.query('catalogItems');

		const indexed =
			args.type && args.status
				? base.withIndex('by_type_status', (idx) =>
						idx.eq('type', args.type!).eq('status', args.status!)
					)
				: args.status
					? base.withIndex('by_status', (idx) => idx.eq('status', args.status!))
					: args.type
						? base.withIndex('by_type_number', (idx) => idx.eq('type', args.type!))
						: base;

		const items = await indexed.order('asc').collect();

		return await Promise.all(
			items.map(async (item) => {
				const imageUrl =
					item.imageStorageIds.length > 0
						? await ctx.storage.getUrl(item.imageStorageIds[0])
						: null;
				return { ...item, imageUrl };
			})
		);
	}
});

// Admin query: get a single catalog item by ID
export const getById = adminQuery({
	args: { id: v.id('catalogItems') },
	handler: async (ctx, args) => {
		const item = await ctx.db.get(args.id);
		if (item === null) {
			throw new Error('Catalog item not found');
		}
		const imageUrl =
			item.imageStorageIds.length > 0 ? await ctx.storage.getUrl(item.imageStorageIds[0]) : null;
		return { ...item, imageUrl };
	}
});

// Create a new catalog item as draft
export const createCatalogItem = adminMutation({
	args: {
		type: v.string(),
		number: v.number(),
		name: v.optional(v.string()),
		edition: v.optional(v.string()),
		releaseDate: v.optional(v.number()),
		imagePath: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		// Check for duplicate type+number
		const existing = await ctx.db
			.query('catalogItems')
			.withIndex('by_type_number', (q) => q.eq('type', args.type).eq('number', args.number))
			.unique();
		if (existing) {
			throw new Error(`Catalog item ${args.type}:${args.number} already exists`);
		}

		return await ctx.db.insert('catalogItems', {
			type: args.type,
			number: args.number,
			name: args.name,
			edition: args.edition,
			releaseDate: args.releaseDate,
			imagePath: args.imagePath,
			imageStorageIds: [],
			status: 'draft'
		});
	}
});

// Update an existing catalog item
export const updateCatalogItem = adminMutation({
	args: {
		id: v.id('catalogItems'),
		name: v.optional(v.string()),
		edition: v.optional(v.string()),
		releaseDate: v.optional(v.number()),
		imagePath: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const item = await ctx.db.get(args.id);
		if (item === null) {
			throw new Error('Catalog item not found');
		}

		const updates: Record<string, unknown> = {};
		if (args.name !== undefined) updates.name = args.name;
		if (args.edition !== undefined) updates.edition = args.edition;
		if (args.releaseDate !== undefined) updates.releaseDate = args.releaseDate;
		if (args.imagePath !== undefined) updates.imagePath = args.imagePath;

		await ctx.db.patch(args.id, updates);
		return args.id;
	}
});

// Publish a catalog item (draft → published)
export const publishCatalogItem = adminMutation({
	args: { id: v.id('catalogItems') },
	handler: async (ctx, args) => {
		const item = await ctx.db.get(args.id);
		if (item === null) {
			throw new Error('Catalog item not found');
		}
		if (item.status === 'published') {
			throw new Error('Item is already published');
		}
		if (item.status === 'archived') {
			throw new Error('Cannot publish an archived item');
		}
		await ctx.db.patch(args.id, { status: 'published' });
		return args.id;
	}
});

// Archive a catalog item and tag all referencing listItems with "archived"
export const archiveCatalogItem = adminMutation({
	args: { id: v.id('catalogItems') },
	handler: async (ctx, args) => {
		const item = await ctx.db.get(args.id);
		if (item === null) {
			throw new Error('Catalog item not found');
		}
		if (item.status === 'archived') {
			throw new Error('Item is already archived');
		}

		// Change status to archived
		await ctx.db.patch(args.id, { status: 'archived' });

		// Find all listItems referencing this catalog item and append "archived" tag
		const referencingItems = await ctx.db
			.query('listItems')
			.withIndex('by_catalogItemId', (q) => q.eq('catalogItemId', args.id))
			.collect();

		let taggedCount = 0;
		for (const listItem of referencingItems) {
			if (!listItem.tags.includes('archived')) {
				await ctx.db.patch(listItem._id, {
					tags: [...listItem.tags, 'archived']
				});
				taggedCount++;
			}
		}

		return { archivedItemId: args.id, taggedListItems: taggedCount };
	}
});
