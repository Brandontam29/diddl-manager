<script lang="ts">
	let {
		count = 3,
		label = 'Loading your collection...'
	}: {
		count?: number;
		label?: string;
	} = $props();
</script>

<div role="status" aria-label={label} class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
	{#each Array.from({ length: count }, (_, index) => index) as index (index)}
		<div class="space-y-4 rounded-xl border border-border/60 bg-card p-5 shadow-xs">
			<div class="h-5 w-2/5 animate-pulse rounded-full bg-muted"></div>
			<div class="h-4 w-4/5 animate-pulse rounded-full bg-muted"></div>
			<div class="grid grid-cols-2 gap-3">
				<div class="h-16 animate-pulse rounded-lg bg-muted"></div>
				<div class="h-16 animate-pulse rounded-lg bg-muted"></div>
			</div>
		</div>
	{/each}
</div>
