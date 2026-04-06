import { describe, expect, it, mock } from "bun:test";
import { TRPCError } from "@trpc/server";
import { ZodError } from "zod";

mock.module("../logging", () => ({
  logging: {
    error: mock(() => {}),
  },
}));

const { AppError, notFoundError } = await import("./app-error");
const { toTrpcError } = await import("./to-trpc-error");

describe("toTrpcError", () => {
  it("preserves existing TRPCError instances", () => {
    const source = new TRPCError({ code: "NOT_FOUND", message: "List not found" });

    const result = toTrpcError(source, {
      fallbackMessage: "Failed to fetch list",
      operation: "test.operation",
    });

    expect(result).toBe(source);
  });

  it("maps AppError to its configured tRPC code", () => {
    const source = notFoundError("List not found", { listId: 1 });

    const result = toTrpcError(source, {
      fallbackMessage: "Failed to fetch list",
      operation: "test.operation",
    });

    expect(result.code).toBe("NOT_FOUND");
    expect(result.message).toBe("List not found");
    expect(result.cause).toBe(source);
  });

  it("maps sqlite constraint failures to CONFLICT", () => {
    const source = new Error("SQLITE_CONSTRAINT: UNIQUE constraint failed: list.name");

    const result = toTrpcError(source, {
      fallbackMessage: "Failed to create list",
      operation: "test.operation",
    });

    expect(result.code).toBe("CONFLICT");
    expect(result.cause).toBeInstanceOf(AppError);
    if (!(result.cause instanceof AppError)) {
      throw new Error("Expected AppError cause");
    }
    expect(result.cause.appCode).toBe("DB_CONSTRAINT");
  });

  it("maps ENOENT to NOT_FOUND", () => {
    const source = Object.assign(new Error("missing file"), {
      code: "ENOENT",
      path: "/tmp/missing.txt",
    });

    const result = toTrpcError(source, {
      fallbackMessage: "Failed to load file",
      operation: "test.operation",
    });

    expect(result.code).toBe("NOT_FOUND");
    expect(result.cause).toBeInstanceOf(AppError);
    if (!(result.cause instanceof AppError)) {
      throw new Error("Expected AppError cause");
    }
    expect(result.cause.appCode).toBe("FILE_NOT_FOUND");
  });

  it("maps EACCES to FORBIDDEN", () => {
    const source = Object.assign(new Error("permission denied"), {
      code: "EACCES",
      path: "/tmp/secret.txt",
    });

    const result = toTrpcError(source, {
      fallbackMessage: "Failed to load file",
      operation: "test.operation",
    });

    expect(result.code).toBe("FORBIDDEN");
    expect(result.cause).toBeInstanceOf(AppError);
    if (!(result.cause instanceof AppError)) {
      throw new Error("Expected AppError cause");
    }
    expect(result.cause.appCode).toBe("FILE_ACCESS_DENIED");
  });

  it("maps zod validation failures to BAD_REQUEST", () => {
    const source = new ZodError([
      {
        code: "invalid_type",
        expected: "string",
        input: 123,
        path: ["name"],
        message: "Invalid input: expected string, received number",
      },
    ]);

    const result = toTrpcError(source, {
      fallbackMessage: "Failed to validate payload",
      operation: "test.operation",
    });

    expect(result.code).toBe("BAD_REQUEST");
    expect(result.cause).toBeInstanceOf(AppError);
    if (!(result.cause instanceof AppError)) {
      throw new Error("Expected AppError cause");
    }
    expect(result.cause.appCode).toBe("INVALID_INPUT");
  });
});
