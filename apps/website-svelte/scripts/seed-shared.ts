/// <reference types="node" />
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const CATALOG_JSON_PATH = resolve(process.cwd(), "catalog.json");

export interface RawCatalogItem {
  name: string;
  type: string;
  imagePath: string;
  imageWidth: number;
  imageHeight: number;
}

export interface ProcessedItem {
  type: string;
  number: number;
  name: string;
  imagePath: string;
}

// Extract the first contiguous digit sequence from a filename (without extension)
function extractNumber(filename: string): number | null {
  const withoutExt = filename.replace(/\.[^/.]+$/, "");
  const match = withoutExt.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

// Process raw catalog items: extract numbers, resolve collisions, assign fallbacks
export function processItems(rawItems: RawCatalogItem[]): ProcessedItem[] {
  const byType = new Map<string, RawCatalogItem[]>();
  for (const item of rawItems) {
    const group = byType.get(item.type) ?? [];
    group.push(item);
    byType.set(item.type, group);
  }

  const processed: ProcessedItem[] = [];

  for (const [type, items] of byType) {
    const usedNumbers = new Set<number>();
    const withNumbers: ProcessedItem[] = [];
    const needsFallback: RawCatalogItem[] = [];

    for (const item of items) {
      const extracted = extractNumber(item.name);
      if (extracted !== null) {
        if (!usedNumbers.has(extracted)) {
          usedNumbers.add(extracted);
          withNumbers.push({ type, number: extracted, name: item.name, imagePath: item.imagePath });
        } else {
          console.log(
            `Seed: collision in type="${type}" number=${extracted} for "${item.name}" — assigning fallback`,
          );
          needsFallback.push(item);
        }
      } else {
        needsFallback.push(item);
      }
    }

    const maxNumber = usedNumbers.size > 0 ? Math.max(...usedNumbers) : 0;
    let fallbackCounter = maxNumber + 1;
    for (const item of needsFallback) {
      while (usedNumbers.has(fallbackCounter)) {
        fallbackCounter++;
      }
      usedNumbers.add(fallbackCounter);
      withNumbers.push({
        type,
        number: fallbackCounter,
        name: item.name,
        imagePath: item.imagePath,
      });
      fallbackCounter++;
    }

    processed.push(...withNumbers);
  }

  return processed;
}

export function readCatalog(): RawCatalogItem[] {
  try {
    return JSON.parse(readFileSync(CATALOG_JSON_PATH, "utf-8")) as RawCatalogItem[];
  } catch {
    console.error(`Error: catalog.json not found at ${CATALOG_JSON_PATH}`);
    return process.exit(1);
  }
}

export const CHUNK_SIZE = 100;

export const DIDDL_TYPES = [
  { slug: "A2", displayName: "A2 Sheets", sortOrder: 0 },
  { slug: "A4", displayName: "A4 Sheets", sortOrder: 1 },
  { slug: "A5", displayName: "A5 Sheets", sortOrder: 2 },
  { slug: "A6", displayName: "A6 Sheets", sortOrder: 3 },
  { slug: "A7", displayName: "A7 Sheets", sortOrder: 4 },
  { slug: "bag-large", displayName: "Large Bags", sortOrder: 5 },
  { slug: "bag-mega", displayName: "Mega Bags", sortOrder: 6 },
  { slug: "bag-plastic", displayName: "Plastic Bags", sortOrder: 7 },
  { slug: "bag-small", displayName: "Small Bags", sortOrder: 8 },
  { slug: "birthday", displayName: "Birthday Cards", sortOrder: 9 },
  { slug: "game", displayName: "Games", sortOrder: 10 },
  { slug: "gift-paper", displayName: "Gift Paper", sortOrder: 11 },
  { slug: "letter-paper", displayName: "Letter Paper", sortOrder: 12 },
  { slug: "paper-bag-A4", displayName: "A4 Paper Bags", sortOrder: 13 },
  { slug: "paper-bag-A5", displayName: "A5 Paper Bags", sortOrder: 14 },
  { slug: "paper-bag-expo", displayName: "Expo Paper Bags", sortOrder: 15 },
  { slug: "paper-relief", displayName: "Relief Paper", sortOrder: 16 },
  { slug: "post-it", displayName: "Post-it Notes", sortOrder: 17 },
  { slug: "postal-card", displayName: "Postal Cards", sortOrder: 18 },
  { slug: "quardiddl-card", displayName: "Quardiddl Cards", sortOrder: 19 },
  { slug: "rectangular-memo", displayName: "Rectangular Memos", sortOrder: 20 },
  { slug: "series", displayName: "Series", sortOrder: 21 },
  { slug: "special", displayName: "Special", sortOrder: 22 },
  { slug: "square-memo", displayName: "Square Memos", sortOrder: 23 },
  { slug: "stamp", displayName: "Stamps", sortOrder: 24 },
  { slug: "sticker", displayName: "Stickers", sortOrder: 25 },
  { slug: "towel", displayName: "Towels", sortOrder: 26 },
];
