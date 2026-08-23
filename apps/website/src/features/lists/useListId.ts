import { useParams } from "@tanstack/solid-router";
import { createMemo } from "solid-js";

/**
 * The `$listId` of `/app/lists/$listId` when rendered there, `null` on the Library.
 * The card grid and the Taskbar are shared by both pages.
 */
export const useListId = () => {
  const params = useParams({ strict: false });

  return createMemo(() => {
    const raw = params().listId;
    if (raw === undefined) return null;
    const parsed = Number.parseInt(raw);
    return Number.isNaN(parsed) ? null : parsed;
  });
};
