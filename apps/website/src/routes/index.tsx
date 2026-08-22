import { createFileRoute } from "@tanstack/solid-router";

export const Route = createFileRoute("/")({
  component: Home,
});

// Placeholder landing page; the real hero ships with "Port Settings and build the landing page".
function Home() {
  return (
    <main class="flex min-h-screen flex-col items-center justify-center gap-2 p-8">
      <h1 class="text-3xl font-bold">Diddl Manager</h1>
      <p class="text-neutral-600">Web app scaffold — coming soon.</p>
    </main>
  );
}
