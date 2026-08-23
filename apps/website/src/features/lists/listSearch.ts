import { z } from "zod";

import type { DiddlCardItem } from "@/features/diddl/cardItems";
import { filterCatalog, librarySearchSchema } from "@/features/diddl/librarySearch";
import type { Diddl, JoinedListItem, ListItemFilter } from "@/shared";

/**
 * The router JSON-parses search values, so `?isDamaged=true` arrives as a boolean
 * and `?minCount=2` as a number; anything else is dropped rather than coerced
 * (`minCount=` must not become a 0-count filter).
 */
const flag = z.boolean().optional().catch(undefined);
const count = z.number().int().nonnegative().optional().catch(undefined);

/**
 * The List page's URL search params, verbatim from the desktop (spec §6): the
 * Library's `type` / `from` / `to`, plus `showAll` and the List Item state filters
 * `isDamaged` / `isIncomplete` / `minCount` / `maxCount`. Invalid values fall back
 * to "unset" so a bad URL still renders the list.
 */
export const listSearchSchema = librarySearchSchema.extend({
  showAll: flag,
  isDamaged: flag,
  isIncomplete: flag,
  minCount: count,
  maxCount: count,
});

export type ListSearch = z.infer<typeof listSearchSchema>;

/** The params that filter on List Item state — the server applies them, Show-all cannot. */
const LIST_STATE_KEYS = ["isDamaged", "isIncomplete", "minCount", "maxCount"] as const;

/** The server-side filters (`ListItemFilter`) carried by the URL, or `undefined` when none. */
export const toListItemFilter = (search: ListSearch): ListItemFilter | undefined => {
  const filter: ListItemFilter = {};

  if (search.type !== undefined) filter.type = search.type;
  for (const key of LIST_STATE_KEYS) {
    const value = search[key];
    if (value !== undefined) Object.assign(filter, { [key]: value });
  }

  return Object.keys(filter).length > 0 ? filter : undefined;
};

/** Any List Item state filter disables Show-all mode (the Catalog has no such state). */
export const hasListStateFilters = (search: ListSearch) =>
  LIST_STATE_KEYS.some((key) => search[key] !== undefined);

export const isShowAllMode = (search: ListSearch) =>
  search.showAll === true && !hasListStateFilters(search);

/**
 * Show-all mode: the Catalog narrowed like the Library (`type` / `from` / `to`),
 * where every Diddl the list holds is replaced by its List Items — so owned ones
 * show their quantity and the rest render at zero.
 */
export const mergeCatalogWithItems = (
  catalog: Diddl[],
  items: JoinedListItem[],
  search: ListSearch,
): DiddlCardItem[] => {
  const itemsByDiddlId = new Map<number, JoinedListItem[]>();
  for (const item of items) {
    const diddlItems = itemsByDiddlId.get(item.diddlId) ?? [];
    diddlItems.push(item);
    itemsByDiddlId.set(item.diddlId, diddlItems);
  }

  return filterCatalog(catalog, search).flatMap(
    (diddl): DiddlCardItem[] => itemsByDiddlId.get(diddl.id) ?? [diddl],
  );
};
