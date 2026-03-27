import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default [
  ...nextVitals,
  ...nextTypescript,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "IrisComm/**",
      "IrisCommMobile/**",
      "src/**",
      "script.js",
      "index.html",
      "index - Copy.html",
    ],
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
      "react-hooks/static-components": "off",
      "react-hooks/immutability": "off",
      "react/no-unescaped-entities": "off",
    },
  },
];
