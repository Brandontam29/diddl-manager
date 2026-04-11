import { SEED_SECRET } from "$env/static/private";
import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { runSeed } from "$lib/remote/seed.remote";

export const POST: RequestHandler = async ({ request }) => {
  // Protect the seed endpoint with a secret to prevent accidental re-seeding
  const authHeader = request.headers.get("authorization");
  if (!authHeader || authHeader !== `Bearer ${SEED_SECRET}`) {
    throw error(401, {
      message: "Unauthorized — provide SEED_SECRET as Bearer token",
      kind: "unauthorized",
      timestamp: Date.now(),
    });
  }

  try {
    const result = await runSeed();
    return json({
      success: true,
      inserted: result.total,
      types: result.types,
    });
  } catch (err) {
    console.error("Seed failed:", err);
    throw error(500, {
      message: err instanceof Error ? err.message : "Seed failed",
      kind: "seed_error",
      timestamp: Date.now(),
    });
  }
};
