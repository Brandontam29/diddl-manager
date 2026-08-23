import { describe, expect, it } from "vitest";

import { FALLBACK_CARD_ASPECT_RATIO, cardAspectRatio } from "./cardAspectRatio";

describe("cardAspectRatio", () => {
  it("returns width / height when both dimensions are known", () => {
    expect(cardAspectRatio({ imageWidth: 300, imageHeight: 400 })).toBe(0.75);
  });

  it("falls back to 0.7 for null, undefined or zero dimensions", () => {
    expect(FALLBACK_CARD_ASPECT_RATIO).toBe(0.7);
    expect(cardAspectRatio({ imageWidth: null, imageHeight: null })).toBe(0.7);
    expect(cardAspectRatio({})).toBe(0.7);
    expect(cardAspectRatio({ imageWidth: 0, imageHeight: 400 })).toBe(0.7);
    expect(cardAspectRatio({ imageWidth: 300, imageHeight: null })).toBe(0.7);
  });
});
