import { useLocation } from "@tanstack/solid-router";
import { createComputed, untrack } from "solid-js";

/**
 * Runs `fn` once on mount and again whenever the path or search changes (not the
 * hash, not a structural re-emit of the same location), before the new route paints.
 * Replaces the desktop's `createComputed(on([pathname, search], ...))` without `on`
 * (spec §2).
 */
export const onLocationChange = (fn: (pathAndSearch: string) => void) => {
  const location = useLocation({ select: (l) => `${l.pathname}${l.searchStr}` });

  createComputed(() => {
    const current = location();
    untrack(() => fn(current));
  });
};
