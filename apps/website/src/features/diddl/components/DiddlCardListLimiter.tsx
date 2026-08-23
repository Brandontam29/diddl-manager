import { createIntersectionObserver } from "@solid-primitives/intersection-observer";
import { Component, createMemo, createSignal } from "solid-js";

import type { DiddlCardItem } from "@/features/diddl";
import DiddlCards from "@/features/lists/components/DiddlCards";
import { onLocationChange } from "@/hooks/onLocationChange";

const DEFAULT_SHOWN = 150;
const INCREMENT_SHOWN = 150;

/**
 * Renders the first 150 cards and 150 more each time the sentinel below the grid
 * scrolls into view — the desktop's grid limiter (spec §6), kept because the full
 * Catalog is 3,913 images. Any navigation (new filter, new list) restarts at 150.
 */
const DiddlCardListLimiter: Component<{
  diddls?: DiddlCardItem[] | null;
  highlightZeroQuantity?: boolean;
  showQuantityControls?: boolean;
}> = (props) => {
  const [maxShown, setMaxShown] = createSignal(DEFAULT_SHOWN);
  const [sentinel, setSentinel] = createSignal<Element[]>([]);

  onLocationChange(() => setMaxShown(DEFAULT_SHOWN));

  createIntersectionObserver(
    sentinel,
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setMaxShown((shown) => shown + INCREMENT_SHOWN);
      }
    },
    { threshold: 0 },
  );

  const limitedDiddls = createMemo(() => props.diddls?.slice(0, maxShown()) ?? props.diddls);

  return (
    <>
      <DiddlCards
        items={limitedDiddls()}
        highlightZeroQuantity={props.highlightZeroQuantity}
        showQuantityControls={props.showQuantityControls}
      />
      <div ref={(el) => setSentinel([el])} class="invisible h-px w-full" aria-hidden="true" />
    </>
  );
};

export default DiddlCardListLimiter;
