<script lang="ts">
	import ClerkWrapper from '$lib/wrappers/ClerkWrapper.svelte';
	import ConvexWrapper from '$lib/wrappers/ConvexWrapper.svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	import { createGuestListStore } from '$lib/lists/listStore.svelte';
	import { setListStoreContext } from '$lib/lists/listStoreContext.svelte';

	const { children } = $props();

	// Instantiate the guest list store once for the app lifecycle.
	// This store is shared across all child routes in /app.
	setListStoreContext(createGuestListStore());
</script>

<svelte:head>
	<title>Diddl Manager</title>
</svelte:head>

<ClerkWrapper>
	<ConvexWrapper>
		{@render children()}
	</ConvexWrapper>
</ClerkWrapper>

<Toaster />
