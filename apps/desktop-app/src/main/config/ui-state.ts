import path from "node:path";

import ElectronStore from "electron-store";

import { type UiState, uiStateSchema } from "../../shared/ui-state-schema";
import { uiStatePath } from "../pathing";

export const createDefaultUiState = () => {
  const fullPath = uiStatePath();
  const cwd = path.dirname(fullPath);
  const name = path.basename(fullPath, ".json");

  // Generate default values from the Zod schema
  const defaults = uiStateSchema.parse({});

  const store = new ElectronStore<UiState>({
    cwd,
    name,
    defaults,
  });

  return store;
};
