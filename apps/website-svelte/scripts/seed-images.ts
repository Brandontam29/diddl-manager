/// <reference types="node" />
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../src/convex/_generated/api";
import { readCatalog, processItems } from "./seed-shared";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Error: ${name} is not set. Check your .env file.`);
    return process.exit(1);
  }
  return value;
}

const CONVEX_URL = requireEnv("PUBLIC_CONVEX_URL");
const API_KEY = requireEnv("CONVEX_PRIVATE_BRIDGE_KEY");
const IMAGES_DIR = requireEnv("SEED_IMAGES_DIR");

const convex = new ConvexHttpClient(CONVEX_URL);

async function main() {
  console.log("Reading catalog.json...");
  const raw = readCatalog();
  const items = processItems(raw);
  const total = items.length;

  let uploaded = 0;
  let skipped = 0;
  let missing = 0;
  let notFound = 0;

  console.log(`Processing ${total} items for image upload...`);

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const progress = `[${i + 1}/${total}]`;

    // Check if item already has an image
    const check = await convex.query(api.private.seed.checkItemHasImage, {
      apiKey: API_KEY,
      type: item.type,
      number: item.number,
    });

    if (!check.exists) {
      console.log(`${progress} SKIP (not in DB): ${item.type}/${item.name}`);
      notFound++;
      continue;
    }

    if (check.hasImage) {
      skipped++;
      if (skipped % 100 === 0) {
        console.log(`${progress} Skipped ${skipped} items with existing images...`);
      }
      continue;
    }

    // Resolve image path
    const imagePath = resolve(IMAGES_DIR, item.imagePath);
    if (!existsSync(imagePath)) {
      console.log(`${progress} MISSING: ${item.imagePath}`);
      missing++;
      continue;
    }

    // Read and upload image
    const fileBuffer = readFileSync(imagePath);
    const imageBytes = fileBuffer.buffer.slice(
      fileBuffer.byteOffset,
      fileBuffer.byteOffset + fileBuffer.byteLength,
    );

    await convex.action(api.private.seed.seedImageForItem, {
      apiKey: API_KEY,
      type: item.type,
      number: item.number,
      imageBytes,
    });

    uploaded++;
    if (uploaded % 50 === 0 || uploaded === 1) {
      console.log(`${progress} Uploaded: ${item.type}/${item.name}`);
    }
  }

  console.log(`\nDone!`);
  console.log(`  Uploaded: ${uploaded}`);
  console.log(`  Skipped (already has image): ${skipped}`);
  console.log(`  Missing (file not found): ${missing}`);
  console.log(`  Not in DB: ${notFound}`);
}

main().catch((err) => {
  console.error("Image seed failed:", err);
  process.exit(1);
});
