# COMANDO - a11y-audit-doc.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\aiox-core\squads\design\tasks\a11y-audit-doc.md
**SHA:** 582c05af8da4c781
**Timestamp:** 2026-08-28T13:25:01.483617
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- 1. Rank documentation gaps by risk: components with the highest usage and least documentation are highest priority

### Ouro Bruto (primeiros 5000 chars)
```
# Task: Accessibility Documentation Audit

**Task ID:** a11y-audit-doc
**Version:** 1.0
**Purpose:** Audit existing accessibility documentation for completeness, accuracy, WCAG conformance, and developer-friendliness
**Agent:** @stephanie-walter
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

Evaluates the quality and completeness of existing accessibility documentation across a design system or product. Checks whether docs accurately reflect WCAG requirements, provide actionable guidance for developers, cover all component states, and remain current with implementation. Documentation that is incomplete, outdated, or unclear is as harmful as missing documentation because it creates a false sense of compliance.

```
INPUT (existing a11y docs, component inventory, WCAG target)
    |
[PHASE 1: COVERAGE ANALYSIS]
    -> Assess which components and criteria are documented vs missing
    |
[PHASE 2: QUALITY EVALUATION]
    -> Evaluate accuracy, clarity, and developer-friendliness of existing docs
    |
[PHASE 3: GAP REMEDIATION PLAN]
    -> Prioritize gaps and create a documentation improvement roadmap
    |
OUTPUT: Audit report with coverage metrics, quality scores, and remediation roadmap
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| a11y_documentation | file | Yes | Existing accessibility documentation to audit (docs site, markdown files, wiki) |
| component_inventory | file | Yes | Complete list of components in the design system |
| wcag_target | enum(A, AA, AAA) | Yes | Target WCAG conformance level to audit against |
| implementation_source | string | No | Link to component code repository for cross-referencing docs against implementation |
| last_audit_date | string | No | Date of previous accessibility documentation audit for tracking improvements |

---

## Preconditions

- Accessibility documentation exists for at least some components (there must be something to audit)
- A complete component inventory is available to measure documentation coverage
- The target WCAG version and level are agreed upon (e.g., WCAG 2.1 AA)
- The auditor has access to both documentation and component implementations for cross-referencing

---

## Steps

### Phase 1: Coverage Analysis
1. List every component in the design system inventory
2. For each component, check if accessibility documentation exists: fully documented, partially documented, or undocumented
3. For documented components, check coverage of four documentation areas:
   - **Design annotations**: focus order, heading structure, alt text requirements, color independence
   - **Usage guidelines**: accessible usage patterns, do/don't examples, content guidelines
   - **Code requirements**: ARIA roles, keyboard interactions, focus management, live regions
   - **Testing procedures**: manual test steps, automated test configuration, expected results
4. Calculate overall coverage: percentage of components with complete documentation, partial documentation, no documentation
5. Cross-reference with WCAG success criteria: for each applicable criterion, check if documentation addresses it:
   - 1.1.1 Non-text Content: are alt text guidelines documented?
   - 1.3.1 Info and Relationships: are semantic structure requirements documented?
   - 2.1.1 Keyboard: are keyboard interactions documented?
   - 2.4.7 Focus Visible: are focus indicator requirements documented?
   - 4.1.2 Name, Role, Value: are ARIA requirements documented?
6. Identify documentation deserts: component categories with the lowest coverage (e.g., all form components lack testing procedures)

### Phase 2: Quality Evaluation
1. Evaluate **accuracy** for each documented component:
   - Do ARIA roles match WAI-ARIA Authoring Practices recommendations?
   - Do keyboard interactions match the expected widget pattern?
   - Do contrast requirements cite the correct WCAG thresholds (4.5:1 for normal text, 3:1 for large text)?
   - Is the documentation current with the actual implementation (or has the component changed since docs were written)?
2. Evaluate **completeness** per component:
   - Are all interactive states covered (default, hover, focus, active, disabled, error, loading)?
   - Are all variants documented (different sizes, colors, or configurations may have different accessibility needs)?
   - Are edge cases addressed (empty state, overflow, truncation, dynamic content)?
3. Evaluate **clarity and developer-friendliness**:
   - Are code examples provided (not just abstract descriptions)?
   - Are ARIA attributes shown in context (full HTML snippet, not just attribute name)?
   - Is keyboard interaction documented as a table (key -> action -> focus result)?
   - Can a developer who is not an accessibility expert follow the documentation?
4. Evaluate **testability**:
   - Are testing steps specific enough to reproduce (not "test with a screen reader" but "navigate to component using Tab, pres
```