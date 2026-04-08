<script lang="ts">
	import type { Id } from '../../../convex/_generated/dataModel';
	import CatalogItemCard from './CatalogItemCard.svelte';
	import { catalogKeyForReference } from '$lib/lists/listTypes';

	let {
		items,
		isLoading,
		error,
		hasSelection,
		isSelectable = false,
		selectedKeys = new Set(),
		onToggleKey
	}: {
		items:
			| Array<{
					_id: Id<'catalogItems'>;
					type: string;
					number: number;
					name?: string;
					imageUrl: string | null;
					edition?: string;
			  }>
			| undefined;
		isLoading: boolean;
		error: string | null;
		hasSelection: boolean;
		isSelectable?: boolean;
		selectedKeys?: Set<string>;
		onToggleKey?: (key: string) => void;
	} = $props();
</script>

<div class="p-6">
	{#if !hasSelection}
		<div class="flex flex-col items-center justify-center py-20 text-center">
			<h2 class="text-base font-semibold text-stone-900">Select a range to browse</h2>
			<p class="mt-1 text-sm text-stone-400">
				Choose a type and number range from the sidebar to see items.
			</p>
		</div>
	{:else if isLoading}
		<div class="flex items-center justify-center py-20 text-sm text-stone-400">
			Loading items...
		</div>
	{:else if error}
		<div class="flex items-center justify-center py-20 text-sm text-red-500">
			{error} Failed to load items. Refresh or select a different range.
		</div>
	{:else if items}
		{#if items.length === 0}
			<div class="flex items-center justify-center py-20 text-sm text-stone-400">
				No items in this range.
			</div>
		{:else}
			<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
				{#each items as item (item._id)}
					{@const key = catalogKeyForReference({ type: item.type, number: item.number })}
					<CatalogItemCard
						{item}
						{isSelectable}
						isSelected={selectedKeys.has(key)}
						onToggleSelected={() => onToggleKey?.(key)}
					/>
				{/each}
			</div>
		{/if}
	{/if}
</div>
