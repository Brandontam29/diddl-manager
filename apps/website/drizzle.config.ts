import { defineConfig } from "drizzle-kit";

// Migrations run from a dev machine or CI against the direct (unpooled) string —
// never the pooled one, and never from Vercel (spec §9).
const connectionString = process.env.DATABASE_URL_UNPOOLED;
if (!connectionString) {
  throw new Error("DATABASE_URL_UNPOOLED is not set");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  casing: "snake_case",
  dbCredentials: { url: connectionString },
});
