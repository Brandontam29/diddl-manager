import { createFileRoute } from "@tanstack/solid-router";
import * as z from "zod";

import { ClerkMount } from "@/components/ClerkMount";

// Splat route: Clerk's sign-in component owns its own sub-paths (factor-one,
// sso-callback, …), so every path under /sign-in has to reach this component.
// `redirect` is where `_authed` sends the visitor back to after signing in.
const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/sign-in/$")({
  validateSearch: searchSchema,
  component: SignIn,
});

function SignIn() {
  const search = Route.useSearch();

  return (
    <main class="flex min-h-screen items-center justify-center p-8">
      <ClerkMount
        mount={(clerk, node) =>
          clerk.mountSignIn(node, {
            forceRedirectUrl: search().redirect ?? "/app",
            signUpUrl: "/sign-up",
          })
        }
        unmount={(clerk, node) => clerk.unmountSignIn(node)}
      />
    </main>
  );
}
