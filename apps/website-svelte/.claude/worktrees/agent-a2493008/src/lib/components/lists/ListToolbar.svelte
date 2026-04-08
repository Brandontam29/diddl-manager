<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Toggle } from '$lib/components/ui/toggle/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Eye, Filter, Copy, CheckCircle2, Circle, ChevronDown, Trash2, Tag } from 'lucide-svelte';
	import CompletionBadge from '../catalog/CompletionBadge.svelte';
	import { LIST_CONDITIONS, type ItemCondition } from '$lib/lists/listTypes';

	let {
		listName,
		completionPercent,
		selectedCount = 0,
		showUnowned = false,
		missingOnly = false,
		onToggleShowUnowned,
		onToggleMissingOnly,
		onDuplicate,
		onMarkComplete,
		onMarkIncomplete,
		onSetCondition,
		onRemove
	}: {
		listName: string;
		completionPercent: number;
		selectedCount?: number;
		showUnowned?: boolean;
		missingOnly?: boolean;
		onToggleShowUnowned: () => void;
		onToggleMissingOnly: () => void;
		onDuplicate: () => void;
		onMarkComplete: () => void;
		onMarkIncomplete: () => void;
		onSetCondition: (condition: ItemCondition) => void;
		onRemove: () => void;
	} = $props();

	const hasSelection = $derived(selectedCount > 0);
</script>

<div
	class="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-stone-200 bg-white/80 px-4 backdrop-blur-md"
>
	<div class="flex items-center gap-4">
		{#if !hasSelection}
			<!-- Default State: Name & Filters -->
			<div class="flex items-center gap-3">
				<h2 class="text-base font-semibold text-stone-900">{listName}</h2>
				<CompletionBadge percent={completionPercent} tooltip="{completionPercent}% Complete" />
			</div>

			<Separator orientation="vertical" class="h-6" />

			<div class="flex items-center gap-1">
				<Toggle
					pressed={showUnowned}
					onPressedChange={onToggleShowUnowned}
					variant="outline"
					size="sm"
					class="gap-2 text-xs"
					aria-label="Toggle show unowned items"
				>
					<Eye class="h-3.5 w-3.5" />
					Show Unowned
				</Toggle>

				<Toggle
					pressed={missingOnly}
					onPressedChange={onToggleMissingOnly}
					variant="outline"
					size="sm"
					class="gap-2 text-xs"
					aria-label="Toggle missing only filter"
				>
					<Filter class="h-3.5 w-3.5" />
					Missing Only
				</Toggle>
			</div>
		{:else}
			<!-- Selection State: Bulk Actions -->
			<div class="flex items-center gap-3">
				<Badge variant="secondary" class="bg-stone-900 px-2 py-0.5 text-white hover:bg-stone-800">
					{selectedCount} selected
				</Badge>

				<div class="flex items-center gap-1">
					<Button variant="ghost" size="sm" class="gap-2 text-xs" onclick={onDuplicate}>
						<Copy class="h-3.5 w-3.5" />
						Duplicate
					</Button>

					<Button variant="ghost" size="sm" class="gap-2 text-xs" onclick={onMarkComplete}>
						<CheckCircle2 class="h-3.5 w-3.5" />
						Complete
					</Button>

					<Button variant="ghost" size="sm" class="gap-2 text-xs" onclick={onMarkIncomplete}>
						<Circle class="h-3.5 w-3.5" />
						Incomplete
					</Button>

					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							{#snippet child({ props })}
								<Button variant="ghost" size="sm" class="gap-2 text-xs" {...props}>
									<Tag class="h-3.5 w-3.5" />
									Condition
									<ChevronDown class="h-3 w-3 opacity-50" />
								</Button>
							{/snippet}
						</DropdownMenu.Trigger>
						<DropdownMenu.Content align="start" class="w-40">
							{#each Object.entries(LIST_CONDITIONS) as [key, meta]}
								<DropdownMenu.Item
									onclick={() => onSetCondition(key as ItemCondition)}
									class="flex items-center justify-between"
								>
									<span>{meta.label}</span>
									<div class="h-2 w-2 rounded-full {meta.color}"></div>
								</DropdownMenu.Item>
							{/each}
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>
			</div>
		{/if}
	</div>

	<div class="flex items-center gap-2">
		{#if hasSelection}
			<Button
				variant="ghost"
				size="sm"
				class="gap-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
				onclick={onRemove}
			>
				<Trash2 class="h-3.5 w-3.5" />
				Remove
			</Button>
		{/if}
	</div>
</div>
