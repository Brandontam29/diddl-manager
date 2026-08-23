import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, test } from "vitest";

import * as handlers from "./index";

/**
 * The structural guarantee of spec §10: every handler over user-owned data takes
 * `userId` as its second parameter, so no query can be written without it in scope.
 * `getCatalog` is the one global (userId-less) handler and is excluded by name.
 */
const USER_SCOPED_MODULES = ["sections", "lists", "items", "profile"] as const;
const GLOBAL_HANDLERS = new Set(["getCatalog"]);

const exportedFns = Object.entries(handlers)
  .filter(([, value]) => typeof value === "function")
  .map(([name]) => name);

describe("handler signatures", () => {
  test("the handler index exports the 16 functions of spec §5 plus helpers", () => {
    expect(exportedFns).toEqual(
      expect.arrayContaining([
        "getCatalog",
        "getSectionsWithLists",
        "createSection",
        "renameSection",
        "deleteSection",
        "reorderSections",
        "createList",
        "deleteList",
        "renameList",
        "updateListColor",
        "reorderLists",
        "getListItems",
        "addListItems",
        "removeListItems",
        "duplicateListItem",
        "updateListItems",
        "getProfile",
        "updateProfile",
      ]),
    );
  });

  for (const moduleName of USER_SCOPED_MODULES) {
    const source = readFileSync(path.join(import.meta.dirname, `${moduleName}.ts`), "utf8");
    const signatures = [...source.matchAll(/export async function (\w+)\(\s*([^)]*)\)/g)];

    test(`${moduleName}.ts exports at least one async handler`, () => {
      expect(signatures.length).toBeGreaterThan(0);
    });

    for (const [, name, params] of signatures) {
      if (GLOBAL_HANDLERS.has(name!)) continue;
      test(`${name} takes (db: Db, userId: string, ...)`, () => {
        const [first, second] = params!.split(",").map((p) => p.trim());
        expect(first).toBe("db: Db");
        expect(second).toBe("userId: string");
      });
    }
  }

  test("every exported user-scoped handler declares at least two parameters", () => {
    for (const name of exportedFns) {
      if (GLOBAL_HANDLERS.has(name)) continue;
      const fn = handlers[name as keyof typeof handlers] as (...args: unknown[]) => unknown;
      expect(fn.length, name).toBeGreaterThanOrEqual(2);
    }
  });
});
