import type { Clerk } from "@clerk/clerk-js";
import { createEffect, createSignal, onCleanup } from "solid-js";

import { useClerk } from "@/lib/clerk-provider";

type MountProps = {
  mount: (clerk: Clerk, node: HTMLDivElement) => void;
  unmount: (clerk: Clerk, node: HTMLDivElement) => void;
};

/**
 * Clerk's prebuilt components are mounted imperatively onto a DOM node, which is all
 * a Solid ref plus an effect needs. Nothing React is involved.
 *
 * The ref is a signal rather than the usual `let node!: HTMLDivElement` so the effect
 * waits for both the node and ClerkJS, whichever lands second.
 */
export function ClerkMount(props: MountProps) {
  const [node, setNode] = createSignal<HTMLDivElement>();
  const { clerk } = useClerk();

  createEffect(() => {
    const instance = clerk();
    const el = node();
    if (!instance || !el) {
      return;
    }
    props.mount(instance, el);
    onCleanup(() => props.unmount(instance, el));
  });

  return <div ref={setNode} />;
}
