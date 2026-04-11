<script lang="ts">
	import { getClerkContext } from '$lib/stores/clerk.svelte';
	import { Button } from '$lib/components/ui/button';
	import { getListStoreContext } from '$lib/lists/listStoreContext.svelte';
	import { BookOpen, ListTodo, LogIn } from 'lucide-svelte';

	const clerkContext = getClerkContext();
	const listStore = getListStoreContext();

	const user = $derived(clerkContext.clerk.user);
	const listCount = $derived(listStore.lists.length);
</script>

<div class="min-h-screen bg-stone-50 font-sans text-stone-900">
	<header class="border-b border-stone-200 bg-white">
		<div class="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
			<h1 class="text-lg font-semibold tracking-tight">Diddl Manager</h1>
			<div class="flex items-center gap-3">
				{#if user}
					<div
						{@attach (el) => {
							clerkContext.clerk.mountUserButton(el);
						}}
					></div>
				{:else}
					<Button variant="outline" size="sm" onclick={() => clerkContext.clerk.openSignIn()}>
						<LogIn class="mr-2 size-4" />
						Sign In
					</Button>
				{/if}
			</div>
		</div>
	</header>

	<main class="mx-auto max-w-5xl px-6 py-12 sm:py-24">
		<div class="text-center">
			<h2 class="text-3xl font-bold tracking-tight text-stone-800 sm:text-4xl">
				Welcome to Diddl Manager
			</h2>
			<p class="mt-4 text-lg text-stone-500">
				{#if user}
					Hi, {user.firstName || 'Collector'}! Your collection is synced and ready.
				{:else}
					Browse the catalog and manage your collection lists. Your data is saved locally.
				{/if}
			</p>

			<div class="mt-10 flex flex-wrap items-center justify-center gap-4">
				<Button size="lg" href="/app/catalog" class="gap-2">
					<BookOpen class="size-5" />
					Browse Catalog
				</Button>
				<Button size="lg" variant="outline" href="/app/lists" class="gap-2">
					<ListTodo class="size-5" />
					My Lists
					{#if listCount > 0}
						<span
							class="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
						>
							{listCount}
						</span>
					{/if}
				</Button>
			</div>
		</div>

		{#if !user}
			<div class="mt-16 rounded-xl border border-stone-200 bg-white p-8 text-center shadow-sm">
				<h3 class="text-lg font-semibold">Guest Mode Active</h3>
				<p class="mt-2 text-stone-500">
					You're currently using guest mode. Sign up to sync your collection across devices and
					unlock unlimited lists.
				</p>
				<Button variant="link" class="mt-4" onclick={() => clerkContext.clerk.openSignUp()}>
					Create an account to sync
				</Button>
			</div>
		{/if}
	</main>
</div>
