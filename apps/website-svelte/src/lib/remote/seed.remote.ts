import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ConvexPrivateService } from '$lib/services/convex';
import { Effect } from 'effect';
import { api } from '../../convex/_generated/api';
import { effectRunner } from '$lib/runtime';

// catalog.json is at the project root (one level up from src/)
const CATALOG_JSON_PATH = resolve(process.cwd(), 'catalog.json');
const CHUNK_SIZE = 100;

interface RawCatalogItem {
	name: string;
	type: string;
	imagePath: string;
	imageWidth: number;
	imageHeight: number;
}

interface ProcessedItem {
	type: string;
	number: number;
	name: string;
	imagePath: string;
}

// Extract the first contiguous digit sequence from a filename (without extension)
function extractNumber(filename: string): number | null {
	const withoutExt = filename.replace(/\.[^/.]+$/, '');
	const match = withoutExt.match(/(\d+)/);
	return match ? parseInt(match[1], 10) : null;
}

// Process raw catalog items: extract numbers, resolve collisions, assign fallbacks
function processItems(rawItems: RawCatalogItem[]): ProcessedItem[] {
	// Group by type
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

		// First pass: extract numbers for items that have them
		for (const item of items) {
			const extracted = extractNumber(item.name);
			if (extracted !== null) {
				if (!usedNumbers.has(extracted)) {
					usedNumbers.add(extracted);
					withNumbers.push({ type, number: extracted, name: item.name, imagePath: item.imagePath });
				} else {
					// Collision: treat as needing fallback
					console.log(
						`Seed: collision in type="${type}" number=${extracted} for "${item.name}" — assigning fallback`
					);
					needsFallback.push(item);
				}
			} else {
				needsFallback.push(item);
			}
		}

		// Second pass: assign sequential fallbacks after max extracted number
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
				imagePath: item.imagePath
			});
			fallbackCounter++;
		}

		processed.push(...withNumbers);
	}

	return processed;
}

const DIDDL_TYPES = [
	{ slug: 'A2', displayName: 'A2 Sheets', sortOrder: 0 },
	{ slug: 'A4', displayName: 'A4 Sheets', sortOrder: 1 },
	{ slug: 'A5', displayName: 'A5 Sheets', sortOrder: 2 },
	{ slug: 'A6', displayName: 'A6 Sheets', sortOrder: 3 },
	{ slug: 'A7', displayName: 'A7 Sheets', sortOrder: 4 },
	{ slug: 'bag-large', displayName: 'Large Bags', sortOrder: 5 },
	{ slug: 'bag-mega', displayName: 'Mega Bags', sortOrder: 6 },
	{ slug: 'bag-plastic', displayName: 'Plastic Bags', sortOrder: 7 },
	{ slug: 'bag-small', displayName: 'Small Bags', sortOrder: 8 },
	{ slug: 'birthday', displayName: 'Birthday Cards', sortOrder: 9 },
	{ slug: 'game', displayName: 'Games', sortOrder: 10 },
	{ slug: 'gift-paper', displayName: 'Gift Paper', sortOrder: 11 },
	{ slug: 'letter-paper', displayName: 'Letter Paper', sortOrder: 12 },
	{ slug: 'paper-bag-A4', displayName: 'A4 Paper Bags', sortOrder: 13 },
	{ slug: 'paper-bag-A5', displayName: 'A5 Paper Bags', sortOrder: 14 },
	{ slug: 'paper-bag-expo', displayName: 'Expo Paper Bags', sortOrder: 15 },
	{ slug: 'paper-relief', displayName: 'Relief Paper', sortOrder: 16 },
	{ slug: 'post-it', displayName: 'Post-it Notes', sortOrder: 17 },
	{ slug: 'postal-card', displayName: 'Postal Cards', sortOrder: 18 },
	{ slug: 'quardiddl-card', displayName: 'Quardiddl Cards', sortOrder: 19 },
	{ slug: 'rectangular-memo', displayName: 'Rectangular Memos', sortOrder: 20 },
	{ slug: 'series', displayName: 'Series', sortOrder: 21 },
	{ slug: 'special', displayName: 'Special', sortOrder: 22 },
	{ slug: 'square-memo', displayName: 'Square Memos', sortOrder: 23 },
	{ slug: 'stamp', displayName: 'Stamps', sortOrder: 24 },
	{ slug: 'sticker', displayName: 'Stickers', sortOrder: 25 },
	{ slug: 'towel', displayName: 'Towels', sortOrder: 26 }
];

const seedEffect = Effect.gen(function* () {
	const convex = yield* ConvexPrivateService;

	// 1. Seed DiddlTypes first
	yield* convex.action({
		func: api.private.seed.seedDiddlTypes,
		args: { types: DIDDL_TYPES }
	});

	// 2. Read and process catalog.json
	const raw = JSON.parse(readFileSync(CATALOG_JSON_PATH, 'utf-8')) as RawCatalogItem[];
	const items = processItems(raw);

	// 3. Chunk into batches of 100 and seed each chunk
	for (let i = 0; i < items.length; i += CHUNK_SIZE) {
		const chunk = items.slice(i, i + CHUNK_SIZE);
		yield* convex.action({
			func: api.private.seed.seedCatalogChunk,
			args: { items: chunk }
		});
		console.log(
			`Seed: inserted chunk ${Math.floor(i / CHUNK_SIZE) + 1}/${Math.ceil(items.length / CHUNK_SIZE)} (${chunk.length} items)`
		);
	}

	return { total: items.length, types: DIDDL_TYPES.length };
});

export async function runSeed(): Promise<{ total: number; types: number }> {
	const result = await effectRunner(seedEffect);
	if (result instanceof Error) {
		throw result;
	}
	return result;
}
