import { Link, createFileRoute, useNavigate } from "@tanstack/solid-router";
import { For, createEffect } from "solid-js";

import { buttonVariants } from "@/components/ui/button";
import { useClerk } from "@/lib/clerk-provider";
import { cn } from "@/libs/cn";
import { imageUrl } from "@/libs/image-url";

/**
 * The public, server-rendered landing (spec §6): name, one-line pitch, a strip of
 * Catalog images and the two auth links. A signed-in visitor is sent on to `/app`
 * once ClerkJS resolves the session in the browser — the page itself stays SSR.
 */
export const Route = createFileRoute("/")({
  component: Landing,
});

/** Hand-picked Catalog entries (`data/catalog.json`) whose images exist under `/diddls`. */
const HERO_DIDDLS = [
  {
    id: 481,
    name: "Pimboli Blatt A6 Auslachen",
    imagePath: "012_Pimboli/Pimboli-Blatt-A6-Auslachen.jpg",
  },
  {
    id: 474,
    name: "Diddlina Blatt A6 blau",
    imagePath: "011_feuilles-hs-A6/Diddlina-Blatt-A6-blau.jpg",
  },
  { id: 533, name: "Galupyblatt HDL", imagePath: "013_Galupy/Galupyblatt-HDL.jpg" },
  { id: 218, name: "NBA7 01", imagePath: "004_1-50/NBA7_01.jpg" },
  { id: 1049, name: "SB0001", imagePath: "026_1-50/SB0001.jpg" },
];

function Landing() {
  const { user } = useClerk();
  const navigate = useNavigate();

  createEffect(() => {
    if (user()) void navigate({ to: "/app", replace: true });
  });

  return (
    <main class="flex min-h-screen flex-col items-center justify-center gap-10 px-6 py-16">
      <section class="max-w-2xl space-y-4 text-center">
        <h1 class="text-5xl font-bold text-purple-950">Diddl Manager</h1>
        <p class="text-lg text-muted-foreground">
          Browse the whole Diddl catalog and keep track of the sheets, stickers and figurines in
          your collection — from any device.
        </p>
      </section>

      <ul class="flex flex-wrap items-end justify-center gap-4" aria-label="Sample Diddls">
        <For each={HERO_DIDDLS}>
          {(diddl) => (
            <li class="overflow-hidden rounded border border-black/20 bg-white shadow-sm">
              <img
                src={imageUrl(diddl.imagePath)}
                alt={diddl.name}
                class="h-48 w-auto object-contain"
                width={134}
                height={192}
              />
            </li>
          )}
        </For>
      </ul>

      <nav class="flex gap-3" aria-label="Account">
        <Link to="/sign-in/$" params={{ _splat: "" }} class={cn(buttonVariants({ size: "lg" }))}>
          Sign in
        </Link>
        <Link
          to="/sign-up/$"
          params={{ _splat: "" }}
          class={cn(buttonVariants({ variant: "outline", size: "lg" }))}
        >
          Sign up
        </Link>
      </nav>
    </main>
  );
}
