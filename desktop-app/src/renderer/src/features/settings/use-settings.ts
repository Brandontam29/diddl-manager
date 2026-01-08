import { action, createAsyncStore, query, revalidate } from "@solidjs/router";

import type { Settings } from "@shared";
import { type DeepPartial } from "@shared";

export const fetchSettings = query(async () => {
  const result = await window.api.getSettings();

  if (result.success) {
    return result.data;
  }
  console.error("Failed to fetch settings:", result.error);
  return null;
}, "settings");

export const useSettings = () =>
  createAsyncStore<Settings | null>(() => fetchSettings(), {
    initialValue: null,
  });

export const updateSettingAction = action(async (newSettings: DeepPartial<Settings>) => {
  const result = await window.api.updateSetting(newSettings);

  if (!result.success) {
    console.error("Failed to update settings:", result.error);
    // toast
  }

  if (result.success) {
    revalidate("settings");
  }

  return result;
});
