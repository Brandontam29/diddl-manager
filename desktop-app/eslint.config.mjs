import tseslint from "@electron-toolkit/eslint-config-ts";
import eslintConfigPrettier from "@electron-toolkit/eslint-config-prettier";
import eslintPluginSolid from "eslint-plugin-solid";
import stylistic from "@stylistic/eslint-plugin";

export default tseslint.config(
  stylistic,
  tseslint.configs.recommended,
  eslintPluginSolid.configs["flat/typescript"],
  eslintConfigPrettier,
  {
    ignores: ["**/node_modules", "**/dist", "**/out"],
    rules: {
      "@stylistic/linebreak-style": "off",
    },
  },
);
