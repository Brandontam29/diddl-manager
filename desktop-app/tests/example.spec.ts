import path from "path";
import { fileURLToPath } from "url";

import { ElectronApplication, Page, _electron as electron, expect, test } from "@playwright/test";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe("App", () => {
  let electronApp: ElectronApplication;
  let page: Page;

  test.beforeEach(async () => {
    // Launch the app from the source execution
    electronApp = await electron.launch({
      args: [path.join(__dirname, "../")], // Use absolute path to the app directory
      env: { ...process.env, NODE_ENV: "development" },
    });

    // Capture and log stdout/stderr to diagnose crashes
    electronApp.process().stdout?.on("data", (data) => console.log(`[stdout]: ${data}`));
    electronApp.process().stderr?.on("data", (data) => console.error(`[stderr]: ${data}`));

    // Wait for the first window
    page = await electronApp.firstWindow({ timeout: 20000 });
    page.on("console", (msg) => console.log(`[app-console]: ${msg.text()}`));
  });

  test.afterEach(async () => {
    if (electronApp) {
      await electronApp.close();
    }
  });

  test("should launch and display the correct title", async () => {
    const title = await page.title();
    console.log(`App title is: ${title}`);
    expect(title).toBeTruthy();
  });
});
