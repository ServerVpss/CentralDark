# COMANDO - mind-validation.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\aiox-core\squads\squad-creator\checklists\mind-validation.md
**SHA:** d7d7cfa0bb6d3a33
**Timestamp:** 2026-08-28T13:25:21.584457
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- **Quality Gate:** BLOCKING - minds that fail CANNOT enter the squad

### Ouro Bruto (primeiros 5000 chars)
```
# Mind Validation Checklist

**Purpose:** Validate if a mind has sufficient documentation to be cloned into an agent
**Used by:** `workflows/mind-research-loop.md` (Iteration 3)
**Quality Gate:** BLOCKING - minds that fail CANNOT enter the squad

---

## Philosophy

> "It doesn't matter if someone is the best in the world if there's no documented process we can replicate."

**Absolute Criterion:**
```
"Is there sufficient documentation of this person's processes
for an agent to replicate the method?"

- YES → Proceeds to next validation
- NO → CUT, no matter how famous they are
```

---

## Quick Validation (5 Mandatory Criteria)

### Scoring System

| Criterion | 0 | 1 | 2 | 3 |
|-----------|---|---|---|---|
| **Documented Framework** | Doesn't exist | Vaguely mentioned | Partially documented | Fully documented |
| **Extractable Process** | No process | Loose tips | General steps | Clear step-by-step |
| **Available Artifacts** | Nothing | Concepts only | Some templates | Templates + Checklists |
| **Application Examples** | None | Mentions | Some cases | Detailed cases |
| **Accessible Material** | Doesn't exist | Hard to find | Partially accessible | Easily accessible |

### Thresholds

| Total Score | Status | Action |
|-------------|--------|--------|
| 12-15 | ✅ PASS | Include in squad |
| 10-11 | ⚠️ CONDITIONAL | Include with caveats |
| 7-9 | ❌ FAIL | Seek alternative |
| 0-6 | 🚫 HARD FAIL | Discard |

**Minimum to pass: 10/15**

---

## 1. DOCUMENTED FRAMEWORK

### What to look for:

- [ ] **Framework/methodology has its own name**
  - Ex: "AIDA", "StoryBrand", "Jobs to be Done"
  - Red flag: Only "X's methodology" without specific name

- [ ] **Defined structure**
  - Ex: "5 steps", "3 pillars", "7 principles"
  - Red flag: Vague concepts without structure

- [ ] **Official documentation**
  - Book, course, certification, official website
  - Red flag: Only mentions in third-party articles

### Validation Questions:

```yaml
questions:
  - "What is the NAME of this person's framework?"
  - "Does this framework have a DEFINED STRUCTURE (steps, phases, components)?"
  - "Where is it OFFICIALLY DOCUMENTED?"
```

### Scoring:

| Score | Criterion |
|-------|----------|
| 0 | No identifiable framework exists |
| 1 | Has "approach" but no formal structure |
| 2 | Framework exists, partially documented |
| 3 | Framework with name, structure, and complete documentation |

---

## 2. EXTRACTABLE PROCESS

### What to look for:

- [ ] **Clear sequence of steps**
  - "First do X, then Y, then Z"
  - Red flag: "It's more art than science"

- [ ] **Documented decisions**
  - "If A happens, do B"
  - Red flag: Depends 100% on intuition

- [ ] **Entry/exit criteria**
  - "Start when you have X, finish when Y"
  - Red flag: Vague process without clear start/end

### Validation Questions:

```yaml
questions:
  - "Is there a documented STEP-BY-STEP process?"
  - "Are the steps SEQUENTIAL and clear?"
  - "Could a beginner FOLLOW the process?"
```

### Scoring:

| Score | Criterion |
|-------|----------|
| 0 | No identifiable process |
| 1 | Loose tips and principles, not sequential |
| 2 | General process exists, but has gaps |
| 3 | Complete and clear step-by-step process |

---

## 3. AVAILABLE ARTIFACTS

### What to look for:

- [ ] **Templates**
  - Fillable structures, blueprints
  - Ex: "Gary Halbert's Sales Page Template"

- [ ] **Checklists**
  - Verification lists derived from the method
  - Ex: "Copy Review Checklist"

- [ ] **Visual frameworks**
  - Diagrams, matrices, canvases
  - Ex: "Business Model Canvas"

- [ ] **Annotated examples**
  - Expert's work with analysis
  - Ex: "Sales letter X line by line"

### Validation Questions:

```yaml
questions:
  - "Are there TEMPLATES we can use?"
  - "Are there CHECKLISTS derived from the method?"
  - "Are there ANNOTATED EXAMPLES of this person's work?"
```

### Scoring:

| Score | Criterion |
|-------|----------|
| 0 | No artifacts found |
| 1 | Only concepts, no practical artifacts |
| 2 | Some templates or checklists |
| 3 | Templates + Checklists + Annotated examples |

---

## 4. APPLICATION EXAMPLES

### What to look for:

- [ ] **Expert's own work**
  - Portfolios, cases, projects
  - Ex: Gary Halbert's sales letters

- [ ] **Documented success cases**
  - Measurable results
  - Ex: "This letter generated $X million"

- [ ] **Before/After**
  - Comparisons showing the method in action
  - Ex: "Copy before vs after revision"

- [ ] **Third-party analysis**
  - Breakdowns, case studies
  - Ex: "Why letter X worked"

### Validation Questions:

```yaml
questions:
  - "Are there WORKS BY THE EXPERT THEMSELVES that we can analyze?"
  - "Are there SUCCESS CASES with measurable results?"
  - "Are there DETAILED ANALYSES of examples?"
```

### Scoring:

| Score | Criterion |
|-------|----------|
| 0 | No examples found |
| 1 | Vague mentions without details |
| 2 | Some documented cases |
| 3 | Multiple detailed cases with analysis |

---

## 5. ACCESSIBLE MATERI
```