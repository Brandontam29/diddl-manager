import path from "node:path";

import { app } from "electron";

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
// listDirectory => C:\Users\brand\AppData\Roaming\diddl-manager\lists
// logDirectory => C:\Users\brand\AppData\Roaming\diddl-manager\logs
// defaultZipPath => C:\Users\brand\AppData\Roaming\diddl-manager\haha.zip
// downloadsFolder => C:\Users\brand\Downloads

// DEV
// appPath => C:\Users\brand\AppData\Roaming\diddl-manager-dev
// dbPath => C:\Users\brand\AppData\Roaming\diddl-manager-dev\db.sqlite3
// defaultZipPath => C:\Users\brand\AppData\Roaming\diddl-manager-dev\diddls.zip
// diddlImagesPath => C:\Users\brand\AppData\Roaming\diddl-manager-dev\diddl-images
// diddlImagesZipPath => C:\Users\brand\code-win\diddl-manager\desktop-app\resources\diddl-images.zip
// downloadsFolder => C:\Users\brand\Downloads
// logDirectory => C:\Users\brand\AppData\Roaming\diddl-manager-dev\logs
// rawGetAppData => C:\Users\brand\code-win\diddl-manager\desktop-app
// rawGetPathAppData => C:\Users\brand\AppData\Roaming
// rawGetPathDownloads => C:\Users\brand\Downloads
// rawGetPathUserData => C:\Users\brand\AppData\Roaming\diddl-manager
// rawGet__dirname => C:\Users\brand\code-win\diddl-manager\desktop-app\out\main
// rendererDirectory => C:\Users\brand\code-win\diddl-manager\desktop-app\src\renderer

export const rawGet__dirname = () => __dirname;
export const rawGetAppData = () => app.getAppPath();
export const rawGetPathAppData = () => app.getPath("appData");
export const rawGetPathUserData = () => app.getPath("userData");
export const rawGetPathDownloads = () => app.getPath("downloads");

/**
 * BASE
 */
export const appPath = () =>
  isDev() ? path.join(app.getPath("appData"), DEV_DIRECTORY) : app.getPath("userData");

export const rendererDirectory = () => path.join(app.getAppPath(), "src", "renderer");

export const dbPath = () => path.join(appPath(), "db.sqlite3");

export const logDirectory = () => path.join(appPath(), "logs");

export const defaultZipPath = (fileName: string = "diddls.zip") => path.join(appPath(), fileName);

export const downloadsFolder = () => app.getPath("downloads");

export const settingsPath = () => path.join(appPath(), "json-files", "settings.json");
export const uiStatePath = () => path.join(appPath(), "json-files", "ui-state.json");


/**
 * Images
 */

export const diddlImagesZipPath = () =>
  isDev()
    ? path.join(rawGet__dirname(), "../", "../", "resources", "diddl-images.zip")
    : path.join(rawGetAppData(), "../", "diddl-images.zip");

export const diddlImagesPath = () => path.join(appPath(), "diddl-images");

export { logAllPaths };
