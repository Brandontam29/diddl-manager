<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { getListStoreContext } from '$lib/lists/listStoreContext.svelte';
	import type { GuestList } from '$lib/lists/listTypes';

	let {
		open = $bindable(false),
		list
	}: {
		open?: boolean;
		list: GuestList;
	} = $props();

	const store = getListStoreContext();
	const itemCount = $derived(store.getItemCount(list.id));

	function handleDelete() {
		store.deleteList(list.id);
		open = false;
	}
</script>

<AlertDialog.Root bind:open>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Delete List</AlertDialog.Title>
			<AlertDialog.Description>
				Are you sure? This will permanently delete "{list.name}" and {itemCount} items.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Keep List</AlertDialog.Cancel>
			<AlertDialog.Action
				onclick={handleDelete}
				class="text-destructive-foreground bg-destructive hover:bg-destructive/90"
			>
				Delete
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
