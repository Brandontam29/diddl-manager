import {
  type ErrorComponentProps,
  Outlet,
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/solid-router";
import { createComputed } from "solid-js";

import Sidebar from "@/components/app/Sidebar";
import FallbackPageLoading from "@/components/fallback/FallbackPageLoading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ToastList, ToastRegion } from "@/components/ui/toast";
import { clearSelectedIds, loadCatalog } from "@/features/diddl";
import { onLocationChange } from "@/hooks/onLocationChange";
import { getProfile, getSectionsWithLists } from "@/server/api";
import { UNAUTHORIZED_MESSAGE } from "@/shared/errors";

/**
 * The app shell under the `_authed` gate (spec §6): one loader for the Catalog
 * (cached forever by `loadCatalog`), the Sections with their Lists and the Profile,
 * which also lazily creates the profile + Default Section on first sign-in.
 * Every mutation ends in `router.invalidate()`, which re-runs this loader.
 */
export const Route = createFileRoute("/_authed/app")({
  loader: async () => {
    const [catalog, sections, profile] = await Promise.all([
      loadCatalog(),
      getSectionsWithLists(),
      getProfile(),
    ]);
    return { catalog, sections, profile };
  },
  // Mutations call `router.invalidate()`; navigation alone must not refetch.
  staleTime: Infinity,
  pendingComponent: FallbackPageLoading,
  errorComponent: AppError,
  component: AppLayout,
});

function AppLayout() {
  // Selection never survives a navigation, including a filter change (spec §6).
  onLocationChange(clearSelectedIds);

  return (
    <div class="flex min-h-screen">
      <Sidebar />
      <main class="flex min-w-0 grow flex-col">
        <Outlet />
      </main>
      <ToastRegion>
        <ToastList />
      </ToastRegion>
    </div>
  );
}

/**
 * Only `message` survives the wire (see `server/errors.ts`), so an expired session is
 * recognised by the UnauthorizedError's default text. Retrying that would just fail
 * again; the user is sent back to sign in and returned here afterwards.
 */
const isUnauthorized = (error: unknown) =>
  error instanceof Error && error.message === UNAUTHORIZED_MESSAGE;

function AppError(props: ErrorComponentProps) {
  const router = useRouter();
  const navigate = useNavigate();

  createComputed(() => {
    if (!isUnauthorized(props.error)) return;
    void navigate({
      to: "/sign-in/$",
      params: { _splat: "" },
      search: { redirect: router.state.location.href },
      replace: true,
    });
  });

  return (
    <div class="flex min-h-screen items-center justify-center p-8">
      <Card class="max-w-md">
        <CardHeader>
          <CardTitle>Something went wrong</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-sm text-muted-foreground">
            {props.error instanceof Error ? props.error.message : "Could not load your data."}
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => void router.invalidate()}>Retry</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
