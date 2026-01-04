import path from "node:path";

import { electronApp, is, optimizer } from "@electron-toolkit/utils";
import { BrowserWindow, app, protocol, shell } from "electron";
import electronUpdater from "electron-updater";

import icon from "../../resources/icon.jpg?asset";
import { initDb, migrateToLatest } from "./database";
import setupDiddlImages from "./diddl/setupDiddlImages";
import { log, logging } from "./logging";
import { appPath, logAllPaths } from "./pathing";
import registerMainHandlers from "./registerMainHandlers";
import isDev from "./utils/isDev";

const { autoUpdater } = electronUpdater;

autoUpdater.logger = logging;

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    // autoHideMenuBar: true,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.mjs"),
      sandbox: false,
      webSecurity: !isDev(),
      allowRunningInsecureContent: false,
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, "..", "renderer", "index.html"));
  }

  return mainWindow;
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId("com.manager.diddl");

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  /**
   * MY STUFF
   */
  logAllPaths();
  const db = initDb();

  if (db) await migrateToLatest(db);

  await setupDiddlImages();

  const window = createWindow();
  if (db) registerMainHandlers(window, db);

  app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  protocol.registerFileProtocol("app", (request, callback) => {
    // 1. Get the requested file path from the URL
    // e.g., for "app://images/photo.png", url will be "images/photo.png"
    const url = request.url.slice("app://".length);

    // 2. Construct the absolute path to the image in your AppData
    const filePath = path.join(appPath(), url);

    // 3. Pass the file path back to Electron

    // console.log(request.url, "===", filePath);
    if (filePath.includes(".JPG.jpg")) {
      const newPath = filePath.replaceAll("JPG.jpg", "jpg");
      callback({ path: newPath });

      return;
    }
    callback({ path: filePath });
  });

  autoUpdater.checkForUpdatesAndNotify().catch((err) => {
    log.error("Update check failed", err);
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Optional: Listen for events to show custom UI/Notifications
autoUpdater.on("update-available", () => {
  logging.info("Update available.");
});

autoUpdater.on("update-downloaded", () => {
  logging.info("Update downloaded; will install now");
  // You can prompt the user to restart here
  // autoUpdater.quitAndInstall();
});
