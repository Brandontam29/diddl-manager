import { SvelteSet } from 'svelte/reactivity';
import { toast } from 'svelte-sonner';
import { browser } from '$app/environment';
import {
	type GuestList,
	type GuestListItem,
	type ListStore,
	catalogKeyForReference,
	createDefaultGuestListItem
} from './listTypes';

const STORAGE_KEY = 'diddl-guest-data';

interface StoragePayload {
	lists: GuestList[];
	items: GuestListItem[];
	activeListId: string | null;
}

/**
 * Concrete implementation of ListStore for Guest mode.
 * Persists data to localStorage using Svelte 5 runes for reactivity.
 */
export function createGuestListStore(): ListStore {
	let lists = $state<GuestList[]>([]);
	let items = $state<GuestListItem[]>([]);
	let activeListId = $state<string | null>(null);
	let initialized = $state(false);

	// Load from localStorage on initialization
	if (browser) {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (raw) {
				const data = JSON.parse(raw) as StoragePayload;
				lists = data.lists || [];
				items = data.items || [];
				activeListId = data.activeListId || (lists[0]?.id ?? null);
			}
		} catch (e) {
			console.error('Failed to load guest list data from localStorage', e);
		}
		initialized = true;
	}

	// Auto-save effect
	$effect(() => {
		if (!initialized) return;
		try {
			const payload: StoragePayload = {
				lists: $state.snapshot(lists),
				items: $state.snapshot(items),
				activeListId: $state.snapshot(activeListId)
			};
			localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
		} catch (e) {
			console.error('Failed to save guest list data to localStorage', e);
			// Only toast on quota errors or actual failures in browser
			if (browser) {
				toast.error('Storage full. Sign up to save your collection reliably.');
			}
		}
	});

	return {
		get lists() {
			return lists;
		},
		get activeListId() {
			return activeListId;
		},
		get activeListItems() {
			return items.filter((i) => i.listId === activeListId);
		},

		createList(name: string, color: string) {
			if (lists.length >= 1) {
				toast.warning('Guest mode is limited to 1 list. Sign up to create more.');
				throw new Error('Guest limit exceeded');
			}
			const newList: GuestList = {
				id: crypto.randomUUID(),
				name,
				color,
				createdAt: Date.now()
			};
			lists.push(newList);
			if (!activeListId) {
				activeListId = newList.id;
			}
			return newList;
		},

		updateList(id, updates) {
			const index = lists.findIndex((l) => l.id === id);
			if (index !== -1) {
				lists[index] = { ...lists[index], ...updates };
			}
		},

		deleteList(id) {
			lists = lists.filter((l) => l.id !== id);
			items = items.filter((i) => i.listId !== id);
			if (activeListId === id) {
				activeListId = lists[0]?.id ?? null;
			}
		},

		setActiveList(id) {
			activeListId = id;
		},

		addCatalogItems(listId, refs) {
			const newItems = refs.map((ref) => createDefaultGuestListItem(listId, ref));
			items.push(...newItems);
		},

		removeItems(itemIds) {
			const idsToRemove = new SvelteSet(itemIds);
			items = items.filter((i) => !idsToRemove.has(i.id));
		},

		updateItems(itemIds, updates) {
			const idsToUpdate = new SvelteSet(itemIds);
			items.forEach((item, index) => {
				if (idsToUpdate.has(item.id)) {
					items[index] = { ...item, ...updates };
				}
			});
		},

		duplicateItems(itemIds) {
			const idsToDuplicate = new SvelteSet(itemIds);
			const duplicated: GuestListItem[] = [];
			const snapshotItems = $state.snapshot(items);
			snapshotItems.forEach((item) => {
				if (idsToDuplicate.has(item.id)) {
					const newItem: GuestListItem = {
						...item,
						id: crypto.randomUUID()
					};
					duplicated.push(newItem);
				}
			});
			items.push(...duplicated);
			return duplicated;
		},

		getCompletionPercent(listId) {
			const listItems = items.filter((i) => i.listId === listId);
			if (listItems.length === 0) return 0;
			const completeCount = listItems.filter((i) => i.complete).length;
			return Math.round((completeCount / listItems.length) * 100);
		},

		getOwnedCatalogKeys(listId) {
			const listItems = items.filter((i) => i.listId === listId);
			return new SvelteSet(listItems.map((i) => catalogKeyForReference(i.catalogRef)));
		},

		getItemCount(listId) {
			return items.filter((i) => i.listId === listId).length;
		},

		getOwnedCountByType(listId, type) {
			return items.filter((i) => i.listId === listId && i.catalogRef.type === type).length;
		},

		getOwnedCountByRange(listId, type, start, end) {
			return items.filter(
				(i) =>
					i.listId === listId &&
					i.catalogRef.type === type &&
					i.catalogRef.number >= start &&
					i.catalogRef.number <= end
			).length;
		}
	};
}
