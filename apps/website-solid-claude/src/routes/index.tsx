import { createSignal, createEffect as solidCreateEffect } from "solid-js";
import { A } from "@solidjs/router";
import { SignedIn, SignedOut, SignInButton } from "clerk-solidjs";
import { Effect, pipe, runSync, AppConfig, AppConfigLive } from "~/lib/effect";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

export default function Home() {
  const [appInfo, setAppInfo] = createSignal<{
    name: string;
    version: string;
  } | null>(null);

  solidCreateEffect(() => {
    const info = runSync(
      pipe(
        AppConfig,
        Effect.map((config) => ({
          name: config.appName,
          version: config.version,
        })),
        Effect.provide(AppConfigLive)
      )
    );
    setAppInfo(info);
  });

  const techStack = [
    {
      name: "SolidStart 2.0",
      description: "Full-stack SolidJS framework with fine-grained reactivity",
      badge: "alpha",
    },
    {
      name: "Effect",
      description:
        "Type-safe functional programming for robust error handling & composability",
      badge: "v3",
    },
    {
      name: "TailwindCSS",
      description: "Utility-first CSS framework for rapid UI development",
      badge: "v4",
    },
    {
      name: "Solid UI",
      description:
        "Beautiful, accessible components built with Kobalte & Tailwind",
      badge: "stable",
    },
    {
      name: "Convex",
      description:
        "Real-time backend with reactive queries and automatic sync",
      badge: "stable",
    },
    {
      name: "Clerk",
      description:
        "Complete authentication & user management with SSR support",
      badge: "stable",
    },
  ];

  return (
    <div class="flex flex-col items-center space-y-12 py-12">
      {/* Hero Section */}
      <section class="flex flex-col items-center text-center space-y-6 max-w-3xl">
        <Badge variant="secondary" class="text-sm">
          {appInfo()?.version ? `v${appInfo()!.version}` : "Loading..."}
        </Badge>
        <h1 class="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Welcome to{" "}
          <span class="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            SolidClaude
          </span>
        </h1>
        <p class="text-xl text-muted-foreground max-w-2xl">
          A modern full-stack application built with SolidStart 2.0, Effect,
          TailwindCSS, Solid UI, Convex, and Clerk. Powered by fine-grained
          reactivity and type-safe functional programming.
        </p>
        <div class="flex gap-4">
          <SignedIn>
            <A href="/dashboard">
              <Button size="lg">Go to Dashboard</Button>
            </A>
          </SignedIn>
          <SignedOut>
            <SignInButton>
              <Button size="lg">Get Started</Button>
            </SignInButton>
          </SignedOut>
          <A href="/chat">
            <Button variant="outline" size="lg">
              Open Chat
            </Button>
          </A>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section class="w-full max-w-5xl space-y-6">
        <h2 class="text-2xl font-bold text-center">Tech Stack</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {techStack.map((tech) => (
            <Card class="transition-shadow hover:shadow-md">
              <CardHeader>
                <div class="flex items-center justify-between">
                  <CardTitle class="text-lg">{tech.name}</CardTitle>
                  <Badge variant="outline">{tech.badge}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{tech.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section class="w-full max-w-3xl space-y-6">
        <h2 class="text-2xl font-bold text-center">Features</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle class="text-lg">Real-time Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-sm text-muted-foreground">
                Convex provides automatic real-time subscriptions. Data syncs
                instantly across all connected clients.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle class="text-lg">Authentication</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-sm text-muted-foreground">
                Clerk handles sign-up, sign-in, and user management with SSR
                support and pre-built UI components.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle class="text-lg">Type Safety</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-sm text-muted-foreground">
                Effect provides type-safe error handling and composable
                abstractions throughout the entire application.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle class="text-lg">Dark Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-sm text-muted-foreground">
                Built-in dark mode with SSR-safe cookie persistence via
                Kobalte's color mode provider.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer class="text-center text-sm text-muted-foreground pt-8 border-t w-full max-w-3xl">
        <p>
          Built with SolidStart 2.0 + Effect + TailwindCSS + Solid UI + Convex +
          Clerk
        </p>
      </footer>
    </div>
  );
}
