# DECISAO - add-glossary-dontdo.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\aiox-core\squads\design\scripts\add-glossary-dontdo.js
**SHA:** c3a43472fc16fd6e
**Timestamp:** 2026-08-28T13:25:00.982760
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- * Run: node squads/design/scripts/add-glossary-dontdo.js [--dry-run]
- const DRY_RUN = process.argv.includes('--dry-run');

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node
/**
 * Batch script: Add Glossary + Don't Do sections to design squad tasks
 * Run: node squads/design/scripts/add-glossary-dontdo.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const TASKS_DIR = path.join(__dirname, '..', 'tasks');
const DRY_RUN = process.argv.includes('--dry-run');

// Tasks that already have don't-do or glossary sections (skip)
const SKIP_FILES = new Set([
  'focus-order-audit.md',  // already has anti_patterns
  'a11y-doc.md',           // already has don't patterns
]);

// Domain group detection by prefix/keyword
function detectGroup(filename) {
  if (filename.startsWith('ds-')) return 'design-system';
  if (filename.startsWith('token-') || filename === 'export-design-tokens-dtcg.md' || filename === 'css-tokens.md') return 'tokens';
  if (filename.startsWith('a11y-') || filename.startsWith('aria-') || filename === 'contrast-matrix.md' || filename === 'inclusive-audit.md' || filename === 'build-inclusive.md' || filename === 'focus-order-audit.md') return 'accessibility';
  if (filename.startsWith('pattern-') || filename === 'interface-inventory.md' || filename === 'object-audit.md' || filename === 'object-map.md' || filename === 'ux-objects.md') return 'patterns';
  if (filename.startsWith('atomic-') || filename === 'element-collage.md') return 'atomic';
  if (filename.startsWith('layout-') || filename === 'responsive-strategy.md' || filename === 'navigation-analysis.md') return 'layout';
  if (filename === 'audit-tailwind-config.md' || filename === 'tailwind-upgrade.md' || filename === 'css-audit.md' || filename === 'cube-css.md' || filename === 'utility-system.md') return 'css';
  if (filename === 'bootstrap-shadcn-library.md' || filename === 'build-component.md' || filename === 'component-spec.md') return 'components';
  if (filename === 'design-language.md' || filename === 'design-principles.md' || filename === 'shared-vocabulary.md' || filename === 'naming-convention.md') return 'language';
  if (filename === 'governance-model.md' || filename === 'contribution-model.md' || filename === 'versioning-strategy.md' || filename === 'team-model.md' || filename === 'team-workshop.md') return 'governance';
  if (filename === 'testing-strategy.md' || filename === 'validate-design-fidelity.md' || filename === 'execute-checklist.md') return 'testing';
  return 'general';
}

// Domain-specific glossary key terms (inline, referencing shared glossary)
const GROUP_GLOSSARY = {
  'design-system': [
    '**Design tokens** — Platform-agnostic key-value pairs encoding design decisions (colors, spacing, typography)',
    '**Pattern consolidation** — Merging similar UI patterns to reduce redundancy',
    '**Greenfield** — Starting from scratch; **Brownfield** — Integrating into existing codebase',
    '**State file (.state.yaml)** — Progress tracking file for audit/extraction state',
    '**Component API** — Props interface defining how a component is consumed',
  ],
  'tokens': [
    '**Global (primitive) tokens** — Raw values with no semantic meaning (e.g., `color.blue.500`)',
    '**Alias (semantic) tokens** — Purpose-driven tokens referencing globals (e.g., `color.action.primary`)',
    '**Component tokens** — Tokens scoped to a specific component',
    '**CTI** — Category-Type-Item naming taxonomy for tokens',
    '**DTCG** — Design Tokens Community Group W3C specification',
    '**Semantic naming** — Naming by purpose (primary) not description (blue-500)',
  ],
  'accessibility': [
    '**WCAG 2.2** — Web Content Accessibility Guidelines (Levels A, AA, AAA)',
    '**ARIA** — Accessible Rich Internet Applications attributes for assistive technology',
    '**Accessible name** — The label assistive tech announces (via aria-label, content, etc.)',
    '**Focus trap** — UI region where keyboard focus is confined (intentional in modals, accidental is a bug)',
    '**Contrast ratio** — Foreground/background color difference measure (4.5:1 for AA text)',
    '**Landmark** — ARIA role or HTML5 element (`<nav>`, `<main>`) for screen reader navigation',
  ],
  'patterns': [
    '**Pattern library** — Organized collection of reusable UI patterns with documentation',
    '**Interface inventory** — Cataloging every unique UI element to identify inconsistencies',
    '**Pattern consolidation** — Merging similar patterns to establish canonical versions',
    '**Design language** — Shared visual rules and vocabulary defining product identity',
    '**Shared vocabulary** — Team-aligned naming ensuring designers and developers use the same terms',
  ],
  'atomic': [
    '**Atoms** — Smallest UI building blocks (button, icon, label, input)',
    '**Molecules** — Functional units composed of atoms (search bar = input + button)',
    '**Organisms** — Complex components composed of molecules (header, sidebar)',
    '**Templates** — Page-level layouts of organisms without real data',
    '**Barrel export** — `index.ts` re-exporting modules for cleaner import paths',
  ],

```