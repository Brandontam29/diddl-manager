import type { TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc";

export type ErrorDetails = Record<string, unknown>;

export type AppErrorCode =
  | "CONFIG_INVALID"
  | "CONFIG_READ_FAILED"
  | "CONFIG_WRITE_FAILED"
  | "DB_CONSTRAINT"
  | "DB_FOREIGN_KEY_CONSTRAINT"
  | "FILE_ACCESS_DENIED"
  | "FILE_IN_USE"
  | "FILE_NOT_FOUND"
  | "INSUFFICIENT_STORAGE"
  | "INVALID_INPUT"
  | "RESOURCE_NOT_FOUND"
  | "UNKNOWN";

type AppErrorOptions = {
  appCode: AppErrorCode;
  trpcCode: TRPC_ERROR_CODE_KEY;
  publicMessage: string;
  details?: ErrorDetails;
  cause?: unknown;
};

export class AppError extends Error {
  public readonly appCode: AppErrorCode;
  public readonly trpcCode: TRPC_ERROR_CODE_KEY;
  public readonly details?: ErrorDetails;
  public override readonly cause?: unknown;

  constructor({ appCode, trpcCode, publicMessage, details, cause }: AppErrorOptions) {
    super(publicMessage);
    this.name = "AppError";
    this.appCode = appCode;
    this.trpcCode = trpcCode;
    this.details = details;
    this.cause = cause;
  }
}

export const notFoundError = (publicMessage: string, details?: ErrorDetails, cause?: unknown) =>
  new AppError({
    appCode: "RESOURCE_NOT_FOUND",
    trpcCode: "NOT_FOUND",
    publicMessage,
    details,
    cause,
  });

export const fileNotFoundError = (
  publicMessage: string,
  details?: ErrorDetails,
  cause?: unknown,
) =>
  new AppError({
    appCode: "FILE_NOT_FOUND",
    trpcCode: "NOT_FOUND",
    publicMessage,
    details,
    cause,
  });

export const invalidInputError = (publicMessage: string, details?: ErrorDetails, cause?: unknown) =>
  new AppError({
    appCode: "INVALID_INPUT",
    trpcCode: "BAD_REQUEST",
    publicMessage,
    details,
    cause,
  });

export const preconditionFailedError = (
  appCode: Extract<AppErrorCode, "CONFIG_INVALID">,
  publicMessage: string,
  details?: ErrorDetails,
  cause?: unknown,
) =>
  new AppError({
    appCode,
    trpcCode: "PRECONDITION_FAILED",
    publicMessage,
    details,
    cause,
  });

export const conflictError = (
  appCode: Extract<AppErrorCode, "DB_CONSTRAINT" | "DB_FOREIGN_KEY_CONSTRAINT">,
  publicMessage: string,
  details?: ErrorDetails,
  cause?: unknown,
) =>
  new AppError({
    appCode,
    trpcCode: "CONFLICT",
    publicMessage,
    details,
    cause,
  });

export const forbiddenError = (
  appCode: Extract<AppErrorCode, "FILE_ACCESS_DENIED">,
  publicMessage: string,
  details?: ErrorDetails,
  cause?: unknown,
) =>
  new AppError({
    appCode,
    trpcCode: "FORBIDDEN",
    publicMessage,
    details,
    cause,
  });

export const internalAppError = (
  appCode: Exclude<
    AppErrorCode,
    | "CONFIG_INVALID"
    | "DB_CONSTRAINT"
    | "DB_FOREIGN_KEY_CONSTRAINT"
    | "FILE_ACCESS_DENIED"
    | "FILE_NOT_FOUND"
    | "INVALID_INPUT"
    | "RESOURCE_NOT_FOUND"
  >,
  publicMessage: string,
  details?: ErrorDetails,
  cause?: unknown,
) =>
  new AppError({
    appCode,
    trpcCode: "INTERNAL_SERVER_ERROR",
    publicMessage,
    details,
    cause,
  });
