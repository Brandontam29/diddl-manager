import { useLocation } from "@tanstack/solid-router";
import { createEffect, untrack } from "solid-js";

/**
 * Runs `fn` once on mount and again after every navigation (path or search change),
 * without tracking anything `fn` reads. Replaces the desktop's
 * `createComputed(on([pathname, search], ...))`, since spec §2 avoids `on`.
 */
export const onLocationChange = (fn: (href: string) => void) => {
  const location = useLocation();

  createEffect(() => {
    const href = location().href;
    untrack(() => fn(href));
  });
};
