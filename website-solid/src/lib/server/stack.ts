import { query } from "@solidjs/router";

export type StackSnapshot = {
  env: {
    clerkPublishableKey: boolean;
    clerkSecretKey: boolean;
    clerkJwtIssuerDomain: boolean;
    convexUrl: boolean;
    convexDeployment: boolean;
  };
  runtime: {
    bun: string | null;
    node: string;
  };
  timestamp: string;
  versions: {
    clerk: string;
    convex: string;
    effect: string;
    solidStart: string;
  };
};

export async function getStackSnapshot(): Promise<StackSnapshot> {
  const { getStackSnapshotEffect } = await import("~/lib/server/stackEffect.server");
  return getStackSnapshotEffect();
}

export const getStackSnapshotQuery = query(async () => {
  "use server";

  return getStackSnapshot();
}, "stack-snapshot");
