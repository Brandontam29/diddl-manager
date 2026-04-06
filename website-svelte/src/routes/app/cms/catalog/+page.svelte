<script lang="ts">
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '../../../../convex/_generated/api';
	import { getClerkContext } from '$lib/stores/clerk.svelte';
	import { goto } from '$app/navigation';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { toast } from 'svelte-sonner';
	import type { Id } from '../../../../convex/_generated/dataModel';

	const clerkContext = getClerkContext();
	const client = useConvexClient();
	const user = $derived(clerkContext.currentUser);

	// Admin check: redirect non-admins
	const isAdmin = $derived(user?.publicMetadata?.role === 'admin');

	$effect(() => {
		if (clerkContext.isClerkLoaded && !user) {
			goto('/app');
		}
		if (clerkContext.isClerkLoaded && user && !isAdmin) {
			goto('/app');
		}
	});

	// Filters
	let filterType = $state('');
	let filterStatus = $state<'draft' | 'published' | 'archived' | ''>('');

	// Build query args — pass undefined for empty filters
	const queryArgs = $derived({
		type: filterType || undefined,
		status: filterStatus || undefined
	});

	const catalogQuery = useQuery(api.authed.cmsCatalog.listAll, () =>
		isAdmin ? queryArgs : 'skip'
	);

	const diddlTypesQuery = useQuery(api.authed.diddlTypes.list, {});
	const diddlTypes = $derived(diddlTypesQuery.data ?? []);
	const items = $derived(catalogQuery.data ?? []);

	// Create/Edit dialog state
	let showFormDialog = $state(false);
	let editingId = $state<Id<'catalogItems'> | null>(null);
	let formType = $state('');
	let formNumber = $state(0);
	let formName = $state('');
	let formEdition = $state('');
	let formSaving = $state(false);

	function openCreateDialog() {
		editingId = null;
		formType = diddlTypes.length > 0 ? diddlTypes[0].slug : '';
		formNumber = 0;
		formName = '';
		formEdition = '';
		showFormDialog = true;
	}

	function openEditDialog(item: (typeof items)[number]) {
		editingId = item._id;
		formType = item.type;
		formNumber = item.number;
		formName = item.name ?? '';
		formEdition = item.edition ?? '';
		showFormDialog = true;
	}

	async function handleFormSubmit() {
		formSaving = true;
		try {
			if (editingId) {
				await client.mutation(api.authed.cmsCatalog.updateCatalogItem, {
					id: editingId,
					name: formName || undefined,
					edition: formEdition || undefined
				});
				toast.success('Item updated');
			} else {
				await client.mutation(api.authed.cmsCatalog.createCatalogItem, {
					type: formType,
					number: formNumber,
					name: formName || undefined,
					edition: formEdition || undefined
				});
				toast.success('Draft item created');
			}
			showFormDialog = false;
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Operation failed');
		} finally {
			formSaving = false;
		}
	}

	// Publish
	let publishingId = $state<Id<'catalogItems'> | null>(null);

	async function handlePublish(id: Id<'catalogItems'>) {
		publishingId = id;
		try {
			await client.mutation(api.authed.cmsCatalog.publishCatalogItem, { id });
			toast.success('Item published');
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Publish failed');
		} finally {
			publishingId = null;
		}
	}

	// Archive
	let archiveTarget = $state<{ id: Id<'catalogItems'>; label: string } | null>(null);
	let archiving = $state(false);

	async function handleArchiveConfirm() {
		if (!archiveTarget) return;
		archiving = true;
		try {
			const result = await client.mutation(api.authed.cmsCatalog.archiveCatalogItem, {
				id: archiveTarget.id
			});
			toast.success(`Item archived. ${result.taggedListItems} user list items tagged.`);
			archiveTarget = null;
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Archive failed');
		} finally {
			archiving = false;
		}
	}

	function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
		if (status === 'published') return 'default';
		if (status === 'draft') return 'secondary';
		if (status === 'archived') return 'outline';
		return 'secondary';
	}
</script>

{#if !isAdmin}
	<div class="flex h-full items-center justify-center p-8">
		<p class="text-muted-foreground">Redirecting...</p>
	</div>
{:else}
	<div class="mx-auto max-w-6xl p-6">
		<div class="mb-6 flex items-center justify-between">
			<div>
				<h1 class="text-2xl font-bold">Catalog CMS</h1>
				<p class="text-sm text-muted-foreground">Manage catalog items</p>
			</div>
			<Button onclick={openCreateDialog}>Create Draft</Button>
		</div>

		<!-- Filters -->
		<div class="mb-4 flex gap-3">
			<select
				class="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
				bind:value={filterType}
			>
				<option value="">All types</option>
				{#each diddlTypes as dt}
					<option value={dt.slug}>{dt.displayName}</option>
				{/each}
			</select>

			<select
				class="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
				bind:value={filterStatus}
			>
				<option value="">All statuses</option>
				<option value="draft">Draft</option>
				<option value="published">Published</option>
				<option value="archived">Archived</option>
			</select>

			<span class="flex items-center text-sm text-muted-foreground">
				{items.length} items
			</span>
		</div>

		<!-- Item List -->
		{#if catalogQuery.isLoading}
			<p class="py-8 text-center text-muted-foreground">Loading...</p>
		{:else if items.length === 0}
			<p class="py-8 text-center text-muted-foreground">No items found.</p>
		{:else}
			<div class="overflow-x-auto rounded-md border">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b bg-muted/50">
							<th class="px-4 py-3 text-left font-medium">Image</th>
							<th class="px-4 py-3 text-left font-medium">Type</th>
							<th class="px-4 py-3 text-left font-medium">Number</th>
							<th class="px-4 py-3 text-left font-medium">Name</th>
							<th class="px-4 py-3 text-left font-medium">Status</th>
							<th class="px-4 py-3 text-right font-medium">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each items as item (item._id)}
							<tr class="border-b transition-colors hover:bg-muted/30">
								<td class="px-4 py-2">
									{#if item.imageUrl}
										<img
											src={item.imageUrl}
											alt={item.name ?? `${item.type} #${item.number}`}
											class="h-10 w-10 rounded object-cover"
										/>
									{:else}
										<div
											class="flex h-10 w-10 items-center justify-center rounded bg-muted text-xs"
										>
											--
										</div>
									{/if}
								</td>
								<td class="px-4 py-2 font-mono">{item.type}</td>
								<td class="px-4 py-2">{item.number}</td>
								<td class="px-4 py-2">{item.name ?? '—'}</td>
								<td class="px-4 py-2">
									<Badge variant={statusVariant(item.status)}>{item.status}</Badge>
								</td>
								<td class="px-4 py-2 text-right">
									<div class="flex justify-end gap-1">
										<Button variant="ghost" size="sm" onclick={() => openEditDialog(item)}>
											Edit
										</Button>

										{#if item.status === 'draft'}
											<Button
												variant="outline"
												size="sm"
												disabled={publishingId === item._id}
												onclick={() => handlePublish(item._id)}
											>
												{publishingId === item._id ? 'Publishing...' : 'Publish'}
											</Button>
										{/if}

										{#if item.status !== 'archived'}
											<Button
												variant="destructive"
												size="sm"
												onclick={() =>
													(archiveTarget = {
														id: item._id,
														label: `${item.type} #${item.number}${item.name ? ` (${item.name})` : ''}`
													})}
											>
												Archive
											</Button>
										{/if}
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>

	<!-- Create/Edit Dialog -->
	<Dialog.Root bind:open={showFormDialog}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>{editingId ? 'Edit Catalog Item' : 'Create Draft Item'}</Dialog.Title>
				<Dialog.Description>
					{editingId ? 'Update the catalog item details.' : 'Create a new catalog item as a draft.'}
				</Dialog.Description>
			</Dialog.Header>

			<form
				class="flex flex-col gap-4"
				onsubmit={(e) => {
					e.preventDefault();
					handleFormSubmit();
				}}
			>
				{#if !editingId}
					<div class="flex gap-3">
						<div class="flex-1">
							<Label for="form-type">Type</Label>
							<select
								id="form-type"
								class="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
								bind:value={formType}
								required
							>
								{#each diddlTypes as dt}
									<option value={dt.slug}>{dt.displayName}</option>
								{/each}
							</select>
						</div>
						<div class="w-28">
							<Label for="form-number">Number</Label>
							<Input
								id="form-number"
								type="number"
								bind:value={formNumber}
								min={0}
								required
								class="mt-1"
							/>
						</div>
					</div>
				{/if}

				<div>
					<Label for="form-name">Name</Label>
					<Input
						id="form-name"
						type="text"
						bind:value={formName}
						placeholder="Optional display name"
						class="mt-1"
					/>
				</div>

				<div>
					<Label for="form-edition">Edition</Label>
					<Input
						id="form-edition"
						type="text"
						bind:value={formEdition}
						placeholder="Optional edition"
						class="mt-1"
					/>
				</div>

				<Dialog.Footer>
					<Button type="button" variant="outline" onclick={() => (showFormDialog = false)}>
						Cancel
					</Button>
					<Button type="submit" disabled={formSaving}>
						{formSaving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Draft'}
					</Button>
				</Dialog.Footer>
			</form>
		</Dialog.Content>
	</Dialog.Root>

	<!-- Archive Confirmation Dialog -->
	<AlertDialog.Root
		open={archiveTarget !== null}
		onOpenChange={(open) => {
			if (!open) archiveTarget = null;
		}}
	>
		<AlertDialog.Content>
			<AlertDialog.Header>
				<AlertDialog.Title>Archive Catalog Item</AlertDialog.Title>
				<AlertDialog.Description>
					Are you sure you want to archive <strong>{archiveTarget?.label}</strong>? This will hide
					it from the public catalog and tag all user list items referencing it with "archived".
					This action cannot be easily undone.
				</AlertDialog.Description>
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
				<AlertDialog.Action
					onclick={handleArchiveConfirm}
					disabled={archiving}
					class="text-destructive-foreground bg-destructive hover:bg-destructive/90"
				>
					{archiving ? 'Archiving...' : 'Archive'}
				</AlertDialog.Action>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>
{/if}
