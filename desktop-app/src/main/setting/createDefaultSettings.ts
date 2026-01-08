import path from "node:path";

import ElectronStore from "electron-store";

import { type Settings, settingsSchema } from "../../shared/settings-schema";
import { settingsPath } from "../pathing";

export const createDefaultSetting = () => {
  const fullPath = settingsPath();
  const cwd = path.dirname(fullPath);
  const name = path.basename(fullPath, ".json");

  const defaults = settingsSchema.parse({});

  const store = new ElectronStore<Settings>({
    cwd,
    name,
    defaults,
  });

  return store;
};
