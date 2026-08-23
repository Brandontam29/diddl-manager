/**
 * The pure half of the desktop import (spec §8): reading the desktop SQLite into a
 * snapshot, normalizing its image paths, remapping sections, and validating every
 * row with the shared zod schemas. No I/O and no `process.env` here so it can be
 * unit-tested; `import-desktop.ts` does the SQLite and Postgres work.
 *
 * Desktop table and column names come from
 * `apps/desktop-app/src/main/database/migrations/` (000, 003, 005, 006).
 */
import { z } from "zod";

import { listItemSchema, listSchema, listSectionSchema } from "../src/shared/list-models";
import { toPosixPath } from "./catalog-rules";

export const DESKTOP_IMAGE_PREFIX = "app://diddl-images/";

/** Marker for "this list goes into the user's existing web Default Section". */
export const DEFAULT_SECTION = "default" as const;

/**
 * SQLite has no boolean type. The desktop's Kysely serialize plugin writes booleans
 * as the TEXT strings 'true'/'false' (and the column defaults are 'false'), while a
 * hand-edited or older row could hold 0/1. Both are accepted.
 */
export type SqliteBoolean = number | boolean | string | null;

export type DesktopSectionRow = {
  id: number;
  name: string;
  position: number;
  is_default: SqliteBoolean;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
};

export type DesktopListRow = {
  id: number;
  name: string;
  color: string | null;
  section_id: number | null;
  position: number;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
};

export type DesktopListItemRow = {
  id: number;
  list_id: number;
  diddl_id: number;
  quantity: number | null;
  is_damaged: SqliteBoolean;
  is_incomplete: SqliteBoolean;
};

export type DesktopDiddlRow = {
  id: number;
  image_path: string | null;
};

export type DesktopSnapshot = {
  sections: DesktopSectionRow[];
  lists: DesktopListRow[];
  items: DesktopListItemRow[];
  diddls: DesktopDiddlRow[];
};

/** The sliver of `bun:sqlite`'s `Database` the reader needs, so tests can fake it. */
export type DesktopSqlite = {
  query<T>(sql: string): { all(): T[] };
};

const DESKTOP_TABLES = ["diddl", "list", "list_item", "list_section"] as const;

/**
 * Reads every row of the four desktop tables. Filtering (live rows only) happens in
 * `buildImportPlan` so the counts of what was skipped can be reported.
 */
export function readDesktopSnapshot(db: DesktopSqlite): DesktopSnapshot {
  const tables = new Set(
    db
      .query<{ name: string }>("SELECT name FROM sqlite_master WHERE type = 'table'")
      .all()
      .map((row) => row.name),
  );
  const missing = DESKTOP_TABLES.filter((table) => !tables.has(table));
  if (missing.length > 0) {
    throw new Error(
      `desktop database is missing table(s) ${missing.join(", ")} — was it migrated to 006_add_list_sections?`,
    );
  }

  return {
    sections: db
      .query<DesktopSectionRow>(
        "SELECT id, name, position, is_default, created_at, updated_at, deleted_at FROM list_section ORDER BY id",
      )
      .all(),
    lists: db
      .query<DesktopListRow>(
        "SELECT id, name, color, section_id, position, created_at, updated_at, deleted_at FROM list ORDER BY id",
      )
      .all(),
    items: db
      .query<DesktopListItemRow>(
        "SELECT id, list_id, diddl_id, quantity, is_damaged, is_incomplete FROM list_item ORDER BY id",
      )
      .all(),
    diddls: db.query<DesktopDiddlRow>("SELECT id, image_path FROM diddl ORDER BY id").all(),
  };
}

/**
 * `app://diddl-images/012_Pimboli\Pimboli-Blatt-A6.jpg` →
 * `012_Pimboli/Pimboli-Blatt-A6.jpg`, the form `catalog.json` stores.
 */
export function normalizeDesktopImagePath(imagePath: string): string {
  const withoutPrefix = imagePath.startsWith(DESKTOP_IMAGE_PREFIX)
    ? imagePath.slice(DESKTOP_IMAGE_PREFIX.length)
    : imagePath;
  return toPosixPath(withoutPrefix);
}

const SQLITE_TIMESTAMP = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

/**
 * Desktop timestamps are either ISO strings (written by the app) or SQLite's
 * `CURRENT_TIMESTAMP` default, `YYYY-MM-DD HH:MM:SS` in UTC with no zone marker —
 * which `Date.parse` would otherwise read as local time.
 */
export function parseDesktopTimestamp(value: string | null | undefined): Date | null {
  if (value === null || value === undefined || value === "") return null;
  const iso = SQLITE_TIMESTAMP.test(value) ? `${value.replace(" ", "T")}Z` : value;
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

const SQLITE_TRUE = new Set<unknown>([true, 1, "1", "true"]);
const SQLITE_FALSE = new Set<unknown>([false, 0, "0", "false", null, undefined]);

/**
 * Decodes a desktop boolean column (see `SqliteBoolean`). A null column means
 * false — that is the desktop's column default. Anything else is returned as-is so
 * zod reports it as a violation.
 */
export function parseSqliteBoolean(value: unknown): unknown {
  if (SQLITE_TRUE.has(value)) return true;
  if (SQLITE_FALSE.has(value)) return false;
  return value;
}

/**
 * Timestamps are checked by `parseDesktopTimestamp` and `deletedAt` is dropped
 * (only live rows reach validation); ids are remapped on insert.
 */
const sectionRowSchema = listSectionSchema.pick({ name: true, position: true });
const listRowSchema = listSchema.pick({ name: true, color: true, position: true });
const itemRowSchema = z.object({
  diddlId: listItemSchema.shape.diddlId,
  quantity: z.preprocess((value) => value ?? 1, listItemSchema.shape.quantity),
  isDamaged: z.preprocess(parseSqliteBoolean, listItemSchema.shape.isDamaged),
  isIncomplete: z.preprocess(parseSqliteBoolean, listItemSchema.shape.isIncomplete),
});

export type PlannedSection = {
  desktopId: number;
  name: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
};

export type PlannedList = {
  desktopId: number;
  /** A desktop section id that survives into `sections`, or the web Default Section. */
  section: number | typeof DEFAULT_SECTION;
  name: string;
  color: string;
  /**
   * Within the Default Section this is relative: the script adds the position after
   * the section's existing lists, so imported lists never collide with them.
   */
  position: number;
  createdAt: Date;
  updatedAt: Date;
};

export type PlannedItem = {
  desktopListId: number;
  diddlId: number;
  quantity: number;
  isDamaged: boolean;
  isIncomplete: boolean;
};

export type ImportPlan = {
  /** Non-default sections, positions renumbered in desktop order around the Default Section. */
  sections: PlannedSection[];
  /** The slot the web Default Section takes in that order, or null when the desktop had none. */
  defaultSectionPosition: number | null;
  lists: PlannedList[];
  items: PlannedItem[];
  /** Lists moved to the Default Section because their desktop section was null, deleted, or missing. */
  remappedListIds: number[];
  skipped: { sections: number; lists: number; items: number };
  /** Anything here means the import must not run. */
  violations: string[];
};

export type CatalogImagePaths = ReadonlyMap<number, string>;

function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join(".") || "row"}: ${issue.message}`)
    .join("; ");
}

type Timestamped = { created_at: string | null; updated_at: string | null };

/** Both timestamps parsed, or the violation text naming the bad raw column(s). */
function parseTimestamps(
  row: Timestamped,
): { createdAt: Date; updatedAt: Date } | { violation: string } {
  const createdAt = parseDesktopTimestamp(row.created_at);
  const updatedAt = parseDesktopTimestamp(row.updated_at);
  if (createdAt && updatedAt) return { createdAt, updatedAt };
  const violation = (["created_at", "updated_at"] as const)
    .filter((column) => parseDesktopTimestamp(row[column]) === null)
    .map((column) => `${column}: unparseable timestamp ${JSON.stringify(row[column])}`)
    .join("; ");
  return { violation };
}

/** Desktop display order: position, then id as the tie-break (matches the sidebar). */
const byDesktopOrder = <T extends { position: number; id: number }>(a: T, b: T) =>
  a.position - b.position || a.id - b.id;

/**
 * Turns the raw desktop snapshot into validated insert-ready rows, applying the §8
 * rules: live rows only, the desktop default section folds into the web one, lists
 * without a live non-default section fall back to the Default Section, and every
 * referenced diddl must resolve to the same image in `catalog.json`.
 */
export function buildImportPlan(snapshot: DesktopSnapshot, catalog: CatalogImagePaths): ImportPlan {
  const violations: string[] = [];
  const skipped = { sections: 0, lists: 0, items: 0 };

  // Sections, renumbered 0..n in desktop order. The desktop's default section is
  // not inserted — the web Default Section takes its slot and its lists. Any extra
  // default sections are treated the same way.
  const sections: PlannedSection[] = [];
  let defaultSectionPosition: number | null = null;
  const desktopDefaultIds = new Set<number>();
  const liveSectionIds = new Set<number>();
  const liveSections = snapshot.sections.filter((row) => row.deleted_at === null);
  skipped.sections = snapshot.sections.length - liveSections.length;

  liveSections.sort(byDesktopOrder).forEach((row, position) => {
    if (parseSqliteBoolean(row.is_default) === true) {
      desktopDefaultIds.add(row.id);
      defaultSectionPosition ??= position;
      return;
    }
    const timestamps = parseTimestamps(row);
    if ("violation" in timestamps) {
      violations.push(`section ${row.id} (${JSON.stringify(row.name)}): ${timestamps.violation}`);
      return;
    }
    const parsed = sectionRowSchema.safeParse({ name: row.name, position });
    if (!parsed.success) {
      violations.push(
        `section ${row.id} (${JSON.stringify(row.name)}): ${formatIssues(parsed.error)}`,
      );
      return;
    }
    liveSectionIds.add(row.id);
    sections.push({
      desktopId: row.id,
      name: parsed.data.name,
      position: parsed.data.position,
      createdAt: timestamps.createdAt,
      updatedAt: timestamps.updatedAt,
    });
  });

  // Lists. Those from the desktop default section keep their positions; those
  // whose section was null/deleted/missing are appended after them, in desktop order.
  const lists: PlannedList[] = [];
  const remappedListIds: number[] = [];
  const liveListIds = new Set<number>();
  const liveLists = snapshot.lists.filter((row) => row.deleted_at === null);
  skipped.lists = snapshot.lists.length - liveLists.length;

  const orphaned: PlannedList[] = [];
  let defaultListMax = -1;
  for (const row of liveLists.sort(byDesktopOrder)) {
    const timestamps = parseTimestamps(row);
    if ("violation" in timestamps) {
      violations.push(`list ${row.id} (${JSON.stringify(row.name)}): ${timestamps.violation}`);
      continue;
    }
    const parsed = listRowSchema.safeParse({
      name: row.name,
      color: row.color,
      position: row.position,
    });
    if (!parsed.success) {
      violations.push(
        `list ${row.id} (${JSON.stringify(row.name)}): ${formatIssues(parsed.error)}`,
      );
      continue;
    }
    liveListIds.add(row.id);
    const base = {
      desktopId: row.id,
      name: parsed.data.name,
      color: parsed.data.color,
      createdAt: timestamps.createdAt,
      updatedAt: timestamps.updatedAt,
    };
    if (row.section_id !== null && liveSectionIds.has(row.section_id)) {
      lists.push({ ...base, section: row.section_id, position: parsed.data.position });
    } else if (row.section_id !== null && desktopDefaultIds.has(row.section_id)) {
      defaultListMax = Math.max(defaultListMax, parsed.data.position);
      lists.push({ ...base, section: DEFAULT_SECTION, position: parsed.data.position });
    } else {
      remappedListIds.push(row.id);
      const planned = { ...base, section: DEFAULT_SECTION, position: -1 };
      orphaned.push(planned);
      lists.push(planned);
    }
  }
  orphaned.forEach((planned, offset) => {
    planned.position = defaultListMax + 1 + offset;
  });

  const items: PlannedItem[] = [];
  for (const row of snapshot.items) {
    if (!liveListIds.has(row.list_id)) {
      skipped.items += 1;
      continue;
    }
    const parsed = itemRowSchema.safeParse({
      diddlId: row.diddl_id,
      quantity: row.quantity,
      isDamaged: row.is_damaged,
      isIncomplete: row.is_incomplete,
    });
    if (!parsed.success) {
      violations.push(`list_item ${row.id}: ${formatIssues(parsed.error)}`);
      continue;
    }
    items.push({ desktopListId: row.list_id, ...parsed.data });
  }

  // Catalog guard: desktop ids map verbatim onto catalog.json ids, checked by image.
  const desktopImages = new Map(snapshot.diddls.map((row) => [row.id, row.image_path]));
  const referenced = [...new Set(items.map((item) => item.diddlId))].sort((a, b) => a - b);
  for (const diddlId of referenced) {
    const desktopPath = desktopImages.get(diddlId);
    const catalogPath = catalog.get(diddlId);
    if (desktopPath === undefined || desktopPath === null) {
      violations.push(
        `diddl ${diddlId}: referenced by a list item but absent from the desktop diddl table`,
      );
      continue;
    }
    if (catalogPath === undefined) {
      violations.push(`diddl ${diddlId}: not in catalog.json`);
      continue;
    }
    const normalized = normalizeDesktopImagePath(desktopPath);
    if (normalized !== catalogPath) {
      violations.push(
        `diddl ${diddlId}: desktop image ${JSON.stringify(normalized)} != catalog ${JSON.stringify(catalogPath)}`,
      );
    }
  }

  return {
    sections,
    defaultSectionPosition,
    lists,
    items,
    remappedListIds,
    skipped,
    violations,
  };
}
