<script lang="ts">
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import SidebarRangeRow from './SidebarRangeRow.svelte';

	let {
		diddlType,
		itemCount,
		selectedType,
		selectedFrom
	}: {
		diddlType: { slug: string; displayName: string };
		itemCount: number;
		selectedType: string | null;
		selectedFrom: number | null;
	} = $props();

	let ranges = $derived.by(() => {
		const numRanges = Math.ceil(itemCount / 100);
		return Array.from({ length: numRanges }, (_, i) => {
			const from = i * 100 + 1;
			const to = Math.min((i + 1) * 100, itemCount);
			return {
				from,
				to,
				label: `${from}–${to}`
			};
		});
	});
</script>

<Accordion.Item value={diddlType.slug} class="border-0">
	<Accordion.Trigger
		class="flex min-h-[44px] w-full items-center justify-between rounded-md px-3 py-2 text-sm font-semibold text-stone-900 transition-colors hover:bg-stone-100 hover:no-underline [&[data-state=open]>svg]:rotate-180"
	>
		{diddlType.displayName}
	</Accordion.Trigger>
	<Accordion.Content class="pt-1 pb-1">
		<div class="space-y-1">
			{#each ranges as range (range.from)}
				<SidebarRangeRow
					type={diddlType.slug}
					from={range.from}
					to={range.to}
					label={range.label}
					isActive={selectedType === diddlType.slug && selectedFrom === range.from}
					completionPercent={null}
				/>
			{/each}
		</div>
	</Accordion.Content>
</Accordion.Item>
