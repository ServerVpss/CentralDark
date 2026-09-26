# Windows Next.js Debugging — Quick Reference Card

## TurboPack Issues
```bash
# Disable TurboPack (use Webpack instead)
OMNIROUTE_USE_TURBOPACK=0 npm run dev

# Clear cache
rm -rf .build/next

# Auto-heal (built into OmniRoute)
# scripts/dev/run-next.mjs has purgeAllTurbopackCaches()
```

## FTS5 / better-sqlite3
```bash
# Rebuild native module
npm rebuild better-sqlite3

# Or force reinstall
npm install --force --ignore-scripts better-sqlite3

# Validate FTS5
node -e "require('better-sqlite3')(':memory:').exec('CREATE VIRTUAL TABLE t USING fts5(x)')"
```

## SQLite Lock/Corruption
```bash
# Clear lock files
rm -rf ~/.config/omniroute/storage.sqlite*
# Windows: C:\Users\<user>\AppData\Roaming\omniroute\storage.sqlite*
```

## NODE_ENV Mismatch
```js
// In dev bootstrap script (before next())
process.env.NODE_ENV = dev ? "development" : "production";
```

## Next.js 15 + Tailwind v3 — CSS & PostCSS (07/08/2026)
```css
/* globals.css — Tailwind v3 REQUIRES trio at top */
@tailwind base;
@tailwind components;
@tailwind utilities;

@import "tw-animate-css";
/* @import "shadcn/tailwind.css";  -- REMOVED, breaks v3 */

/* @layer base now works with @apply */
@layer base {
  * { border-color: var(--border); }
}
```

```js
// postcss.config.cjs — MUST be CommonJS (.cjs)
const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer");

module.exports = {
  plugins: { tailwindcss: {}, autoprefixer: {} },
};
```

```js
// tailwind.config.js — MUST be CommonJS
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: {} },
  plugins: [],
};
```

```tsx
// Client Component required for event handlers
"use client";

import { useState } from "react";
// onMouseEnter/onMouseLeave now work
```

## Large node_modules Cleanup on Windows NTFS
```bash
# 1. Backup .env
cp projeto/.env /tmp/backup-env.txt

# 2. Kill orphan Node processes
tasklist | findstr node
taskkill /F /PID <pids>

# 3. rm -rf in background + monitor
rm -rf projeto/node_modules > /tmp/rm.log 2>&1 &
# ls projeto/node_modules/ — empty = ok even if log still writing

# 4. If root folder stuck, move children directly:
mkdir -p /tmp/trash
mv projeto/* /tmp/trash/
rmdir projeto
```

## Quick Commands
```bash
# All-in-one health check
node -e "require('better-sqlite3')(':memory:').exec('CREATE VIRTUAL TABLE t USING fts5(x)'); console.log('FTS5 OK')"

# Clear TurboPack cache
rm -rf .build/next

# Disable TurboPack
export OMNIROUTE_USE_TURBOPACK=0
npm run dev
```