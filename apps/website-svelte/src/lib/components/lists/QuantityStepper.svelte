<script lang="ts">
	import { Minus, Plus } from 'lucide-svelte';
	import * as Button from '$lib/components/ui/button/index.js';

	let {
		value,
		min = 1,
		max = 999,
		onValueChange
	}: {
		value: number;
		min?: number;
		max?: number;
		onValueChange: (newValue: number) => void;
	} = $props();

	function decrement() {
		if (value > min) {
			onValueChange(value - 1);
		}
	}

	function increment() {
		if (value < max) {
			onValueChange(value + 1);
		}
	}
</script>

<div class="flex items-center gap-1 rounded-md border border-stone-200 bg-white p-0.5">
	<Button.Root
		variant="ghost"
		size="icon"
		class="h-6 w-6 text-stone-500 hover:bg-stone-100 hover:text-stone-900"
		onclick={decrement}
		disabled={value <= min}
		aria-label="Decrease quantity"
	>
		<Minus class="h-3 w-3" />
	</Button.Root>

	<span class="min-w-[1.5rem] text-center text-xs font-semibold text-stone-900">
		{value}
	</span>

	<Button.Root
		variant="ghost"
		size="icon"
		class="h-6 w-6 text-stone-500 hover:bg-stone-100 hover:text-stone-900"
		onclick={increment}
		disabled={value >= max}
		aria-label="Increase quantity"
	>
		<Plus class="h-3 w-3" />
	</Button.Root>
</div>
