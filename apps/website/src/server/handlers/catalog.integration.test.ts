import { expect, test } from "vitest";

import { createTestDb } from "../../../test/db";
import { getCatalog } from "./catalog";

test("getCatalog returns the whole seeded catalog in id order", async () => {
  const catalog = await getCatalog(createTestDb());
  expect(catalog.length).toBeGreaterThan(3000);
  expect(catalog[0]?.id).toBe(1);
  expect(catalog.at(-1)?.id).toBe(catalog.length);
});
