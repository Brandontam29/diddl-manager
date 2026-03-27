import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { settingsSchema } from "../../../shared/settings-schema";
import { uiStateSchema } from "../../../shared/ui-state-schema";
import { YamlHandler } from "../../config/yaml-handler";
import { settingsPath, uiStatePath } from "../../pathing";
import { publicProcedure, router } from "../trpc";

const settingsDocument = new YamlHandler(settingsSchema, settingsPath());
const uiStateDocument = new YamlHandler(uiStateSchema, uiStatePath());

export const configRouter = router({
  getSettings: publicProcedure.query(async () => {
    const result = await settingsDocument.read();
    return result.match(
      (data) => data,
      (e) => {
        console.error(e);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to read settings",
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
          console.error(e);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update setting",
          });
        },
      );
    }),

  getUiState: publicProcedure.query(async () => {
    const result = await uiStateDocument.read();
    return result.match(
      (data) => data,
      (e) => {
        console.error(e);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to read UI state",
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
          console.error(e);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update UI state",
          });
        },
      );
    }),
});
