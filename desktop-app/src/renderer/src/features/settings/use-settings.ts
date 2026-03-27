import { action, createAsyncStore, query, revalidate } from "@solidjs/router";

import type { Settings } from "@shared";
import { type DeepPartial } from "@shared";

import { trpc } from "@renderer/libs/trpc";

export const fetchSettings = query(async () => {
  try {
    return await trpc.config.getSettings.query();
  } catch (e) {
    console.error("Failed to fetch settings:", e);
    return null;
  }
}, "settings");

export const useSettings = () =>
  createAsyncStore<Settings | null>(() => fetchSettings(), {
    initialValue: null,
  });

export const updateSettingAction = action(async (newSettings: DeepPartial<Settings>) => {
  try {
    // Flatten the deep partial into key-path updates
    const updates = flattenToKeyPaths(newSettings);
    for (const { keyPath, value } of updates) {
      await trpc.config.updateSetting.mutate({ keyPath, value });
    }
    revalidate("settings");
    return { success: true as const };
  } catch (e) {
    console.error("Failed to update settings:", e);
    return { success: false as const };
  }
});

function flattenToKeyPaths(
  obj: Record<string, unknown>,
  prefix: string[] = [],
): { keyPath: string[]; value: unknown }[] {
  const results: { keyPath: string[]; value: unknown }[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = [...prefix, key];
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      results.push(...flattenToKeyPaths(value as Record<string, unknown>, currentPath));
    } else {
      results.push({ keyPath: currentPath, value });
    }
  }
  return results;
}
