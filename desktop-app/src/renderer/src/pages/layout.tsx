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
import { fetchDiddlState, setDiddlStore } from "@renderer/features/diddl";

import Sidebar from "./components/Sidebar";

const BaseLayout: Component<RouteSectionProps> = (props) => {
  onMount(() => {
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
