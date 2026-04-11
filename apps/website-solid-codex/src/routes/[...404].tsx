import { A } from "@solidjs/router";

import { buttonVariants } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function NotFound() {
  return (
    <main class="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl items-center px-4 py-10 sm:px-6">
      <Card class="w-full">
        <CardHeader>
          <p class="text-sm tracking-[0.3em] text-primary uppercase">404</p>
          <CardTitle class="text-4xl">That route is not part of `website-solid`.</CardTitle>
        </CardHeader>
        <CardContent class="flex flex-wrap items-center gap-3">
          <A href="/" class={buttonVariants({ size: "lg" })}>
            Return home
          </A>
          <A href="/about" class={buttonVariants({ variant: "outline", size: "lg" })}>
            Review setup
          </A>
        </CardContent>
      </Card>
    </main>
  );
}
