import { Link } from "@tanstack/solid-router";

export function NotFound() {
  return (
    <main class="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 class="text-2xl font-bold">Page not found</h1>
      <Link to="/" class="underline">
        Back to home
      </Link>
    </main>
  );
}
