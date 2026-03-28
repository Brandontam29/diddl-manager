import { createSignal } from "solid-js";

import { trpc } from "@renderer/libs/trpc";

export type UpdateStatusType =
  | "idle"
  | "checking"
  | "update-available"
  | "downloading"
  | "update-downloaded"
  | "update-not-available"
  | "error";

export type UpdateStatus = {
  type: UpdateStatusType;
  version?: string;
  error?: string;
};

const [updateStatus, setUpdateStatus] = createSignal<UpdateStatus>({ type: "idle" });
const [appVersion, setAppVersion] = createSignal<string>("");
const [lastCheckedForUpdate, setLastCheckedForUpdate] = createSignal<string | null>(null);

export { updateStatus, appVersion, lastCheckedForUpdate };

export function initUpdateState() {
  // Fetch initial state to catch any pending update from before subscription
  trpc.updater.getStatus.query().then((result) => {
    setUpdateStatus(result.status);
    setAppVersion(result.appVersion);
    setLastCheckedForUpdate(result.lastCheckedForUpdate);
  });

  // Subscribe to live status changes
  trpc.updater.onStatus.subscribe(undefined, {
    onData(status: UpdateStatus) {
      setUpdateStatus(status);
    },
  });
}

export async function checkForUpdate() {
  await trpc.updater.checkForUpdate.mutate();
  // Refresh last checked timestamp
  const result = await trpc.updater.getStatus.query();
  setLastCheckedForUpdate(result.lastCheckedForUpdate);
}

export function installUpdate() {
  trpc.updater.installUpdate.mutate();
}
