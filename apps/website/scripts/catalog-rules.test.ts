import { describe, expect, it } from "vitest";

import { cleanDiddlName, toPosixPath } from "./catalog-rules";

describe("cleanDiddlName", () => {
  it("strips the .jpg extension", () => {
    expect(cleanDiddlName("stickers.jpg")).toBe("Stickers");
  });

  it("turns underscores and hyphens into spaces", () => {
    expect(cleanDiddlName("pani_001_sticker.jpg")).toBe("Pani 001 sticker");
    expect(cleanDiddlName("Pimboli-Blatt-A6-Herz aus Kiste.jpg")).toBe(
      "Pimboli Blatt A6 Herz aus Kiste",
    );
  });

  it("collapses runs of separators and whitespace", () => {
    expect(cleanDiddlName("a__b--c.jpg")).toBe("A b c");
    expect(cleanDiddlName("a   b.jpg")).toBe("A b");
    expect(cleanDiddlName("  padded  .jpg")).toBe("Padded");
  });

  it("capitalizes only the first letter, leaving the rest alone", () => {
    expect(cleanDiddlName("mSK5.jpg")).toBe("MSK5");
    expect(cleanDiddlName("A6_115.jpg")).toBe("A6 115");
  });

  it("leaves a name that is already clean untouched", () => {
    expect(cleanDiddlName("Roadshow1.jpg")).toBe("Roadshow1");
  });

  it("keeps the extension when the name is nothing but separators", () => {
    expect(cleanDiddlName("___.jpg")).toBe("___");
  });

  it("is case-insensitive about the extension", () => {
    expect(cleanDiddlName("thing.JPG")).toBe("Thing");
  });
});

describe("toPosixPath", () => {
  it("forward-slashes Windows paths", () => {
    expect(toPosixPath("012_Pimboli\\Pimboli-Blatt-A6.jpg")).toBe(
      "012_Pimboli/Pimboli-Blatt-A6.jpg",
    );
  });

  it("leaves an already-posix path alone", () => {
    expect(toPosixPath("012_Pimboli/x.jpg")).toBe("012_Pimboli/x.jpg");
  });
});
