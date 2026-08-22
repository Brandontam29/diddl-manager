import { defineConfig } from "vitest/config";

// Unit tests: pure node, no Vite app plugins. Integration tests have their own config.
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    passWithNoTests: true,
  },
});
