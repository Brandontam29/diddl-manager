import { getRouteApi } from "@tanstack/solid-router";

/**
 * The `/app` layout loader's data (Catalog, Sections with Lists, Profile), readable
 * from any component under `/app` without prop drilling — the web stand-in for the
 * desktop's `useDiddls` / `useListSections` / `useProfile` async stores.
 */
const appRoute = getRouteApi("/_authed/app");

export const useAppData = () => appRoute.useLoaderData();
