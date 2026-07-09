/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test";

import { listSectionNameSchema } from "./list-models";

describe("listSectionNameSchema", () => {
  test("trims valid section names", () => {
    expect(listSectionNameSchema.parse(" Trade ")).toBe("Trade");
  });

  test("rejects section names shorter than two characters after trimming", () => {
    expect(() => listSectionNameSchema.parse(" a ")).toThrow();
  });

  test("rejects section names longer than forty characters", () => {
    expect(() => listSectionNameSchema.parse("a".repeat(41))).toThrow();
  });
});
