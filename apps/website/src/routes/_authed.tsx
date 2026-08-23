import { createFileRoute, Outlet, redirect } from "@tanstack/solid-router";

import { loadClerk } from "@/lib/clerk";

/**
 * The auth gate for everything under `/app` (spec §4, §6). `ssr: false` keeps the
 * whole authed half client-rendered — the smallest port, and Clerk's session is
 * client-resolved anyway — which also means `beforeLoad` only ever runs in the
 * browser, where ClerkJS lives.
 *
 * Server functions reject unauthenticated calls independently; this redirect is a
 * convenience, not the security boundary.
 */
export const Route = createFileRoute("/_authed")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const clerk = await loadClerk();
    if (!clerk.isSignedIn) {
      throw redirect({
        to: "/sign-in/$",
        params: { _splat: "" },
        search: { redirect: location.href },
      });
    }
  },
  component: () => <Outlet />,
});
