import { Diddl, ListItem } from "@shared";
import { createIntersectionObserver } from "@solid-primitives/intersection-observer";
import { useSearchParams } from "@solidjs/router";
import { Component, JSX, createComputed, createMemo, createSignal, on } from "solid-js";

import DiddlListCard from "./DiddlListCard";

const InfiniteScroll: Component<{
  children: JSX.Element;
  callback?: (idNumber: number) => void;
}> = (props) => {
  const [params] = useSearchParams();

  const [targets, setTargets] = createSignal<Element[]>([]);
  const [elementId, setElementId] = createSignal("0");

  createComputed(
    on([() => params.from, () => params.to, () => params.type], () => {
      setElementId("0");

      if (props.callback === undefined) return;
      props.callback(0);
    }),
  );

  createIntersectionObserver(
    targets,
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        if (props.callback === undefined) return;

        const idNumber = parseInt(entry.target.id);

        if (Number.isNaN(idNumber)) return;

        setElementId(`${idNumber + 1}`);
        props.callback(idNumber);
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

const DiddlCardListLimiter: Component<{
  diddls?: (Diddl & { listItem?: ListItem })[];
  isListItem?: boolean;
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
      <DiddlListCard diddls={limitedDiddls()} isListItem={props.isListItem} />
    </InfiniteScroll>
  );
};

export default DiddlCardListLimiter;
