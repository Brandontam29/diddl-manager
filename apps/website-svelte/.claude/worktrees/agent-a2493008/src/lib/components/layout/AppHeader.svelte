<script lang="ts">
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button';
	import { getClerkContext } from '$lib/stores/clerk.svelte';
	import { cn } from '$lib/utils.js';

	let {
		currentPath = '',
		title = 'Diddl Manager'
	}: {
		currentPath?: string;
		title?: string;
	} = $props();

	const clerkContext = getClerkContext();
	const user = $derived(clerkContext.currentUser);

	const navItems = [
		{ path: '/app/catalog', label: 'Catalog' },
		{ path: '/app/lists', label: 'Lists' }
	] as const;

	function mountUserButton(element: HTMLDivElement) {
		clerkContext.clerk.mountUserButton(element);

		return () => {
			clerkContext.clerk.unmountUserButton(element);
		};
	}
</script>

<header
	class="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
>
	<div class="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-6 py-3">
		<div class="flex items-center gap-6">
			<a href={resolve('/app')} class="text-base font-semibold tracking-tight">{title}</a>

			<nav class="flex items-center gap-1 text-sm">
				{#each navItems as item (item.path)}
					<a
						href={resolve(item.path)}
						aria-current={currentPath.startsWith(item.path) ? 'page' : undefined}
						class={cn(
							'rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
							currentPath.startsWith(item.path) && 'bg-muted text-foreground'
						)}
					>
						{item.label}
					</a>
				{/each}
			</nav>
		</div>

		<div class="flex items-center gap-2">
			{#if user}
				<div class="flex min-w-8 justify-end" {@attach mountUserButton}></div>
			{:else}
				<Button variant="ghost" size="sm" onclick={() => clerkContext.clerk.openSignUp()}>
					Sign Up
				</Button>
				<Button variant="outline" size="sm" onclick={() => clerkContext.clerk.openSignIn()}>
					Sign In
				</Button>
			{/if}
		</div>
	</div>
</header>
