/**
 * Server functions signal failure by throwing (spec §5). The desktop's tRPC
 * procedures threw `TRPCError` too, so this is parity, not a new convention —
 * neverthrow appears only in desktop-only file-system utilities.
 *
 * Every error carries a tRPC-style `code` for server-side callers and logs. It does
 * **not** survive the wire: TanStack Start serialises a thrown error as a plain
 * `Error` with only its `message`, so client error boundaries cannot use
 * `instanceof` or `.code` — they must match on the message (or a response status
 * set before throwing) until the UI tickets settle a client-side convention.
 */
export type ErrorCode = "UNAUTHORIZED" | "NOT_FOUND" | "BAD_REQUEST" | "CONFLICT";

export class AppError extends Error {
  constructor(
    readonly code: ErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Not signed in") {
    super("UNAUTHORIZED", message);
    this.name = "UnauthorizedError";
  }
}

/**
 * Thrown both when a row does not exist and when it belongs to another user —
 * the two are deliberately indistinguishable to the caller (spec §5, §10).
 */
export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super("NOT_FOUND", message);
    this.name = "NotFoundError";
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super("BAD_REQUEST", message);
    this.name = "BadRequestError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super("CONFLICT", message);
    this.name = "ConflictError";
  }
}
