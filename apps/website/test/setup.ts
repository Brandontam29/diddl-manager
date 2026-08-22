// Integration tests must never silently pass against nothing: fail loudly when the
// Neon `test` branch connection string is missing (spec.md §10).
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Integration tests need the Neon `test` branch connection string " +
      "(see apps/website/.env.example — put it in apps/website/.env.test locally).",
  );
}
