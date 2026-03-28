import electronUpdater from "electron-updater";

import { logging } from "../logging";
import { setUpdateStatus } from "./state";

const { autoUpdater } = electronUpdater;

type StatusListener = (status: ReturnType<typeof import("./state").getUpdateStatus>) => void;

const listeners = new Set<StatusListener>();

export function onUpdateStatusChange(listener: StatusListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emit(status: ReturnType<typeof import("./state").getUpdateStatus>) {
  setUpdateStatus(status);
  for (const listener of listeners) {
    listener(status);
  }
}

export function setupAutoUpdater() {
  autoUpdater.logger = logging;
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = false;

  autoUpdater.on("checking-for-update", () => {
    emit({ type: "checking" });
  });

  autoUpdater.on("update-available", (info) => {
    logging.info("Update available:", info.version);
    emit({ type: "update-available", version: info.version });
  });

  autoUpdater.on("download-progress", () => {
    emit({ type: "downloading" });
  });

  autoUpdater.on("update-downloaded", (info) => {
    logging.info("Update downloaded:", info.version);
    emit({ type: "update-downloaded", version: info.version });
  });

  autoUpdater.on("update-not-available", () => {
    emit({ type: "update-not-available" });
  });

  autoUpdater.on("error", (err) => {
    logging.error("Update error:", err);
    emit({ type: "error", error: err.message });
  });
}

export function checkForUpdates() {
  return autoUpdater.checkForUpdates();
}

export function installUpdate() {
  autoUpdater.quitAndInstall();
}
