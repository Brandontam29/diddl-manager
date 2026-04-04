<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { getClerkContext } from '$lib/stores/clerk.svelte';
	import { cn } from '$lib/utils.js';

	let {
		message,
		ctaLabel = 'Sign up',
		align = 'left',
		class: className
	}: {
		message: string;
		ctaLabel?: string;
		align?: 'left' | 'center';
		class?: string;
	} = $props();

	const clerkContext = getClerkContext();
	const user = $derived(clerkContext.currentUser);
</script>

{#if !user}
	<div
		class={cn(
			'rounded-lg border border-border/60 bg-muted/50 px-4 py-3 text-sm text-muted-foreground',
			align === 'center' && 'text-center',
			className
		)}
	>
		<span>{message}</span>
		<Button
			variant="link"
			class="h-auto px-1 py-0 text-sm font-semibold text-primary underline underline-offset-4"
			onclick={() => clerkContext.clerk.openSignUp()}
		>
			{ctaLabel}
		</Button>
	</div>
{/if}
