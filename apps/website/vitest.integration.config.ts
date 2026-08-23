import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

// `bun run <script>` does not hand its .env files to the vitest child process, so
// load them here. Mode "test" makes `.env.test` (the Neon `test` branch) win over
// `.env.local` (the `dev` branch); CI sets the variables directly and has no files.
for (const [key, value] of Object.entries(loadEnv("test", import.meta.dirname, ""))) {
  process.env[key] ??= value;
}

// DB-backed integration tests against the Neon `test` branch (see spec.md §10).
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    include: ["src/**/*.integration.test.ts"],
    setupFiles: ["test/setup.ts"],
    passWithNoTests: true,
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});
