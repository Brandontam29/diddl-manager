<script lang="ts">
	import { setClerkContext } from '$lib/stores/clerk.svelte';
	import type { Snippet } from 'svelte';

	const { children }: { children: Snippet } = $props();

	// Initialize Clerk context for all child components
	setClerkContext();
</script>

{@render children()}
