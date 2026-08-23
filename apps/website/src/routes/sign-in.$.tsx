import { createFileRoute } from "@tanstack/solid-router";

import { ClerkMount } from "@/components/ClerkMount";
import { authRedirectSearchSchema, DEFAULT_AFTER_AUTH_PATH } from "@/lib/auth-redirect";

// Splat route: Clerk's sign-in component owns its own sub-paths (factor-one,
// sso-callback, …), so every path under /sign-in has to reach this component.
// The `redirect` search param travels with the visitor to /sign-up and back.
export const Route = createFileRoute("/sign-in/$")({
  validateSearch: authRedirectSearchSchema,
  component: SignIn,
});

function SignIn() {
  const search = Route.useSearch();
  const redirect = () => search().redirect ?? DEFAULT_AFTER_AUTH_PATH;

  return (
    <main class="flex min-h-screen items-center justify-center p-8">
      <ClerkMount
        mount={(clerk, node) =>
          clerk.mountSignIn(node, {
            forceRedirectUrl: redirect(),
            signUpUrl: `/sign-up?redirect=${encodeURIComponent(redirect())}`,
          })
        }
        unmount={(clerk, node) => clerk.unmountSignIn(node)}
      />
    </main>
  );
}
