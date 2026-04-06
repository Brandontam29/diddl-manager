import { TRPCError } from "@trpc/server";
import { ZodError } from "zod";

import { logging } from "../logging";
import { toError } from "../neverthrow-utils/to-error";
import {
  AppError,
  conflictError,
  fileNotFoundError,
  forbiddenError,
  internalAppError,
  invalidInputError,
  type ErrorDetails,
} from "./app-error";

type ToTrpcErrorOptions = {
  fallbackMessage: string;
  operation: string;
  details?: ErrorDetails;
};

type ErrorWithCode = Error & {
  code?: string;
  errno?: number;
  path?: string;
};

const isErrorWithCode = (error: unknown): error is ErrorWithCode =>
  error instanceof Error && "code" in error;

const isSqliteConstraintError = (error: Error) =>
  /UNIQUE constraint failed/i.test(error.message) || /CHECK constraint failed/i.test(error.message);

const isSqliteForeignKeyError = (error: Error) => /FOREIGN KEY constraint failed/i.test(error.message);

const serializeError = (error: unknown) => {
  const normalized = toError(error);
  const nodeError = isErrorWithCode(normalized) ? normalized : undefined;

  return {
    name: normalized.name,
    message: normalized.message,
    code: nodeError?.code,
    errno: nodeError?.errno,
    path: nodeError?.path,
    stack: normalized.stack,
  };
};

const classifyUnknownError = (error: unknown, options: ToTrpcErrorOptions): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof ZodError) {
    return invalidInputError(
      "The provided data is invalid",
      {
        ...options.details,
        issues: error.issues.map((issue) => ({
          code: issue.code,
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      error,
    );
  }

  const normalized = toError(error);

  if (isErrorWithCode(normalized)) {
    switch (normalized.code) {
      case "ENOENT":
        return fileNotFoundError(
          "A required file or directory could not be found",
          { ...options.details, path: normalized.path },
          normalized,
        );
      case "EACCES":
      case "EPERM":
        return forbiddenError(
          "FILE_ACCESS_DENIED",
          "Access to a required file or directory was denied",
          { ...options.details, path: normalized.path },
          normalized,
        );
      case "EBUSY":
        return internalAppError(
          "FILE_IN_USE",
          "A required file is currently in use",
          { ...options.details, path: normalized.path },
          normalized,
        );
      case "ENOSPC":
        return internalAppError(
          "INSUFFICIENT_STORAGE",
          "There is not enough disk space to complete this action",
          { ...options.details, path: normalized.path },
          normalized,
        );
      default:
        break;
    }
  }

  if (isSqliteForeignKeyError(normalized)) {
    return conflictError(
      "DB_FOREIGN_KEY_CONSTRAINT",
      "This action references data that does not exist",
      options.details,
      normalized,
    );
  }

  if (isSqliteConstraintError(normalized)) {
    return conflictError(
      "DB_CONSTRAINT",
      "This action conflicts with existing data",
      options.details,
      normalized,
    );
  }

  return internalAppError("UNKNOWN", options.fallbackMessage, options.details, normalized);
};

export const toTrpcError = (error: unknown, options: ToTrpcErrorOptions) => {
  if (error instanceof TRPCError) {
    return error;
  }

  const appError = classifyUnknownError(error, options);

  logging.error({
    operation: options.operation,
    appCode: appError.appCode,
    trpcCode: appError.trpcCode,
    details: appError.details ?? null,
    cause: serializeError(appError.cause ?? error),
  });

  return new TRPCError({
    code: appError.trpcCode,
    message: appError.message,
    cause: appError,
  });
};
