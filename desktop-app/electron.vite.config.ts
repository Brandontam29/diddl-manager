import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    resolve: {
      alias: {
        "@renderer": resolve("src/renderer/src"),
      },
    },
    worker: {
      rollupOptions: {
        output: {
          assetFileNames: (assetInfo) => {
            // Keep the original directory structure for assets
            const info = assetInfo.name.split(".");
            const extType = info[info.length - 1];
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
              // Preserve path for images
              return `assets/images/[name]-[hash][extname]`;
            }
            // Other assets
            return `assets/[name]-[hash][extname]`;
          },
        },
      },
    },
    plugins: [solid()],
  },
});
