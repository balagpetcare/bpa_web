import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // React Compiler rules are overly strict for existing codebases.
    // set-state-in-effect is the normal pattern for initializing state from
    // async data / props. The compiler handles safe-memoization automatically.
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "react-hooks/immutability": "off",
      // Allow img tags on pages that render user/markdown content
      // where next/Image is impractical.
      "@next/next/no-img-element": "warn",
    },
  },
]);

export default eslintConfig;
