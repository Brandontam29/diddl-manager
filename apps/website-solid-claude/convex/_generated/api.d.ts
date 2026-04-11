/* oxlint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type { FunctionReference } from "convex/server";

declare const fullApi: {
  messages: {
    list: FunctionReference<"query", "public", Record<string, never>, any>;
    send: FunctionReference<
      "mutation",
      "public",
      { userId: string; userName: string; body: string },
      any
    >;
    remove: FunctionReference<"mutation", "public", { id: any }, any>;
  };
  tasks: {
    list: FunctionReference<"query", "public", { userId: string }, any>;
    create: FunctionReference<"mutation", "public", { userId: string; title: string }, any>;
    toggle: FunctionReference<"mutation", "public", { id: any }, any>;
    remove: FunctionReference<"mutation", "public", { id: any }, any>;
  };
};

export declare const api: typeof fullApi;
export declare const internal: typeof fullApi;
