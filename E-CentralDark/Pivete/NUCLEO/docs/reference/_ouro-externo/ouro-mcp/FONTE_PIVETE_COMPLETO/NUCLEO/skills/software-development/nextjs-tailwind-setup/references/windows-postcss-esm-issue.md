# Windows PostCSS ESM Issue — Why `.cjs` is Required

## The Problem
On Windows, Next.js fails to load `postcss.config.mjs` (ES Module) with:
```
ReferenceError: module is not defined in ES module scope
    at file:///C:/.../postcss.config.mjs:1:1
```

## Root Cause
Next.js's internal PostCSS config loader (`find-config.js`) uses `require()` / dynamic import that doesn't properly handle ES modules on Windows in certain Node versions. The loader expects CommonJS (`module.exports`).

## Evidence from This Session
- `postcss.config.mjs` with `import tailwindcss from "tailwindcss"` → **FAILS**
- `postcss.config.cjs` with `const tailwindcss = require("tailwindcss")` → **WORKS**

## Why It's Windows-Specific
- Linux/macOS: Node's ESM loader handles `.mjs` more consistently
- Windows: File system case-insensitivity + Node's `package.json` `"type": "module"` resolution quirks cause the loader to misidentify the module format
- Next.js 15.5.23 (current) still has this code path

## Solution
**Always use `postcss.config.cjs` with CommonJS syntax on Windows:**

```javascript
// postcss.config.cjs
const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer");

module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

## Verification
```bash
# This should work without "module is not defined" error
npm run dev
```

## Related Issues
- Next.js repo: `packages/next/build/webpack/config/blocks/css/plugins.js` → `getPostCssPlugins()`
- Node.js ESM on Windows: `import()` vs `require()` resolution
- Workaround: rename `.mjs` → `.cjs` and use `require`/`module.exports`

## When This Might Change
- Next.js 16+ may fix the loader
- Node.js 22+ improves Windows ESM support
- Until then: `.cjs` is the safe default for Windows