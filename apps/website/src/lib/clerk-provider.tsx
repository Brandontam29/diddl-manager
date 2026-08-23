import type { Clerk } from "@clerk/clerk-js";
import {
  type Accessor,
  createContext,
  createSignal,
  type JSX,
  onCleanup,
  onMount,
  useContext,
} from "solid-js";

import { loadClerk } from "./clerk";

/** `@clerk/types` is only a transitive dependency, so the user type is read off the class. */
type ClerkUser = NonNullable<Clerk["user"]>;

type ClerkContextValue = {
  /** `undefined` until ClerkJS has loaded in the browser. */
  clerk: Accessor<Clerk | undefined>;
  /** `null` when loaded and signed out. */
  user: Accessor<ClerkUser | null | undefined>;
};

const ClerkContext = createContext<ClerkContextValue>();

/**
 * The thin hand-rolled provider ADR 0001 calls for: it loads ClerkJS once on the
 * client and re-publishes the user through a signal as Clerk emits resource changes.
 * Everything else — sign-in, sign-up, the user profile — is Clerk's own prebuilt UI
 * mounted imperatively onto a `ref`.
 */
export function ClerkProvider(props: { children: JSX.Element }) {
  const [clerk, setClerk] = createSignal<Clerk>();
  const [user, setUser] = createSignal<ClerkUser | null>();

  onMount(() => {
    let unsubscribe: (() => void) | undefined;
    let disposed = false;

    void loadClerk().then((instance) => {
      if (disposed) {
        return;
      }
      setClerk(instance);
      // addListener fires synchronously with the current resources, so this also
      // publishes the initial user.
      unsubscribe = instance.addListener((resources) => setUser(() => resources.user ?? null));
    });

    onCleanup(() => {
      disposed = true;
      unsubscribe?.();
    });
  });

  return <ClerkContext.Provider value={{ clerk, user }}>{props.children}</ClerkContext.Provider>;
}

export function useClerk(): ClerkContextValue {
  const store = useContext(ClerkContext);
  if (!store) {
    throw new Error("useClerk must be used inside <ClerkProvider>");
  }
  return store;
}
