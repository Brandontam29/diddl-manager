import { action, createAsyncStore, query, revalidate } from "@solidjs/router";

import type { DeepPartial, UiState } from "@shared";

export const fetchUiState = query(async () => {
  const result = await window.api.getUiState();
  if (result.success) {
    return result.data;
  }
  console.error("Failed to fetch UI state:", result.error);
  return null;
}, "ui-state");

export const useUiState = () =>
  createAsyncStore<UiState | null>(() => fetchUiState(), {
    initialValue: null,
  });

export const updateUiStateAction = action(async (newUiState: DeepPartial<UiState>) => {
  const result = await window.api.updateUiState(newUiState);

  if (!result.success) {
    console.error("Failed to update UI state:", result.error);
  }

  if (result.success) {
    revalidate("ui-state");
  }

  return result;
});
