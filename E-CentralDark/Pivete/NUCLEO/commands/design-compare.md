# COMANDO - design-compare.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\aiox-core\squads\design-studio\tasks\design-compare.md
**SHA:** 373c0a309545e6b5
**Timestamp:** 2026-08-28T13:25:09.981706
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- pattern: "card-based with sidebar"

### Gaps
- gap:

### Ouro Bruto (primeiros 5000 chars)
```
# Design Compare Task

> Task ID: design-compare
> Agent: design-system
> Version: 1.0.0
> Command: `*design-compare {reference} {implementation}`

## Description

Compares a design reference (screenshot, Figma export, or image) against implemented code to measure design fidelity. Extracts design tokens from both sources and generates a detailed comparison report with actionable fixes.

**Use case:** When user sends a design mockup/screenshot and wants to validate if the implemented component matches.

## Why Not Pixel-Perfect Comparison?

| Challenge | Reality |
|-----------|---------|
| Size differences | Figma 1440px vs browser 1512px |
| Font rendering | Browser anti-aliasing differs from design tools |
| Dynamic content | Real text vs placeholder |
| Responsive behavior | Design is static, code adapts |

**Solution:** Semantic token extraction + comparison with tolerance thresholds.

---

## Input Parameters

### Reference (required)
Design source - one of:
- Image path: `./designs/dashboard.png`
- Pasted image: User pastes screenshot
- URL: `https://figma.com/file/xxx` (if accessible)

### Implementation (required)
Code source - one of:
- Component path: `./app/components/Dashboard.tsx`
- Folder path: `./app/components/dashboard/`
- URL: `http://localhost:3000/dashboard` (takes screenshot)

---

## Workflow

### Phase 1: Extract from Design Reference

When user provides an image, analyze visually to extract:

```yaml
design_tokens:
  colors:
    background:
      - value: "#1a1a2e"
        location: "main background"
      - value: "#252540"
        location: "card background"
    accent:
      - value: "#D4AF37"
        location: "buttons, highlights"
    text:
      - value: "#FFFFFF"
        location: "headings"
      - value: "#A0A0A0"
        location: "secondary text"

  spacing:
    padding:
      - value: "24px"
        location: "card internal padding"
      - value: "16px"
        location: "section gaps"
    margin:
      - value: "32px"
        location: "between major sections"
    gap:
      - value: "12px"
        location: "between list items"

  typography:
    headings:
      - size: "24px"
        weight: "bold"
        location: "main title"
    body:
      - size: "16px"
        weight: "normal"
        line_height: "1.5"
        location: "paragraph text"
    small:
      - size: "14px"
        weight: "normal"
        location: "captions, labels"

  layout:
    structure: "grid" | "flex" | "stack"
    columns: 3
    pattern: "card-based with sidebar"

  effects:
    shadows:
      - value: "0 4px 12px rgba(0,0,0,0.3)"
        location: "cards"
    borders:
      - value: "1px solid #333"
        location: "dividers"
    radius:
      - value: "12px"
        location: "cards"
      - value: "8px"
        location: "buttons"
```

### Phase 2: Extract from Code

Parse the component(s) to extract actual values:

#### 2.1 Tailwind Classes
```typescript
// Input
<div className="bg-[#1a1a2e] p-6 rounded-xl shadow-lg">

// Extracted
{
  background: "#1a1a2e",
  padding: "24px",      // p-6
  borderRadius: "12px", // rounded-xl
  shadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" // shadow-lg
}
```

#### 2.2 CSS Custom Properties
```css
/* Input */
--color-bg-primary: #1a1a2e;
--spacing-card: 24px;

/* Extracted */
{
  "color-bg-primary": "#1a1a2e",
  "spacing-card": "24px"
}
```

#### 2.3 Inline Styles
```typescript
// Input
<div style={{ backgroundColor: '#252540', padding: '20px' }}>

// Extracted
{
  backgroundColor: "#252540",
  padding: "20px"
}
```

#### 2.4 Design Token Usage
```typescript
// Input
<div className="bg-primary p-card rounded-card">

// Resolve from tokens.yaml
{
  background: "var(--color-bg-primary)" → "#1a1a2e",
  padding: "var(--spacing-card)" → "24px",
  borderRadius: "var(--radius-card)" → "12px"
}
```

### Phase 3: Compare with Tolerances

```yaml
comparison_thresholds:
  colors:
    method: "HSL distance"
    tolerance: 5%  # 5% HSL difference = match

  spacing:
    method: "absolute"
    tolerance: 4px  # ±4px = match

  typography:
    size_tolerance: 2px
    weight_exact: true  # must match exactly

  radius:
    tolerance: 2px
```

#### Comparison Logic

```typescript
function compareColor(design: string, code: string): ComparisonResult {
  const designHSL = hexToHSL(design);
  const codeHSL = hexToHSL(code);

  const distance = calculateHSLDistance(designHSL, codeHSL);

  return {
    match: distance <= 0.05, // 5% threshold
    distance,
    design,
    code,
    fix: distance > 0.05 ? `Change to ${design}` : null
  };
}

function compareSpacing(design: number, code: number): ComparisonResult {
  const diff = Math.abs(design - code);

  return {
    match: diff <= 4, // 4px threshold
    diff,
    design: `${design}px`,
    code: `${code}px`,
    fix: diff > 4 ? `Use ${getTailwindClass(design)} instead of ${getTailwindClass(code)}` : null
  };
}
```

### Phase 4: Generate Fidelity Report

Output template:

```markdown
# Design Fidelity Report

**Reference:**
```