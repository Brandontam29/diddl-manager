import { createFileRoute } from "@tanstack/solid-router";

import { getSignedInUserId } from "@/server/session";

// Placeholder for the Library page — "Port components/ui and the Library page"
// replaces this component and adds the layout loader. It exists now to prove the
// auth round trip end to end.
export const Route = createFileRoute("/_authed/app")({
  loader: () => getSignedInUserId(),
  component: App,
});

function App() {
  const userId = Route.useLoaderData();

  return (
    <main class="flex min-h-screen flex-col items-center justify-center gap-2 p-8">
      <h1 class="text-3xl font-bold">Diddl Manager</h1>
      <p class="text-neutral-600">
        Signed in as <code class="font-mono">{userId()}</code>
      </p>
    </main>
  );
}
