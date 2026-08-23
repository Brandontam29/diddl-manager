import { createServerFn } from "@tanstack/solid-start";

import { authedMiddleware } from "./auth";

/**
 * The smallest possible proof that the Clerk cookie survives the server-function
 * round trip. The real handlers land with "Server functions and the
 * authorization-scoping suite"; this one stays as a cheap liveness check.
 */
export const getSignedInUserId = createServerFn({ method: "GET" })
  .middleware([authedMiddleware])
  .handler(({ context }) => context.userId);
