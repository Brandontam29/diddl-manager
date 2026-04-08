<script lang="ts">
	import { getClerkContext } from '$lib/stores/clerk.svelte';
	import { useConvexClient } from 'convex-svelte';
	import { createGuestListStore } from '$lib/lists/listStore.svelte';
	import { createConvexListStore } from '$lib/lists/convexListStore.svelte';
	import { hasGuestData, migrateGuestData } from '$lib/lists/migration';
	import type { ReactiveListStoreHolder } from '$lib/lists/listStoreContext.svelte';
	import type { Snippet } from 'svelte';

	const {
		holder,
		onMigratingChange,
		children
	}: {
		holder: ReactiveListStoreHolder;
		onMigratingChange: (migrating: boolean) => void;
		children: Snippet;
	} = $props();

	const clerkContext = getClerkContext();
	const client = useConvexClient();

	$effect(() => {
		const user = clerkContext.currentUser;
		if (user) {
			// User signed in — switch to ConvexListStore
			if (hasGuestData()) {
				onMigratingChange(true);
				migrateGuestData(client).finally(() => {
					onMigratingChange(false);
					holder.setStore(createConvexListStore());
				});
			} else {
				holder.setStore(createConvexListStore());
			}
		} else if (clerkContext.isClerkLoaded) {
			// User signed out or guest — use GuestListStore
			holder.setStore(createGuestListStore());
		}
	});
</script>

{@render children()}
