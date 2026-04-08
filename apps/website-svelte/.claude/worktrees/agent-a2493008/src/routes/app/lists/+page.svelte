<script lang="ts">
	import { getListStoreContext } from '$lib/lists/listStoreContext.svelte';
	import { getClerkContext } from '$lib/stores/clerk.svelte';
	import ListCard from '$lib/components/lists/ListCard.svelte';
	import { Button } from '$lib/components/ui/button';
	import CreateListDialog from '$lib/components/lists/CreateListDialog.svelte';
	import UpgradePrompt from '$lib/components/layout/UpgradePrompt.svelte';
	import { Plus } from 'lucide-svelte';

	const store = getListStoreContext();
	const clerkContext = getClerkContext();
	const lists = $derived(store.lists);
	const canCreate = $derived(lists.length < 1);

	let createOpen = $state(false);
</script>

<div class="container mx-auto max-w-7xl px-4 py-8">
	<div class="mb-8 flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-semibold">My Lists</h1>
			<p class="mt-1 text-sm text-muted-foreground">
				Manage your collection lists and track progress.
			</p>
		</div>
		<div
			class="relative"
			title={!canCreate ? 'Guests can create 1 list. Sign up for unlimited lists.' : ''}
		>
			<Button onclick={() => (createOpen = true)} disabled={!canCreate}>
				<Plus class="mr-2 size-4" />
				Create List
			</Button>
		</div>
	</div>

	{#if lists.length === 0}
		<div
			class="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/30 py-24 text-center"
		>
			<h3 class="text-base font-semibold">No lists yet</h3>
			<p class="mt-1 max-w-xs text-sm text-muted-foreground">
				Create your first list to start tracking your Diddl collection.
			</p>
			<Button variant="default" class="mt-4" onclick={() => (createOpen = true)}>
				Create List
			</Button>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each lists as list (list.id)}
				<ListCard {list} />
			{/each}
		</div>
	{/if}
</div>

{#if !clerkContext.currentUser}
	<div class="mt-8">
		<UpgradePrompt message="Sign up to sync across devices" />
	</div>
{/if}

<CreateListDialog bind:open={createOpen} />
