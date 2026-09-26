---
name: tailwind-setup
category: frontend-core
description: Install and configure Tailwind CSS in React/Vue/Next.js projects
related_skills:
  - tailwind-responsive
  - tailwind-darkmode
  - shadcn-setup
---

# Tailwind CSS Setup

## When to Use

Use this skill when starting a new project or adding Tailwind CSS to an existing React, Vue, or Next.js project.

## Quick Start

```bash
# Install Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Configure tailwind.config.js
# Add to src/index.css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Core Concepts

- **Utility-First**: Apply styles directly in HTML/JSX using utility classes
- **PostCSS Integration**: Tailwind processes CSS at build time via PostCSS
- **JIT Mode**: Just-In-Time compilation generates only used classes (default in v3+)

## Step-by-Step Guide

### 1. Install Dependencies

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

This creates:
- `tailwind.config.js` - Tailwind configuration
- `postcss.config.js` - PostCSS configuration

### 2. Configure Content Paths

Edit `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",  // Scan these files for classes
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### 3. Add Tailwind Directives

In your main CSS file (e.g., `src/index.css`):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 4. Verify Setup

Create a test component:

```tsx
function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <h1 className="text-4xl font-bold text-blue-600">
        Tailwind CSS is working!
      </h1>
    </div>
  )
}
```

Run dev server:
```bash
npm run dev
```

You should see styled text with gray background.

## Common Patterns

### Pattern 1: Vite + React

```js
// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
      },
    },
  },
  plugins: [],
}
```

### Pattern 2: Next.js App Router

```js
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
export default config
```

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Pattern 3: Custom Theme Extension

```js
// tailwind.config.js
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          500: '#0ea5e9',
          900: '#0c4a6e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      spacing: {
        '128': '32rem',
      },
    },
  },
  plugins: [],
}
```

## Gotchas & Tips

**Common Mistakes:**
- ❌ Forgetting to add file paths to `content` array → styles won't generate
- ❌ Not importing CSS file in main entry → Tailwind won't load
- ❌ Using arbitrary values without backticks: `w-[100px]` not `w-100px`

**Best Practices:**
- ✅ Use specific content paths to speed up build
- ✅ Extend theme in `extend` object, don't replace defaults
- ✅ Use `@layer` for custom components (see `tailwind-components` skill)
- ✅ Install Tailwind IntelliSense VS Code extension

**Verification:**
```bash
# Check if Tailwind is processing
npm run build

# Output CSS file should be small (JIT mode)
# Development: ~5-10KB base
# Production: Only used classes
```

## Related Skills

- Use `tailwind-responsive` for mobile-first responsive design
- Use `tailwind-darkmode` to add dark theme support
- Combine with `shadcn-setup` for pre-built components
- See `tailwind-components` for custom component patterns

💡 **Plugin**: For complete frontend setup, see `frontend-fullstack-setup` plugin
