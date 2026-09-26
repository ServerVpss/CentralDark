# OUTRO - focus-order-audit.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\aiox-core\squads\design-studio\tasks\focus-order-audit.md
**SHA:** 62c4c7c626587b9a
**Timestamp:** 2026-08-28T13:25:12.816079
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- last_run: "2026-01-05T14:30:00Z"

### Ouro Bruto (primeiros 5000 chars)
```
# Task: focus-order-audit

> **Command:** `*focus-order {path}`
> **Agent:** Brad Frost (Design System Architect)
> **Purpose:** Validate keyboard navigation, tab order, and focus management

---

## Overview

Comprehensive keyboard accessibility audit covering:
1. **Tab order validation** - logical focus sequence
2. **Focus indicators** - visible, sufficient contrast
3. **Keyboard traps** - elements that capture focus
4. **Interactive elements** - all clickable = keyboard accessible
5. **Focus management** - modals, dialogs, dynamic content

---

## Input

| Parameter | Required | Description |
|-----------|----------|-------------|
| `path` | Yes | Directory to audit (e.g., `./app/components`) |
| `--component` | No | Audit single component |
| `--generate-map` | No | Generate visual focus order diagram |
| `--fix` | No | Auto-fix simple issues |

---

## Execution Steps

### Phase 1: Interactive Element Discovery

Find all elements that should be keyboard accessible:

```typescript
interface InteractiveElement {
  type: 'native' | 'custom';
  element: string;            // button, a, div, span, etc.
  file: string;
  line: number;
  hasTabIndex: boolean;
  tabIndexValue: number | null;
  hasClickHandler: boolean;
  hasKeyHandler: boolean;
  role: string | null;
  issues: FocusIssue[];
}

// Elements to scan for
const nativeInteractive = [
  'button', 'a[href]', 'input', 'select', 'textarea',
  '[contenteditable]', 'details', 'summary'
];

const customInteractive = [
  // Elements with click handlers
  'onClick=', '@click=', '(click)=',
  // Elements with interactive roles
  'role="button"', 'role="link"', 'role="tab"',
  'role="menuitem"', 'role="option"', 'role="checkbox"',
  'role="radio"', 'role="switch"', 'role="slider"'
];
```

### Phase 2: Tab Order Analysis

```typescript
interface TabOrderResult {
  element: string;
  file: string;
  line: number;
  tabIndex: number;
  order: number;         // Computed tab order position
  issues: TabOrderIssue[];
}

type TabOrderIssue =
  | 'positive-tabindex'     // tabIndex > 0 (anti-pattern)
  | 'negative-tabindex'     // tabIndex < 0 on interactive
  | 'out-of-order'          // Visual vs DOM order mismatch
  | 'skip-heading'          // Skips heading levels
  | 'focus-trap-detected';  // Can't tab out
```

**Tab Order Rules:**
1. `tabIndex="0"` - Natural order (preferred)
2. `tabIndex="-1"` - Programmatically focusable only
3. `tabIndex="1+"` - ANTI-PATTERN (forces order, breaks predictability)

### Phase 3: Focus Indicator Validation

```typescript
interface FocusIndicator {
  element: string;
  file: string;
  line: number;
  hasVisibleFocus: boolean;
  focusStyle: {
    outline: string | null;
    boxShadow: string | null;
    ring: string | null;      // Tailwind ring-*
    custom: boolean;
  };
  contrastRatio: number;      // Focus vs background
  issues: FocusIndicatorIssue[];
}

type FocusIndicatorIssue =
  | 'outline-none-no-replacement'  // outline:none without alternative
  | 'insufficient-contrast'        // Focus indicator < 3:1
  | 'too-subtle'                   // Very thin/light focus
  | 'focus-visible-missing';       // No :focus-visible support
```

**WCAG 2.2 Focus Requirements:**
- **2.4.7 Focus Visible (AA):** Focus indicator must be visible
- **2.4.11 Focus Not Obscured (AA):** Focus not fully hidden by other content
- **2.4.12 Focus Not Obscured Enhanced (AAA):** Focus not partially hidden
- **2.4.13 Focus Appearance (AAA):** Minimum 2px perimeter, 3:1 contrast

### Phase 4: Keyboard Handler Validation

```typescript
interface KeyboardHandler {
  element: string;
  file: string;
  line: number;
  handlers: {
    onClick: boolean;
    onKeyDown: boolean;
    onKeyUp: boolean;
    onKeyPress: boolean;  // Deprecated
  };
  expectedKeys: string[];  // Enter, Space, Arrow*, Escape
  issues: KeyboardIssue[];
}

type KeyboardIssue =
  | 'click-only'              // onClick without keyboard handler
  | 'missing-enter-space'     // Button without Enter/Space
  | 'missing-escape'          // Modal/dialog without Escape
  | 'missing-arrows'          // Menu/tabs without arrow keys
  | 'using-deprecated';       // onKeyPress instead of onKeyDown
```

**Expected Keyboard Patterns:**

| Element/Role | Required Keys |
|--------------|---------------|
| Button | Enter, Space |
| Link | Enter |
| Menu item | Enter, Arrow Up/Down |
| Tab | Enter, Arrow Left/Right |
| Modal/Dialog | Escape (close) |
| Dropdown | Escape, Arrow Up/Down |
| Slider | Arrow Left/Right |
| Checkbox | Space |
| Radio | Space, Arrow Up/Down |

### Phase 5: Focus Trap Detection

```typescript
interface FocusTrap {
  element: string;
  file: string;
  line: number;
  trapType: 'intentional' | 'unintentional';
  hasEscapeRoute: boolean;
  issues: FocusTrapIssue[];
}

// Intentional traps (OK if implemented correctly)
const intentionalTraps = [
  'role="dialog"',
  'role="alertdialog"',
  'aria-modal="true"'
];

// Patterns that often cause unintentional traps
const trapPatterns
```