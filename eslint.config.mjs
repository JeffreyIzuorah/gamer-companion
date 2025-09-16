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
      "generated/**",
      "prisma/**",
      "src/generated/**",
      "src/generated/prisma/**",
      "src/generated/prisma/client/**",
      "src/generated/prisma/client/index.ts",
      "src/generated/prisma/client/index.d.ts",
      "src/generated/prisma/client/index.js",
      "src/generated/prisma/client/index.js.map",
    ],
  },
];

export default eslintConfig;
