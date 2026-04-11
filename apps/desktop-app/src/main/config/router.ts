import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { logging } from "../logging";
import { publicProcedure, router } from "../trpc/trpc";
import { createDefaultSetting } from "./settings";
import { createDefaultUiState } from "./ui-state";

const settingsStore = createDefaultSetting();
const uiStateStore = createDefaultUiState();

export const configRouter = router({
  getSettings: publicProcedure.query(() => {
    try {
      return settingsStore.store;
    } catch (e) {
      logging.error(`Failed to read settings: ${e}`);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to read settings",
      });
    }
  }),

  updateSetting: publicProcedure
    .input(z.object({ keyPath: z.array(z.string()), value: z.any() }))
    .mutation(({ input }) => {
      try {
        settingsStore.set(input.keyPath.join("."), input.value);
        return { success: true as const };
      } catch (e) {
        logging.error(`Failed to update setting: ${e}`);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update setting",
        });
      }
    }),

  getUiState: publicProcedure.query(() => {
    try {
      return uiStateStore.store;
    } catch (e) {
      logging.error(`Failed to read UI state: ${e}`);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to read UI state",
      });
    }
  }),

  updateUiState: publicProcedure
    .input(z.object({ keyPath: z.array(z.string()), value: z.any() }))
    .mutation(({ input }) => {
      try {
        uiStateStore.set(input.keyPath.join("."), input.value);
        return { success: true as const };
      } catch (e) {
        logging.error(`Failed to update UI state: ${e}`);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update UI state",
        });
      }
    }),
});
