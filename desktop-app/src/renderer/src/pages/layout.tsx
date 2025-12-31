import { ToastRegion, ToastList } from "@renderer/components/ui/toast";
import FallbackPageLoading from "@renderer/components/FallbackPageLoading";
import { fetchTrackerList } from "@renderer/features/lists";
import { fetchDiddlState, setDiddlStore } from "@renderer/features/diddl";
import { RouteSectionProps } from "@solidjs/router";
import { type Component, createComputed, createEffect, createMemo, on, Suspense } from "solid-js";

import Sidebar from "./components/Sidebar";

const BaseLayout: Component<RouteSectionProps> = (props) => {
  createEffect(() => {
    fetchTrackerList();
    fetchDiddlState();
  });

  createComputed(
    on([() => props.location.pathname, () => props.location.search], () =>
      setDiddlStore("selectedIndices", []),
    ),
  );

  const currentPath = createMemo(() => `${props.location.pathname}${props.location.search}`);

  createEffect(() => console.log("location", JSON.stringify(props.location)));
  createEffect(() => console.log("currentPath", currentPath()));

  return (
    <>
      <Sidebar currentPath={currentPath()} />
      <Suspense fallback={<FallbackPageLoading />}>{props.children}</Suspense>
      <ToastRegion>
        <ToastList />
      </ToastRegion>
    </>
  );
};

export default BaseLayout;
