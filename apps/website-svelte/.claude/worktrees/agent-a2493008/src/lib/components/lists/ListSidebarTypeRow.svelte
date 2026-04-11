<script lang="ts">
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import ListSidebarRangeRow from './ListSidebarRangeRow.svelte';

	let {
		listId,
		diddlType,
		itemCount,
		selectedType,
		selectedFrom,
		showCounts,
		ownedCount,
		getOwnedCountByRange
	}: {
		listId: string;
		diddlType: { slug: string; displayName: string };
		itemCount: number;
		selectedType: string | null;
		selectedFrom: number | null;
		showCounts: boolean;
		ownedCount: number;
		getOwnedCountByRange: (type: string, from: number, to: number) => number;
	} = $props();

	let ranges = $derived.by(() => {
		const numRanges = Math.ceil(itemCount / 100);
		return Array.from({ length: numRanges }, (_, i) => {
			const from = i * 100 + 1;
			const to = Math.min((i + 1) * 100, itemCount);
			return {
				from,
				to,
				label: `${from}–${to}`,
				owned: getOwnedCountByRange(diddlType.slug, from, to)
			};
		});
	});
</script>

<Accordion.Item value={diddlType.slug} class="border-0">
	<Accordion.Trigger
		class="flex min-h-[44px] w-full items-center justify-between rounded-md px-3 py-2 text-sm font-semibold text-stone-900 transition-colors hover:bg-stone-100 hover:no-underline [&[data-state=open]>svg]:rotate-180"
	>
		<div class="flex items-center gap-2">
			<span>{diddlType.displayName}</span>
			{#if showCounts && ownedCount > 0}
				<span class="text-xs font-normal text-stone-400">({ownedCount})</span>
			{/if}
		</div>
	</Accordion.Trigger>
	<Accordion.Content class="pt-1 pb-1">
		<div class="space-y-1">
			{#each ranges as range (range.from)}
				<ListSidebarRangeRow
					{listId}
					type={diddlType.slug}
					from={range.from}
					to={range.to}
					label={range.label}
					isActive={selectedType === diddlType.slug && selectedFrom === range.from}
					owned={range.owned}
					total={range.to - range.from + 1}
					{showCounts}
				/>
			{/each}
		</div>
	</Accordion.Content>
</Accordion.Item>
