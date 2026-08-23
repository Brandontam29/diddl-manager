import type { Clerk } from "@clerk/clerk-js";

/**
 * There is no official Clerk SDK for Solid or TanStack Start (Solid) — the
 * supported path is vanilla `@clerk/clerk-js` (see ADR 0001). This module owns the
 * single browser-side Clerk instance; `ClerkProvider` and the `_authed` route guard
 * both go through it.
 *
 * The import is dynamic and the instance lazily constructed so nothing Clerk-related
 * is touched during SSR — `@clerk/clerk-js` is browser-only.
 *
 * As of clerk-js 6.29 the prebuilt UI is no longer implicit: without `ui` passed to
 * `load()`, `mountSignIn` no-ops with "Clerk was not loaded with Ui components" and
 * the sign-in page renders blank. Both packages use their `/no-rhc` builds so the UI
 * is bundled rather than fetched from Clerk's CDN at runtime — the remote-hosted
 * variant's lazy chunk load does not survive bundling here.
 */
let clerkPromise: Promise<Clerk> | undefined;

export function loadClerk(): Promise<Clerk> {
  clerkPromise ??= (async () => {
    const [{ Clerk: ClerkClass }, { ui }] = await Promise.all([
      import("@clerk/clerk-js/no-rhc"),
      import("@clerk/ui/no-rhc"),
    ]);
    const clerk = new ClerkClass(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
    await clerk.load({ ui });
    return clerk;
  })();
  return clerkPromise;
}
