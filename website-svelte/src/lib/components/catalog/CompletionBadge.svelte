<script lang="ts">
	import { Badge } from '$lib/components/ui/badge/index.js';

	let {
		percent,
		tooltip
	}: {
		percent: number;
		tooltip: string;
	} = $props();

	let colorClass = $derived.by(() => {
		if (percent >= 100) return 'bg-emerald-50 text-emerald-700 border-0';
		if (percent >= 67) return 'bg-blue-50 text-blue-600 border-0';
		if (percent >= 34) return 'bg-amber-50 text-amber-600 border-0';
		return 'bg-red-50 text-red-600 border-0';
	});
</script>

<Badge class={colorClass} title={tooltip}>{percent}%</Badge>
