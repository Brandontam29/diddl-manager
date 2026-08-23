import { z } from "zod";

import { type Diddl, diddlTypeSchema } from "@/shared";

/**
 * The Library's URL search params, verbatim from the desktop (spec §6): `type`
 * narrows to one Diddl Type, `from` / `to` slice the narrowed array (the sidebar's
 * `100-199` link is `from=99&to=199` — a desktop quirk kept on purpose).
 */
export const librarySearchSchema = z.object({
  type: diddlTypeSchema.optional(),
  from: z.coerce.number().int().nonnegative().optional(),
  to: z.coerce.number().int().nonnegative().optional(),
});

export type LibrarySearch = z.infer<typeof librarySearchSchema>;

export const filterCatalog = (catalog: Diddl[], search: LibrarySearch): Diddl[] => {
  let filtered = catalog;

  if (search.type !== undefined) {
    filtered = filtered.filter((diddl) => diddl.type === search.type);
  }

  if (search.from !== undefined || search.to !== undefined) {
    filtered = filtered.slice(search.from ?? 0, search.to);
  }

  return filtered;
};
