<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import ColorPalette from './ColorPalette.svelte';
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

	let name = $state(list.name);
	let color = $state(list.color);
	let error = $state('');

	$effect(() => {
		if (open) {
			name = list.name;
			color = list.color;
			error = '';
		}
	});

	function handleUpdate() {
		if (!name.trim()) {
			error = 'Name is required';
			return;
		}

		store.updateList(list.id, {
			name: name.trim(),
			color
		});
		open = false;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Edit List</Dialog.Title>
			<Dialog.Description>Update your list name and color.</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid gap-2">
				<Label for="edit-name" class={error ? 'text-destructive' : ''}>Name</Label>
				<Input
					id="edit-name"
					bind:value={name}
					placeholder="My Collection"
					class={error ? 'border-destructive focus-visible:ring-destructive' : ''}
				/>
				{#if error}
					<p class="text-xs font-medium text-destructive">{error}</p>
				{/if}
			</div>
			<div class="grid gap-2">
				<Label>Color</Label>
				<ColorPalette bind:selected={color} />
			</div>
		</div>
		<Dialog.Footer>
			<Button type="button" onclick={handleUpdate}>Save Changes</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
