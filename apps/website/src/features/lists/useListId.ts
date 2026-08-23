import { useParams } from "@tanstack/solid-router";
import { createMemo } from "solid-js";

/**
 * The `$listId` of `/app/lists/$listId` when rendered there, `null` on the Library.
 * The route's `params.parse` already made it a number (or sent a bad id to
 * `notFoundComponent`), so this is only a lookup.
 */
export const useListId = () => {
  const params = useParams({ strict: false });

  return createMemo(() => params().listId ?? null);
};
