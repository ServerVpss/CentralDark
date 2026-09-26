# Next.js 15 + Tailwind CSS v4 + PostCSS in Monorepo — Setup Reference

## Problem
Setting up Tailwind CSS v4 with PostCSS in a Next.js 15 monorepo (ui/ workspace) triggers Next.js built-in Tailwind detection, which conflicts with manual PostCSS configuration using `@tailwindcss/postcss`.

## Root Cause
Next.js automatically detects `tailwindcss` package in `node_modules` and injects its own PostCSS plugin (`tailwindcss`), conflicting with explicit `@tailwindcss/postcss` in `postcss.config.mjs`. Error: *"It looks like you're trying to use \`tailwindcss\` directly as a PostCSS plugin."*

## Solution Checklist

### 1. Package.json (ui/)
```json
{
  "dependencies": {
    "next": "^15.2.0",
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "tw-animate-css": "^1.2.5"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.3.3",
    "@types/react": "^19.2.15",
    "@types/react-dom": "^19.2.3",
    "eslint": "^9.39.4",
    "eslint-config-next": "16.2.10",
    "postcss": "^8.5.18",
    "typescript": "^6.0.3"
  }
}
```
**Key**: NO `tailwindcss` in dependencies/devDependencies. Only `@tailwindcss/postcss`.

### 2. postcss.config.mjs (ui/)
```mjs
import tailwindcss from "@tailwindcss/postcss";
import autoprefixer from "autoprefixer";

export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### 3. next.config.mjs (ui/)
```mjs
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import createNextIntlPlugin from "next-intl/plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: "50mb" },
  },
  images: { unoptimized: true },
  // Disable Next.js built-in Tailwind CSS handling completely
  tailwindcss: false,
  // Ensure Next.js doesn't auto-detect Tailwind in webpack
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'tailwindcss': false,
      };
    }
    return config;
  },
};

export default withNextIntl(nextConfig);
```

### 4. tailwind.config.js (ui/)
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: {} },
  plugins: [],
};
```

### 5. globals.css (ui/src/app/)
```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  /* CSS variables mapped to Tailwind tokens */
}

@layer base {
  * { @apply border-border outline-ring/50; }
  body { /* ... */ }
}
```

## Critical Notes
- **Tailwind v4 syntax**: `@import "tailwindcss"`, `@theme inline`, `@layer base` — NO `@tailwind base/components/utilities`
- **NO `tailwindcss` package** in any workspace. Only `@tailwindcss/postcss` in devDependencies.
- **`tailwindcss: false`** in next.config.mjs disables Next.js built-in Tailwind detection.
- **Webpack alias** `'tailwindcss': false` prevents webpack from resolving `tailwindcss` package.
- **tailwind.config.js** still needed for `content` paths in v4.
- **Root postcss.config.mjs** (repo root) can mirror ui/ config for consistency.

## Troubleshooting
| Symptom | Fix |
|---------|-----|
| "tailwindcss directly as PostCSS plugin" | Remove `tailwindcss` from all package.json; use only `@tailwindcss/postcss` |
| `@layer base` needs `@tailwind base` | Tailwind v4 doesn't use `@tailwind base`; remove `@layer base` or ensure `@import "tailwindcss"` is present |
| Next.js still injects tailwindcss | Verify `tailwindcss: false` in next.config.mjs; check webpack alias |
| Port 3001 EADDRINUSE | `taskkill /F /FI "IMAGENAME eq node.exe"` then restart |
| Turbopack cache corruption | `rm -rf .next node_modules/.cache` then restart |

## Files Created in This Session
- `/c/Users/danda/aiox-core/ui/package.json` (no tailwindcss)
- `/c/Users/danda/aiox-core/ui/postcss.config.mjs` (@tailwindcss/postcss)
- `/c/Users/danda/aiox-core/ui/next.config.mjs` (tailwindcss: false + webpack alias)
- `/c/Users/danda/aiox-core/ui/tailwind.config.js` (content paths)
- `/c/Users/danda/aiox-core/ui/src/app/globals.css` (v4 syntax)
- `/c/Users/danda/aiox-core/ui/tailwind.config.js` (content paths)
- `/c/Users/danda/aiox-core/ui/postcss.config.mjs` (@tailwindcss/postcss)