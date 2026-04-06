<script lang="ts">
	import { cn } from '$lib/utils.js';

	let {
		listId,
		type,
		from,
		to,
		label,
		isActive,
		owned,
		total,
		showCounts
	}: {
		listId: string;
		type: string;
		from: number;
		to: number;
		label: string;
		isActive: boolean;
		owned: number;
		total: number;
		showCounts: boolean;
	} = $props();

	const href = $derived(
		`/app/lists/${listId}?type=${encodeURIComponent(type)}&from=${from}&to=${to}`
	);
</script>

<a
	{href}
	class={cn(
		'flex min-h-[44px] items-center justify-between rounded-md px-3 py-2 text-sm transition-colors',
		isActive ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
	)}
	aria-current={isActive ? 'page' : undefined}
>
	<span>{label}</span>
	{#if showCounts}
		<span class={cn('text-xs font-medium', isActive ? 'text-stone-300' : 'text-stone-400')}>
			{owned}/{total}
		</span>
	{/if}
</a>
