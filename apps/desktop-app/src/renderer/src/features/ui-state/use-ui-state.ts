import { action, createAsyncStore, query, revalidate } from "@solidjs/router";

import type { DeepPartial, UiState } from "@shared";

import { trpc } from "@renderer/libs/trpc";

export const fetchUiState = query(async () => {
  try {
    return await trpc.config.getUiState.query();
  } catch (e) {
    console.error("Failed to fetch UI state:", e);
    return null;
  }
}, "ui-state");

export const useUiState = () =>
  createAsyncStore<UiState | null>(() => fetchUiState(), {
    initialValue: null,
  });

export const updateUiStateAction = action(async (newUiState: DeepPartial<UiState>) => {
  try {
    const updates = flattenToKeyPaths(newUiState);
    for (const { keyPath, value } of updates) {
      await trpc.config.updateUiState.mutate({ keyPath, value });
    }
    revalidate("ui-state");
    return { success: true as const };
  } catch (e) {
    console.error("Failed to update UI state:", e);
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
