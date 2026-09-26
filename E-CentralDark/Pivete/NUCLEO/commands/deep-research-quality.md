# COMANDO - deep-research-quality.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\aiox-core\squads\squad-creator\checklists\deep-research-quality.md
**SHA:** b8f8d11ecaeb6617
**Timestamp:** 2026-08-28T13:25:21.220668
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- **Quality Gate:** BLOCKING - research that fails cannot proceed to agent creation.

### Principios
- **Each principle:**

### Gaps
- Missing: {missing_items}

### Ouro Bruto (primeiros 5000 chars)
```
# Deep Research Quality Checklist

**Purpose:** Validate research output BEFORE using it to create agents and tasks.
**Used by:** `workflows/wf-research-then-create-agent.yaml` (Step 5)
**Quality Gate:** BLOCKING - research that fails cannot proceed to agent creation.

---

## Quick Validation (Automated)

### Minimum Thresholds

| Metric | Minimum | Target | Measurement |
|--------|---------|--------|-------------|
| Total lines | 500 | 800+ | `wc -l research.md` |
| Primary sources | 3 | 5+ | Count citations marked (PRIMARY) |
| Scope sections covered | 4/6 | 6/6 | Count ## headers matching scope |
| Actionable frameworks | 1 | 2+ | Count extracted process/checklist |
| Real examples analyzed | 2 | 5+ | Count case studies with analysis |

```yaml
automated_checks:
  - check: "total_lines >= 500"
    weight: 20%
    fail_action: "BLOCK - insufficient research depth"

  - check: "primary_sources >= 3"
    weight: 20%
    fail_action: "BLOCK - need more primary evidence"

  - check: "scope_coverage >= 4/6"
    weight: 15%
    fail_action: "WARN - gaps in coverage"

  - check: "has_actionable_framework == true"
    weight: 25%
    fail_action: "BLOCK - no extractable process"

  - check: "real_examples >= 2"
    weight: 20%
    fail_action: "WARN - need more examples"
```

---

## 1. DOCUMENT STRUCTURE

### 1.1 Required Sections

- [ ] **Executive Summary** present (2-3 paragraphs)
- [ ] **Scope sections** match original research prompt (4-6 sections)
- [ ] **Consolidated Framework** section present
- [ ] **Sources** section with citations
- [ ] **Research Metadata** section

### 1.2 Section Quality

- [ ] Each scope section has substantive content (50+ lines minimum)
- [ ] Sections follow logical progression
- [ ] No empty or placeholder sections
- [ ] Headers use consistent formatting (## for main, ### for sub)

---

## 2. PRIMARY EVIDENCE

### 2.1 Source Types

**Primary Sources (highest value):**
- [ ] Direct quotes from expert/specialist
- [ ] Excerpts from expert's books/articles
- [ ] Transcripts of expert's speeches/interviews
- [ ] Expert's documented processes/frameworks

**Secondary Sources (supporting):**
- [ ] Analysis by practitioners who studied the expert
- [ ] Case studies applying expert's methods
- [ ] Academic research on the methodology
- [ ] Industry commentary and validation

### 2.2 Citation Quality

- [ ] Each major claim has source attribution
- [ ] Primary sources clearly marked as `(PRIMARY)` or `(EVIDENCE)`
- [ ] Source format includes: Author, Work, Year/Chapter when available
- [ ] URLs provided for web sources
- [ ] No unsourced claims in framework sections

### 2.3 Evidence Distribution

```yaml
evidence_distribution:
  minimum:
    primary_sources: 3
    secondary_sources: 2
    case_studies: 2

  ideal:
    primary_sources: 5+
    secondary_sources: 3+
    case_studies: 5+

  red_flags:
    - "All sources from single origin"
    - "No direct quotes from expert"
    - "Only blog posts, no books/papers"
    - "Sources older than 20 years with no modern validation"
```

---

## 3. SCOPE COVERAGE

### 3.1 Per-Section Validation

For EACH scope section in the research prompt, verify:

- [ ] **Section exists** with matching header
- [ ] **Minimum depth:** 50+ lines of content
- [ ] **Sub-points addressed:** All sub-points from prompt covered
- [ ] **Evidence present:** At least 1 citation in section
- [ ] **Actionable content:** Contains how-to, not just theory

### 3.2 Coverage Scoring

| Coverage | Score | Status |
|----------|-------|--------|
| 6/6 sections | 100% | PASS |
| 5/6 sections | 83% | PASS |
| 4/6 sections | 67% | CONDITIONAL |
| 3/6 sections | 50% | FAIL |
| <3 sections | <50% | HARD FAIL |

### 3.3 Depth Indicators

**Adequate depth (per section):**
- [ ] Has introduction explaining section relevance
- [ ] Has 2+ specific techniques or principles
- [ ] Has at least 1 real example
- [ ] Has practical guidance (not just theory)

**Insufficient depth:**
- [ ] Only definitions without application
- [ ] Single paragraph treatment
- [ ] No examples or evidence
- [ ] Vague generalizations

---

## 4. ACTIONABLE CONTENT

### 4.1 Framework Extraction Readiness

The research MUST contain enough detail to extract:

**Principles (3+ required):**
- [ ] Explicit rules stated by expert
- [ ] Documented beliefs/philosophy
- [ ] What expert considers important
- [ ] Format: Clear, quotable statements

**Process (1 required):**
- [ ] Step-by-step workflow
- [ ] Sequence of actions
- [ ] How expert actually does the work
- [ ] Format: Numbered or ordered steps

**Structure (1 required):**
- [ ] Anatomy of the output (sections, components)
- [ ] Template or blueprint
- [ ] What the deliverable looks like
- [ ] Format: List of sections with purposes

**Quality Criteria (1 required):**
- [ ] What expert considers "good"
- [ ] What expert considers "bad"
- [ ] Evaluation criteria
- [ ] Format: Do/Don't or Excellent/Weak lists

**Checklist (derivable):**
- [ ] Enough criteria to create v
```