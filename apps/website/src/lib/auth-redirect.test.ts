import { describe, expect, test } from "vitest";

import { authRedirectSearchSchema } from "./auth-redirect";

const parse = (redirect: unknown) => authRedirectSearchSchema.parse({ redirect }).redirect;

describe("authRedirectSearchSchema", () => {
  test("keeps in-app paths", () => {
    expect(parse("/app")).toBe("/app");
    expect(parse("/app/lists/123?tab=items")).toBe("/app/lists/123?tab=items");
  });

  test("drops anything that could leave the origin", () => {
    expect(parse("https://evil.example")).toBeUndefined();
    expect(parse("//evil.example")).toBeUndefined();
    expect(parse("javascript:alert(1)")).toBeUndefined();
    expect(parse("app")).toBeUndefined();
  });

  test("tolerates a missing or malformed value", () => {
    expect(parse(undefined)).toBeUndefined();
    expect(parse(42)).toBeUndefined();
  });
});
