import { observable } from "@trpc/server/observable";
import { app } from "electron";

import { createDefaultUiState } from "../config";
import { publicProcedure, router } from "../trpc/trpc";
import { checkForUpdates, installUpdate, onUpdateStatusChange } from "./setup";
import { type UpdateStatus, getUpdateStatus } from "./state";

const uiStore = createDefaultUiState();

export const updaterRouter = router({
  checkForUpdate: publicProcedure.mutation(async () => {
    await checkForUpdates();
    uiStore.set("lastCheckedForUpdate", new Date().toISOString());
    return { success: true };
  }),

  installUpdate: publicProcedure.mutation(() => {
    installUpdate();
    return { success: true };
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
