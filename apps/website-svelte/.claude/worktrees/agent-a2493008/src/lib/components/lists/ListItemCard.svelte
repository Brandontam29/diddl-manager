<script lang="ts">
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Plus, Check } from 'lucide-svelte';
	import LazyImage from '../catalog/LazyImage.svelte';
	import QuantityStepper from './QuantityStepper.svelte';
	import { cn } from '$lib/utils.js';
	import type { ItemCondition } from '$lib/lists/listTypes';

	let {
		item,
		ownedItem = null,
		isUnowned = false,
		isSelected = false,
		onSelectChange,
		onQuantityChange,
		onAddUnowned,
		class: className
	}: {
		item: {
			type: string;
			number: number;
			name?: string;
			imageUrl: string | null;
			edition?: string;
		};
		ownedItem?: {
			id: string;
			quantity: number;
			complete: boolean;
			condition: ItemCondition;
		} | null;
		isUnowned?: boolean;
		isSelected?: boolean;
		onSelectChange?: (selected: boolean) => void;
		onQuantityChange?: (newQuantity: number) => void;
		onAddUnowned?: () => void;
		class?: string;
	} = $props();
</script>

<Card.Root
	class={cn(
		'group relative overflow-hidden rounded-lg border bg-white transition-all',
		isUnowned ? 'border-dashed border-stone-300 opacity-60' : 'border-stone-200 hover:shadow-md',
		isSelected && 'ring-2 ring-stone-900 ring-offset-2',
		className
	)}
>
	<!-- Selection Checkbox (Owned only) -->
	{#if !isUnowned}
		<div class="absolute top-2 left-2 z-10">
			<Checkbox
				checked={isSelected}
				onCheckedChange={(v) => onSelectChange?.(!!v)}
				aria-label="Select {item.name ?? item.type} #{item.number}"
				class="bg-white/90 data-[state=checked]:bg-stone-900"
			/>
		</div>
	{/if}

	<!-- Completion Indicator (Owned only) -->
	{#if ownedItem?.complete}
		<div class="absolute top-2 right-2 z-10">
			<div class="rounded-full bg-emerald-500 p-1 text-white shadow-sm">
				<Check class="h-3 w-3" />
			</div>
		</div>
	{/if}

	<!-- Image Area -->
	<div class="relative aspect-square overflow-hidden bg-stone-50">
		<LazyImage src={item.imageUrl} alt="{item.name ?? item.type} — image not yet available" />

		<!-- Unowned Add Overlay -->
		{#if isUnowned}
			<div
				class="absolute inset-0 flex items-center justify-center bg-stone-900/5 opacity-0 transition-opacity group-hover:opacity-100"
			>
				<Button variant="secondary" size="sm" class="shadow-sm" onclick={() => onAddUnowned?.()}>
					<Plus class="mr-2 h-4 w-4" />
					Add to List
				</Button>
			</div>
		{/if}
	</div>

	<Card.Content class="p-3">
		<div class="flex flex-col gap-1">
			<h3 class="truncate text-sm font-semibold text-stone-900">
				{item.name ?? item.type}
			</h3>
			<p class="text-xs text-stone-400">
				#{item.number}{item.edition ? ' · ' + item.edition : ''}
			</p>

			<div class="mt-2 flex items-center justify-between">
				{#if !isUnowned && ownedItem}
					<QuantityStepper
						value={ownedItem.quantity}
						onValueChange={(v) => onQuantityChange?.(v)}
					/>

					<span class="text-[10px] font-medium tracking-wider text-stone-400 uppercase">
						{ownedItem.condition.replace('_', ' ')}
					</span>
				{:else if isUnowned}
					<Button
						variant="ghost"
						size="sm"
						class="h-7 px-2 text-xs text-stone-500 hover:text-stone-900"
						onclick={() => onAddUnowned?.()}
					>
						<Plus class="h-3.3 mr-1 w-3.5" />
						Add
					</Button>
				{/if}
			</div>
		</div>
	</Card.Content>
</Card.Root>
