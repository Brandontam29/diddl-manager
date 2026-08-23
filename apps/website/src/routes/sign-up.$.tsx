import { createFileRoute } from "@tanstack/solid-router";

import { ClerkMount } from "@/components/ClerkMount";
import { authRedirectSearchSchema, DEFAULT_AFTER_AUTH_PATH } from "@/lib/auth-redirect";

// Mirror of /sign-in/$ — same splat, same `redirect` search param.
export const Route = createFileRoute("/sign-up/$")({
  validateSearch: authRedirectSearchSchema,
  component: SignUp,
});

function SignUp() {
  const search = Route.useSearch();
  const redirect = () => search().redirect ?? DEFAULT_AFTER_AUTH_PATH;

  return (
    <main class="flex min-h-screen items-center justify-center p-8">
      <ClerkMount
        mount={(clerk, node) =>
          clerk.mountSignUp(node, {
            forceRedirectUrl: redirect(),
            signInUrl: `/sign-in?redirect=${encodeURIComponent(redirect())}`,
          })
        }
        unmount={(clerk, node) => clerk.unmountSignUp(node)}
      />
    </main>
  );
}
