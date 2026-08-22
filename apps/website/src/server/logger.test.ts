import { describe, expect, it } from "vitest";
import { formatLogLine } from "./logger";

describe("formatLogLine", () => {
  it("emits a single JSON line with time, level, msg and meta", () => {
    const time = new Date("2026-08-21T12:00:00.000Z");
    const line = formatLogLine("info", "hello", { userId: "u_1" }, time);
    expect(line).not.toContain("\n");
    expect(JSON.parse(line)).toEqual({
      time: "2026-08-21T12:00:00.000Z",
      level: "info",
      msg: "hello",
      userId: "u_1",
    });
  });

  it("omits meta when not provided", () => {
    const parsed = JSON.parse(formatLogLine("warn", "x"));
    expect(Object.keys(parsed).sort()).toEqual(["level", "msg", "time"]);
  });
});
