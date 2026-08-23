import { createFileRoute } from "@tanstack/solid-router";

// Placeholder so the sidebar link has a target; the Sections board ships with
// "Port the Lists board and List detail" (issue #33).
export const Route = createFileRoute("/_authed/app/lists/")({
  component: () => (
    <div class="p-8 max-md:pt-14">
      <h1 class="text-2xl font-semibold">Lists</h1>
      <p class="text-muted-foreground">Coming soon.</p>
    </div>
  ),
});
