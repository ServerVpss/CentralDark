# Tailwind CSS v3 vs v4 — Key Differences for Next.js

## Why This Matters
Next.js 15+ works with both, but mixing syntax causes build failures. This session hit every v3/v4 mismatch.

## Syntax Comparison

| Feature | v3 (Current Stable) | v4 (Beta/RC) |
|---------|---------------------|--------------|
| Package | `tailwindcss` | `@tailwindcss/postcss` |
| CSS Import | `@tailwind base; @tailwind components; @tailwind utilities;` | `@import "tailwindcss";` |
| PostCSS Plugin | `require("tailwindcss")` | `require("@tailwindcss/postcss")` |
| Config File | `tailwind.config.js` | `tailwind.config.ts` (optional) |
| CSS Variables | Define in `:root` + `@layer` | Built-in `@theme` directive |
| `@apply` | Works with CSS vars | Works with `@theme` tokens |

## Migration Checklist (v4 → v3)

1. **Package.json**: Replace `@tailwindcss/postcss` with `tailwindcss` in `dependencies`
2. **PostCSS**: `postcss.config.cjs` with `require("tailwindcss")`
3. **Globals.css**: Replace `@import "tailwindcss"` with three `@tailwind` directives
4. **Config**: Keep `tailwind.config.js` (CommonJS)
5. **CSS Vars**: Move from `@theme` to `:root { --color-*: ... }` + `@layer base`

## What Broke in This Session

| Wrong (v4 syntax) | Right (v3 syntax) |
|-------------------|-------------------|
| `@import "tailwindcss";` | `@tailwind base; @tailwind components; @tailwind utilities;` |
| `@import "shadcn/tailwind.css";` | Remove or install shadcn-ui separately |
| `postcss.config.mjs` + `import tailwindcss from "@tailwindcss/postcss"` | `postcss.config.cjs` + `require("tailwindcss")` |
| `@apply border-border` without CSS var | Define `--border` in `:root` or use plain CSS |
| `@tailwindcss/postcss` in deps | `tailwindcss` in deps |

## When to Use v4
- New projects starting fresh with Next.js 15.2+
- You want `@theme` directive and modern CSS-first approach
- OK with beta/RC churn

## When to Stay on v3
- Existing projects (like this one)
- Stability required
- Team knows v3 patterns
- Windows + Next.js 15 (v3 has fewer edge cases)

## References
- [Tailwind v3 Docs](https://v3.tailwindcss.com/docs/installation)
- [Tailwind v4 Migration](https://tailwindcss.com/docs/v4-migration)
- [Next.js + Tailwind](https://nextjs.org/docs/app/building-your-application/styling/tailwind-css)