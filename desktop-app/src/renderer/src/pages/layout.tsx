import { RouteSectionProps } from "@solidjs/router";
import {
  type Component,
  Suspense,
  createComputed,
  createEffect,
  createMemo,
  on,
  onMount,
} from "solid-js";

import FallbackPageLoading from "@renderer/components/fallback/FallbackPageLoading";
import { ToastList, ToastRegion } from "@renderer/components/ui/toast";
import { clearDiffCache, fetchDiddls, setDiddlStore } from "@renderer/features/diddl";
import { useWindowTracking } from "@renderer/features/ui-state";
import UpdateDialog from "@renderer/features/updater/UpdateDialog";
import { initUpdateState } from "@renderer/features/updater/update-state";

import Sidebar from "./components/Sidebar";

const BaseLayout: Component<RouteSectionProps> = (props) => {
  useWindowTracking();

  onMount(() => {
    fetchDiddls();
    initUpdateState();
  });

  createComputed(
    on([() => props.location.pathname, () => props.location.search], () => {
      setDiddlStore("selectedIndices", []);

      if (props.location.pathname !== "/") {
        setDiddlStore("diffListIds", []);
        clearDiffCache();
      }
    }),
  );

  const currentPath = createMemo(() => `${props.location.pathname}${props.location.search}`);

  createEffect(() => console.log("location", JSON.stringify(props.location)));
  createEffect(() => console.log("currentPath", currentPath()));

  return (
    <>
      <Sidebar currentPath={currentPath()} />
      <Suspense fallback={<FallbackPageLoading />}>{props.children}</Suspense>
      <UpdateDialog />
      <ToastRegion>
        <ToastList />
      </ToastRegion>
    </>
  );
};

export default BaseLayout;
