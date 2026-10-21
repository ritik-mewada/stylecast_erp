// @ts-check
import { defineConfig } from "eslint/config";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default defineConfig(
  // Generated migrations are left as TypeORM writes them.
  { ignores: ["dist/", "src/migrations/"] },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    rules: {
      // Allow intentionally unused args/vars when prefixed with _ (e.g. Express handlers).
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
    },
  },
);
