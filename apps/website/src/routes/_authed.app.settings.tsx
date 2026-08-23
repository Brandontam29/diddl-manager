import { createFileRoute } from "@tanstack/solid-router";

// Placeholder so the sidebar link has a target; Settings ships with
// "Port Settings and build the landing page" (issue #34).
export const Route = createFileRoute("/_authed/app/settings")({
  component: () => (
    <div class="p-8 max-md:pt-14">
      <h1 class="text-2xl font-semibold">Settings</h1>
      <p class="text-muted-foreground">Coming soon.</p>
    </div>
  ),
});
