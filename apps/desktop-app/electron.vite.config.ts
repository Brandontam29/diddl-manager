import tailwindcss from "@tailwindcss/vite";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import solid from "vite-plugin-solid";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
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
