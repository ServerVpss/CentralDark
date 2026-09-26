---
name: nextjs-tailwind-setup
description: Fix Next.js 15 Tailwind v3 Windows — PostCSS config errors.
category: software-development
tags: [nextjs, tailwind, windows, css, postcss]
---

# Next.js + Tailwind CSS v3 Setup (Windows)

Class-level skill for initializing and troubleshooting Next.js projects with Tailwind v3 on Windows.

## When to use
- Creating a new Next.js project with Tailwind v3 on Windows
- Debugging `npm run dev` failures related to Tailwind/PostCSS
- Verifying Tailwind compilation in a Next.js monorepo

## Critical Configuration

### `package.json`
```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0"
  },
  "devDependencies": {
    "postcss": "^8.4.0",
    "typescript": "^5.0.0"
  }
}
```
**Key**: `tailwindcss` in `dependencies`. `@tailwindcss/postcss` is for v4 — **do not use with v3**.

### `postcss.config.cjs` (CommonJS — required on Windows)
```javascript
const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer");
module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };
```
**Why `.cjs`**: Windows fails to load ES module PostCSS config.

### `tailwind.config.js`
```javascript
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./app/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} }, plugins: []
};
```

### `src/app/globals.css`
```css
@tailwind base; @tailwind components; @tailwind utilities;
@layer base { * { border-color: var(--border); } }
```
**Critical**: Use `@tailwind` directives, not `@import "tailwindcss"` (v4 syntax).

## Common Failures & Fixes

| Error | Fix |
|-------|-----|
| `tailwindcss directly as PostCSS plugin` | Remove `@tailwindcss/postcss`, use `tailwindcss` |
| `module is not defined` | Rename `postcss.config.mjs` → `postcss.config.cjs` |
| `\`border-border\` class does not exist` | Define CSS vars in `:root` or use plain CSS |
| `shadcn/tailwind.css` not found | Remove `@import "shadcn/tailwind.css"` |
| `@layer base` no matching `@tailwind base` | Add `@tailwind base;` before `@layer base` |

## Verification
```bash
rm -rf node_modules .next && npm install --legacy-peer-deps && npm run dev
```

## Windows Notes
- `taskkill /F /FI "IMAGENAME eq node.exe"` kills stuck Node
- PowerShell: use `$id` not `$pid` (reserved)
- Paths: prefer `/` in configs

## References
- `references/tailwind-v3-v4-differences.md`
- `references/windows-postcss-esm-issue.md`
- `references/globals-css-patterns.md`