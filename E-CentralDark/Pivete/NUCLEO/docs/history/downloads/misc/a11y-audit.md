# OUTRO - a11y-audit.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\aiox-core\squads\design-studio\tasks\a11y-audit.md
**SHA:** 2c2160cdfade0366
**Timestamp:** 2026-08-28T13:25:09.652807
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- last_run: "2026-01-05T14:30:00Z"

### Padroes
- pattern: string;

### Ouro Bruto (primeiros 5000 chars)
```
# Task: a11y-audit

> **Command:** `*a11y-audit {path}`
> **Agent:** Brad Frost (Design System Architect)
> **Purpose:** Comprehensive WCAG 2.2 accessibility audit with automated + manual checks

---

## Overview

Full accessibility audit combining:
1. **Automated scanning** (axe-core rules via code analysis)
2. **Manual inspection patterns** (focus order, ARIA usage, semantic HTML)
3. **Contrast validation** (WCAG 2.2 + APCA)
4. **Keyboard navigation** mapping
5. **Screen reader compatibility** assessment

---

## Input

| Parameter | Required | Description |
|-----------|----------|-------------|
| `path` | Yes | Directory or file to audit (e.g., `./app/components`) |
| `--level` | No | WCAG level: `AA` (default) or `AAA` |
| `--scope` | No | Scope: `full`, `color`, `keyboard`, `aria` (default: `full`) |
| `--fix` | No | Auto-fix simple issues (missing alt, missing labels) |

---

## Execution Steps

### Phase 1: Discovery (Automated)

```bash
# 1. Find all component files
glob("**/*.tsx", "**/*.jsx", "**/*.vue", "**/*.html")

# 2. Count interactive elements
grep: "onClick|onKeyDown|href|<button|<a |<input|<select|<textarea"

# 3. Find existing ARIA usage
grep: "aria-|role=|tabIndex"

# 4. Find images without alt
grep: "<img(?![^>]*alt=)"
```

### Phase 2: Contrast Analysis

For each color pair found in the codebase:

```typescript
interface ContrastResult {
  foreground: string;
  background: string;
  ratio: number;
  wcagAA_normal: boolean;   // ≥4.5:1
  wcagAA_large: boolean;    // ≥3:1
  wcagAAA_normal: boolean;  // ≥7:1
  wcagAAA_large: boolean;   // ≥4.5:1
  apca_Lc: number;          // APCA Lightness contrast
  usage: string[];          // Where used
}
```

**WCAG 2.2 Contrast Requirements:**
| Element Type | AA Minimum | AAA Target |
|--------------|------------|------------|
| Normal text (<18px) | 4.5:1 | 7:1 |
| Large text (≥18px or bold ≥14px) | 3:1 | 4.5:1 |
| UI components | 3:1 | 3:1 |
| Graphical objects | 3:1 | 3:1 |
| Focus indicators | 3:1 | 3:1 |

### Phase 3: Keyboard Audit

Check each interactive element:

```typescript
interface KeyboardAuditItem {
  element: string;
  file: string;
  line: number;
  issues: {
    notFocusable: boolean;      // Missing tabIndex or not native interactive
    noKeyHandler: boolean;       // onClick without onKeyDown
    focusNotVisible: boolean;    // outline: none without replacement
    trapDetected: boolean;       // Focus can't escape
  };
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
}
```

**Critical Patterns to Detect:**
1. `<div onClick>` without `role="button"` and `tabIndex={0}`
2. `outline: none` or `outline: 0` without `:focus-visible` replacement
3. Custom dropdowns without arrow key support
4. Modals without focus trap + Escape close
5. Tab order jumping (positive tabIndex values)

### Phase 4: ARIA Validation

```typescript
interface AriaAuditItem {
  element: string;
  file: string;
  line: number;
  issue: AriaIssueType;
  suggestion: string;
}

type AriaIssueType =
  | 'invalid-role'           // Role doesn't exist
  | 'missing-required-prop'  // role="slider" without aria-valuenow
  | 'redundant-role'         // <button role="button">
  | 'orphan-aria-label'      // aria-labelledby points to non-existent id
  | 'missing-live-region'    // Dynamic content without aria-live
  | 'wrong-aria-usage';      // aria-expanded on non-expandable element
```

**Common ARIA Errors:**
| Pattern | Issue | Fix |
|---------|-------|-----|
| `<span role="button">` | Missing keyboard support | Add `tabIndex={0}` + `onKeyDown` |
| `<input aria-label="x" aria-labelledby="y">` | Conflicting labels | Use one or the other |
| `<div aria-hidden="true">` with focusable children | Hidden but focusable | Remove focusable or aria-hidden |
| Dynamic content update | No announcement | Add `aria-live="polite"` |

### Phase 5: Semantic HTML Check

```typescript
interface SemanticIssue {
  pattern: string;
  occurrences: number;
  severity: 'critical' | 'serious' | 'moderate';
  recommendation: string;
}
```

**Anti-Patterns:**
| Anti-Pattern | Better Alternative |
|--------------|-------------------|
| `<div onClick>` | `<button>` |
| `<span>` for links | `<a href>` |
| `<b>` for emphasis | `<strong>` |
| Multiple `<h1>` | Single `<h1>`, then `<h2>`, etc. |
| `<table>` for layout | CSS Grid/Flexbox |
| Missing `<main>` | Wrap main content |
| Missing `<nav>` | Wrap navigation |

---

## Output

### 1. Summary Report

```markdown
# Accessibility Audit Report

**Path:** ./app/components
**Date:** 2026-01-05
**Level:** WCAG 2.2 AA

## Summary

| Category | Issues | Critical | Serious | Moderate | Minor |
|----------|--------|----------|---------|----------|-------|
| Contrast | 12 | 3 | 5 | 4 | 0 |
| Keyboard | 8 | 2 | 4 | 2 | 0 |
| ARIA | 15 | 1 | 6 | 5 | 3 |
| Semantic | 6 | 0 | 3 | 2 | 1 |
| **Total** | **41** | **6** | **18** | **13** | **4** |

## Compliance Score

**Current:** 72% (AA)
**Target:** 100% (AA)

## Critical Issues (Must Fix)

1. **[CON
```

---

# OUTRO - a11y-audit.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\aiox-core\squads\design\tasks\a11y-audit.md
**SHA:** 509fd7758f345347
**Timestamp:** 2026-08-28T13:25:09.941665
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- last_run: "2026-01-05T14:30:00Z"

### Padroes
- pattern: string;

### Ouro Bruto (primeiros 5000 chars)
```
# Task: a11y-audit

> **Command:** `*a11y-audit {path}`
> **Agent:** Brad Frost (Design System Architect)
> **Purpose:** Comprehensive WCAG 2.2 accessibility audit with automated + manual checks

---

## Overview

Full accessibility audit combining:
1. **Automated scanning** (axe-core rules via code analysis)
2. **Manual inspection patterns** (focus order, ARIA usage, semantic HTML)
3. **Contrast validation** (WCAG 2.2 + APCA)
4. **Keyboard navigation** mapping
5. **Screen reader compatibility** assessment

---

## Input

| Parameter | Required | Description |
|-----------|----------|-------------|
| `path` | Yes | Directory or file to audit (e.g., `./app/components`) |
| `--level` | No | WCAG level: `AA` (default) or `AAA` |
| `--scope` | No | Scope: `full`, `color`, `keyboard`, `aria` (default: `full`) |
| `--fix` | No | Auto-fix simple issues (missing alt, missing labels) |

---

## Execution Steps

### Phase 1: Discovery (Automated)

```bash
# 1. Find all component files
glob("**/*.tsx", "**/*.jsx", "**/*.vue", "**/*.html")

# 2. Count interactive elements
grep: "onClick|onKeyDown|href|<button|<a |<input|<select|<textarea"

# 3. Find existing ARIA usage
grep: "aria-|role=|tabIndex"

# 4. Find images without alt
grep: "<img(?![^>]*alt=)"
```

### Phase 2: Contrast Analysis

For each color pair found in the codebase:

```typescript
interface ContrastResult {
  foreground: string;
  background: string;
  ratio: number;
  wcagAA_normal: boolean;   // ≥4.5:1
  wcagAA_large: boolean;    // ≥3:1
  wcagAAA_normal: boolean;  // ≥7:1
  wcagAAA_large: boolean;   // ≥4.5:1
  apca_Lc: number;          // APCA Lightness contrast
  usage: string[];          // Where used
}
```

**WCAG 2.2 Contrast Requirements:**
| Element Type | AA Minimum | AAA Target |
|--------------|------------|------------|
| Normal text (<18px) | 4.5:1 | 7:1 |
| Large text (≥18px or bold ≥14px) | 3:1 | 4.5:1 |
| UI components | 3:1 | 3:1 |
| Graphical objects | 3:1 | 3:1 |
| Focus indicators | 3:1 | 3:1 |

### Phase 3: Keyboard Audit

Check each interactive element:

```typescript
interface KeyboardAuditItem {
  element: string;
  file: string;
  line: number;
  issues: {
    notFocusable: boolean;      // Missing tabIndex or not native interactive
    noKeyHandler: boolean;       // onClick without onKeyDown
    focusNotVisible: boolean;    // outline: none without replacement
    trapDetected: boolean;       // Focus can't escape
  };
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
}
```

**Critical Patterns to Detect:**
1. `<div onClick>` without `role="button"` and `tabIndex={0}`
2. `outline: none` or `outline: 0` without `:focus-visible` replacement
3. Custom dropdowns without arrow key support
4. Modals without focus trap + Escape close
5. Tab order jumping (positive tabIndex values)

### Phase 4: ARIA Validation

```typescript
interface AriaAuditItem {
  element: string;
  file: string;
  line: number;
  issue: AriaIssueType;
  suggestion: string;
}

type AriaIssueType =
  | 'invalid-role'           // Role doesn't exist
  | 'missing-required-prop'  // role="slider" without aria-valuenow
  | 'redundant-role'         // <button role="button">
  | 'orphan-aria-label'      // aria-labelledby points to non-existent id
  | 'missing-live-region'    // Dynamic content without aria-live
  | 'wrong-aria-usage';      // aria-expanded on non-expandable element
```

**Common ARIA Errors:**
| Pattern | Issue | Fix |
|---------|-------|-----|
| `<span role="button">` | Missing keyboard support | Add `tabIndex={0}` + `onKeyDown` |
| `<input aria-label="x" aria-labelledby="y">` | Conflicting labels | Use one or the other |
| `<div aria-hidden="true">` with focusable children | Hidden but focusable | Remove focusable or aria-hidden |
| Dynamic content update | No announcement | Add `aria-live="polite"` |

### Phase 5: Semantic HTML Check

```typescript
interface SemanticIssue {
  pattern: string;
  occurrences: number;
  severity: 'critical' | 'serious' | 'moderate';
  recommendation: string;
}
```

**Anti-Patterns:**
| Anti-Pattern | Better Alternative |
|--------------|-------------------|
| `<div onClick>` | `<button>` |
| `<span>` for links | `<a href>` |
| `<b>` for emphasis | `<strong>` |
| Multiple `<h1>` | Single `<h1>`, then `<h2>`, etc. |
| `<table>` for layout | CSS Grid/Flexbox |
| Missing `<main>` | Wrap main content |
| Missing `<nav>` | Wrap navigation |

---

## Output

### 1. Summary Report

```markdown
# Accessibility Audit Report

**Path:** ./app/components
**Date:** 2026-01-05
**Level:** WCAG 2.2 AA

## Summary

| Category | Issues | Critical | Serious | Moderate | Minor |
|----------|--------|----------|---------|----------|-------|
| Contrast | 12 | 3 | 5 | 4 | 0 |
| Keyboard | 8 | 2 | 4 | 2 | 0 |
| ARIA | 15 | 1 | 6 | 5 | 3 |
| Semantic | 6 | 0 | 3 | 2 | 1 |
| **Total** | **41** | **6** | **18** | **13** | **4** |

## Compliance Score

**Current:** 72% (AA)
**Target:** 100% (AA)

## Critical Issues (Must Fix)

1. **[CON
```