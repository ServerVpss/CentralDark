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

**Output:** Detailed improvement breakdown for each positive delta.

---

### Step 4: Identify Dimensions That REGRESSED

For every dimension with a negative delta (-0.2 or more):

#### Regression Analysis Template

**Dimension:** [Name]
**Delta:** -[X.X] ([V_A score] → [V_B score])
**What Changed:** [Specific textual or structural change between versions]
**Why It Regressed:** [Root cause analysis — what about the change hurt the score]
**Evidence from V_A (lost):** [Quote what was removed or weakened]
**Evidence from V_B (damage):** [Quote the problematic section in new version]
**Impact on Composite:** -[weighted delta]

**Repeat for all regressed dimensions.**

**Output:** Detailed regression breakdown for each negative delta.

---

### Step 5: Calculate Net Improvement

**Composite Delta:**
- Net Improvement = V_B Composite - V_A Composite
- Percentage Change = (Net Improvement / V_A Composite) × 100%

**Weighted Impact by Dimension:**

| Dimension              | Weight | Delta | Weighted Delta |
|------------------------|--------|-------|----------------|
| Hook Strength          | 15%    | ±?    | ±?             |
| PCCE Compliance        | 10%    | ±?    | ±?             |
| Open Loop Density      | 10%    | ±?    | ±?             |
| Pattern Interrupt Freq | 10%    | ±?    | ±?             |
| Emotional Arc          | 10%    | ±?    | ±?             |
| Re-Hook Placement      | 10%    | ±?    | ±?             |
| Stakes Escalation      | 10%    | ±?    | ±?             |
| Value Density          | 15%    | ±?    | ±?             |
| Niche Optimization     | 10%    | ±?    | ±?             |
| **NET IMPROVEMENT**    | 100%   | —     | **±?**         |

**Interpretation:**
- Net Improvement > +0.5: Significant upgrade
- Net Improvement +0.2 to +0.5: Moderate upgrade
- Net Improvement -0.2 to +0.2: Lateral move (no meaningful change)
- Net Improvement -0.2 to -0.5: Moderate downgrade
- Net Improvement < -0.5: Significant downgrade

**Output:** Net improvement calculation with interpretation.

---

### Step 6: Flag "Fix One, Break Another" Patterns

Identify cases where improving one dimension caused regression in another:

**Pattern Detection Rules:**
- If Dimension X improved by +0.5 or more AND Dimension Y regressed by -0.5 or more, investigate causality.
- Common trade-off patterns to watch for:
  - **Hook vs. Value**: Stronger hook but lost depth → check if hook lengthened at expense of body
  - **Loops vs. PCCE**: More loops but worse progression flow → check if added loops created context bloat
  - **Emotion vs. Stakes**: Higher emotion but lower stakes → check if emotional moments flattened tension
  - **Pacing vs. Value**: Faster pacing but lower value density → check if cuts removed key insights
  - **Re-hooks vs. Flow**: Added re-hooks but hurt emotional arc → check if re-hooks interrupted momentum

**For each detected pattern:**

#### Trade-Off Analysis Template

**Pattern:** [Dimension X] ↑ vs. [Dimension Y] ↓
**Trade-Off Type:** [Hook/Value, Loops/PCCE, etc.]
**What Happened:** [Describe the causal relationship]
**Example from V_B:** [Quote showing the trade-off in action]
**Is This Acceptable?** [Yes/No with justification]
**Recommendation:** [How to get the benefit of X without hurting Y]

**Output:** List of trade-off patterns with recommendations.

---

### Step 7: Recommend Which Version to Ship

Based on the analysis, make a clear recommendation:

### Recommendation Decision Tree

#### Case 1: Version B Clearly Wins
**Conditions:**
- V_B Composite ≥ 9.5/10 (elite threshold)
- Net Improvement ≥ +0.3
- No critical regressions (no dimension dropped by -1.0 or more)
- No unacceptable trade-offs

**Recommendation:** **Ship Version B**
**Justification:** [Summary of why V_B is superior]

---

#### Case 2: Version A Was Better
**Conditions:**
- Net Improvement is negative (V_B < V_A)
- V_B introduced regressions in high-weight dimensions (Hook or Value)
- Trade-offs are unacceptable

**Recommendation:** **Ship Version A** (revert to original)
**Justification:** [Summary of why revision backfired]
**Next Steps:** [What to try instead for next revision]

---

#### Case 3: Mixed Results (Neither Clear Winner)
**Conditions:**
- Net Improvement is marginal (-0.2 to +0.2)
- V_B fixed some issues but created new ones
- Both versions have critical weaknesses (both < 9.5)

**Recommendation:** **Ship neither — iterate to Version C**
**Justification:** [Why neither version is publish-ready]
**Hybrid Strategy:** Combine the best elements of both versions (see Step 8)

---

#### Case 4: Both Pass Threshold
**Conditions:**
- Both V_A and V_B score ≥ 9.5/10
- Net improvement is marginal but positive

**Recommendation:** **Ship Version B** (slight edge)
**Justification:** [Why V_B has a marginal advantage]
**Note:** Either version is publish-ready; preference is minor.

---

### Step 8: If Neither Passes — Provide Targeted Fix List

If the recommendation is "Ship neither," create a hybrid fix plan that combines the best of both versions:

#### Hybrid Version C Strategy

| Dimension              | Use Version | Reason                                          | Specific Element to Keep |
|------------------------|-------------|------------------------------------------------|--------------------------|
| Hook Strength          | A / B       | [Why this version's hook is superior]          | [Quote hook to keep]     |
| PCCE Compliance        | A / B       | [Why this version's flow is superior]          | [Section to keep]        |
| Open Loop Density      | A / B       | [Why this version's loops are superior]        | [Loops to keep]          |
| Pattern Interrupt Freq | A / B       | [Why this version's pacing is superior]        | [Pattern to keep]        |
| Emotional Arc          | A / B       | [Why this version's arc is superior]           | [Arc element to keep]    |
| Re-Hook Placement      | A / B       | [Why this version's re-hooks are superior]     | [Re-hook to keep]        |
| Stakes Escalation      | A / B       | [Why this version's stakes are superior]       | [Stakes line to keep]    |
| Value Density          | A / B       | [Why this version's value is superior]         | [Insight to keep]        |
| Niche Optimization     | A / B       | [Why this version's niche fit is superior]     | [Element to keep]        |

**Specific Fixes to Apply to Version C:**

1. **Fix 1:** [Actionable fix]
   - **Problem:** [What's broken in both versions]
   - **Solution:** [Exact change to make]
   - **Expected Impact:** [Dimension] +[delta]

2. **Fix 2:** [Actionable fix]
   - **Problem:** [What's broken in both versions]
   - **Solution:** [Exact change to make]
   - **Expected Impact:** [Dimension] +[delta]

3. **Fix 3:** [Actionable fix]
   - **Problem:** [What's broken in both versions]
   - **Solution:** [Exact change to make]
   - **Expected Impact:** [Dimension] +[delta]

**Projected Composite Score for Version C:** [X.X]/10 (based on combining best elements + fixes)

**Output:** Detailed hybrid strategy with projected outcome.

---

## Output Format

```
## Script Version Comparison Report

### Version Overview
- **Version A:** [Label] — [word count] words, [duration]
- **Version B:** [Label] — [word count] words, [duration]
- **Revision Focus:** [What V_B was attempting to fix]
- **Niche:** [niche]

---

### Dimension Delta Table

| # | Dimension              | V_A Score | V_B Score | Delta | Direction | Impact |
|---|------------------------|-----------|-----------|-------|-----------|--------|
| 1 | Hook Strength          | X.X/10    | X.X/10    | ±X.X  | ↑/↓/→     | High   |
| 2 | PCCE Compliance        | X.X/10    | X.X/10    | ±X.X  | ↑/↓/→     | Medium |
| 3 | Open Loop Density      | X.X/10    | X.X/10    | ±X.X  | ↑/↓/→     | Medium |
| 4 | Pattern Interrupt Freq | X.X/10    | X.X/10    | ±X.X  | ↑/↓/→     | Medium |
| 5 | Emotional Arc          | X.X/10    | X.X/10    | ±X.X  | ↑/↓/→     | Medium |
| 6 | Re-Hook Placement      | X.X/10    | X.X/10    | ±X.X  | ↑/↓/→     | Medium |
| 7 | Stakes Escalation      | X.X/10    | X.X/10    | ±X.X  | ↑/↓/→     | Medium |
| 8 | Value Density          | X.X/10    | X.X/10    | ±X.X  | ↑/↓/→     | High   |
| 9 | Niche Optimization     | X.X/10    | X.X/10    | ±X.X  | ↑/↓/→     | Medium |
| **COMPOSITE**          | **X.X/10**| **X.X/10**| **±X.X** | **↑/↓/→** | **—**  |

---

### Net Improvement Analysis

**Composite Delta:** ±X.X
**Percentage Change:** ±X.X%
**Interpretation:** [Significant/Moderate/Negligible/Downgrade]

**Weighted Impact Breakdown:**
[Table showing weighted deltas per dimension]

---

### Dimensions That IMPROVED

[For each improved dimension:]
#### [Dimension Name] (+X.X)
- **What Changed:** [description]
- **Why It Improved:** [analysis]
- **Evidence from V_B:** [quote]
- **Impact on Composite:** +X.X

---

### Dimensions That REGRESSED

[For each regressed dimension:]
#### [Dimension Name] (-X.X)
- **What Changed:** [description]
- **Why It Regressed:** [analysis]
- **Evidence from V_A (lost):** [quote]
- **Evidence from V_B (damage):** [quote]
- **Impact on Composite:** -X.X

---

### Trade-Off Patterns Detected

[For each trade-off:]
#### [Dimension X] ↑ vs. [Dimension Y] ↓
- **Trade-Off Type:** [type]
- **What Happened:** [description]
- **Example from V_B:** [quote]
- **Is This Acceptable?** [Yes/No]
- **Recommendation:** [how to resolve]

---

### Recommendation

**DECISION:** Ship Version [A/B/Neither]

**Justification:**
[Clear explanation of why this is the right choice]

**Next Steps:**
[What to do based on the decision]

---

### [If applicable] Hybrid Version C Strategy

**Best Elements to Combine:**
[Table showing which version to pull from for each dimension]

**Specific Fixes for Version C:**
1. [Fix with expected impact]
2. [Fix with expected impact]
3. [Fix with expected impact]

**Projected Composite Score:** X.X/10
```

---

## Validation Criteria

- [ ] Both versions scored independently with full 9-dimension breakdown.
- [ ] Delta table calculated correctly (V_B - V_A for all dimensions).
- [ ] All improved dimensions have root-cause analysis with evidence.
- [ ] All regressed dimensions have root-cause analysis with evidence.
- [ ] Net improvement calculated correctly (composite delta + weighted breakdown).
- [ ] Trade-off patterns identified and analyzed for acceptability.
- [ ] Clear recommendation made (Ship A / Ship B / Ship Neither).
- [ ] If "Ship Neither," hybrid strategy provided with specific fixes.
- [ ] Projected composite score for Version C is realistic and justified.
- [ ] Report is formatted consistently and easy to compare side-by-side.

---

## Error Handling

| Error Condition                          | Response                                                        |
|------------------------------------------|-----------------------------------------------------------------|
| Version A or B text is empty             | Return error: "Both versions required for comparison."          |
| Versions are identical or nearly identical| Warn: "Versions are nearly identical. Delta analysis may not be meaningful." |
| Version B is shorter by >20%             | Flag: "Significant length reduction detected. Check if cuts removed value." |
| Version B is longer by >20%              | Flag: "Significant length increase detected. Check if additions dilute pacing." |
| Both versions score below 6.0            | Warn: "Both versions critically weak. Consider full rewrite instead of comparison." |
| Revision focus conflicts with actual changes | Note: "Revision focus was [X], but changes affected [Y] instead." |

---

## Related Tasks

- `score-script.md` — Base scoring protocol used for both versions
- `analyze-script.md` — Full analysis (can replace scoring step if needed)
- `optimize-retention.md` — Follow-up task to fix weak dimensions in chosen version
- `adapt-niche.md` — Follow-up task if niche optimization regressed

---

*Task Version 1.0 — YouTube Scripts Squad*
