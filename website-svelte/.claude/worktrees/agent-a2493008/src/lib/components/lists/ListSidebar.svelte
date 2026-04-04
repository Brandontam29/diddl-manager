<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import { Hash } from 'lucide-svelte';
	import ListSidebarTypeRow from './ListSidebarTypeRow.svelte';

	let {
		listId,
		diddlTypes,
		selectedType,
		selectedFrom,
		getOwnedCountByType,
		getOwnedCountByRange
	}: {
		listId: string;
		diddlTypes: Array<{
			_id: any;
			slug: string;
			displayName: string;
			itemCount: number;
		}>;
		selectedType: string | null;
		selectedFrom: number | null;
		getOwnedCountByType: (type: string) => number;
		getOwnedCountByRange: (type: string, from: number, to: number) => number;
	} = $props();

	let showCounts = $state(true);
</script>

<aside
	class="sticky top-0 h-screen w-64 shrink-0 overflow-y-auto border-r border-stone-200 bg-stone-50 p-2"
>
	<div class="mb-2 flex items-center justify-between px-3 py-2">
		<span class="text-xs font-semibold uppercase tracking-wider text-stone-400">Categories</span>
		<Button
			variant="ghost"
			size="icon"
			class="h-6 w-6 text-stone-400 hover:text-stone-900"
			onclick={() => (showCounts = !showCounts)}
			aria-label="Toggle counts"
		>
			<Hash class="h-3.5 w-3.5" />
		</Button>
	</div>

	{#if !diddlTypes || diddlTypes.length === 0}
		<div class="px-3 py-2 text-sm text-stone-400">Loading categories...</div>
	{:else}
		<Accordion.Root
			type="multiple"
			value={selectedType ? [selectedType] : undefined}
			class="space-y-1"
		>
			{#each diddlTypes as type (type._id)}
				<ListSidebarTypeRow
					{listId}
					diddlType={type}
					itemCount={type.itemCount}
					{selectedType}
					{selectedFrom}
					{showCounts}
					ownedCount={getOwnedCountByType(type.slug)}
					{getOwnedCountByRange}
				/>
			{/each}
		</Accordion.Root>
	{/if}
</aside>
