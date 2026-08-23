import { createClerkClient } from "@clerk/backend";
import { createMiddleware } from "@tanstack/solid-start";
import { getRequest } from "@tanstack/solid-start/server";

import { UnauthorizedError } from "./errors";

/**
 * Built on first use, never at module scope: routes import this module for the
 * middleware, so the client bundle keeps the module shell (the compiler strips only
 * the handler bodies). A module-level `process.env` read would therefore run in the
 * browser, where `process.env` is `{}`, and throw on every page load.
 */
let clerkClient: ReturnType<typeof createClerkClient> | undefined;

function getClerkClient() {
  if (!clerkClient) {
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      throw new Error("CLERK_SECRET_KEY is not set");
    }
    clerkClient = createClerkClient({
      secretKey,
      publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
    });
  }
  return clerkClient;
}

/**
 * The one auth middleware every server function composes (spec §4). It reads the
 * `__session` cookie off the incoming request, verifies it with `@clerk/backend`,
 * and puts the Clerk user id on the context — the `user_id text` every user-owned
 * table is scoped by. There is no local users table and no webhooks.
 *
 * `authorizedParties` is deliberately unset: the app is single-origin and the
 * production origin is not known until the Vercel project exists (ticket 28).
 *
 * Clerk gets a body-less copy of the request: `authenticateRequest` clones it with
 * `new Request(request)`, and for POST server functions Start has already consumed
 * the body stream by the time middleware runs, which makes that clone throw
 * ("Response body object should not be disturbed or locked"). Only the URL and the
 * headers (cookies) matter for authentication.
 *
 * A `handshake` status means Clerk wants a redirect roundtrip to refresh an expired
 * token. Server functions cannot perform that roundtrip, so it is treated as
 * unauthenticated — the client's own Clerk instance refreshes and the call retries.
 */
export const authedMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const requestState = await getClerkClient().authenticateRequest(withoutBody(getRequest()));
  const { userId } = requestState.toAuth() ?? {};

  if (!userId) {
    throw new UnauthorizedError();
  }

  return next({ context: { userId } });
});

function withoutBody(request: Request): Request {
  return new Request(request.url, { method: request.method, headers: request.headers });
}
