import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // Allow any types for form handling and API responses where types are complex
      "@typescript-eslint/no-explicit-any": "off",
      
      // Configure unused variables to show as errors during development
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "caughtErrorsIgnorePattern": "^_"
        }
      ],
      
      // Allow unescaped entities in React (common for apostrophes and quotes)
      "react/no-unescaped-entities": [
        "error",
        {
          "forbid": [">", "}"]
        }
      ],
      
      // Relax Next.js image optimization warning to warning level
      "@next/next/no-img-element": "warn",
    },
  },
];

export default eslintConfig;
