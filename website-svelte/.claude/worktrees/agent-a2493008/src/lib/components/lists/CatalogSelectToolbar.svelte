<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Loader2, Plus, X } from 'lucide-svelte';

	let {
		selectedCount,
		onAdd,
		onCancel,
		isLoading = false
	}: {
		selectedCount: number;
		onAdd: () => void;
		onCancel: () => void;
		isLoading?: boolean;
	} = $props();
</script>

<div
	class="fixed bottom-6 left-1/2 z-50 flex w-[calc(100%-3rem)] max-w-md -translate-x-1/2 items-center justify-between rounded-full border border-stone-200 bg-white/95 p-2 shadow-2xl backdrop-blur-sm sm:w-auto sm:min-w-[400px]"
>
	<div class="flex items-center gap-3 pl-4">
		<span class="text-sm font-medium text-stone-900">
			{selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
		</span>
	</div>

	<div class="flex items-center gap-2">
		<Button
			variant="ghost"
			size="sm"
			onclick={onCancel}
			class="h-9 rounded-full px-4 text-stone-500 hover:bg-stone-100"
		>
			Done Selecting
		</Button>
		<Button
			variant="default"
			size="sm"
			onclick={onAdd}
			disabled={selectedCount === 0 || isLoading}
			class="h-9 rounded-full bg-rose-600 px-6 font-semibold hover:bg-rose-700"
		>
			{#if isLoading}
				<Loader2 class="mr-2 h-4 w-4 animate-spin" />
			{:else}
				<Plus class="mr-2 h-4 w-4" />
			{/if}
			Add selected to list
		</Button>
	</div>
</div>
