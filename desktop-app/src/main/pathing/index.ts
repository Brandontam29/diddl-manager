import { app } from "electron";
import path from "path";

import isDev from "../utils/isDev";
import logAllPaths from "./logAllPaths";

const DEV_DIRECTORY = "diddl-manager-dev";

/**
 * RAW
 */
export const rawGet__dirname = () => __dirname;
// /home/<username>/code/diddl-manager/desktop-app/out/main
export const rawGetAppData = () => app.getAppPath(); // C:\Users\<username>\AppData\Roaming
export const rawGetPathAppData = () => app.getPath("appData"); // C:\Users\<username>\AppData\Roaming
export const rawGetPathUserData = () => app.getPath("userData"); // C:\Users\<username>\AppData\Roaming\diddl-manager
export const rawGetPathDownloads = () => app.getPath("downloads"); // C:\Users\<username>\AppData\Roaming\diddl-manager

/**
 * BASE
 */
export const appPath = () =>
  isDev() ? path.join(app.getPath("appData"), DEV_DIRECTORY) : app.getPath("userData");

export const relativeDiddlImagesDirectory = () => path.join("src", "assets", "diddl-images");
export const rendererDirectory = () => path.join(app.getAppPath(), "src", "renderer");

export const libraryPath = () => path.join(appPath(), "library.json");
export const libraryMapPath = () => path.join(appPath(), "library-map.json");

export const defaultLibraryPath = () =>
  path.join(app.getAppPath(), "resources", "default-library.json");

export const listDirectory = () => path.join(appPath(), "lists");
export const listTrackerPath = () => path.join(appPath(), "lists", "list-tracker.json");

export const collectionListPath = () => path.join(appPath(), "lists", "collection.json");

export const logDirectory = () => path.join(appPath(), "logs");

export const defaultZipPath = (fileName: string = "haha.zip") => path.join(appPath(), fileName);

export const downloadsFolder = () => app.getPath("downloads");

export const assetsDirectory = () => path.join(app.getAppPath(), "../");

export { logAllPaths };
