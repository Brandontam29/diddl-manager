import { A, createAsync } from "@solidjs/router";
import { AlertCircle, Database, LockKeyhole, Sparkles } from "lucide-solid";
import { For, Show, type Component } from "solid-js";

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { buttonVariants, Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { useClerk } from "~/lib/clerk";
import { dashboardSummaryQuery } from "~/lib/convex/api";
import { useConvexQuery } from "~/lib/convex/client";
import { getStackSnapshotQuery } from "~/lib/server/stack";
import { cn } from "~/lib/utils";

export const route = {
  preload: () => void getStackSnapshotQuery(),
};

type StatusItem = {
  copy: string;
  icon: Component<{ class?: string }>;
  ready: boolean;
  title: string;
};

function initials(name: string | null | undefined) {
  return (
    name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "DM"
  );
}

export default function Home() {
  const stack = createAsync(() => getStackSnapshotQuery());
  const clerk = useClerk();
  const convex = useConvexQuery(dashboardSummaryQuery, () => ({}));

  const statusItems = (): StatusItem[] => [
    {
      title: "Server runtime",
      copy: stack()
        ? `Node ${stack()!.runtime.node}${stack()!.runtime.bun ? ` and Bun ${stack()!.runtime.bun}` : ""}`
        : "Collecting runtime metadata with Effect",
      ready: true,
      icon: Sparkles,
    },
    {
      title: "Clerk auth",
      copy: clerk.configured
        ? clerk.user()
          ? `Signed in as ${clerk.user()!.firstName ?? clerk.user()!.username ?? "builder"}`
          : "Publishable key detected. Sign-in modal is ready."
        : "Add VITE_CLERK_PUBLISHABLE_KEY to enable authentication.",
      ready: clerk.configured,
      icon: LockKeyhole,
    },
    {
      title: "Convex data",
      copy: convex.configured
        ? convex.status() === "ready"
          ? "Live query is responding from the Convex backend."
          : "Client is configured. Finish env setup to unlock live data."
        : "Add VITE_CONVEX_URL and CONVEX_DEPLOYMENT to enable subscriptions.",
      ready: convex.configured && convex.status() === "ready",
      icon: Database,
    },
  ];

  return (
    <main class="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
      <section class="grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
        <Card class="overflow-hidden border-primary/20 bg-gradient-to-br from-white/90 via-card to-secondary/70">
          <CardHeader class="gap-5">
            <div class="flex flex-wrap gap-2">
              <Badge round>SolidStart</Badge>
              <Badge variant="secondary" round>
                Tailwind CSS
              </Badge>
              <Badge variant="secondary" round>
                Effect
              </Badge>
              <Badge variant="secondary" round>
                Convex
              </Badge>
              <Badge variant="secondary" round>
                Clerk
              </Badge>
            </div>
            <div class="space-y-4">
              <h1 class="max-w-3xl text-4xl leading-tight sm:text-5xl">
                A SolidStart 2 starter with real auth, real data, and a cleaner default shell.
              </h1>
              <p class="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                `website-solid` is now scaffolded with Tailwind v4, Effect on the server,
                Convex-ready live data, Clerk browser auth, and reusable components from
                solid-ui.com.
              </p>
            </div>
          </CardHeader>
          <CardContent class="flex flex-wrap items-center gap-3">
            <Show
              when={!clerk.user()}
              fallback={
                <Badge variant="success" round class="px-4 py-2 text-sm">
                  Authenticated
                </Badge>
              }
            >
              <Button
                size="lg"
                onClick={() => {
                  clerk.clerk()?.openSignUp();
                }}
              >
                Create account
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  clerk.clerk()?.openSignIn();
                }}
              >
                Sign in
              </Button>
            </Show>
            <A href="/about" class={buttonVariants({ variant: "ghost", size: "lg" })}>
              Review setup
            </A>
          </CardContent>
        </Card>

        <Card class="border-border/80 bg-white/80">
          <CardHeader>
            <CardTitle>Current session</CardTitle>
            <CardDescription>
              Clerk is integrated through the browser SDK so the app works without waiting on a
              framework-specific package.
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex items-center gap-4">
              <Avatar class="size-14 border border-border/70">
                <AvatarImage src={clerk.user()?.imageUrl} alt={clerk.user()?.fullName ?? "User"} />
                <AvatarFallback class="bg-primary/12 text-primary">
                  {initials(clerk.user()?.fullName)}
                </AvatarFallback>
              </Avatar>
              <div class="space-y-1">
                <p class="text-sm uppercase tracking-[0.28em] text-muted-foreground">Viewer</p>
                <p class="text-xl font-semibold">{clerk.user()?.fullName ?? "Anonymous visitor"}</p>
                <p class="text-sm text-muted-foreground">
                  {clerk.user()?.primaryEmailAddress?.emailAddress ??
                    "Open Clerk to create a session"}
                </p>
              </div>
            </div>

            <div class="grid gap-3 sm:grid-cols-2">
              <div class="rounded-2xl border border-border/70 bg-secondary/60 p-4">
                <p class="text-sm text-muted-foreground">Clerk status</p>
                <p class="mt-2 font-semibold">
                  {clerk.configured ? (clerk.isLoaded() ? "Loaded" : "Booting") : "Not configured"}
                </p>
              </div>
              <div class="rounded-2xl border border-border/70 bg-secondary/60 p-4">
                <p class="text-sm text-muted-foreground">Snapshot generated</p>
                <p class="mt-2 font-semibold">
                  {stack() ? new Date(stack()!.timestamp).toLocaleString() : "Loading"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section class="grid gap-4 md:grid-cols-3">
        <For each={statusItems()}>
          {(item) => {
            const Icon = item.icon;

            return (
              <Card class="h-full">
                <CardHeader class="flex-row items-start justify-between space-y-0">
                  <div class="space-y-2">
                    <CardTitle class="text-xl">{item.title}</CardTitle>
                    <CardDescription class="leading-6">{item.copy}</CardDescription>
                  </div>
                  <div class="rounded-2xl border border-border/60 bg-background/80 p-3">
                    <Icon class="size-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Badge variant={item.ready ? "success" : "outline"} round>
                    {item.ready ? "Ready" : "Needs env"}
                  </Badge>
                </CardContent>
              </Card>
            );
          }}
        </For>
      </section>

      <section class="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card class="border-border/80 bg-white/85">
          <CardHeader>
            <CardTitle>Convex live summary</CardTitle>
            <CardDescription>
              This card subscribes to a real Convex query when `VITE_CONVEX_URL` is present.
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <Show
              when={convex.status() === "ready" && convex.data()}
              fallback={
                <Alert>
                  <AlertCircle class="size-4" />
                  <AlertTitle>Convex is staged, not active</AlertTitle>
                  <AlertDescription>
                    <p>
                      Add `VITE_CONVEX_URL`, `CONVEX_DEPLOYMENT`, and the Clerk JWT issuer domain,
                      then run `bun run convex:gen` to finish the live link.
                    </p>
                  </AlertDescription>
                </Alert>
              }
            >
              <div class="grid gap-3">
                <div class="rounded-2xl border border-border/70 bg-secondary/55 p-4">
                  <p class="text-sm text-muted-foreground">Deployment</p>
                  <p class="mt-2 text-lg font-semibold">{convex.data()!.deployment}</p>
                </div>
                <div class="rounded-2xl border border-border/70 bg-secondary/55 p-4">
                  <p class="text-sm text-muted-foreground">Viewer</p>
                  <p class="mt-2 text-lg font-semibold">
                    {convex.data()!.viewer?.name ??
                      convex.data()!.viewer?.email ??
                      "Anonymous reader"}
                  </p>
                </div>
                <div class="flex flex-wrap gap-2">
                  <For each={convex.data()!.features}>
                    {(feature) => (
                      <Badge variant="secondary" round>
                        {feature}
                      </Badge>
                    )}
                  </For>
                </div>
              </div>
            </Show>
          </CardContent>
        </Card>

        <Card class="border-border/80 bg-gradient-to-br from-white via-white to-accent/35">
          <CardHeader>
            <CardTitle>Versions in this app</CardTitle>
            <CardDescription>
              Read on the server through an Effect-based snapshot, then streamed into the page.
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-3">
            <For
              each={[
                { name: "SolidStart", version: stack()?.versions.solidStart },
                { name: "Effect", version: stack()?.versions.effect },
                { name: "Convex", version: stack()?.versions.convex },
                { name: "Clerk", version: stack()?.versions.clerk },
              ]}
            >
              {(item) => (
                <div class="flex items-center justify-between rounded-2xl border border-border/70 bg-background/70 px-4 py-3">
                  <span class="font-medium">{item.name}</span>
                  <code class="text-sm text-muted-foreground">{item.version ?? "loading"}</code>
                </div>
              )}
            </For>
          </CardContent>
        </Card>
      </section>

      <Show when={clerk.error() || convex.error()}>
        <Alert variant="destructive">
          <AlertCircle class="size-4" />
          <AlertTitle>Integration feedback</AlertTitle>
          <AlertDescription>
            <p>{clerk.error() ?? convex.error()}</p>
          </AlertDescription>
        </Alert>
      </Show>
    </main>
  );
}
