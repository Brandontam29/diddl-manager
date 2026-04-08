<script lang="ts">
	import { resolve } from '$app/paths';
	import { getClerkContext } from '$lib/stores/clerk.svelte';
	import { Button } from '$lib/components/ui/button';

	const clerkContext = getClerkContext();

	const user = $derived(clerkContext.currentUser);

	function mountUserButton(element: HTMLDivElement) {
		clerkContext.clerk.mountUserButton(element);

		return () => {
			clerkContext.clerk.unmountUserButton(element);
		};
	}
</script>

<header
	class="border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75"
>
	<div class="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-6 py-3">
		<div class="flex flex-col">
			<a href={resolve('/')} class="text-base font-semibold tracking-tight">Diddl Manager</a>
			<p class="text-xs text-muted-foreground">A collector's companion</p>
		</div>

		<div class="flex items-center gap-2">
			<a
				href={resolve('/app')}
				class="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
			>
				Try as Guest
			</a>

			{#if user}
				<Button href={resolve('/app')} size="sm">Open App</Button>
				<div class="flex min-w-8 justify-end" {@attach mountUserButton}></div>
			{:else}
				<Button variant="outline" size="sm" onclick={() => clerkContext.clerk.openSignIn()}>
					Sign In
				</Button>
			{/if}
		</div>
	</div>
</header>
