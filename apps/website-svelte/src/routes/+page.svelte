<script lang="ts">
	import LandingHeader from '$lib/components/landing/LandingHeader.svelte';
	import HeroActions from '$lib/components/landing/HeroActions.svelte';
	import FeatureCard from '$lib/components/landing/FeatureCard.svelte';
	import ShimmerGrid from '$lib/components/layout/ShimmerGrid.svelte';
	import UpgradePrompt from '$lib/components/layout/UpgradePrompt.svelte';
	import ClerkWrapper from '$lib/wrappers/ClerkWrapper.svelte';
	import { BookOpen, Cloud, Sparkles } from 'lucide-svelte';
</script>

<ClerkWrapper>
	<div class="min-h-screen bg-background text-foreground">
		<LandingHeader />

		<main>
			<section class="relative overflow-hidden">
				<div
					class="absolute inset-x-0 top-0 -z-10 h-[28rem] bg-gradient-to-b from-stone-200/60 via-stone-100/40 to-transparent"
				></div>
				<div class="mx-auto flex max-w-6xl flex-col gap-16 px-6 py-16 sm:py-24">
					<div class="mx-auto max-w-2xl text-center">
						<div
							class="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase"
						>
							<Sparkles class="size-3.5" />
							Collection tracking, without the spreadsheet drift
						</div>
						<h1 class="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
							Track Your Diddl Collection
						</h1>
						<p class="mt-5 text-sm leading-7 text-muted-foreground sm:text-base">
							Browse the catalog, build lists, and track what you own - all in one place.
						</p>

						<HeroActions />
					</div>

					<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
						<FeatureCard
							title="Browse the Catalog"
							description="Explore thousands of Diddl products organized by type and number."
						>
							<BookOpen class="size-5" />
						</FeatureCard>
						<FeatureCard
							title="Track Your Collection"
							description="Create lists, set conditions, and see your completion progress."
						>
							<Sparkles class="size-5" />
						</FeatureCard>
						<FeatureCard
							title="Sync Across Devices"
							description="Sign in to save your collection and access it anywhere."
						>
							<Cloud class="size-5" />
						</FeatureCard>
					</div>

					<section
						class="grid gap-6 rounded-[2rem] border border-border/70 bg-card/70 p-6 shadow-sm lg:grid-cols-[1.2fr_0.8fr] lg:p-8"
					>
						<div class="space-y-4">
							<p class="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
								Phase 3 auth shell preview
							</p>
							<h2 class="text-2xl font-semibold tracking-tight">
								The same app structure works for guests and signed-in collectors.
							</h2>
							<p class="max-w-xl text-sm leading-7 text-muted-foreground">
								Guests can explore and manage a browser-saved list immediately. Signing in adds
								sync, migration, and account persistence without changing the core navigation.
							</p>
							<UpgradePrompt
								message="Sign up to sync across devices."
								ctaLabel="Sign up"
								class="max-w-md"
							/>
						</div>

						<div class="rounded-[1.5rem] border border-border/60 bg-background p-4">
							<ShimmerGrid />
						</div>
					</section>
				</div>
			</section>
		</main>

		<footer class="border-t border-border/80 px-6 py-8 text-center text-xs text-muted-foreground">
			Diddl Manager - A collector's companion
		</footer>
	</div>
</ClerkWrapper>
