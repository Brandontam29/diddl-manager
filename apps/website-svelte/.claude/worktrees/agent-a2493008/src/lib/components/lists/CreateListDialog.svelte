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
		onCreated
	}: {
		open?: boolean;
		onCreated?: (list: GuestList) => void;
	} = $props();

	const store = getListStoreContext();

	let name = $state('My Collection');
	let color = $state('#e11d48');
	let error = $state('');

	function handleCreate() {
		if (!name.trim()) {
			error = 'Name is required';
			return;
		}

		try {
			const newList = store.createList(name.trim(), color);
			open = false;
			onCreated?.(newList);
			// Reset form
			name = 'My Collection';
			color = '#e11d48';
			error = '';
		} catch (e) {
			// Guest limit toast is handled by store.createList
			console.error('Failed to create list:', e);
		}
	}

	$effect(() => {
		if (open) {
			error = '';
		}
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Create List</Dialog.Title>
			<Dialog.Description>
				Create your first list to start tracking your Diddl collection.
			</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid gap-2">
				<Label for="name" class={error ? 'text-destructive' : ''}>Name</Label>
				<Input
					id="name"
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
			<Button type="button" onclick={handleCreate}>Create List</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
