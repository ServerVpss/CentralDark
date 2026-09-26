---
name: market-research
description: "Professional market research and competitive analysis using McKinsey/BCG/Bain consulting methodologies. Use when analyzing markets, competitive landscapes, customer insights, or strategic positioning. Generates hypothesis-driven research with PPTX presentation deliverables."
license: Proprietary. Complete terms in LICENSE.txt
allowed-tools: Read, Grep, Glob, WebFetch, WebSearch, Write, Bash
---

# Market Research: MBB-Grade Analysis & PPTX Deliverables

Execute professional market research using proven methodologies from top consulting firms (McKinsey, BCG, Bain). This skill generates hypothesis-driven analysis structured as a four-level pyramid: Segment/Market → Customers → Competitors → Your Company, culminating in a presentation-ready PPTX artifact.

## When to Use This Skill

Activate this skill when the user requests:
- Market sizing and industry analysis
- Competitive landscape assessment
- Customer needs and behavioral research
- Strategic positioning evaluation
- Business intelligence gathering
- Client-ready market research presentations

## Quality Standard

Work must demonstrate **master-level execution** typical of top consulting firms:
- Every insight backed by solid numbers and cited sources
- Strategic rigor matching McKinsey/BCG/Bain standards
- Professional-grade visual design (avoid AI slop: no purple gradients, no centered-everything layouts, no generic templates)
- CRAAP-validated sources only
- Multi-source triangulation for critical findings

---

## Three-Phase Workflow

### Phase 1: Research Philosophy (30 minutes)

Create the strategic foundation using hypothesis-driven methodology.

**Execute these steps:**

1. **Define the problem** using SMART criteria (Specific, Measurable, Achievable, Relevant, Time-bound)
2. **Build hypothesis tree** applying MECE principle (Mutually Exclusive, Collectively Exhaustive)
   - Reference: `references/MBB_METHODOLOGY.md` for MECE framework details
3. **Identify source strategy** prioritizing free, high-credibility resources
   - Reference: `references/FREE_SOURCES_GUIDE.md` for Tier 1-3 source hierarchy
4. **Generate research brief** using template: `templates/research-brief.md`
5. **Establish success metrics** and validation criteria

**Deliverable:** Research brief document (4-6 paragraphs) articulating:
- Core research question and decision context
- Hypothesis structure (MECE-validated)
- Source identification strategy
- Success criteria and timeline

**Standard:** Brief must demonstrate "strategic clarity typical of top consulting firms" - clear problem definition, structured thinking, actionable scope.

---

### Phase 2: Pyramídová Analýza (1-2 days)

Systematically collect and validate data across four analytical levels, building from broad market context (bottom) to specific company positioning (top).

#### Level 4 (Pyramid Bottom): Segment & Market Analysis

**Analyze:**
- Market size (TAM, SAM, SOM)
- Growth rate (CAGR, historical trends)
- Key market drivers and trends
- Development opportunities and threats

**Source priority:**
- Tier 1: Government statistics (Eurostat, US Census Bureau, national statistical offices)
- Tier 1: Academic journals (Google Scholar, JSTOR)
- Tier 2: Industry associations, trade publications
- Tier 2: World Bank, OECD, IMF datasets

**Validate:** Apply CRAAP test to each source (reference: `references/VALIDATION_FRAMEWORKS.md`)

#### Level 3: Customer Insights

**Investigate:**
- Customer segments and demographics
- Needs, motivations, pain points
- Purchase barriers and decision-making process
- Behavioral patterns and preferences

**Source priority:**
- Consumer survey data (academic research, government consumer reports)
- Industry white papers and market research reports
- Academic studies on consumer behavior
- Trade association consumer research

**Triangulate:** Minimum 2-3 independent sources per critical finding

#### Level 2: Competitive Landscape

**Profile top 3-5 competitors:**
- Market positioning and differentiation
- Product/service offering analysis
- Communication strategy and brand messaging
- How they address customer needs
- Strengths and vulnerabilities

**Source priority:**
- Company websites and press releases
- News articles and media coverage
- Crunchbase, LinkedIn, public filings
- Industry analyst reports
- Academic case studies

**Cross-validate:** Compare competitor claims against independent sources

#### Level 1 (Pyramid Top): Your Company Position

**Assess:**
- Current strategy and business model
- Organizational culture and capabilities
- Core strengths and unique advantages
- Brand positioning potential
- Strategic fit with market opportunities

**Synthesize:**
- Internal documentation analysis
- Competitive benchmarking against Level 2 findings
- Gap analysis (market needs vs. company capabilities)
- Strategic recommendations

**Continuous synthesis:** Create "Day 1 draft" insights immediately, refine continuously. Never accumulate analysis until the end.

#### Data Collection Standards

For each pyramid level:
1. **Source tracking:** Document every source in `templates/source-bibliography.md`
2. **CRAAP validation:** Score Currency, Relevance, Authority, Accuracy, Purpose
3. **Triangulation:** Validate critical findings with 2-3 independent sources
4. **Documentation:** Capture methodology, limitations, confidence levels

**Output:** Completed pyramid analysis using `templates/pyramid-analysis.md` structure

**McKinsey principle:** "Any solution not backed by solid numbers carries heavy burden of proof"

---

### Phase 3: PPTX Artifact Generation (1-2 hours)

Transform analysis into presentation-ready PPTX using professional design standards.

**Execute these steps:**

1. **Prepare HTML slides** using `templates/slide-deck.html`:
   - Dimensions: 720pt width × 405pt height (16:9 aspect ratio)
   - ALL text must be in `<p>`, `<h1>`-`<h6>`, `<ul>`, or `<ol>` tags (html2pptx requirement)
   - Use professional color scheme from `assets/color-scheme.json`
   - Apply pyramid visual from `assets/pyramid-diagram.svg`

2. **Generate slide content** (7-9 slides):
   - **Slide 1:** Title - Project name, client, date
   - **Slide 2:** Executive Summary - 3-5 key findings
   - **Slide 3:** Segment & Market Analysis (Pyramid Level 4)
   - **Slide 4:** Customer Insights (Pyramid Level 3)
   - **Slide 5:** Competitive Landscape (Pyramid Level 2)
   - **Slide 6:** Your Company Position (Pyramid Level 1)
   - **Slide 7:** Strategic Recommendations - Action items with ownership
   - **Slide 8:** Next Steps - Timeline and priorities
   - **Slide 9:** Appendix: Sources Bibliography

3. **Invoke PPTX generation:**
   - Option A: Use `scripts/generate-slides.js` wrapper for document-skills/pptx
   - Option B: Directly invoke the `pptx` skill with generated HTML
   - Follow html2pptx workflow (see document-skills/pptx/html2pptx.md)

4. **Quality validation:**
   - Verify all text is visible (check no text in plain `<div>` or `<span>`)
   - Confirm professional visual design (no AI slop patterns)
   - Validate source citations on every data point
   - Check slide flow and narrative coherence

**Deliverable:** `market-research-report.pptx` - Professional presentation matching MBB standards

**Standard:** "Museum-quality execution" with "meticulous attention to craft" - every slide should appear professionally designed, every insight substantiated.

---

## Helper Scripts

### Initialize New Research Project

```bash
bash scripts/init-research.sh <client-name> <industry>
```

Creates project structure with pre-populated templates.

### Automated Source Validation

```bash
python scripts/validate-sources.py <bibliography-file>
```

Runs automated CRAAP scoring on all documented sources, outputs validation report.

### Generate PPTX from Analysis

```bash
node scripts/generate-slides.js <pyramid-analysis-file>
```

Converts completed pyramid analysis to HTML slides, invokes document-skills/pptx for final PPTX generation.

---

## References

Detailed methodologies are in `references/` for deep consultation:

- **MBB_METHODOLOGY.md** - McKinsey 7-step problem-solving process, MECE principle, Pyramid Principle, Issue Trees, 80/20 rule
- **FREE_SOURCES_GUIDE.md** - Comprehensive guide to Tier 1-3 data sources with focus on free government and academic resources
- **VALIDATION_FRAMEWORKS.md** - Complete CRAAP test framework, Six Essential Questions, triangulation methods

Grep these files when needing specific framework details during analysis.

---

## Common Pitfalls to Avoid

1. **Accepting sources at face value** → Apply systematic CRAAP evaluation
2. **Cherry-picking data** → Use comprehensive search, document all relevant sources
3. **Ignoring original context** → Understand data collection purpose and limitations
4. **Over-reliance on single database** → Multi-source triangulation mandatory
5. **Outdated information** → Check publication dates, verify currency
6. **Unclear methodology** → Only use sources with transparent methodology

---

## Integration with document-skills

This skill requires the **pptx** skill from Anthropic's document-skills suite for Phase 3 PPTX generation.

**Setup option 1 (recommended):** Add document-skills as git submodule:
```bash
git submodule add https://github.com/anthropics/skills document-skills
```

**Setup option 2:** Ensure the `pptx` skill is available in your Claude environment and invoke it when Phase 3 requires PPTX generation.

Reference: https://github.com/anthropics/skills/tree/main/document-skills/pptx

---

## Success Checklist

Before delivering research to client, verify:

✓ Research brief demonstrates clear hypothesis-driven approach
✓ All four pyramid levels analyzed with CRAAP-validated sources
✓ Critical findings triangulated with 2-3 independent sources
✓ Every quantitative claim backed by cited source
✓ Source bibliography complete with validation scores
✓ PPTX presentation follows professional design standards
✓ No AI slop patterns (generic layouts, purple gradients, etc.)
✓ Slide narrative flows logically from market to company
✓ Recommendations are specific, actionable, and prioritized
✓ Final deliverable matches McKinsey/BCG/Bain quality standards
