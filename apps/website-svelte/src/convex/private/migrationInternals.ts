import { v } from 'convex/values';
import type { MigrationPartialReason, MigrationResult } from '../../lib/lists/migrationResult';
import type { Doc, Id } from '../_generated/dataModel';
import { internalMutation, internalQuery } from '../_generated/server';

const guestListValidator = v.object({
	id: v.string(),
	name: v.string(),
	color: v.string(),
	createdAt: v.number()
});

const conditionValidator = v.union(
	v.literal('mint'),
	v.literal('near_mint'),
	v.literal('good'),
	v.literal('poor'),
	v.literal('damaged')
);

const guestItemValidator = v.object({
	id: v.string(),
	listId: v.string(),
	catalogRef: v.object({
		type: v.string(),
		number: v.number()
	}),
	condition: conditionValidator,
	quantity: v.number(),
	complete: v.boolean(),
	tags: v.array(v.string())
});

interface PlannedItemInsert {
	catalogItemId: Id<'catalogItems'>;
	condition: Doc<'listItems'>['condition'];
	quantity: number;
	complete: boolean;
	tags: string[];
}

interface PlannedListCreate {
	guestListId: string;
	name: string;
	color: string;
	createdAt: number;
	items: PlannedItemInsert[];
}

interface PlannedListMerge {
	targetListId: Id<'lists'>;
	items: PlannedItemInsert[];
}

interface MigrationPreflight {
	result: MigrationResult;
	operations: {
		creates: PlannedListCreate[];
		merges: PlannedListMerge[];
	};
}

const emptyOperations = {
	creates: [],
	merges: []
} satisfies MigrationPreflight['operations'];

const createPartialResult = ({
	listsProcessed,
	itemsProcessed,
	reasons,
	listCapExceeded = false,
	missingCatalogReferences = []
}: {
	listsProcessed: number;
	itemsProcessed: number;
	reasons: MigrationPartialReason[];
	listCapExceeded?: boolean;
	missingCatalogReferences?: Array<{ type: string; number: number }>;
}): MigrationResult => ({
	status: 'partial_or_retry_needed',
	safeToClearGuestData: false,
	listsProcessed,
	itemsProcessed,
	reasons,
	conflicts: {
		listCapExceeded,
		missingCatalogReferences
	}
});

export const preflightGuestMigrationInternal = internalQuery({
	args: {
		ownerSubject: v.string(),
		guestSessionId: v.string(),
		lists: v.array(guestListValidator),
		items: v.array(guestItemValidator)
	},
	handler: async (ctx, args): Promise<MigrationPreflight> => {
		const listsProcessed = args.lists.length;
		const itemsProcessed = args.items.length;

		const existingCompletion = await ctx.db
			.query('migrationCompletions')
			.withIndex('by_owner_guest_session', (q) =>
				q.eq('ownerSubject', args.ownerSubject).eq('guestSessionId', args.guestSessionId)
			)
			.unique();

		if (existingCompletion !== null) {
			return {
				result: {
					status: 'already_migrated',
					safeToClearGuestData: true,
					listsProcessed,
					itemsProcessed,
					completedAt: existingCompletion.migratedAt
				},
				operations: emptyOperations
			};
		}

		const guestListIds = new Set(args.lists.map((list) => list.id));
		if (guestListIds.size !== args.lists.length) {
			return {
				result: createPartialResult({
					listsProcessed,
					itemsProcessed,
					reasons: ['guest_payload_invalid']
				}),
				operations: emptyOperations
			};
		}

		for (const item of args.items) {
			if (!guestListIds.has(item.listId)) {
				return {
					result: createPartialResult({
						listsProcessed,
						itemsProcessed,
						reasons: ['guest_payload_invalid']
					}),
					operations: emptyOperations
				};
			}
		}

		const existingLists = await ctx.db
			.query('lists')
			.withIndex('by_owner', (q) => q.eq('ownerSubject', args.ownerSubject))
			.collect();

		const existingListByName = new Map(existingLists.map((list) => [list.name, list]));
		const createPlans: PlannedListCreate[] = [];
		const mergePlansByListId = new Map<Id<'lists'>, PlannedListMerge>();

		for (const guestList of args.lists) {
			const existingList = existingListByName.get(guestList.name);
			if (existingList === undefined) {
				createPlans.push({
					guestListId: guestList.id,
					name: guestList.name,
					color: guestList.color,
					createdAt: guestList.createdAt,
					items: []
				});
				continue;
			}

			if (!mergePlansByListId.has(existingList._id)) {
				mergePlansByListId.set(existingList._id, {
					targetListId: existingList._id,
					items: []
				});
			}
		}

		if (existingLists.length + createPlans.length > 3) {
			return {
				result: createPartialResult({
					listsProcessed,
					itemsProcessed,
					reasons: ['auth_list_cap_reached'],
					listCapExceeded: true
				}),
				operations: emptyOperations
			};
		}

		const catalogByKey = new Map<string, Doc<'catalogItems'>>();
		const missingCatalogReferences: Array<{ type: string; number: number }> = [];

		for (const item of args.items) {
			const catalogKey = `${item.catalogRef.type}:${item.catalogRef.number}`;
			if (catalogByKey.has(catalogKey)) {
				continue;
			}

			const catalogItem = await ctx.db
				.query('catalogItems')
				.withIndex('by_type_number', (q) =>
					q.eq('type', item.catalogRef.type).eq('number', item.catalogRef.number)
				)
				.unique();

			if (catalogItem === null) {
				missingCatalogReferences.push({
					type: item.catalogRef.type,
					number: item.catalogRef.number
				});
				continue;
			}

			catalogByKey.set(catalogKey, catalogItem);
		}

		if (missingCatalogReferences.length > 0) {
			return {
				result: createPartialResult({
					listsProcessed,
					itemsProcessed,
					reasons: ['catalog_reference_not_found'],
					missingCatalogReferences
				}),
				operations: emptyOperations
			};
		}

		const createPlanByGuestListId = new Map(createPlans.map((plan) => [plan.guestListId, plan]));
		const existingCatalogItemIdsByListId = new Map<Id<'lists'>, Set<Id<'catalogItems'>>>();

		for (const mergePlan of mergePlansByListId.values()) {
			const existingItems = await ctx.db
				.query('listItems')
				.withIndex('by_list', (q) => q.eq('listId', mergePlan.targetListId))
				.collect();

			existingCatalogItemIdsByListId.set(
				mergePlan.targetListId,
				new Set(existingItems.map((item) => item.catalogItemId))
			);
		}

		for (const item of args.items) {
			const catalogKey = `${item.catalogRef.type}:${item.catalogRef.number}`;
			const catalogItem = catalogByKey.get(catalogKey);
			if (catalogItem === undefined) {
				return {
					result: createPartialResult({
						listsProcessed,
						itemsProcessed,
						reasons: ['migration_state_changed']
					}),
					operations: emptyOperations
				};
			}

			const createPlan = createPlanByGuestListId.get(item.listId);
			if (createPlan !== undefined) {
				createPlan.items.push({
					catalogItemId: catalogItem._id,
					condition: item.condition,
					quantity: item.quantity,
					complete: item.complete,
					tags: item.tags
				});
				continue;
			}

			const guestList = args.lists.find((list) => list.id === item.listId);
			if (guestList === undefined) {
				return {
					result: createPartialResult({
						listsProcessed,
						itemsProcessed,
						reasons: ['guest_payload_invalid']
					}),
					operations: emptyOperations
				};
			}

			const existingList = existingListByName.get(guestList.name);
			if (existingList === undefined) {
				return {
					result: createPartialResult({
						listsProcessed,
						itemsProcessed,
						reasons: ['migration_state_changed']
					}),
					operations: emptyOperations
				};
			}

			const mergePlan = mergePlansByListId.get(existingList._id);
			if (mergePlan === undefined) {
				return {
					result: createPartialResult({
						listsProcessed,
						itemsProcessed,
						reasons: ['migration_state_changed']
					}),
					operations: emptyOperations
				};
			}

			const existingCatalogIds = existingCatalogItemIdsByListId.get(existingList._id);
			if (existingCatalogIds?.has(catalogItem._id)) {
				continue;
			}

			mergePlan.items.push({
				catalogItemId: catalogItem._id,
				condition: item.condition,
				quantity: item.quantity,
				complete: item.complete,
				tags: item.tags
			});
		}

		return {
			result: {
				status: 'fully_migrated',
				safeToClearGuestData: true,
				listsProcessed,
				itemsProcessed
			},
			operations: {
				creates: createPlans,
				merges: [...mergePlansByListId.values()]
			}
		};
	}
});

export const applyGuestMigrationInternal = internalMutation({
	args: {
		ownerSubject: v.string(),
		guestSessionId: v.string(),
		listsProcessed: v.number(),
		itemsProcessed: v.number(),
		creates: v.array(
			v.object({
				guestListId: v.string(),
				name: v.string(),
				color: v.string(),
				createdAt: v.number(),
				items: v.array(
					v.object({
						catalogItemId: v.id('catalogItems'),
						condition: conditionValidator,
						quantity: v.number(),
						complete: v.boolean(),
						tags: v.array(v.string())
					})
				)
			})
		),
		merges: v.array(
			v.object({
				targetListId: v.id('lists'),
				items: v.array(
					v.object({
						catalogItemId: v.id('catalogItems'),
						condition: conditionValidator,
						quantity: v.number(),
						complete: v.boolean(),
						tags: v.array(v.string())
					})
				)
			})
		)
	},
	handler: async (ctx, args): Promise<MigrationResult> => {
		const existingCompletion = await ctx.db
			.query('migrationCompletions')
			.withIndex('by_owner_guest_session', (q) =>
				q.eq('ownerSubject', args.ownerSubject).eq('guestSessionId', args.guestSessionId)
			)
			.unique();

		if (existingCompletion !== null) {
			return {
				status: 'already_migrated',
				safeToClearGuestData: true,
				listsProcessed: args.listsProcessed,
				itemsProcessed: args.itemsProcessed,
				completedAt: existingCompletion.migratedAt
			};
		}

		const currentLists = await ctx.db
			.query('lists')
			.withIndex('by_owner', (q) => q.eq('ownerSubject', args.ownerSubject))
			.collect();

		if (currentLists.length + args.creates.length > 3) {
			return createPartialResult({
				listsProcessed: args.listsProcessed,
				itemsProcessed: args.itemsProcessed,
				reasons: ['auth_list_cap_reached'],
				listCapExceeded: true
			});
		}

		for (const merge of args.merges) {
			const targetList = await ctx.db.get(merge.targetListId);
			if (targetList === null || targetList.ownerSubject !== args.ownerSubject) {
				return createPartialResult({
					listsProcessed: args.listsProcessed,
					itemsProcessed: args.itemsProcessed,
					reasons: ['migration_state_changed']
				});
			}
		}

		for (const create of args.creates) {
			const listId = await ctx.db.insert('lists', {
				name: create.name,
				color: create.color,
				description: undefined,
				ownerSubject: args.ownerSubject
			});

			for (const item of create.items) {
				await ctx.db.insert('listItems', {
					listId,
					catalogItemId: item.catalogItemId,
					condition: item.condition,
					quantity: item.quantity,
					complete: item.complete,
					tags: item.tags
				});
			}
		}

		for (const merge of args.merges) {
			const existingItems = await ctx.db
				.query('listItems')
				.withIndex('by_list', (q) => q.eq('listId', merge.targetListId))
				.collect();
			const existingCatalogIds = new Set(existingItems.map((item) => item.catalogItemId));

			for (const item of merge.items) {
				if (existingCatalogIds.has(item.catalogItemId)) {
					continue;
				}

				await ctx.db.insert('listItems', {
					listId: merge.targetListId,
					catalogItemId: item.catalogItemId,
					condition: item.condition,
					quantity: item.quantity,
					complete: item.complete,
					tags: item.tags
				});
			}
		}

		await ctx.db.insert('migrationCompletions', {
			ownerSubject: args.ownerSubject,
			guestSessionId: args.guestSessionId,
			migratedAt: Date.now()
		});

		return {
			status: 'fully_migrated',
			safeToClearGuestData: true,
			listsProcessed: args.listsProcessed,
			itemsProcessed: args.itemsProcessed
		};
	}
});
