import { app } from "electron";
import path from "path";

import isDev from "../utils/isDev";
import logAllPaths from "./logAllPaths";

const DEV_DIRECTORY = "diddl-manager-dev";

/**
 * RAW
 */

// PROD
// rawGet__dirname => C:\Users\brand\AppData\Local\Programs\diddl-manager\resources\app.asar\out\main
// rawGetAppData => C:\Users\brand\AppData\Local\Programs\diddl-manager\resources\app.asar
// rawGetPathAppData => C:\Users\brand\AppData\Roaming
// rawGetPathUserData => C:\Users\brand\AppData\Roaming\diddl-manager
// rawGetPathDownloads => C:\Users\brand\Downloads
// appPath => C:\Users\brand\AppData\Roaming\diddl-manager
// rendererDirectory => C:\Users\brand\AppData\Local\Programs\diddl-manager\resources\app.asar\src\renderer
// libraryPath => C:\Users\brand\AppData\Roaming\diddl-manager\library.json
// libraryMapPath => C:\Users\brand\AppData\Roaming\diddl-manager\library-map.json
// defaultLibraryPath => C:\Users\brand\AppData\Local\Programs\diddl-manager\resources\app.asar\resources\default-library.json
// listDirectory => C:\Users\brand\AppData\Roaming\diddl-manager\lists
// listTrackerPath => C:\Users\brand\AppData\Roaming\diddl-manager\lists\list-tracker.json
// collectionListPath => C:\Users\brand\AppData\Roaming\diddl-manager\lists\collection.json
// logDirectory => C:\Users\brand\AppData\Roaming\diddl-manager\logs
// defaultZipPath => C:\Users\brand\AppData\Roaming\diddl-manager\haha.zip
// downloadsFolder => C:\Users\brand\Downloads

// DEV

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

export const rendererDirectory = () => path.join(app.getAppPath(), "src", "renderer");

export const libraryPath = () => path.join(appPath(), "library.json");
export const libraryMapPath = () => path.join(appPath(), "library-map.json");

export const defaultLibraryPath = () =>
  path.join(app.getAppPath(), "resources", "default-library.json");

export const listDirectory = () => path.join(appPath(), "lists");
export const listTrackerPath = () => path.join(appPath(), "lists", "list-tracker.json");

export const collectionListPath = () => path.join(appPath(), "lists", "collection.json");

export const logDirectory = () => path.join(appPath(), "logs");

export const defaultZipPath = (fileName: string = "diddls.zip") => path.join(appPath(), fileName);

export const downloadsFolder = () => app.getPath("downloads");

export const assetsDirectory = () => path.join(app.getAppPath(), "../");

/**
 * Images
 */

export const diddlImagesZipPath = () =>
  isDev()
    ? path.join(rawGet__dirname(), "../", "../", "resources", "diddl-images.zip")
    : path.join(appPath(), "diddl-images.zip");

export const diddlImagesPath = () => path.join(appPath(), "diddl-images");

export { logAllPaths };
