# COMANDO - compare-versions.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\squads\youtube-scripts\tasks\compare-versions.md
**SHA:** 5d347f373e8fc1d5
**Timestamp:** 2026-08-28T02:19:39.877463
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- **For each detected pattern:**
- **Pattern:** [Dimension X] ↑ vs. [Dimension Y] ↓

### Ouro Bruto (primeiros 5000 chars)
```
# Task: Compare Script Versions (Side-by-Side Delta Analysis)

## Metadata

| Field          | Value                                      |
|----------------|--------------------------------------------|
| **Task ID**    | `YTS-TASK-010`                             |
| **Task Name**  | Compare Script Versions                    |
| **Version**    | 1.0                                        |
| **Purpose**    | Compare two script versions side-by-side with scoring deltas across all 9 dimensions to track improvement trajectory, identify regressions, and detect "fix-one-break-another" patterns. Determines which version should ship or if further iteration is needed. |
| **Executor**   | `script-analyst` agent                     |
| **Trigger**    | Manual invocation after script revision    |
| **Priority**   | High                                       |
| **Estimated Duration** | 4-6 minutes                        |

---

## Inputs

| Input            | Required | Type     | Description                                              |
|------------------|----------|----------|----------------------------------------------------------|
| `version_a_text` | Yes      | string   | Script Version A (original/baseline)                     |
| `version_b_text` | Yes      | string   | Script Version B (revised/candidate)                     |
| `version_a_label`| No       | string   | Label for Version A (default: "Version A")               |
| `version_b_label`| No       | string   | Label for Version B (default: "Version B")               |
| `niche`          | No       | string   | Target niche (finance, crime, tech, education, etc.)     |
| `target_length`  | No       | string   | Expected video length for pacing assessment              |
| `title`          | No       | string   | Video title for hook alignment check                     |
| `revision_focus` | No       | string   | What the revision was attempting to fix (for targeted assessment) |

---

## Prerequisites

- Both script versions must be complete (not outlines or fragments).
- Ideally, Version A has already been scored (previous scorecard can be referenced to save time).
- Version B should be a deliberate revision of Version A (not an unrelated script).

---

## Steps

### Step 1: Score Both Versions Independently

Run the full scoring protocol (from `score-script.md`) on **both versions independently**:

**For Version A:**
- Score all 9 dimensions with specific evidence
- Calculate weighted composite score
- Identify top 3 issues
- Document specific weaknesses with quotes

**For Version B:**
- Score all 9 dimensions with specific evidence
- Calculate weighted composite score
- Identify top 3 issues
- Document specific weaknesses with quotes

**Output:** Two complete scorecards (9 dimensions each).

---

### Step 2: Calculate Dimension Deltas

Create a delta table comparing both versions across all dimensions:

| # | Dimension              | V_A Score | V_B Score | Delta | Direction | Impact |
|---|------------------------|-----------|-----------|-------|-----------|--------|
| 1 | Hook Strength          | ?/10      | ?/10      | ±?    | ↑/↓/→     | High   |
| 2 | PCCE Compliance        | ?/10      | ?/10      | ±?    | ↑/↓/→     | Medium |
| 3 | Open Loop Density      | ?/10      | ?/10      | ±?    | ↑/↓/→     | Medium |
| 4 | Pattern Interrupt Freq | ?/10      | ?/10      | ±?    | ↑/↓/→     | Medium |
| 5 | Emotional Arc          | ?/10      | ?/10      | ±?    | ↑/↓/→     | Medium |
| 6 | Re-Hook Placement      | ?/10      | ?/10      | ±?    | ↑/↓/→     | Medium |
| 7 | Stakes Escalation      | ?/10      | ?/10      | ±?    | ↑/↓/→     | Medium |
| 8 | Value Density          | ?/10      | ?/10      | ±?    | ↑/↓/→     | High   |
| 9 | Niche Optimization     | ?/10      | ?/10      | ±?    | ↑/↓/→     | Medium |
| **COMPOSITE** | **Weighted Average** | **?/10** | **?/10** | **±?** | **↑/↓/→** | **—** |

**Delta Calculation:**
- Delta = V_B Score - V_A Score
- Direction: ↑ (improved), ↓ (regressed), → (unchanged/negligible change <0.2)
- Impact = dimension weight (15% = High, 10% = Medium)

**Color-Coding Convention (for reporting):**
- Green (↑) = Improvement of +0.5 or more
- Yellow (↑) = Improvement of +0.2 to +0.5
- Gray (→) = Change of -0.2 to +0.2 (negligible)
- Orange (↓) = Regression of -0.2 to -0.5
- Red (↓) = Regression of -0.5 or more

**Output:** Complete delta table with visual indicators.

---

### Step 3: Identify Dimensions That IMPROVED

For every dimension with a positive delta (+0.2 or more):

#### Improvement Analysis Template

**Dimension:** [Name]
**Delta:** +[X.X] ([V_A score] → [V_B score])
**What Changed:** [Specific textual or structural change between versions]
**Why It Improved:** [Root cause analysis — what about the change drove the score up]
**Evidence from V_B:** [Quote the improved section]
**Impact on Composite:** +[weighted delta]

**Repeat for all improved dimensions.**

**Output:** Detailed improvement breakd
```