import { A, useLocation } from "@solidjs/router";
import { Show } from "solid-js";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { ClerkUserButton, useClerk } from "~/lib/clerk";
import { cn } from "~/lib/utils";

const links = [
  { href: "/", label: "Overview" },
  { href: "/about", label: "Setup" },
];

export default function Nav() {
  const location = useLocation();
  const clerk = useClerk();

  return (
    <header class="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div class="flex items-center gap-3">
          <A href="/" class="group">
            <div class="flex flex-col">
              <span class="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-primary">
                Diddl Manager
              </span>
              <span class="font-serif text-xl text-foreground transition-colors group-hover:text-primary">
                website-solid
              </span>
            </div>
          </A>
          <Badge variant="secondary" round class="hidden sm:inline-flex">
            SolidStart 2 alpha
          </Badge>
        </div>

        <div class="flex items-center gap-3">
          <nav class="hidden items-center gap-1 rounded-full border border-border/60 bg-white/60 p-1 md:flex">
            {links.map((link) => (
              <A
                href={link.href}
                class={cn(
                  "rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors",
                  location.pathname === link.href
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "hover:bg-secondary hover:text-foreground",
                )}
              >
                {link.label}
              </A>
            ))}
          </nav>

          <Show
            when={clerk.user()}
            fallback={
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    clerk.clerk()?.openSignIn();
                  }}
                >
                  Sign in
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    clerk.clerk()?.openSignUp();
                  }}
                >
                  Start
                </Button>
              </>
            }
          >
            <ClerkUserButton class="min-h-10 min-w-10" />
          </Show>
        </div>
      </div>
    </header>
  );
}
