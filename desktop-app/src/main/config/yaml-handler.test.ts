import fs from "node:fs/promises";

import { beforeEach, describe, expect, it, mock, spyOn } from "bun:test";
import { z } from "zod";

import { AppError } from "../errors/app-error";
import * as ensureFileExistsModule from "../utils/ensureFileExists";

// Mock Electron module to handle deep imports
mock.module("electron", () => ({
  app: {
    getPath: () => "/tmp/diddl-manager",
    getAppPath: () => "/tmp",
  },
}));

// Mock logging BEFORE importing YamlHandler to avoid other recursive deps if any
mock.module("../logging", () => ({
  logging: {
    error: mock(() => {}),
  },
}));

// Mock dependencies
const mockReadFile = spyOn(fs, "readFile");
const mockWriteFile = spyOn(fs, "writeFile");
const mockEnsureFileExists = spyOn(ensureFileExistsModule, "default");
// We can now access the mocked logging if needed, or just rely on the mock above.
// Since we mocked the module, we can't easily spy on the imported object in the same way
// if we didn't export the mock functions.
// Let's rely on the fact that we can't verify 'logging.error' call count easily without
// exposing it from the mock.module, OR we can just check if loading error path works without crashing.

// To verify logging calls, we need to return a spy/mock from mock.module
const mockLoggingError = mock(() => {});
mock.module("../logging", () => ({
  logging: {
    error: mockLoggingError,
  },
}));

const { YamlHandler } = await import("./yaml-handler");

describe("YamlHandler", () => {
  const schema = z.object({
    name: z.string(),
    value: z.number(),
  });

  const filePath = "test-config.yaml";
  let handler = new YamlHandler(schema, filePath);

  beforeEach(() => {
    handler = new YamlHandler(schema, filePath);
    mockReadFile.mockReset();
    mockWriteFile.mockReset();
    mockEnsureFileExists.mockReset();
    mockLoggingError.mockReset();
  });

  describe("load", () => {
    it("should load and parse valid YAML content", async () => {
      mockReadFile.mockResolvedValue("name: test\nvalue: 123");
      const result = await handler.load();
      expect(result.isOk()).toBe(true);

      const readResult = await handler.read();
      expect(readResult.isOk()).toBe(true);
      expect(readResult._unsafeUnwrap()).toEqual({ name: "test", value: 123 });
    });

    it("should handle ENOENT by creating an empty document", async () => {
      const error: Error & { code?: string } = new Error("File not found");
      error.code = "ENOENT";
      mockReadFile.mockRejectedValue(error);

      const result = await handler.load();
      expect(result.isOk()).toBe(true);

      // Document is initialized as empty, so read() might fail validation if schema loads strict
      // In this case, schema requires name and value, so empty doc will fail validation on read
      // But load itself succeeds.
    });

    it("should return error for other file system errors", async () => {
      mockReadFile.mockRejectedValue(new Error("Permission denied"));
      const result = await handler.load();
      expect(result.isErr()).toBe(true);
      expect(mockLoggingError).toHaveBeenCalled();
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(AppError);
    });

    it("should return a config validation error for malformed YAML", async () => {
      mockReadFile.mockResolvedValue("name: broken\nvalue: [");

      const result = await handler.load();

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(AppError);
      const appError = result._unsafeUnwrapErr();
      if (!(appError instanceof AppError)) {
        throw new Error("Expected AppError");
      }
      expect(appError.appCode).toBe("CONFIG_INVALID");
    });
  });

  describe("read", () => {
    it("should validate loaded data against schema", async () => {
      mockReadFile.mockResolvedValue("name: valid\nvalue: 100");
      const result = await handler.read();
      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toEqual({ name: "valid", value: 100 });
    });

    it("should fail if data does not match schema", async () => {
      mockReadFile.mockResolvedValue("name: valid\nvalue: not-a-number");
      const result = await handler.read();
      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(AppError);
      const appError = result._unsafeUnwrapErr();
      if (!(appError instanceof AppError)) {
        throw new Error("Expected AppError");
      }
      expect(appError.appCode).toBe("CONFIG_INVALID");
    });
  });

  describe("update", () => {
    it("should update value, validate, and save to disk", async () => {
      mockReadFile.mockResolvedValue("name: initial\nvalue: 1");
      // Pre-load
      await handler.load();

      mockEnsureFileExists.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue(undefined);

      const result = await handler.update(["value"], 2);
      expect(result.isOk()).toBe(true);

      expect(mockWriteFile).toHaveBeenCalled();
      // Verify content written to file contains new value
      const writtenContent = mockWriteFile.mock.calls[0][1] as string;
      expect(writtenContent).toContain("value: 2");
    });

    it("should fail update if validation fails", async () => {
      mockReadFile.mockResolvedValue("name: initial\nvalue: 1");
      await handler.load();

      const result = await handler.update(["value"], "invalid-string");
      expect(result.isErr()).toBe(true);
      expect(mockWriteFile).not.toHaveBeenCalled();
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(AppError);
      const appError = result._unsafeUnwrapErr();
      if (!(appError instanceof AppError)) {
        throw new Error("Expected AppError");
      }
      expect(appError.appCode).toBe("CONFIG_INVALID");
    });
  });

  describe("set", () => {
    it("should replace entire object and save to disk", async () => {
      const newData = { name: "new", value: 999 };
      mockEnsureFileExists.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue(undefined);

      const result = await handler.set(newData);
      expect(result.isOk()).toBe(true);
      expect(mockWriteFile).toHaveBeenCalled();

      const writtenContent = mockWriteFile.mock.calls[0][1] as string;
      expect(writtenContent).toContain("name: new");
      expect(writtenContent).toContain("value: 999");
    });
  });
});
