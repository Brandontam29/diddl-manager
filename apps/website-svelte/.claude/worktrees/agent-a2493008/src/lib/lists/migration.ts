import { toast } from "svelte-sonner";
import type { ConvexClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import type { ItemCondition } from "./listTypes";

const STORAGE_KEY = "diddl-guest-data";
const SESSION_KEY = "diddl-guest-session-id";

interface StoragePayload {
  lists: Array<{ id: string; name: string; color: string; createdAt: number }>;
  items: Array<{
    id: string;
    listId: string;
    catalogRef: { type: string; number: number };
    condition: string;
    quantity: number;
    complete: boolean;
    tags: string[];
  }>;
  activeListId: string | null;
}

/**
 * Get or create a persistent guest session ID for idempotency tracking.
 */
export function getGuestSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/**
 * Check if there is guest data in localStorage that needs migration.
 */
export function hasGuestData(): boolean {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;
  try {
    const data = JSON.parse(raw) as StoragePayload;
    return data.lists.length > 0;
  } catch {
    return false;
  }
}

/**
 * Migrate guest data from localStorage to Convex.
 * Retries up to 3 times with exponential backoff (1s, 2s, 4s).
 * Returns true on success, false on final failure.
 * localStorage is cleared ONLY on confirmed success (per CF-03).
 */
export async function migrateGuestData(client: ConvexClient): Promise<boolean> {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return true; // Nothing to migrate

  let guestData: StoragePayload;
  try {
    guestData = JSON.parse(raw);
  } catch {
    return true; // Corrupt data, nothing to migrate
  }

  if (guestData.lists.length === 0) return true;

  const guestSessionId = getGuestSessionId();
  const delays = [1000, 2000, 4000];

  for (let attempt = 0; attempt <= delays.length; attempt++) {
    try {
      await client.action(api.authed.migration.migrateGuestData, {
        guestSessionId,
        lists: guestData.lists.map((l) => ({
          id: l.id,
          name: l.name,
          color: l.color,
        })),
        items: guestData.items.map((i) => ({
          listId: i.listId,
          type: i.catalogRef.type,
          number: i.catalogRef.number,
          condition: i.condition as ItemCondition,
          quantity: i.quantity,
          complete: i.complete,
          tags: i.tags,
        })),
      });

      // Success — clear localStorage (per CF-03: only after confirmed success)
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SESSION_KEY);
      toast.success("Your collection has been saved to your account.");
      return true;
    } catch (error) {
      if (attempt < delays.length) {
        toast.info("Could not save collection. Retrying...");
        await new Promise((r) => setTimeout(r, delays[attempt]));
      }
    }
  }

  // All retries failed (per D-10)
  toast.warning("Data safe in browser. We'll try again next time.");
  return false;
}
