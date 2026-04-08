<script lang="ts">
	const COLORS = [
		{ name: 'Berry', value: '#e11d48', class: 'bg-rose-600' },
		{ name: 'Sunset', value: '#ea580c', class: 'bg-orange-600' },
		{ name: 'Honey', value: '#ca8a04', class: 'bg-yellow-600' },
		{ name: 'Forest', value: '#16a34a', class: 'bg-green-600' },
		{ name: 'Ocean', value: '#2563eb', class: 'bg-blue-600' },
		{ name: 'Violet', value: '#9333ea', class: 'bg-purple-600' },
		{ name: 'Slate', value: '#64748b', class: 'bg-slate-500' },
		{ name: 'Stone', value: '#78716c', class: 'bg-stone-500' }
	];

	let { selected = $bindable('#e11d48') } = $props();
</script>

<div class="flex flex-wrap gap-2" role="radiogroup" aria-label="List color">
	{#each COLORS as color}
		<button
			type="button"
			role="radio"
			aria-checked={selected === color.value}
			aria-label={color.name}
			class="relative flex size-7 shrink-0 items-center justify-center rounded-full transition-transform hover:scale-110 active:scale-95 {color.class} {selected ===
			color.value
				? 'ring-2 ring-stone-900 ring-offset-2 dark:ring-stone-100 dark:ring-offset-stone-900'
				: ''}"
			onclick={() => (selected = color.value)}
		>
			{#if selected === color.value}
				<div class="size-1.5 rounded-full bg-white"></div>
			{/if}
		</button>
	{/each}
</div>
