import { z } from "zod";

import { settingsSchema } from "../../shared/settings-schema";
import { uiStateSchema } from "../../shared/ui-state-schema";
import { toTrpcError } from "../errors";
import { settingsPath, uiStatePath } from "../pathing";
import { publicProcedure, router } from "../trpc/trpc";
import { YamlHandler } from "./yaml-handler";

const settingsDocument = new YamlHandler(settingsSchema, settingsPath());
const uiStateDocument = new YamlHandler(uiStateSchema, uiStatePath());

export const configRouter = router({
  getSettings: publicProcedure.query(async () => {
    const result = await settingsDocument.read();
    return result.match(
      (data) => data,
      (e) => {
        throw toTrpcError(e, {
          fallbackMessage: "Failed to read settings",
          operation: "config.getSettings",
          details: { file: "settings" },
        });
      },
    );
  }),

  updateSetting: publicProcedure
    .input(z.object({ keyPath: z.array(z.string()), value: z.any() }))
    .mutation(async ({ input }) => {
      const result = await settingsDocument.update(input.keyPath, input.value);
      return result.match(
        () => ({ success: true as const }),
        (e) => {
          throw toTrpcError(e, {
            fallbackMessage: "Failed to update setting",
            operation: "config.updateSetting",
            details: { file: "settings", keyPath: input.keyPath },
          });
        },
      );
    }),

  getUiState: publicProcedure.query(async () => {
    const result = await uiStateDocument.read();
    return result.match(
      (data) => data,
      (e) => {
        throw toTrpcError(e, {
          fallbackMessage: "Failed to read UI state",
          operation: "config.getUiState",
          details: { file: "uiState" },
        });
      },
    );
  }),

  updateUiState: publicProcedure
    .input(z.object({ keyPath: z.array(z.string()), value: z.any() }))
    .mutation(async ({ input }) => {
      const result = await uiStateDocument.update(input.keyPath, input.value);
      return result.match(
        () => ({ success: true as const }),
        (e) => {
          throw toTrpcError(e, {
            fallbackMessage: "Failed to update UI state",
            operation: "config.updateUiState",
            details: { file: "uiState", keyPath: input.keyPath },
          });
        },
      );
    }),
});
