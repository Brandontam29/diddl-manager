import { ToastRegion, ToastList } from "@renderer/components/ui/toast";
import FallbackPageLoading from "@renderer/components/FallbackPageLoading";
import { fetchTrackerList } from "@renderer/features/lists";
import { fetchDiddlState, setDiddlStore } from "@renderer/features/diddl";
import { RouteSectionProps } from "@solidjs/router";
import { type Component, createComputed, createEffect, on, Suspense } from "solid-js";

import Sidebar from "./components/Sidebar";

const BaseLayout: Component<RouteSectionProps> = (props) => {
  createEffect(() => {
    fetchTrackerList();
    fetchDiddlState();
  });

  createEffect(() => console.log(props.params));
  createEffect(() => console.log(JSON.stringify(props.location)));
  createComputed(
    on([() => props.location.pathname, () => props.location.search], () =>
      setDiddlStore("selectedIndices", []),
    ),
  );

  return (
    <>
      <Sidebar location={location} />
      <Suspense fallback={<FallbackPageLoading />}>{props.children}</Suspense>
      <ToastRegion>
        <ToastList />
      </ToastRegion>
    </>
  );
};

export default BaseLayout;
