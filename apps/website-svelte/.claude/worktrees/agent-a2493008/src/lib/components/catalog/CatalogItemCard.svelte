<script lang="ts">
	import type { Id } from '../../../convex/_generated/dataModel';
	import * as Card from '$lib/components/ui/card/index.js';
	import LazyImage from './LazyImage.svelte';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { cn } from '$lib/utils';

	let {
		item,
		isSelectable = false,
		isSelected = false,
		onToggleSelected
	}: {
		item: {
			type: string;
			number: number;
			name?: string;
			imageUrl: string | null;
			edition?: string;
		};
		isSelectable?: boolean;
		isSelected?: boolean;
		onToggleSelected?: () => void;
	} = $props();

	function handleClick() {
		if (isSelectable && onToggleSelected) {
			onToggleSelected();
		}
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
	onclick={handleClick}
	class={cn(
		'group relative cursor-pointer ring-offset-2 transition-all outline-none',
		isSelectable && isSelected && 'ring-2 ring-rose-500 ring-offset-0',
		!isSelectable && 'cursor-default'
	)}
>
	<Card.Root
		class={cn(
			'overflow-hidden rounded-lg border border-stone-200 bg-white transition-shadow',
			!isSelectable && 'hover:shadow-md',
			isSelectable && isSelected && 'border-rose-200 bg-rose-50/30'
		)}
	>
		<div class="relative aspect-square w-full">
			<LazyImage src={item.imageUrl} alt="{item.name ?? item.type} — image not yet available" />

			{#if isSelectable}
				<div
					class={cn(
						'absolute inset-0 flex items-start justify-end p-2 transition-opacity',
						isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
					)}
				>
					<div
						class={cn(
							'flex h-6 w-6 items-center justify-center rounded-full border bg-white shadow-sm',
							isSelected ? 'border-rose-500 bg-rose-500 text-white' : 'border-stone-300'
						)}
					>
						{#if isSelected}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="3"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="h-4 w-4"
							>
								<polyline points="20 6 9 17 4 12" />
							</svg>
						{/if}
					</div>
				</div>
			{/if}
		</div>

		<Card.Content class="p-3">
			<h3 class="truncate text-sm font-semibold text-stone-900">
				{item.name ?? item.type}
			</h3>
			<p class="text-xs text-stone-400">
				#{item.number}{item.edition ? ' · ' + item.edition : ''}
			</p>
		</Card.Content>
	</Card.Root>
</div>
