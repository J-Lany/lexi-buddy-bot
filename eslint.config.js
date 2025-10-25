import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    ignores: ["node_modules/", "dist/", "build/", ".husky/", "*.config.js"],
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
    },
  },
);
