<script lang="ts">
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import SidebarTypeRow from './SidebarTypeRow.svelte';

	let {
		diddlTypes,
		selectedType,
		selectedFrom
	}: {
		diddlTypes: Array<{
			_id: any;
			slug: string;
			displayName: string;
			sortOrder: number;
			itemCount: number;
		}>;
		selectedType: string | null;
		selectedFrom: number | null;
	} = $props();
</script>

<aside
	class="sticky top-0 h-screen w-64 shrink-0 overflow-y-auto border-r border-stone-200 bg-stone-50 p-2"
>
	{#if !diddlTypes || diddlTypes.length === 0}
		<div class="px-3 py-2 text-sm text-stone-400">Loading catalog...</div>
	{:else}
		<Accordion.Root
			type="multiple"
			value={selectedType ? [selectedType] : undefined}
			class="space-y-1"
		>
			{#each diddlTypes as type (type._id)}
				<SidebarTypeRow diddlType={type} itemCount={type.itemCount} {selectedType} {selectedFrom} />
			{/each}
		</Accordion.Root>
	{/if}
</aside>
