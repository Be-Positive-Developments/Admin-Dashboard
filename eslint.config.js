// @ts-nocheck
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import filenames from "eslint-plugin-filenames";
import { defineConfig, globalIgnores } from "eslint/config";
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{js,jsx}"],
    extends: [
      js.configs.recommended,
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite,
      "plugin:prettier/recommended",
    ],
    plugins: {
      filenames,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    rules: {
      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
      "react/jsx-pascal-case": ["error", { allowAllCaps: true }],
      camelcase: ["error", { properties: "always" }],
      "filenames/match-regex": ["error", "^[a-z0-9-]+$", true],
      "react/prefer-stateless-function": [
        "error",
        { ignorePureComponents: true },
      ],
      "react/no-deprecated": "error",
      "react/no-unsafe": "error",
      "prettier/prettier": "error",
      "no-restricted-props": [
        "error",
        {
          propName: "style",
          message:
            "Avoid inline styles. Use CSS modules, Tailwind, or styled-components instead.",
        },
      ],
    },
  },
]);
