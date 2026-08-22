import { defineConfig } from "vitest/config";

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
  },
});
