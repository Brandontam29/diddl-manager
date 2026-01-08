import { debounce } from "@solid-primitives/scheduled";
import { onCleanup, onMount } from "solid-js";

import { updateUiStateAction } from "./index";

export const useWindowTracking = () => {
  onMount(() => {
    const handleUpdate = debounce(() => {
      updateUiStateAction({
        windowBounds: {
          width: window.outerWidth,
          height: window.outerHeight,
          x: window.screenX,
          y: window.screenY,
        },
      });
    }, 1000);

    window.addEventListener("resize", handleUpdate);

    let lastX = window.screenX;
    let lastY = window.screenY;

    const intervalId = setInterval(() => {
      if (window.screenX !== lastX || window.screenY !== lastY) {
        lastX = window.screenX;
        lastY = window.screenY;
        handleUpdate();
      }
    }, 1000);

    onCleanup(() => {
      window.removeEventListener("resize", handleUpdate);
      clearInterval(intervalId);
    });
  });
};
