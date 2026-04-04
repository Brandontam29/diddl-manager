<script lang="ts">
	import { setupConvex } from 'convex-svelte';
	import { PUBLIC_CONVEX_URL } from '$env/static/public';
	import type { Snippet } from 'svelte';

	const { children }: { children: Snippet } = $props();

	// Initialize Convex client for all child components
	setupConvex(PUBLIC_CONVEX_URL);
</script>

{@render children()}
