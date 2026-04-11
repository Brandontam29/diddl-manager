import { Clerk } from "@clerk/clerk-js";
import { PUBLIC_CLERK_PUBLISHABLE_KEY } from "$env/static/public";
import { createContext, onMount } from "svelte";
import { ui } from "@clerk/ui";

type EmittedOrganization = NonNullable<
  Parameters<Parameters<Clerk["addListener"]>[0]>[0]["organization"]
>;
type EmittedUser = NonNullable<Parameters<Parameters<Clerk["addListener"]>[0]>[0]["user"]>;
type EmittedSession = NonNullable<Parameters<Parameters<Clerk["addListener"]>[0]>[0]["session"]>;

const clerkAppearance = {
  variables: {
    colorBackground: "hsl(var(--card))",
    colorDanger: "hsl(var(--destructive))",
    colorForeground: "hsl(var(--foreground))",
    colorInputBackground: "hsl(var(--background))",
    colorInputText: "hsl(var(--foreground))",
    colorMutedForeground: "hsl(var(--muted-foreground))",
    colorNeutral: "hsl(var(--border))",
    colorPrimary: "hsl(var(--primary))",
    colorSuccess: "hsl(var(--primary))",
    colorText: "hsl(var(--foreground))",
    colorTextOnPrimaryBackground: "hsl(var(--primary-foreground))",
    borderRadius: "0.75rem",
    fontFamily: "Inter Variable, sans-serif",
  },
  elements: {
    cardBox: "shadow-xl ring-1 ring-border/60",
    formButtonPrimary: "shadow-none",
    footerActionLink: "text-primary hover:text-primary/80",
    formFieldInput: "shadow-none",
    modalBackdrop: "bg-black/50 backdrop-blur-[1px]",
  },
} as const;

class ClerkStore {
  isClerkLoaded = $state(false);
  clerk = new Clerk(PUBLIC_CLERK_PUBLISHABLE_KEY);
  currentOrganization = $state<EmittedOrganization | null>(null);
  currentSession = $state<EmittedSession | null>(null);
  currentUser = $state<EmittedUser | null>(null);

  constructor() {
    $effect(() => {
      const cleanup = this.clerk.addListener((emission) => {
        if (emission.organization) {
          this.currentOrganization = emission.organization;
        } else {
          this.currentOrganization = null;
        }

        if (emission.session) {
          this.currentSession = emission.session;
        } else {
          this.currentSession = null;
        }

        if (emission.user) {
          this.currentUser = emission.user;
        } else {
          this.currentUser = null;
        }
      });

      return () => {
        cleanup();
      };
    });

    onMount(async () => {
      try {
        await this.clerk.load({
          ui,
          appearance: clerkAppearance,
          afterSignOutUrl: "/",
          signInForceRedirectUrl: "/app",
          signUpForceRedirectUrl: "/app",
        });
        this.isClerkLoaded = true;
      } catch (error) {
        console.error("Error loading Clerk", error);
      } finally {
        this.isClerkLoaded = true;
      }
    });
  }
}

const [internalGetClerkContext, setInternalGetClerkContext] = createContext<ClerkStore>();

export function getClerkContext() {
  const clerkContext = internalGetClerkContext();

  if (!clerkContext) {
    throw new Error("Clerk context not found");
  }

  return clerkContext;
}

export function setClerkContext() {
  const clerkContext = new ClerkStore();
  setInternalGetClerkContext(clerkContext);
  return clerkContext;
}
