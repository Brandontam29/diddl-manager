<script lang="ts">
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button';
	import { getClerkContext } from '$lib/stores/clerk.svelte';

	const clerkContext = getClerkContext();
</script>

<div class="mt-8 flex flex-wrap items-center justify-center gap-3">
	<Button href={resolve('/app')} size="lg">Try as Guest</Button>
	<Button variant="outline" size="lg" onclick={() => clerkContext.clerk.openSignIn()}>
		Sign In
	</Button>
</div>
