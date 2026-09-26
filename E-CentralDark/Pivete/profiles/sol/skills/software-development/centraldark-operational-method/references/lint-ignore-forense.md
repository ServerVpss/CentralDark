# Lint Ignore for _forense Directory

When running `npm run lint` (ESLint) on the CentralDark repository, the `_forense/` directory contains large forensic data dumps (e.g., extracted brains, logs, test fixtures) that generate thousands of lint errors and are not part of the source code to be maintained.

To prevent lint noise and keep feedback actionable, the ESLint configuration (`eslint.config.js`) includes `"_forense"` in the `ignores` array:

```js
export default tseslint.config(
  { ignores: ["dist", "_forense"] },
  { /* existing config */ }
);
```

This change was introduced in the Dependabot update branch for eslint@9.39.5 (PR #1234) and verified by ensuring that `npm run lint` output contains no paths under `_forense/`.

**Note**: This ignore is safe because `_forense/` contains only extracted, read‑only forensic material; none of it is edited or committed as part of the product.