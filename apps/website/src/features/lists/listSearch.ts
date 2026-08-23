import { z } from "zod";

import type { DiddlCardItem } from "@/features/diddl";
import { type Diddl, type JoinedListItem, type ListItemFilter, diddlTypeSchema } from "@/shared";

/**
 * The desktop read every param as a string (`showAll === "true"`); TanStack Router
 * parses `?showAll=true` to a boolean, so both spellings are accepted here.
 */
const boolParam = z
  .union([z.boolean(), z.enum(["true", "false"]).transform((value) => value === "true")])
  .optional()
  .catch(undefined);
const index = z.coerce.number().int().nonnegative().optional().catch(undefined);
const count = z.coerce.number().int().optional().catch(undefined);

/**
 * The List page's URL search params, verbatim from the desktop (spec §6): the
 * Library's `type` / `from` / `to`, plus `showAll` and the List Item state filters
 * `isDamaged` / `isIncomplete` / `minCount` / `maxCount`. Invalid values fall back
 * to "unset" so a bad URL still renders the list.
 */
export const listSearchSchema = z.object({
  type: diddlTypeSchema.optional().catch(undefined),
  from: index,
  to: index,
  showAll: boolParam,
  isDamaged: boolParam,
  isIncomplete: boolParam,
  minCount: count,
  maxCount: count,
});

export type ListSearch = z.infer<typeof listSearchSchema>;

/** The server-side filters (`ListItemFilter`) carried by the URL, or `undefined` when none. */
export const toListItemFilter = (search: ListSearch): ListItemFilter | undefined => {
  const filter: ListItemFilter = {};

  if (search.type !== undefined) filter.type = search.type;
  if (search.isDamaged !== undefined) filter.isDamaged = search.isDamaged;
  if (search.isIncomplete !== undefined) filter.isIncomplete = search.isIncomplete;
  if (search.minCount !== undefined) filter.minCount = search.minCount;
  if (search.maxCount !== undefined) filter.maxCount = search.maxCount;

  return Object.keys(filter).length > 0 ? filter : undefined;
};

/** Any List Item state filter disables Show-all mode (the Catalog has no such state). */
export const hasListStateFilters = (search: ListSearch) =>
  search.isDamaged !== undefined ||
  search.isIncomplete !== undefined ||
  search.minCount !== undefined ||
  search.maxCount !== undefined;

export const isShowAllMode = (search: ListSearch) =>
  search.showAll === true && !hasListStateFilters(search);

/**
 * Show-all mode: the whole Catalog (narrowed by `type` / `from` / `to` like the
 * Library), where every Diddl the list holds is replaced by its List Items — so
 * owned ones show their quantity and the rest render at zero.
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

  let filtered = catalog;

  if (search.type !== undefined) {
    filtered = filtered.filter((diddl) => diddl.type === search.type);
  }

  if (search.from !== undefined || search.to !== undefined) {
    filtered = filtered.slice(search.from ?? 0, search.to);
  }

  return filtered.flatMap((diddl): DiddlCardItem[] => itemsByDiddlId.get(diddl.id) ?? [diddl]);
};
