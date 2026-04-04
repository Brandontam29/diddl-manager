<script lang="ts">
	import { useIntersectionObserver } from 'runed';
	import { ImageOff } from '@lucide/svelte';

	let { src, alt }: { src: string | null; alt: string } = $props();

	let imgEl = $state<HTMLImageElement | undefined>();
	let isVisible = $state(false);
	let loaded = $state(false);
	let errored = $state(false);

	useIntersectionObserver(
		() => imgEl,
		(entries) => {
			if (entries[0]?.isIntersecting) {
				isVisible = true;
			}
		}
	);
</script>

<div class="relative h-40 w-full overflow-hidden bg-stone-100">
	{#if !src || errored || (!isVisible && !loaded)}
		<div class="absolute inset-0 flex items-center justify-center text-stone-300">
			<ImageOff size={32} />
		</div>
	{/if}
	{#if src && isVisible}
		<img
			bind:this={imgEl}
			{src}
			{alt}
			loading="lazy"
			onload={() => (loaded = true)}
			onerror={() => (errored = true)}
			class="h-full w-full object-cover transition-opacity duration-200 {loaded
				? 'opacity-100'
				: 'opacity-0'}"
		/>
	{/if}
</div>
