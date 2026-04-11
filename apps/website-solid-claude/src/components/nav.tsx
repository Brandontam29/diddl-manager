import { A } from "@solidjs/router";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  ClerkLoading,
  ClerkLoaded,
} from "clerk-solidjs";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { ThemeToggle } from "~/components/theme-toggle";

export default function Nav() {
  return (
    <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="container mx-auto flex h-14 items-center px-4">
        <div class="mr-4 flex">
          <A href="/" class="mr-6 flex items-center space-x-2">
            <span class="text-lg font-bold">SolidClaude</span>
          </A>
          <nav class="flex items-center gap-4 text-sm">
            <A
              href="/"
              class="text-foreground/60 transition-colors hover:text-foreground/80"
              activeClass="text-foreground"
              end
            >
              Home
            </A>
            <A
              href="/dashboard"
              class="text-foreground/60 transition-colors hover:text-foreground/80"
              activeClass="text-foreground"
            >
              Dashboard
            </A>
            <A
              href="/chat"
              class="text-foreground/60 transition-colors hover:text-foreground/80"
              activeClass="text-foreground"
            >
              Chat
            </A>
          </nav>
        </div>

        <div class="flex flex-1 items-center justify-end space-x-2">
          <ThemeToggle />
          <Separator orientation="vertical" class="mx-2 h-6" />
          <ClerkLoading>
            <div class="h-8 w-8 animate-pulse rounded-full bg-muted" />
          </ClerkLoading>
          <ClerkLoaded>
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <SignInButton>
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
          </ClerkLoaded>
        </div>
      </div>
    </header>
  );
}
