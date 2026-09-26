# ESLint Ignore _forense Directory

To prevent ESLint from processing files under `_forense/` (which contains large, generated, or external code that should not be linted), add the directory to the `ignores` array in `eslint.config.js`:

```js
export default tseslint.config(
  { ignores: ["dist", "_forense"] },
  {
    /* rest of config */
  }
);
```

This ensures:
- No lint errors/warnings are reported from `_forense/`
- Lint performance is improved by skipping unnecessary files
- The ignore works for both flat and hierarchical configs in ESLint v9+

**Note:** If using an older ESLint version with `.eslintignore`, migrate to the `ignores` property as shown above.