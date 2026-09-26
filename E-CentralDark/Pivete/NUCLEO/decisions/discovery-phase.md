# DECISAO - discovery-phase.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\figma\skills\figma-generate-library\references\discovery-phase.md
**SHA:** fb60b63283f9cc99
**Timestamp:** 2026-08-26T18:31:10.887306
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- **Pattern:** `/--[\w-]+:\s*[^;]+/g`
- **Pattern:** `*.tokens.json` or `tokens/*.json`. Find source files, not generated outputs from Style Dictionary or Tokens Studio.

### Ouro Bruto (primeiros 5000 chars)
```
> Part of the [figma-generate-library skill](../SKILL.md).

# Discovery Phase Reference

This document covers everything needed for Phase 0 of a design system build: analyzing the codebase for tokens, inspecting the Figma file for existing conventions, searching subscribed libraries, building the plan, and resolving conflicts before any write operations begin.

---

## 1. Codebase Analysis — Finding Token Sources

### Search Priority Order

Look for token sources in this order. Stop as soon as you find a definitive source; multiple formats can coexist:

1. Design token files: `*.tokens.json`, `tokens/*.json`, `src/tokens/**`
2. CSS variable files: `variables.css`, `tokens.css`, `theme.css`, `global.css`
3. Tailwind config: `tailwind.config.js`, `tailwind.config.ts`
4. CSS-in-JS theme objects: `theme.ts`, `createTheme`, `ThemeProvider`
5. Platform-specific: iOS Asset catalogs (`.xcassets`), Android `themes.xml`, `colors.xml`

### CSS Custom Properties (Most Common for Web)

**What to search for:**

```
:root { ... }
@theme { ... }          ← Tailwind v4
--color-*, --spacing-*, --radius-*, --shadow-*, --font-*
```

**Pattern:** `/--[\w-]+:\s*[^;]+/g`

**Common file locations:** `src/styles/tokens.css`, `src/styles/variables.css`, `src/theme/*.css`

**Extraction and naming translation:**

| CSS Property | Figma Variable Name | Figma Type | WEB Code Syntax |
|---|---|---|---|
| `--color-bg-primary: #fff` | `color/bg/primary` | COLOR | `var(--color-bg-primary)` |
| `--color-text-secondary: #757575` | `color/text/secondary` | COLOR | `var(--color-text-secondary)` |
| `--spacing-sm: 8px` | `spacing/sm` | FLOAT | `var(--spacing-sm)` |
| `--radius-md: 8px` | `radius/md` | FLOAT | `var(--radius-md)` |
| `--font-body: "Inter"` | `typography/body/font-family` | STRING | `var(--font-body)` |

**Naming rule:** Replace hyphens with slashes at category boundaries. Keep hyphens within the final path segment: `--color-bg-primary` → `color/bg/primary`, but `--color-bg-primary-hover` → `color/bg/primary-hover`.

**Always store the original CSS variable name** as the code syntax value — never derive it from the Figma variable name. If the codebase uses `--sds-color-background-brand-default`, use exactly that string in `setVariableCodeSyntax('WEB', '--sds-color-background-brand-default')`.

### Tailwind Configuration

**What to look for in `tailwind.config.js` or `tailwind.config.ts`:**

```javascript
// theme.extend.colors → Figma color variables
{ primary: { DEFAULT: '#3366FF', light: '#6699FF', dark: '#0033CC' } }
// → color/primary/default, color/primary/light, color/primary/dark

// theme.extend.spacing → Figma FLOAT variables
{ 'xs': '4px', 'sm': '8px', 'md': '16px' }
// → spacing/xs = 4, spacing/sm = 8, spacing/md = 16

// theme.extend.borderRadius → Figma FLOAT variables
{ 'sm': '4px', 'md': '8px', 'lg': '16px' }
// → radius/sm = 4, radius/md = 8, radius/lg = 16
```

Tailwind utility class names (`bg-blue-500`, `p-4`) are not tokens — extract values from the config object, not the class names.

### Design Token Community Group (DTCG) Format

**Pattern:** `*.tokens.json` or `tokens/*.json`. Find source files, not generated outputs from Style Dictionary or Tokens Studio.

```json
{
  "color": {
    "bg": {
      "primary": { "$type": "color", "$value": "#ffffff" },
      "secondary": { "$type": "color", "$value": "#f5f5f5" }
    }
  },
  "spacing": {
    "sm": { "$type": "dimension", "$value": "8px" }
  }
}
```

Nested keys map to slash-separated Figma names: `color.bg.primary` → `color/bg/primary`.

### CSS-in-JS / Theme Objects

**What to search for:** `createTheme`, `ThemeProvider`, `theme = {}`, styled-components, Emotion, Stitches, vanilla-extract

```typescript
// theme.colors.bg.primary → Figma variable: color/bg/primary
// theme.spacing.sm        → Figma variable: spacing/sm
// Multiple theme objects (lightTheme, darkTheme) → modes in the same collection
```

### iOS Token Sources

```swift
// Asset catalog colors in .xcassets/Colors.xcassets
// extension Color { static let bgPrimary = Color("bg-primary") }
// Look for traitCollection.userInterfaceStyle for dark mode detection
```

### Android Token Sources

```kotlin
// res/values/colors.xml  <color name="primary">#3366FF</color>
// res/values-night/colors.xml  (dark mode overrides)
// MaterialTheme.colorScheme.primary in Compose
// val Primary = Color(0xFF3366FF)
```

### Detecting Dark Mode

| Platform | Signal |
|---|---|
| Web (CSS) | `@media (prefers-color-scheme: dark)`, `.dark { }`, `[data-theme="dark"]` |
| Web (Tailwind) | `darkMode: 'class'` or `darkMode: 'media'` in config |
| Web (JS) | Separate `darkTheme` object alongside `lightTheme` |
| iOS | `Color(uiColor:)` with `traitCollection.userInterfaceStyle`, dual-appearance asset catalog |
| Android | `themes.xml` with `Theme.*.Night`, `isSystemInDarkTheme()` in Compose, `values-night/` folder |

**Figma mapping:** If dark mode exists → minimum 2 modes (Light/Dark) in the semantic color collection. Primi
```