import { ConvexClient } from "convex/browser";
import type { FunctionArgs, FunctionReference, FunctionReturnType } from "convex/server";
import {
  createContext,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  useContext,
  type Accessor,
  type ParentComponent
} from "solid-js";

import { useClerk } from "~/lib/clerk";

type QueryState = "unavailable" | "loading" | "ready" | "error";

type ConvexContextValue = {
  client: Accessor<ConvexClient | undefined>;
  configured: boolean;
  url: string;
};

const ConvexContext = createContext<ConvexContextValue>();

function getConvexUrl() {
  return import.meta.env.VITE_CONVEX_URL?.trim() ?? "";
}

export const ConvexProvider: ParentComponent = props => {
  const clerk = useClerk();
  const [client, setClient] = createSignal<ConvexClient>();
  const url = getConvexUrl();
  const configured = url.length > 0;

  onMount(() => {
    if (!configured) {
      return;
    }

    const instance = new ConvexClient(url);
    instance.setAuth(async () => {
      const currentSession = clerk.session();

      if (!currentSession) {
        return null;
      }

      return currentSession.getToken({
        template: "convex"
      });
    });

    setClient(instance);

    onCleanup(() => {
      void instance.close();
    });
  });

  return (
    <ConvexContext.Provider
      value={{
        client,
        configured,
        url
      }}
    >
      {props.children}
    </ConvexContext.Provider>
  );
};

export function useConvex() {
  const context = useContext(ConvexContext);

  if (!context) {
    throw new Error("Convex context is not available");
  }

  return context;
}

export function useConvexQuery<Query extends FunctionReference<"query">>(
  query: Query,
  args: Accessor<FunctionArgs<Query>>
) {
  const convex = useConvex();
  const [data, setData] = createSignal<FunctionReturnType<Query>>();
  const [error, setError] = createSignal<string | null>(null);
  const [status, setStatus] = createSignal<QueryState>(convex.configured ? "loading" : "unavailable");

  createEffect(() => {
    const client = convex.client();

    if (!convex.configured) {
      setStatus("unavailable");
      setData(undefined);
      setError(null);
      return;
    }

    if (!client) {
      setStatus("loading");
      return;
    }

    setStatus("loading");
    setError(null);

    const unsubscribe = client.onUpdate(
      query,
      args(),
      value => {
        setData(() => value);
        setStatus("ready");
      },
      cause => {
        setError(cause.message);
        setStatus("error");
      }
    );

    onCleanup(() => {
      unsubscribe();
    });
  });

  return {
    configured: convex.configured,
    data,
    error,
    status
  };
}
