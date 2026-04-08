<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';

	let {
		title,
		description,
		children
	}: {
		title: string;
		description: string;
		children?: import('svelte').Snippet;
	} = $props();
</script>

<Card class="border border-border/70 bg-card/95 shadow-sm">
	<CardHeader class="gap-3 px-6 pb-0">
		<div
			class="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"
			aria-hidden="true"
		>
			{@render children?.()}
		</div>
		<CardTitle class="text-base font-semibold">{title}</CardTitle>
	</CardHeader>
	<CardContent class="px-6 pt-0 text-sm leading-6 text-muted-foreground">
		<p>{description}</p>
	</CardContent>
</Card>
