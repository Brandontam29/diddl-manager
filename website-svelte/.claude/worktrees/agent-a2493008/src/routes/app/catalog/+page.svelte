<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { page } from '$app/stores';
	import { api } from '../../../convex/_generated/api';
	import CatalogSidebar from '$lib/components/catalog/CatalogSidebar.svelte';
	import CatalogGrid from '$lib/components/catalog/CatalogGrid.svelte';
	import CatalogSelectToolbar from '$lib/components/lists/CatalogSelectToolbar.svelte';
	import CreateListDialog from '$lib/components/lists/CreateListDialog.svelte';
	import { getListStoreContext } from '$lib/lists/listStoreContext.svelte';
	import { catalogReferenceFromKey } from '$lib/lists/listTypes';
	import { Button } from '$lib/components/ui/button';
	import { SvelteSet } from 'svelte/reactivity';

	const store = getListStoreContext();

	// URL-derived selection state — reactive to navigation
	const selectedType = $derived($page.url.searchParams.get('type'));
	const selectedFrom = $derived(Number($page.url.searchParams.get('from') ?? 0));
	const selectedTo = $derived(Number($page.url.searchParams.get('to') ?? 99));

	// Fetch DiddlTypes list (unauthenticated — catalog is public)
	const diddlTypesQuery = useQuery(api.authed.diddlTypes.list, {});

	// Fetch item counts per type (unauthenticated — used by sidebar for range derivation)
	const countsQuery = useQuery(api.authed.catalog.countByType, {});

	// Fetch catalog items for selected range; 'skip' when nothing selected
	const catalogQuery = useQuery(api.authed.catalog.listByRange, () =>
		selectedType !== null
			? { type: selectedType, fromNumber: selectedFrom, toNumber: selectedTo }
			: 'skip'
	);

	// Join diddlTypes with counts for the sidebar
	const diddlTypesWithCounts = $derived.by(() => {
		const types = diddlTypesQuery.data ?? [];
		const counts = countsQuery.data ?? [];
		const countMap = new Map(counts.map((c) => [c.slug, c.count]));
		return types.map((t) => ({ ...t, itemCount: countMap.get(t.slug) ?? 0 }));
	});

	// --- Select Mode State ---
	let selectMode = $state(false);
	let selectedCatalogKeys = $state(new SvelteSet<string>());
	let isCreateDialogOpen = $state(false);
	let isAdding = $state(false);

	function toggleKey(key: string) {
		if (selectedCatalogKeys.has(key)) {
			selectedCatalogKeys.delete(key);
		} else {
			selectedCatalogKeys.add(key);
		}
	}

	function handleExitSelectMode() {
		selectMode = false;
		selectedCatalogKeys.clear();
	}

	async function handleBulkAdd() {
		if (selectedCatalogKeys.size === 0) return;

		// Guests have at most one list.
		// If they have one, add directly.
		// If they have zero, open CreateListDialog first.
		const hasList = store.lists.length > 0;

		if (hasList) {
			const listId = store.lists[0].id;
			const refs = Array.from(selectedCatalogKeys).map(catalogReferenceFromKey);
			isAdding = true;
			try {
				store.addCatalogItems(listId, refs);
				handleExitSelectMode();
			} finally {
				isAdding = false;
			}
		} else {
			isCreateDialogOpen = true;
		}
	}

	function handleCreated(newList: { id: string }) {
		const refs = Array.from(selectedCatalogKeys).map(catalogReferenceFromKey);
		isAdding = true;
		try {
			store.addCatalogItems(newList.id, refs);
			handleExitSelectMode();
		} finally {
			isAdding = false;
		}
	}

	// Exit select mode when changing catalog range
	$effect(() => {
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		selectedType;
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		selectedFrom;
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		selectedTo;

		if (selectMode) {
			handleExitSelectMode();
		}
	});
</script>

<svelte:head>
	<title>Catalog — Diddl Manager</title>
</svelte:head>

<div class="flex h-screen overflow-hidden bg-stone-50">
	<CatalogSidebar diddlTypes={diddlTypesWithCounts} {selectedType} {selectedFrom} />

	<main class="relative min-w-0 flex-1 flex flex-col overflow-hidden">
		<!-- Header / Toolbar area -->
		<header class="flex h-16 shrink-0 items-center justify-between border-b border-stone-200 bg-white px-6">
			<div>
				<h1 class="text-lg font-semibold text-stone-900">
					{selectedType ? `${selectedType} #${selectedFrom}-${selectedTo}` : 'Catalog'}
				</h1>
			</div>

			{#if selectedType && catalogQuery.data && catalogQuery.data.length > 0}
				<div>
					<Button
						variant={selectMode ? 'secondary' : 'outline'}
						size="sm"
						onclick={() => (selectMode ? handleExitSelectMode() : (selectMode = true))}
						class="h-9 rounded-full px-4"
					>
						{selectMode ? 'Done Selecting' : 'Select'}
					</Button>
				</div>
			{/if}
		</header>

		<div class="flex-1 overflow-y-auto">
			<CatalogGrid
				items={catalogQuery.data}
				isLoading={catalogQuery.isLoading}
				error={catalogQuery.error
					? 'Failed to load items. Refresh or select a different range.'
					: null}
				hasSelection={selectedType !== null}
				isSelectable={selectMode}
				selectedKeys={selectedCatalogKeys}
				onToggleKey={toggleKey}
			/>
		</div>

		{#if selectMode}
			<CatalogSelectToolbar
				selectedCount={selectedCatalogKeys.size}
				onAdd={handleBulkAdd}
				onCancel={handleExitSelectMode}
				isLoading={isAdding}
			/>
		{/if}
	</main>
</div>

<CreateListDialog bind:open={isCreateDialogOpen} onCreated={handleCreated} />
