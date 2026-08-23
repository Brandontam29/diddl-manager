import type { Diddl } from "@/shared";
import { getCatalog } from "@/server/api";

/**
 * The Catalog is global and immutable between deploys, so the `/app` layout loader
 * treats it as `staleTime: Infinity` (spec §6): the first call fetches, every later
 * loader run — including the `router.invalidate()` after each mutation — reuses the
 * same promise. A rejected promise is dropped so Retry refetches.
 */
let catalogPromise: Promise<Diddl[]> | undefined;

export const loadCatalog = (): Promise<Diddl[]> => {
  if (!catalogPromise) {
    const attempt = getCatalog().catch((error: unknown) => {
      if (catalogPromise === attempt) catalogPromise = undefined;
      throw error;
    });
    catalogPromise = attempt;
  }
  return catalogPromise;
};
