# OUTRO - aria-audit.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\aiox-core\squads\design-studio\tasks\aria-audit.md
**SHA:** 48b68bf16394e89f
**Timestamp:** 2026-08-28T13:25:11.459159
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- last_run: "2026-01-05T14:30:00Z"

### Padroes
- pattern: string;
- { pattern: '<button role="button">', fix: '<button>' },
- { pattern: '<a href role="link">', fix: '<a href>' },
- { pattern: '<nav role="navigation">', fix: '<nav>' },
- { pattern: '<main role="main">', fix: '<main>' },
- { pattern: '<header role="banner">', fix: '<header>' },
- { pattern: '<footer role="contentinfo">', fix: '<footer>' },
- { pattern: '<aside role="complementary">', fix: '<aside>' },
- { pattern: '<article role="article">', fix: '<article>' },
- { pattern: '<input type="checkbox" role="checkbox">', fix: '<input type="checkbox">' },

### Ouro Bruto (primeiros 5000 chars)
```
# Task: aria-audit

> **Command:** `*aria-audit {path}`
> **Agent:** Brad Frost (Design System Architect)
> **Purpose:** Validate ARIA usage, roles, states, and properties

---

## Overview

Comprehensive ARIA (Accessible Rich Internet Applications) audit covering:
1. **Valid ARIA attributes** - No invalid/deprecated attributes
2. **Required properties** - Roles have required aria-* props
3. **Correct usage patterns** - ARIA used appropriately
4. **Redundant ARIA** - Native HTML preferred
5. **Live regions** - Dynamic content announced

---

## Input

| Parameter | Required | Description |
|-----------|----------|-------------|
| `path` | Yes | Directory to audit (e.g., `./app/components`) |
| `--strict` | No | Fail on warnings too (not just errors) |
| `--fix` | No | Auto-fix simple issues |

---

## Execution Steps

### Phase 1: ARIA Attribute Discovery

```typescript
interface AriaUsage {
  attribute: string;        // aria-label, role, etc.
  value: string;
  element: string;          // HTML element
  file: string;
  line: number;
  valid: boolean;
  issues: AriaIssue[];
}

// All ARIA attributes to scan
const ariaAttributes = [
  // Roles
  'role',
  // States & Properties
  'aria-activedescendant', 'aria-atomic', 'aria-autocomplete',
  'aria-braillelabel', 'aria-brailleroledescription', 'aria-busy',
  'aria-checked', 'aria-colcount', 'aria-colindex', 'aria-colspan',
  'aria-controls', 'aria-current', 'aria-describedby', 'aria-description',
  'aria-details', 'aria-disabled', 'aria-dropeffect', 'aria-errormessage',
  'aria-expanded', 'aria-flowto', 'aria-grabbed', 'aria-haspopup',
  'aria-hidden', 'aria-invalid', 'aria-keyshortcuts', 'aria-label',
  'aria-labelledby', 'aria-level', 'aria-live', 'aria-modal',
  'aria-multiline', 'aria-multiselectable', 'aria-orientation',
  'aria-owns', 'aria-placeholder', 'aria-posinset', 'aria-pressed',
  'aria-readonly', 'aria-relevant', 'aria-required', 'aria-roledescription',
  'aria-rowcount', 'aria-rowindex', 'aria-rowspan', 'aria-selected',
  'aria-setsize', 'aria-sort', 'aria-valuemax', 'aria-valuemin',
  'aria-valuenow', 'aria-valuetext'
];
```

### Phase 2: Role Validation

```typescript
interface RoleAudit {
  role: string;
  element: string;
  file: string;
  line: number;
  checks: {
    validRole: boolean;           // Role exists in ARIA spec
    appropriateElement: boolean;  // Role appropriate for element
    hasRequiredProps: boolean;    // Required aria-* present
    hasAllowedProps: boolean;     // No disallowed aria-*
    redundant: boolean;           // Native HTML would suffice
  };
  requiredProps: string[];        // What's required
  missingProps: string[];         // What's missing
}

// Required properties by role
const roleRequirements: Record<string, string[]> = {
  'checkbox': ['aria-checked'],
  'combobox': ['aria-expanded', 'aria-controls'],
  'heading': ['aria-level'],
  'meter': ['aria-valuenow'],
  'option': [], // aria-selected recommended
  'radio': ['aria-checked'],
  'scrollbar': ['aria-controls', 'aria-valuenow'],
  'separator': [], // if focusable: aria-valuenow
  'slider': ['aria-valuenow'],
  'spinbutton': ['aria-valuenow'],
  'switch': ['aria-checked'],
  'tab': [], // aria-selected recommended
  'tabpanel': [], // aria-labelledby recommended
  'treeitem': [], // aria-expanded if has children
};
```

### Phase 3: Common ARIA Errors Detection

```typescript
type AriaIssue =
  // Invalid usage
  | 'invalid-role'              // Role doesn't exist
  | 'invalid-attribute'         // Attribute doesn't exist
  | 'invalid-value'             // Wrong value type/format

  // Missing requirements
  | 'missing-required-prop'     // Required prop not present
  | 'missing-accessible-name'   // No label, labelledby, or content

  // Incorrect usage
  | 'redundant-role'            // <button role="button">
  | 'conflicting-semantics'     // <nav role="navigation">
  | 'aria-hidden-focusable'     // aria-hidden with focusable child
  | 'aria-label-on-generic'     // aria-label on div/span without role
  | 'broken-reference'          // aria-labelledby points to missing id

  // Bad patterns
  | 'aria-live-wrong-value'     // aria-live="true" instead of "polite"
  | 'role-presentation-focusable' // role="presentation" on focusable
  | 'nested-interactive'        // Interactive inside interactive
  | 'abstract-role';            // Using abstract role (widget, landmark)
```

### Phase 4: Pattern-Specific Audits

#### Modals/Dialogs
```typescript
interface ModalAriaAudit {
  component: string;
  checks: {
    hasRoleDialog: boolean;       // role="dialog" or "alertdialog"
    hasAriaModal: boolean;        // aria-modal="true"
    hasLabel: boolean;            // aria-label or aria-labelledby
    inertBackground: boolean;     // Background has aria-hidden or inert
  };
}
```

#### Tabs
```typescript
interface TabsAriaAudit {
  component: string;
  checks: {
    tablistHasRole: boolean;      // role="tablist"
    tabsHaveRole: boolean;        // 
```