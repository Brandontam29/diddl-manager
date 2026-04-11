/// <reference types="node" />
import { ConvexHttpClient } from "convex/browser";
import { api } from "../src/convex/_generated/api";
import { readCatalog, processItems, DIDDL_TYPES, CHUNK_SIZE } from "./seed-shared";

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

const convex = new ConvexHttpClient(CONVEX_URL);

async function main() {
  console.log("Seeding diddlTypes...");
  const typesResult = await convex.action(api.private.seed.seedDiddlTypes, {
    apiKey: API_KEY,
    types: DIDDL_TYPES,
  });
  console.log(`DiddlTypes: ${typesResult.inserted} inserted, ${typesResult.updated} updated`);

  console.log("Reading catalog.json...");
  const raw = readCatalog();
  const items = processItems(raw);
  const totalChunks = Math.ceil(items.length / CHUNK_SIZE);

  console.log(`Processing ${items.length} items in ${totalChunks} chunks...`);

  let totalInserted = 0;
  let totalUpdated = 0;

  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    const chunk = items.slice(i, i + CHUNK_SIZE);
    const chunkNum = Math.floor(i / CHUNK_SIZE) + 1;
    const result = await convex.action(api.private.seed.seedCatalogChunk, {
      apiKey: API_KEY,
      items: chunk,
    });
    totalInserted += result.inserted;
    totalUpdated += result.updated;
    console.log(
      `Chunk ${chunkNum}/${totalChunks} — ${result.inserted} inserted, ${result.updated} updated`,
    );
  }

  console.log(
    `\nDone! ${totalInserted} inserted, ${totalUpdated} updated out of ${items.length} total items.`,
  );
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
