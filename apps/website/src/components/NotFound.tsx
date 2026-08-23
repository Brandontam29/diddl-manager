import { Link } from "@tanstack/solid-router";

import diddlTongue from "@/assets/diddl-tongue.gif";
import { buttonVariants } from "@/components/ui/button";
import { Image, ImageFallback, ImageRoot } from "@/components/ui/image";
import { Skeleton } from "@/components/ui/skeleton";

/** The desktop's `pages/not-found.tsx`; the root `notFoundComponent` (spec §6). */
export function NotFound() {
  return (
    <main class="flex min-h-screen items-center justify-center p-8">
      <div class="mx-auto max-w-lg space-y-2 text-center">
        <ImageRoot class="mx-auto">
          <Image src={diddlTongue} alt="Diddl sticking his tongue out laughing" />
          <ImageFallback>
            <Skeleton class="aspect-square h-[390px] rounded" />
          </ImageFallback>
        </ImageRoot>

        <h1 class="text-lg font-semibold">This Page is Not Found</h1>
        <p>You can click on Home to go back to an existing page.</p>
        <Link to="/" class={buttonVariants({ variant: "outline", class: "mt-2" })}>
          Home
        </Link>
      </div>
    </main>
  );
}
