<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { page } from '$app/stores';
	import { api } from '../../../../convex/_generated/api';
	import { getListStoreContext } from '$lib/lists/listStoreContext.svelte';
	import ListSidebar from '$lib/components/lists/ListSidebar.svelte';
	import ListToolbar from '$lib/components/lists/ListToolbar.svelte';
	import ListItemCard from '$lib/components/lists/ListItemCard.svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { catalogKeyForReference, type ItemCondition } from '$lib/lists/listTypes';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	const listId = $derived($page.params.id as string);
	const store = getListStoreContext();

	// Navigation state from URL
	const selectedType = $derived($page.url.searchParams.get('type'));
	const selectedFrom = $derived(Number($page.url.searchParams.get('from') ?? 0));
	const selectedTo = $derived(Number($page.url.searchParams.get('to') ?? 99));

	// Page-level UI state
	let showUnowned = $state(false);
	let missingOnly = $state(false);
	let selectedItemIds = $state(new SvelteSet<string>());

	// Ensure we're viewing the correct list in the store
	$effect(() => {
		if (listId && store.activeListId !== listId) {
			store.setActiveList(listId);
		}
	});

	// Redirect if list doesn't exist
	onMount(() => {
		if (!store.lists.find((l) => l.id === listId)) {
			goto('/app/lists');
		}
	});

	const list = $derived(store.lists.find((l) => l.id === listId));

	// Fetch DiddlTypes and catalog counts for the sidebar
	const diddlTypesQuery = useQuery(api.authed.diddlTypes.list, {});
	const countsQuery = useQuery(api.authed.catalog.countByType, {});

	// Fetch catalog items for the current range (used when showUnowned is true)
	const catalogQuery = useQuery(api.authed.catalog.listByRange, () =>
		showUnowned && selectedType !== null
			? { type: selectedType, fromNumber: selectedFrom, toNumber: selectedTo }
			: 'skip'
	);

	// Join diddlTypes with counts for the sidebar
	const diddlTypesWithCounts = $derived.by(() => {
		const types = diddlTypesQuery.data ?? [];
		const counts = countsQuery.data ?? [];
		const countMap = new Map(counts.map((c) => [c.slug, c.count]));
		return types.map((t) => ({
			_id: t._id,
			slug: t.slug,
			displayName: t.displayName,
			itemCount: countMap.get(t.slug) ?? 0
		}));
	});

	// Filter owned items by type/range and missing-only
	const filteredOwnedItems = $derived.by(() => {
		let items = store.activeListItems;

		// Filter by selected category if applicable
		if (selectedType !== null) {
			items = items.filter(
				(i) =>
					i.catalogRef.type === selectedType &&
					i.catalogRef.number >= selectedFrom &&
					i.catalogRef.number <= selectedTo
			);
		}

		// Filter by missing-only
		if (missingOnly) {
			items = items.filter((i) => !i.complete);
		}

		return items;
	});

	// Derive unowned catalog items for the current range
	const unownedItems = $derived.by(() => {
		if (!showUnowned || !catalogQuery.data) return [];
		const ownedKeys = store.getOwnedCatalogKeys(listId);
		return catalogQuery.data.filter((item) => !ownedKeys.has(catalogKeyForReference(item)));
	});

	// Bulk actions
	function handleDuplicate() {
		const newItems = store.duplicateItems(Array.from(selectedItemIds));
		selectedItemIds.clear();
		// Automatically select the new duplicates? No, keep it simple.
	}

	function handleMarkComplete() {
		store.updateItems(Array.from(selectedItemIds), { complete: true });
		selectedItemIds.clear();
	}

	function handleMarkIncomplete() {
		store.updateItems(Array.from(selectedItemIds), { complete: false });
		selectedItemIds.clear();
	}

	function handleSetCondition(condition: ItemCondition) {
		store.updateItems(Array.from(selectedItemIds), { condition });
		selectedItemIds.clear();
	}

	function handleRemove() {
		store.removeItems(Array.from(selectedItemIds));
		selectedItemIds.clear();
	}

	function handleToggleSelection(id: string, selected: boolean) {
		if (selected) {
			selectedItemIds.add(id);
		} else {
			selectedItemIds.delete(id);
		}
	}
</script>

<svelte:head>
	<title>{list?.name ?? 'List'} — Diddl Manager</title>
</svelte:head>

<div class="flex h-screen overflow-hidden bg-stone-50">
	<ListSidebar
		{listId}
		diddlTypes={diddlTypesWithCounts}
		{selectedType}
		{selectedFrom}
		getOwnedCountByType={(type) => store.getOwnedCountByType(listId, type)}
		getOwnedCountByRange={(type, from, to) => store.getOwnedCountByRange(listId, type, from, to)}
	/>

	<div class="flex min-w-0 flex-1 flex-col">
		<ListToolbar
			listName={list?.name ?? 'Loading...'}
			completionPercent={store.getCompletionPercent(listId)}
			selectedCount={selectedItemIds.size}
			{showUnowned}
			{missingOnly}
			onToggleShowUnowned={() => (showUnowned = !showUnowned)}
			onToggleMissingOnly={() => (missingOnly = !missingOnly)}
			onDuplicate={handleDuplicate}
			onMarkComplete={handleMarkComplete}
			onMarkIncomplete={handleMarkIncomplete}
			onSetCondition={handleSetCondition}
			onRemove={handleRemove}
		/>

		<main class="flex-1 overflow-y-auto p-6">
			{#if selectedType === null}
				<div class="flex flex-col items-center justify-center py-24 text-center">
					<div class="rounded-full bg-stone-100 p-6">
						<svg
							class="h-12 w-12 text-stone-300"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.5"
								d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
							/>
						</svg>
					</div>
					<h3 class="mt-4 text-lg font-semibold text-stone-900">Select a category</h3>
					<p class="mt-2 max-w-sm text-stone-500">
						Choose a Diddl type and range from the sidebar to manage your items.
					</p>
				</div>
			{:else if filteredOwnedItems.length === 0 && unownedItems.length === 0}
				<div class="flex flex-col items-center justify-center py-24 text-center">
					<h3 class="text-lg font-semibold text-stone-900">No items found</h3>
					<p class="mt-2 text-stone-500">
						{missingOnly
							? 'All items in this range are marked as complete!'
							: 'This range is empty in the catalog.'}
					</p>
				</div>
			{:else}
				<div
					class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
				>
					<!-- Owned Items -->
					{#each filteredOwnedItems as ownedItem (ownedItem.id)}
						<ListItemCard
							item={{
								type: ownedItem.catalogRef.type,
								number: ownedItem.catalogRef.number,
								imageUrl: null // In Phase 2, we don't have catalog item details in the store,
								// so images will be missing unless we join or fetch them.
								// For guest mode, we might just show placeholders or
								// assume unowned cards (below) provide the images.
							}}
							{ownedItem}
							isSelected={selectedItemIds.has(ownedItem.id)}
							onSelectChange={(selected) => handleToggleSelection(ownedItem.id, selected)}
							onQuantityChange={(v) => store.updateItems([ownedItem.id], { quantity: v })}
						/>
					{/each}

					<!-- Unowned Items (Catalog Join) -->
					{#if showUnowned}
						{#each unownedItems as item (catalogKeyForReference(item))}
							<ListItemCard
								item={{
									type: item.type,
									number: item.number,
									imageUrl: item.imageUrl,
									edition: item.edition,
									name: item.name
								}}
								isUnowned={true}
								onAddUnowned={() => store.addCatalogItems(listId, [item])}
							/>
						{/each}
					{/if}
				</div>
			{/if}
		</main>
	</div>
</div>
