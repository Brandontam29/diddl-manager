<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Pencil, Trash2 } from 'lucide-svelte';
	import CompletionBadge from '$lib/components/catalog/CompletionBadge.svelte';
	import type { GuestList } from '$lib/lists/listTypes';
	import { getListStoreContext } from '$lib/lists/listStoreContext.svelte';
	import EditListDialog from './EditListDialog.svelte';
	import DeleteListDialog from './DeleteListDialog.svelte';

	let { list }: { list: GuestList } = $props();

	const store = getListStoreContext();
	const completionPercent = $derived(store.getCompletionPercent(list.id));
	const itemCount = $derived(store.getItemCount(list.id));

	let editOpen = $state(false);
	let deleteOpen = $state(false);
</script>

<Card.Root
	class="relative cursor-pointer overflow-hidden transition-shadow hover:shadow-md"
	onclick={() => (window.location.href = `/app/lists/${list.id}`)}
>
	<div class="h-1 w-full" style="background-color: {list.color}"></div>
	<Card.Header class="pb-2">
		<div class="flex items-start justify-between">
			<Card.Title class="max-w-[calc(100%-64px)] truncate text-sm font-semibold">
				{list.name}
			</Card.Title>
			<div class="-mt-2 -mr-2 flex gap-1" onclick={(e) => e.stopPropagation()}>
				<Button
					variant="ghost"
					size="icon"
					class="size-8"
					aria-label="Edit {list.name}"
					onclick={() => (editOpen = true)}
				>
					<Pencil class="size-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					class="size-8 hover:text-destructive"
					aria-label="Delete {list.name}"
					onclick={() => (deleteOpen = true)}
				>
					<Trash2 class="size-4" />
				</Button>
			</div>
		</div>
	</Card.Header>
	<Card.Content>
		<div class="flex items-center justify-between">
			<span class="text-xs text-muted-foreground">{itemCount} items</span>
			<CompletionBadge percent={completionPercent} tooltip={`${completionPercent}% complete`} />
		</div>
	</Card.Content>
</Card.Root>

<EditListDialog bind:open={editOpen} {list} />
<DeleteListDialog bind:open={deleteOpen} {list} />
