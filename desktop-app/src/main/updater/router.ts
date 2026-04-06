import { observable } from "@trpc/server/observable";
import { app } from "electron";

import { createDefaultUiState } from "../config";
import { toTrpcError } from "../errors";
import { publicProcedure, router } from "../trpc/trpc";
import { checkForUpdates, installUpdate, onUpdateStatusChange } from "./setup";
import { type UpdateStatus, getUpdateStatus } from "./state";

const uiStore = createDefaultUiState();

export const updaterRouter = router({
  checkForUpdate: publicProcedure.mutation(async () => {
    try {
      await checkForUpdates();
      uiStore.set("lastCheckedForUpdate", new Date().toISOString());
      return { success: true };
    } catch (error) {
      throw toTrpcError(error, {
        fallbackMessage: "Failed to check for updates",
        operation: "updater.checkForUpdate",
      });
    }
  }),

  installUpdate: publicProcedure.mutation(() => {
    try {
      installUpdate();
      return { success: true };
    } catch (error) {
      throw toTrpcError(error, {
        fallbackMessage: "Failed to install the downloaded update",
        operation: "updater.installUpdate",
      });
    }
  }),

  getStatus: publicProcedure.query(() => {
    return {
      status: getUpdateStatus(),
      lastCheckedForUpdate: uiStore.get("lastCheckedForUpdate") ?? null,
      appVersion: app.getVersion(),
    };
  }),

  onStatus: publicProcedure.subscription(() => {
    return observable<UpdateStatus>((emit) => {
      const unsubscribe = onUpdateStatusChange((status) => {
        emit.next(status);
      });

      return unsubscribe;
    });
  }),
});
