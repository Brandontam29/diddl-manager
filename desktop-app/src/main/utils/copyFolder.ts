import fs from "node:fs/promises";
import path from "node:path";

import exists from "./exists";

async function copyFolder(source: string, destination: string) {
  if (await exists(destination)) {
    await fs.mkdir(destination, { recursive: true });
  }

  const files = await fs.readdir(source);

  await Promise.all(
    files.map(async (file) => {
      const srcPath = path.join(source, file);
      const destPath = path.join(destination, file);

      if ((await fs.lstat(srcPath)).isDirectory()) {
        return copyFolder(srcPath, destPath);
      }
      return fs.copyFile(srcPath, destPath);
    }),
  );
}

export default copyFolder;
