// electron.vite.config.ts
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import solid from "vite-plugin-solid";
import tsconfigPaths from "vite-tsconfig-paths";

var electron_vite_config_default = defineConfig({
  main: {
    plugins: [externalizeDepsPlugin({ exclude: ["electron-trpc"] })],
  },
  preload: {
    plugins: [externalizeDepsPlugin({ exclude: ["electron-trpc"] })],
  },
  renderer: {
    plugins: [solid(), tailwindcss(), tsconfigPaths()],
  },
});
export { electron_vite_config_default as default };
