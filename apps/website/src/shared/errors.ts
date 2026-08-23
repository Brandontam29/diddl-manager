/**
 * The one piece of the server's error vocabulary the browser needs: TanStack Start
 * forwards a thrown error as a plain `Error` carrying only `message`, so the client
 * recognises an expired session by this exact text (`UnauthorizedError`'s default).
 */
export const UNAUTHORIZED_MESSAGE = "Not signed in";
