# COMANDO - ds-generate-shock-report.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\aiox-core\squads\design-studio\tasks\ds-generate-shock-report.md
**SHA:** c4378a673a0dfcea
**Timestamp:** 2026-08-28T13:25:08.343109
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- .horror-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }

### Ouro Bruto (primeiros 5000 chars)
```
# Generate Visual Shock Report

> Task ID: brad-generate-shock-report
> Agent: Brad (Design System Architect)
> Version: 1.0.0

## Description

Generate self-contained HTML report showing visual evidence of UI chaos with side-by-side comparisons, cost analysis, and "horror show" presentation designed to drive stakeholder action.

## Prerequisites

- Audit completed (*audit command run successfully)
- Consolidation data available (optional but recommended)
- ROI calculated (optional but recommended for full impact)

## Workflow

### Interactive Elicitation

This task uses interactive elicitation to customize shock report.

1. **Select Report Scope**
   - Full report (all patterns) or focused (top offenders only)
   - Include ROI section (requires *calculate-roi)
   - Include before/after preview
   - Target audience (engineers vs executives)

2. **Review Pattern Data**
   - Show which patterns will be visualized
   - Confirm most shocking examples selected
   - Ask for any patterns to highlight

3. **Configure Output**
   - HTML only or HTML + PDF export
   - Responsive design (mobile-viewable)
   - Color scheme (light/dark mode)

### Steps

1. **Load Audit and Consolidation Data**
   - Read .state.yaml for all pattern metrics
   - Load inventory, consolidation, ROI data if available
   - Validate data completeness
   - Validation: Sufficient data for report generation

2. **Extract Visual Examples**
   - Scan codebase for actual button implementations
   - Extract CSS for representative examples
   - Find most egregious duplicates
   - Capture top 10 worst offenders
   - Validation: Visual examples extracted

3. **Generate HTML Structure**
   - Create self-contained HTML (no external dependencies)
   - Embed CSS and minimal JavaScript
   - Responsive design (mobile to desktop)
   - Validation: Valid HTML5 structure

4. **Create "Horror Show" Section**
   - Display all button variations side-by-side
   - Show color palette explosion (89 colors in grid)
   - Visualize spacing inconsistencies
   - Make it visually overwhelming (intentional)
   - Validation: Visual impact maximized

5. **Add Metrics Dashboard**
   - Pattern count cards (before/after)
   - Reduction percentages with progress bars
   - Redundancy factors highlighted
   - Validation: Metrics clearly presented

6. **Generate Cost Analysis Section**
   - If ROI calculated, embed cost breakdown
   - Show monthly/annual waste
   - Display ROI metrics prominently
   - Include savings calculator widget
   - Validation: Financial impact clear

7. **Create Before/After Preview**
   - Show consolidated future state
   - Side-by-side comparison (47 buttons → 3)
   - Highlight simplicity and consistency
   - Validation: Future state looks clean

8. **Add Executive Summary**
   - Top-of-page key findings
   - One-sentence problem statement
   - Three bullet point solution
   - Clear call-to-action
   - Validation: Executive-friendly intro

9. **Embed Interactive Elements**
   - Savings calculator (input team size, see ROI)
   - Pattern filter (show/hide categories)
   - Export to PDF button
   - Validation: Interactive elements functional

10. **Generate Report File**
    - Save as shock-report.html
    - Self-contained (works offline)
    - Optimized file size (<1MB)
    - Validation: File opens in all browsers

11. **Optional: Export to PDF**
    - If requested, generate PDF version
    - Preserve visual layout
    - Validation: PDF readable and printable

12. **Update State File**
    - Add shock_report section to .state.yaml
    - Record report location and generation time
    - Validation: State updated

## Output

- **shock-report.html**: Self-contained visual report
- **shock-report.pdf**: PDF version (optional)
- **.state.yaml**: Updated with report location

### Output Format

```html
<!DOCTYPE html>
<html>
<head>
  <title>UI Pattern Chaos Report</title>
  <style>
    /* Embedded CSS for self-contained report */
    body { font-family: system-ui; max-width: 1200px; margin: 0 auto; }
    .horror-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }
    .metric-card { background: #f0f0f0; padding: 20px; border-radius: 8px; }
    .metric-value { font-size: 3rem; font-weight: bold; color: #dc2626; }
  </style>
</head>
<body>
  <header>
    <h1>🚨 UI Pattern Chaos Report</h1>
    <p class="subtitle">Generated by Brad | 2025-10-27</p>
  </header>

  <section class="executive-summary">
    <h2>Executive Summary</h2>
    <p><strong>Problem:</strong> 176 redundant UI patterns cost $457,200/year in maintenance.</p>
    <ul>
      <li>81.8% pattern reduction possible (176 → 32)</li>
      <li>$374,400/year savings potential</li>
      <li>ROI breakeven in 10 days</li>
    </ul>
    <p><strong>Action:</strong> Approve design system implementation immediately.</p>
  </section>

  <section class="metrics">
    <h2>The Damage</h2>
    <div class="metric-cards">
      <div class="metric-card">
        <div class="metric-valu
```