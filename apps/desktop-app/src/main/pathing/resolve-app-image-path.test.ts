/// <reference types="bun-types" />

import path from "node:path";

import { describe, expect, test } from "bun:test";

import { resolveAppImagePath } from "./resolve-app-image-path";

const basePath = path.resolve("test-user-data");

describe("resolveAppImagePath", () => {
  test("resolves legacy Windows separators inside the image root", () => {
    expect(resolveAppImagePath("app://diddl-images/category\\image.jpg", basePath)).toBe(
      path.join(basePath, "diddl-images", "category", "image.jpg"),
    );
  });

  test("preserves percent-encoded archive filenames", () => {
    expect(resolveAppImagePath("app://diddl-images/category/image%20name.jpg", basePath)).toBe(
      path.join(basePath, "diddl-images", "category", "image%20name.jpg"),
    );
  });

  test("matches punctuation encoded in archive filenames", () => {
    expect(resolveAppImagePath("app://diddl-images/category/image!.jpg", basePath)).toBe(
      path.join(basePath, "diddl-images", "category", "image%21.jpg"),
    );
  });

  test("removes the duplicate extension from legacy seed data", () => {
    expect(resolveAppImagePath("app://diddl-images/category/image.JPG.jpg", basePath)).toBe(
      path.join(basePath, "diddl-images", "category", "image.JPG"),
    );
  });

  test("rejects paths outside the supported image roots", () => {
    expect(resolveAppImagePath("app://diddl-images/..\\db.sqlite3", basePath)).toBeNull();
    expect(resolveAppImagePath("app://logs/app.log", basePath)).toBeNull();
  });
});
