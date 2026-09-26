# COMANDO - ds-component-quality-checklist.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\aiox-core\squads\design\checklists\ds-component-quality-checklist.md
**SHA:** 355a21795d112853
**Timestamp:** 2026-08-28T13:24:55.242870
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- **Quality Gate:** [ ] PASS [ ] FAIL

### Ouro Bruto (primeiros 5000 chars)
```
# Component Quality Checklist

**Purpose:** Validate component before marking complete
**Agent:** Atlas (Design System Builder)
**Standard:** Production-ready React/TypeScript components

---

## CODE QUALITY

- [ ] TypeScript compiles with zero errors
- [ ] No `any` types used
- [ ] Props fully typed with interface
- [ ] All props documented with TSDoc comments
- [ ] Component exported correctly

---

## STYLING

- [ ] All styling uses tokens (zero hardcoded values)
- [ ] CSS Modules or chosen approach used consistently
- [ ] No inline styles
- [ ] Responsive design implemented (if needed)
- [ ] All variants styled correctly

---

## ACCESSIBILITY (WCAG AA MINIMUM)

- [ ] Semantic HTML elements used
- [ ] ARIA attributes present where needed
- [ ] Color contrast ≥4.5:1 for text
- [ ] Keyboard navigation works (Tab, Enter, Space)
- [ ] Focus indicators visible
- [ ] Disabled state handled correctly
- [ ] Screen reader tested (or documented)

---

## TESTING

- [ ] Unit tests written
- [ ] All variants tested
- [ ] All sizes tested
- [ ] Disabled state tested
- [ ] Event handlers tested
- [ ] Test coverage >80%
- [ ] All tests pass

---

## DOCUMENTATION

- [ ] Component.md created
- [ ] Props documented with examples
- [ ] Variants explained
- [ ] Usage examples provided
- [ ] Accessibility notes included

---

## STORYBOOK (if enabled)

- [ ] Stories file created
- [ ] Story for each variant
- [ ] Interactive controls work
- [ ] Stories display correctly

---

**Reviewer:** ________ **Date:** ________
**Quality Gate:** [ ] PASS [ ] FAIL

---

## Scoring

| Category | Items | Weight |
|----------|-------|--------|
| Code Quality | 5 | 20% |
| Styling | 5 | 15% |
| Accessibility | 7 | 25% |
| Testing | 7 | 25% |
| Documentation | 5 | 10% |
| Storybook | 4 | 5% |

**Minimum passing score:** 85%
**Blocking items (MUST pass regardless of overall score):**
- TypeScript compiles with zero errors
- Color contrast >=4.5:1 for text
- Keyboard navigation works (Tab, Enter, Space)
- All tests pass

### Remediation Guide

| Failed Item | Fix |
|-------------|-----|
| `any` types used | Replace with proper interfaces; use `unknown` + type guards when type is genuinely unknown |
| Hardcoded style values | Extract to design tokens in `tokens/` and reference via CSS variables or Tailwind config |
| Color contrast below 4.5:1 | Use WebAIM contrast checker; increase foreground darkness or background lightness until ratio met |
| Test coverage below 80% | Add tests for uncovered variants, edge cases, and error states; run `npx jest --coverage` to verify |
| Missing component documentation | Create `Component.md` with props table, usage examples, and accessibility notes using the doc template |

```