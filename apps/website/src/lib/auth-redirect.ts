import * as z from "zod";

/**
 * The `?redirect=` search param the auth pages carry: where `_authed` sends a
 * visitor back to after signing in or up. Only an in-app path is accepted — a
 * leading `/` that is not `//` — so the param can never become an open redirect
 * to another origin, whatever Clerk's own allow-list says. Anything else is
 * dropped rather than rejected, so a tampered link still lands on the sign-in page.
 */
export const authRedirectSearchSchema = z.object({
  redirect: z
    .string()
    .regex(/^\/(?!\/)/)
    .optional()
    .catch(undefined),
});

export const DEFAULT_AFTER_AUTH_PATH = "/app";
