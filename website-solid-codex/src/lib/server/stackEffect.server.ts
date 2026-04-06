import { Effect } from "effect";

import type { StackSnapshot } from "~/lib/server/stack";

type PackageJson = {
  dependencies?: Record<string, string>;
};

export async function getStackSnapshotEffect(): Promise<StackSnapshot> {
  return Effect.gen(function* () {
    const versions = yield* Effect.tryPromise(async () => {
      const { readFile } = await import("node:fs/promises");
      const rawPackageJson = await readFile(new URL("../../../package.json", import.meta.url), "utf8");
      const parsed = JSON.parse(rawPackageJson) as PackageJson;

      return {
        clerk: parsed.dependencies?.["@clerk/clerk-js"] ?? "unknown",
        convex: parsed.dependencies?.["convex"] ?? "unknown",
        effect: parsed.dependencies?.["effect"] ?? "unknown",
        solidStart: parsed.dependencies?.["@solidjs/start"] ?? "unknown"
      };
    });
    const bunVersion =
      "Bun" in globalThis
        ? ((globalThis as typeof globalThis & { Bun?: { version?: string } }).Bun?.version ?? null)
        : null;

    return {
      env: {
        clerkPublishableKey: Boolean(process.env.VITE_CLERK_PUBLISHABLE_KEY),
        clerkSecretKey: Boolean(process.env.CLERK_SECRET_KEY),
        clerkJwtIssuerDomain: Boolean(process.env.CLERK_JWT_ISSUER_DOMAIN),
        convexUrl: Boolean(process.env.VITE_CONVEX_URL),
        convexDeployment: Boolean(process.env.CONVEX_DEPLOYMENT)
      },
      runtime: {
        bun: bunVersion,
        node: process.version
      },
      timestamp: new Date().toISOString(),
      versions
    };
  }).pipe(Effect.runPromise);
}
