import js from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import globals from "globals";

export default [
  { ignores: ["dist", "node_modules", "public/js/**", "api/**"] },
  {
    ...js.configs.recommended,
    files: ["*.js", "vite.config.*"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  eslintPluginPrettier,
];
