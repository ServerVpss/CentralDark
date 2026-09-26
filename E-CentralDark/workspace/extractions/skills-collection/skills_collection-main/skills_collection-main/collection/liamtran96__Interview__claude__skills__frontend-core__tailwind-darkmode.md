---
name: tailwind-darkmode
category: frontend-core
description: Implement dark mode in Tailwind CSS with class or media strategy
related_skills:
  - tailwind-setup
  - tailwind-responsive
---

# Tailwind Dark Mode

## When to Use

Use this skill when adding dark theme support to your application using Tailwind's built-in dark mode utilities.

## Quick Start

```tsx
// 1. Configure tailwind.config.js
export default {
  darkMode: 'class',  // or 'media'
  // ...
}

// 2. Use dark: prefix
<div className="bg-white dark:bg-gray-900">
  <h1 className="text-gray-900 dark:text-white">
    Title
  </h1>
</div>

// 3. Toggle dark class on root
document.documentElement.classList.toggle('dark')
```

## Core Concepts

- **Dark Variant**: `dark:` prefix applies styles when dark mode active
- **Class Strategy**: Manually toggle via `dark` class on `<html>`
- **Media Strategy**: Auto-detect from OS preferences (`prefers-color-scheme`)

## Configuration Strategies

### Strategy 1: Class-Based (Recommended)

**Best for:** User-controlled dark mode toggle

```js
// tailwind.config.js
export default {
  darkMode: 'class',  // Enable class strategy
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  // ...
}
```

```tsx
// Toggle component
function DarkModeToggle() {
  const [dark, setDark] = useState(false)

  const toggleDark = () => {
    document.documentElement.classList.toggle('dark')
    setDark(!dark)
  }

  return (
    <button onClick={toggleDark}>
      {dark ? '🌞' : '🌙'}
    </button>
  )
}
```

### Strategy 2: Media Query (Auto)

**Best for:** Respect OS preference only

```js
// tailwind.config.js
export default {
  darkMode: 'media',  // Use OS preference
  // ...
}
```

No JavaScript needed - automatically responds to `prefers-color-scheme`.

## Step-by-Step Implementation

### 1. Configure Tailwind

```js
// tailwind.config.js
export default {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Optional: Define dark-specific colors
        dark: {
          bg: '#0f172a',
          card: '#1e293b',
          border: '#334155',
        },
      },
    },
  },
}
```

### 2. Create Dark Mode Hook

```tsx
// hooks/useDarkMode.ts
import { useEffect, useState } from 'react'

export function useDarkMode() {
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage or default to light
    return localStorage.getItem('darkMode') === 'true'
  })

  useEffect(() => {
    const root = document.documentElement
    if (darkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('darkMode', darkMode.toString())
  }, [darkMode])

  return [darkMode, setDarkMode] as const
}
```

### 3. Apply Dark Styles

```tsx
function App() {
  return (
    <div className="
      min-h-screen
      bg-white dark:bg-gray-900
      text-gray-900 dark:text-gray-100
    ">
      <header className="
        border-b border-gray-200 dark:border-gray-700
        bg-white dark:bg-gray-800
      ">
        <h1 className="text-xl font-bold">My App</h1>
      </header>

      <main className="p-4">
        <div className="
          bg-gray-100 dark:bg-gray-800
          p-6 rounded-lg
          shadow-md dark:shadow-gray-900/50
        ">
          Card content
        </div>
      </main>
    </div>
  )
}
```

### 4. Create Toggle Component

```tsx
function DarkModeToggle() {
  const [darkMode, setDarkMode] = useDarkMode()

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="
        p-2 rounded-lg
        bg-gray-200 dark:bg-gray-700
        hover:bg-gray-300 dark:hover:bg-gray-600
        transition-colors
      "
      aria-label="Toggle dark mode"
    >
      {darkMode ? '🌞' : '🌙'}
    </button>
  )
}
```

## Common Patterns

### Pattern 1: Color System

```tsx
// Design tokens approach
<div className="
  // Backgrounds
  bg-white dark:bg-gray-900

  // Text
  text-gray-900 dark:text-gray-100

  // Borders
  border border-gray-200 dark:border-gray-700

  // Subtle backgrounds
  hover:bg-gray-50 dark:hover:bg-gray-800
">
  Content
</div>
```

### Pattern 2: Images/Logos

```tsx
function Logo() {
  return (
    <>
      {/* Light mode logo */}
      <img
        src="/logo-light.png"
        alt="Logo"
        className="block dark:hidden"
      />

      {/* Dark mode logo */}
      <img
        src="/logo-dark.png"
        alt="Logo"
        className="hidden dark:block"
      />
    </>
  )
}
```

### Pattern 3: Gradients

```tsx
<div className="
  bg-gradient-to-r
  from-blue-500 to-purple-500
  dark:from-blue-700 dark:to-purple-700
">
  Gradient background
</div>
```

### Pattern 4: Form Inputs

```tsx
<input
  type="text"
  className="
    w-full px-4 py-2 rounded-lg
    bg-white dark:bg-gray-800
    border border-gray-300 dark:border-gray-600
    text-gray-900 dark:text-gray-100
    placeholder-gray-400 dark:placeholder-gray-500
    focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
    focus:border-transparent
  "
  placeholder="Enter text..."
/>
```

## Advanced: System Preference + User Override

```tsx
function useDarkMode() {
  const [mode, setMode] = useState<'light' | 'dark' | 'system'>(() => {
    return (localStorage.getItem('theme') as any) || 'system'
  })

  useEffect(() => {
    const root = document.documentElement
    const applyTheme = (theme: 'light' | 'dark') => {
      if (theme === 'dark') {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }

    if (mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      applyTheme(mediaQuery.matches ? 'dark' : 'light')

      const handler = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? 'dark' : 'light')
      }
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    } else {
      applyTheme(mode)
    }

    localStorage.setItem('theme', mode)
  }, [mode])

  return [mode, setMode] as const
}
```

## Gotchas & Tips

**Common Mistakes:**
- ❌ Forgetting to configure `darkMode` in config → `dark:` won't work
- ❌ Not persisting user preference → resets on refresh
- ❌ Low contrast in dark mode → always test text readability
- ❌ Using pure black (#000) → too harsh, use dark gray instead

**Best Practices:**
- ✅ Use semantic color naming (bg-primary vs bg-blue-500)
- ✅ Test with real dark/light content (images, code blocks)
- ✅ Provide smooth transitions: `transition-colors duration-200`
- ✅ Remember focus states need dark variants too
- ✅ Use gray-900 instead of black for dark backgrounds

**Color Recommendations:**
```
Light Mode          Dark Mode
──────────────────────────────────
bg-white            bg-gray-900
bg-gray-50          bg-gray-800
text-gray-900       text-gray-100
text-gray-600       text-gray-400
border-gray-200     border-gray-700
```

## Testing Checklist

- [ ] Toggle switches between light and dark
- [ ] Preference persists across page reloads
- [ ] All text is readable in both modes
- [ ] Images/logos have appropriate versions
- [ ] Form inputs are visible and usable
- [ ] Focus states are visible
- [ ] Hover states work in both modes
- [ ] No flash of wrong theme on page load

## Related Skills

- Use `tailwind-setup` to configure Tailwind first
- Combine with `tailwind-responsive` for responsive dark mode
- See `tailwind-components` for dark-mode-aware components

💡 **Plugin**: For complete dark mode setup with system detection, see `frontend-fullstack-setup` plugin
