import { createFileRoute } from "@tanstack/solid-router";

import { ClerkMount } from "@/components/ClerkMount";

export const Route = createFileRoute("/sign-up/$")({
  component: SignUp,
});

function SignUp() {
  return (
    <main class="flex min-h-screen items-center justify-center p-8">
      <ClerkMount
        mount={(clerk, node) =>
          clerk.mountSignUp(node, { forceRedirectUrl: "/app", signInUrl: "/sign-in" })
        }
        unmount={(clerk, node) => clerk.unmountSignUp(node)}
      />
    </main>
  );
}
