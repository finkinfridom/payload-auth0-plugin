module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  rules: {
    "no-console": 2,
    "@typescript-eslint/no-empty-function": 1,
    "@typescript-eslint/ban-types": 1,
    "@typescript-eslint/ban-ts-comment": 1,
  },
  // env: {
  //   node: true,
  //   es2020: true,
  // },
  parserOptions: {
    project: ["./tsconfig.json"],
    tsconfigRootDir: __dirname,
  },
};
