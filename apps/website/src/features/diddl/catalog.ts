import type { Diddl } from "@/shared";
import { getCatalog } from "@/server/api";

/**
 * The Catalog is global and immutable between deploys, so the `/app` layout loader
 * treats it as `staleTime: Infinity` (spec §6): the first call fetches, every later
 * loader run — including the `router.invalidate()` after each mutation — reuses the
 * same promise. A failed fetch is forgotten so Retry can try again.
 */
let catalogPromise: Promise<Diddl[]> | undefined;

export const loadCatalog = (): Promise<Diddl[]> => {
  catalogPromise ??= getCatalog().catch((error: unknown) => {
    catalogPromise = undefined;
    throw error;
  });
  return catalogPromise;
};
