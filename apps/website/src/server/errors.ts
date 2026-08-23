/**
 * Server functions signal failure by throwing (spec §5). The desktop's tRPC
 * procedures threw `TRPCError` too, so this is parity, not a new convention —
 * neverthrow appears only in desktop-only file-system utilities.
 */
export class UnauthorizedError extends Error {
  readonly code = "UNAUTHORIZED";

  constructor(message = "Not signed in") {
    super(message);
    this.name = "UnauthorizedError";
  }
}
