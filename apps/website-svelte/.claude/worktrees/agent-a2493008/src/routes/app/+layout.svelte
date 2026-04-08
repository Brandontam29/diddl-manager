<script lang="ts">
	import ClerkWrapper from '$lib/wrappers/ClerkWrapper.svelte';
	import ConvexWrapper from '$lib/wrappers/ConvexWrapper.svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	import { createGuestListStore } from '$lib/lists/listStore.svelte';
	import { initListStoreContext } from '$lib/lists/listStoreContext.svelte';
	import AppHeader from '$lib/components/layout/AppHeader.svelte';
	import ShimmerGrid from '$lib/components/layout/ShimmerGrid.svelte';
	import StoreManager from '$lib/components/layout/StoreManager.svelte';
	import type { Snippet } from 'svelte';

	const { children }: { children: Snippet } = $props();

	// Initialize with GuestListStore by default
	const holder = initListStoreContext(createGuestListStore());

	let isMigrating = $state(false);
</script>

<svelte:head>
	<title>Diddl Manager</title>
</svelte:head>

<ClerkWrapper>
	<ConvexWrapper>
		<StoreManager {holder} onMigratingChange={(v) => (isMigrating = v)}>
			<div class="min-h-screen bg-stone-50 font-sans text-stone-900">
				<AppHeader />
				<main>
					{#if isMigrating}
						<div class="mx-auto max-w-5xl px-6 py-12">
							<ShimmerGrid />
						</div>
					{:else}
						{@render children()}
					{/if}
				</main>
			</div>
		</StoreManager>
	</ConvexWrapper>
</ClerkWrapper>

<Toaster />
