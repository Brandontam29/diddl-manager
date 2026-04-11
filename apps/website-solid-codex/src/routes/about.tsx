import { A, createAsync } from "@solidjs/router";
import { CheckCircle2, TerminalSquare } from "lucide-solid";
import { For, Show } from "solid-js";

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { buttonVariants } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { getStackSnapshotQuery } from "~/lib/server/stack";

export const route = {
  preload: () => void getStackSnapshotQuery(),
};

const envVariables = [
  { key: "VITE_CLERK_PUBLISHABLE_KEY", note: "Enables the Clerk browser SDK." },
  { key: "CLERK_JWT_ISSUER_DOMAIN", note: "Lets Convex validate Clerk-issued JWTs." },
  { key: "CLERK_SECRET_KEY", note: "Reserved for future server-side Clerk work." },
  { key: "VITE_CONVEX_URL", note: "WebSocket endpoint for the Convex browser client." },
  { key: "CONVEX_DEPLOYMENT", note: "Deployment name used by the Convex CLI and dashboard." },
];

const commands = ["bun install", "bun run dev", "bun run convex:gen", "bun run build"];

export default function About() {
  const stack = createAsync(() => getStackSnapshotQuery());

  return (
    <main class="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <section class="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <Badge variant="secondary" round class="w-fit">
              Setup
            </Badge>
            <CardTitle>Finish the remaining environment wiring</CardTitle>
            <CardDescription>
              The app builds today, but live auth-backed Convex data needs your project-specific
              keys.
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-3">
            <For each={envVariables}>
              {(item) => (
                <div class="rounded-2xl border border-border/70 bg-background/70 p-4">
                  <div class="flex items-center justify-between gap-3">
                    <code class="text-sm font-semibold">{item.key}</code>
                    <Show
                      when={
                        stack() &&
                        ((item.key === "VITE_CLERK_PUBLISHABLE_KEY" &&
                          stack()!.env.clerkPublishableKey) ||
                          (item.key === "CLERK_JWT_ISSUER_DOMAIN" &&
                            stack()!.env.clerkJwtIssuerDomain) ||
                          (item.key === "CLERK_SECRET_KEY" && stack()!.env.clerkSecretKey) ||
                          (item.key === "VITE_CONVEX_URL" && stack()!.env.convexUrl) ||
                          (item.key === "CONVEX_DEPLOYMENT" && stack()!.env.convexDeployment))
                      }
                    >
                      <Badge variant="success" round>
                        Configured
                      </Badge>
                    </Show>
                  </div>
                  <p class="mt-2 text-sm leading-6 text-muted-foreground">{item.note}</p>
                </div>
              )}
            </For>
          </CardContent>
        </Card>

        <Card class="bg-gradient-to-br from-white via-card to-secondary/80">
          <CardHeader>
            <CardTitle>Useful commands</CardTitle>
            <CardDescription>
              The project is already on Bun and includes a Convex codegen script.
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-3">
            <For each={commands}>
              {(command) => (
                <div class="flex items-center justify-between rounded-2xl border border-border/70 bg-background/75 px-4 py-3">
                  <code class="text-sm">{command}</code>
                  <TerminalSquare class="size-4 text-primary" />
                </div>
              )}
            </For>
            <div class="pt-2">
              <A href="/" class={buttonVariants({ variant: "outline", size: "lg" })}>
                Back to overview
              </A>
            </div>
          </CardContent>
        </Card>
      </section>

      <Alert>
        <CheckCircle2 class="size-4" />
        <AlertTitle>What is already wired</AlertTitle>
        <AlertDescription>
          <p>
            SolidStart v2 alpha, Tailwind v4 styling, solid-ui components, ClerkJS integration,
            Convex client/provider plumbing, and an Effect-powered server snapshot are all in place.
          </p>
        </AlertDescription>
      </Alert>
    </main>
  );
}
