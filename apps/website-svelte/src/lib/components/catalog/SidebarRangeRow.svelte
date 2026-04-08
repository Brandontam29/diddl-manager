<script lang="ts">
	import CompletionBadge from './CompletionBadge.svelte';

	let {
		type,
		from,
		to,
		label,
		isActive,
		completionPercent
	}: {
		type: string;
		from: number;
		to: number;
		label: string;
		isActive: boolean;
		completionPercent: number | null;
	} = $props();

	const href = $derived(`/app/catalog?type=${encodeURIComponent(type)}&from=${from}&to=${to}`);
</script>

<a
	{href}
	class="flex min-h-[44px] items-center justify-between px-3 py-2 text-sm transition-colors {isActive
		? 'bg-stone-900 text-white'
		: 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'} rounded-md"
	aria-current={isActive ? 'page' : undefined}
>
	<span>{label}</span>
	{#if completionPercent !== null}
		<CompletionBadge percent={completionPercent} tooltip="{completionPercent}% collected" />
	{/if}
</a>
