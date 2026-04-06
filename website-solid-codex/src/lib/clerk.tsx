import { Clerk } from "@clerk/clerk-js";
import {
  Show,
  createContext,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  useContext,
  type Accessor,
  type JSX,
  type ParentComponent
} from "solid-js";

type EmittedResources = Parameters<Parameters<Clerk["addListener"]>[0]>[0];
type SessionResource = NonNullable<EmittedResources["session"]>;
type UserResource = NonNullable<EmittedResources["user"]>;
type OrganizationResource = NonNullable<EmittedResources["organization"]>;

type ClerkContextValue = {
  clerk: Accessor<Clerk | undefined>;
  configured: boolean;
  isLoaded: Accessor<boolean>;
  organization: Accessor<OrganizationResource | null>;
  session: Accessor<SessionResource | null>;
  user: Accessor<UserResource | null>;
  error: Accessor<string | null>;
};

const ClerkContext = createContext<ClerkContextValue>();

function getClerkKey() {
  return import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim() ?? "";
}

export const ClerkProvider: ParentComponent = props => {
  const [clerk, setClerk] = createSignal<Clerk>();
  const [isLoaded, setIsLoaded] = createSignal(false);
  const [session, setSession] = createSignal<SessionResource | null>(null);
  const [user, setUser] = createSignal<UserResource | null>(null);
  const [organization, setOrganization] = createSignal<OrganizationResource | null>(null);
  const [error, setError] = createSignal<string | null>(null);
  const configured = getClerkKey().length > 0;

  onMount(() => {
    if (!configured) {
      setIsLoaded(true);
      return;
    }

    const instance = new Clerk(getClerkKey());
    const unsubscribe = instance.addListener(emission => {
      setOrganization(emission.organization ?? null);
      setSession(emission.session ?? null);
      setUser(emission.user ?? null);
    });

    setClerk(instance);

    void instance
      .load({
        afterSignOutUrl: "/",
        signInForceRedirectUrl: "/",
        signUpForceRedirectUrl: "/"
      })
      .catch(cause => {
        setError(cause instanceof Error ? cause.message : "Failed to load Clerk");
      })
      .finally(() => {
        setIsLoaded(true);
      });

    onCleanup(() => {
      unsubscribe();
    });
  });

  return (
    <ClerkContext.Provider
      value={{
        clerk,
        configured,
        isLoaded,
        organization,
        session,
        user,
        error
      }}
    >
      {props.children}
    </ClerkContext.Provider>
  );
};

export function useClerk() {
  const context = useContext(ClerkContext);

  if (!context) {
    throw new Error("Clerk context is not available");
  }

  return context;
}

export function ClerkUserButton(props: { class?: string }) {
  const clerk = useClerk();
  let buttonRef: HTMLDivElement | undefined;

  createEffect(() => {
    const instance = clerk.clerk();
    const node = buttonRef;
    const currentUser = clerk.user();

    if (!instance || !node || !currentUser || !clerk.isLoaded()) {
      return;
    }

    instance.mountUserButton(node);

    onCleanup(() => {
      instance.unmountUserButton(node);
    });
  });

  return (
    <Show when={clerk.user()}>
      <div ref={buttonRef} class={props.class} />
    </Show>
  );
}

export function ClerkOnly(props: { children: JSX.Element; fallback?: JSX.Element }) {
  const clerk = useClerk();
  return <Show when={clerk.user()} fallback={props.fallback}>{props.children}</Show>;
}
