# globals.css Patterns — @tailwind vs @import, @layer Usage

## The Golden Rule for Tailwind v3
```css
/* ✅ CORRECT — v3 syntax */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Your custom styles below */
@layer base {
  * {
    border-color: var(--border);
    outline-color: color-mix(in srgb, var(--ring) 50%, transparent);
  }
}

/* ❌ WRONG — v4 syntax (causes build failures in v3) */
@import "tailwindcss";
@import "shadcn/tailwind.css";
```

## Why This Matters
- `@tailwind` directives tell Tailwind v3 where to inject its generated CSS
- `@import "tailwindcss"` is v4 syntax — PostCSS v3 plugin doesn't understand it
- Missing `@tailwind base` before `@layer base` → "`@layer base` used but no matching `@tailwind base` directive"

## CSS Variables Pattern (v3 Compatible)

### Define in `:root` (Global)
```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.141 0.005 285.823);
  --border: oklch(0.92 0.004 286.32);
  --ring: oklch(0.705 0.015 286.067);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

.dark {
  --background: oklch(0.141 0.005 285.823);
  --foreground: oklch(0.985 0 0);
  --border: oklch(1 0 0 / 10%);
  --ring: oklch(0.552 0.016 285.938);
}
```

### Use in `@layer base`
```css
@layer base {
  * {
    border-color: var(--border);
    outline-color: color-mix(in srgb, var(--ring) 50%, transparent);
  }
  body {
    background-color: var(--background);
    color: var(--foreground);
    font-family: var(--font-sans), sans-serif;
  }
}
```

## Common Mistakes & Fixes

| Mistake | Error | Fix |
|--------|-------|-----|
| `@apply border-border` without `--border` defined | `The \`border-border\` class does not exist` | Define `--border` in `:root` |
| `@layer base` before `@tailwind base` | `@layer base` used but no matching `@tailwind base` | Order: `@tailwind base` → `@layer base` |
| `@import "tailwindcss"` | `tailwindcss directly as PostCSS plugin` | Use `@tailwind base; @tailwind components; @tailwind utilities;` |
| `@import "shadcn/tailwind.css"` | `Module not found` | Remove or install `@shadcn/ui` properly |

## Complete Working Example (This Session's Final Config)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import "tw-animate-css";

:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.141 0.005 285.823);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.141 0.005 285.823);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.141 0.005 285.823);
  --primary: oklch(0.21 0.006 285.885);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.967 0.001 286.375);
  --secondary-foreground: oklch(0.21 0.006 285.885);
  --muted: oklch(0.967 0.001 286.375);
  --muted-foreground: oklch(0.552 0.016 285.938);
  --accent: oklch(0.967 0.001 286.375);
  --accent-foreground: oklch(0.21 0.006 285.885);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.92 0.004 286.32);
  --input: oklch(0.92 0.004 286.32);
  --ring: oklch(0.705 0.015 286.067);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.141 0.005 285.823);
  --sidebar-primary: oklch(0.21 0.006 285.885);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.967 0.001 286.375);
  --sidebar-accent-foreground: oklch(0.21 0.006 285.885);
  --sidebar-border: oklch(0.92 0.004 286.32);
  --sidebar-ring: oklch(0.705 0.015 286.067);
}

.dark {
  --background: oklch(0.141 0.005 285.823);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.21 0.006 285.885);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.21 0.006 285.885);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.92 0.004 286.32);
  --primary-foreground: oklch(0.21 0.006 285.885);
  --secondary: oklch(0.274 0.006 286.033);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.274 0.006 286.033);
  --muted-foreground: oklch(0.705 0.015 286.067);
  --accent: oklch(0.274 0.006 286.033);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.552 0.016 285.938);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.21 0.006 285.885);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.274 0.006 286.033);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.552 0.016 285.938);
}

@layer base {
  * {
    border-color: var(--border);
    outline-color: color-mix(in srgb, var(--ring) 50%, transparent);
  }
  body {
    background-color: var(--background);
    color: var(--foreground);
    font-family: var(--font-sans), sans-serif;
  }
}

/* Custom components below */
.cockpit-shell { /* ... */ }
.metric-card { /* ... */ }
```

## Order Matters
1. `@tailwind base; @tailwind components; @tailwind utilities;`
2. `@import` for third-party (e.g., `tw-animate-css`)
3. `:root` / `.dark` CSS variables
4. `@layer base { ... }`
5. Custom component classes

## Verification Checklist
- [ ] `@tailwind base` appears before any `@layer base`
- [ ] All `--color-*` variables defined in `:root`
- [ ] No `@import "tailwindcss"` or `@import "shadcn/tailwind.css"`
- [ ] `@apply` only used with defined CSS variables
- [ ] `postcss.config.cjs` uses `require("tailwindcss")`