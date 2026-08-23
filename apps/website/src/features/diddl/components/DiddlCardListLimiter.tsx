import { createIntersectionObserver } from "@solid-primitives/intersection-observer";
import { Component, JSX, createMemo, createSignal } from "solid-js";

import type { DiddlCardItem } from "@/features/diddl";
import DiddlCards from "@/features/lists/components/DiddlCards";
import { onLocationChange } from "@/hooks/onLocationChange";

const InfiniteScroll: Component<{
  children: JSX.Element;
  callback?: (idNumber: number) => void;
}> = (props) => {
  const [targets, setTargets] = createSignal<Element[]>([]);
  const [elementId, setElementId] = createSignal("0");

  // Any change to the URL (new filter, new list) restarts the window from the top.
  onLocationChange(() => {
    setElementId("0");
    props.callback?.(0);
  });

  createIntersectionObserver(
    targets,
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        if (props.callback === undefined) return;

        const idNumber = parseInt(entry.target.id);

        if (Number.isNaN(idNumber)) return;

        // Each time the sentinel comes into view the window grows by one step.
        const next = idNumber + 1;
        setElementId(`${next}`);
        props.callback(next);
      });
    },
    { threshold: 0 },
  );

  return (
    <>
      {props.children}
      <div ref={(el) => setTargets((prev) => [...prev, el])} class="invisible" id={elementId()}>
        Infinite Scroll Easter Egg
      </div>
    </>
  );
};

const DEFAULT_SHOWN = 150;
const INCREMENT_SHOWN = 150;

/**
 * Renders the first 150 cards and 150 more each time the sentinel below the grid
 * scrolls into view — the desktop's grid limiter (spec §6), kept because the full
 * Catalog is 3,913 images.
 */
const DiddlCardListLimiter: Component<{
  diddls?: DiddlCardItem[] | null;
  highlightZeroQuantity?: boolean;
  showQuantityControls?: boolean;
}> = (props) => {
  const [maxShown, setMaxShown] = createSignal(DEFAULT_SHOWN);

  const limitedDiddls = createMemo(() => {
    if (!props.diddls) return props.diddls;

    return props.diddls.slice(0, maxShown());
  });

  return (
    <InfiniteScroll
      callback={(idNumber) => {
        setMaxShown(DEFAULT_SHOWN + idNumber * INCREMENT_SHOWN);
      }}
    >
      <DiddlCards
        items={limitedDiddls()}
        highlightZeroQuantity={props.highlightZeroQuantity}
        showQuantityControls={props.showQuantityControls}
      />
    </InfiniteScroll>
  );
};

export default DiddlCardListLimiter;
