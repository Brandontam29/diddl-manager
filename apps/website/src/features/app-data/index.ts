import { getRouteApi } from "@tanstack/solid-router";

/**
 * The `/app` layout loader's data (Catalog, Sections with Lists, Profile), readable
 * from any component under `/app` without prop drilling — the web stand-in for the
 * desktop's `useDiddls` / `useListSections` / `useProfile` async stores.
 */
const appRoute = getRouteApi("/_authed/app");

export const useAppData = () => appRoute.useLoaderData();

export type AppData = ReturnType<ReturnType<typeof useAppData>>;

/**
 * A List Section / List as the loader delivers them: the server rows, whose
 * timestamps arrive as `Date`s (Start's serialiser keeps them), not the ISO strings
 * of the desktop's zod models.
 */
export type AppSection = AppData["sections"][number];
export type AppList = AppSection["lists"][number];

/** Every List across the sections, in board order. */
export const allLists = (data: AppData): AppList[] =>
  data.sections.flatMap((section) => section.lists);

export const findList = (data: AppData, listId: number): AppList | undefined =>
  allLists(data).find((list) => list.id === listId);
