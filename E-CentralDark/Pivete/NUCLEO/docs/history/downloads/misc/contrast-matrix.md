# OUTRO - contrast-matrix.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\aiox-core\squads\design-studio\tasks\contrast-matrix.md
**SHA:** 9756d56231f756ff
**Timestamp:** 2026-08-28T13:25:11.109832
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- last_run: "2026-01-05T14:30:00Z"

### Ouro Bruto (primeiros 5000 chars)
```
# Task: contrast-matrix

> **Command:** `*contrast-matrix {path}`
> **Agent:** Brad Frost (Design System Architect)
> **Purpose:** Generate complete color contrast matrix with WCAG 2.2 + APCA validation

---

## Overview

Generates a comprehensive contrast matrix showing all foreground/background color combinations in the codebase with:
- WCAG 2.2 contrast ratios (AA and AAA)
- APCA (Advanced Perceptual Contrast Algorithm) Lc values
- Usage locations
- Pass/fail indicators
- Remediation suggestions

---

## Input

| Parameter | Required | Description |
|-----------|----------|-------------|
| `path` | Yes | Directory to scan (e.g., `./app/components`) |
| `--format` | No | Output: `table`, `html`, `json` (default: `table`) |
| `--include-tokens` | No | Include design token colors |
| `--theme` | No | Filter by theme: `light`, `dark`, `sepia`, `all` (default: `all`) |

---

## Execution Steps

### Phase 1: Color Extraction

Extract all colors from:

```typescript
// Sources to scan
const colorSources = [
  // CSS/SCSS
  'color:', 'background-color:', 'border-color:', 'fill:', 'stroke:',
  // Tailwind classes
  'text-', 'bg-', 'border-', 'fill-', 'stroke-',
  // CSS variables
  'var(--color-', '--color-',
  // Inline styles
  'style={{ color:', 'style={{ backgroundColor:',
  // Hex values
  '#[0-9A-Fa-f]{3,8}',
  // RGB/RGBA
  'rgb(', 'rgba(',
  // HSL/HSLA
  'hsl(', 'hsla(',
  // OKLCH
  'oklch('
];

interface ExtractedColor {
  value: string;           // Normalized hex
  original: string;        // Original format found
  source: 'css' | 'tailwind' | 'token' | 'inline';
  usage: 'foreground' | 'background' | 'border' | 'unknown';
  files: Array<{ path: string; line: number }>;
  theme?: 'light' | 'dark' | 'sepia';
}
```

### Phase 2: Contrast Calculation

For each foreground/background pair:

```typescript
interface ContrastResult {
  foreground: string;
  background: string;

  // WCAG 2.x Contrast Ratio
  wcagRatio: number;        // e.g., 4.52:1

  // WCAG 2.2 Compliance
  wcag: {
    AA_normal: boolean;     // ≥4.5:1 for <18px
    AA_large: boolean;      // ≥3:1 for ≥18px/bold
    AAA_normal: boolean;    // ≥7:1
    AAA_large: boolean;     // ≥4.5:1
    ui_components: boolean; // ≥3:1 (borders, icons)
  };

  // APCA (Lc values)
  apca: {
    Lc: number;             // Lightness contrast (-108 to +106)
    recommended_size: string; // e.g., "14px+" or "18px bold+"
    pass: boolean;
  };

  // Usage context
  usage: Array<{
    file: string;
    line: number;
    element: string;        // e.g., "Button", "p", "span"
    fontSize: string;       // If detectable
    fontWeight: string;     // If detectable
  }>;
}
```

### Phase 3: WCAG 2.2 + APCA Calculations

**WCAG 2.x Contrast Ratio Formula:**
```typescript
function getWCAGContrastRatio(fg: string, bg: string): number {
  const L1 = getRelativeLuminance(fg);
  const L2 = getRelativeLuminance(bg);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getRelativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  const [r, g, b] = rgb.map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
```

**APCA Lc Calculation:**
```typescript
// APCA W3 reference algorithm
function getAPCAContrast(textColor: string, bgColor: string): number {
  // Uses SAPC (Spatial Perception of Color) model
  // Returns Lc (Lightness contrast) value
  // Positive = light text on dark bg
  // Negative = dark text on light bg
  // |Lc| ≥ 60 is generally readable
  // |Lc| ≥ 75 is comfortable for body text
  // |Lc| ≥ 90 is excellent
}
```

**APCA Minimum Lc Values by Font Size/Weight:**

| Font Size | Weight | Min |Lc| for Body | Min |Lc| for UI |
|-----------|--------|---------------------|-------------------|
| 12px | 400 | 90 | 75 |
| 14px | 400 | 75 | 60 |
| 16px | 400 | 60 | 50 |
| 18px | 400 | 55 | 45 |
| 24px | 400 | 45 | 40 |
| 14px | 700 | 60 | 50 |
| 18px | 700 | 50 | 40 |

### Phase 4: Matrix Generation

Group by theme and generate matrix:

```typescript
interface ContrastMatrix {
  theme: 'light' | 'dark' | 'sepia';
  colors: {
    foregrounds: ExtractedColor[];
    backgrounds: ExtractedColor[];
  };
  pairs: ContrastResult[];
  summary: {
    total_pairs: number;
    wcag_aa_pass: number;
    wcag_aaa_pass: number;
    apca_pass: number;
    failures: number;
  };
}
```

---

## Output

### 1. Matrix Table (Default)

```markdown
# Color Contrast Matrix

**Theme:** Light
**Scanned:** ./app/components (487 files)
**Date:** 2026-01-05

## Summary

| Metric | Count | Percentage |
|--------|-------|------------|
| Total pairs | 156 | 100% |
| WCAG AA Pass | 142 | 91.0% |
| WCAG AAA Pass | 98 | 62.8% |
| APCA Pass | 138 | 88.5% |
| **Failures** | **14** | **9.0%** |

## Complete Matrix

| Foreground | Background | Ratio | AA | AAA | APCA Lc | Status |
|------------|------------|-------|
```