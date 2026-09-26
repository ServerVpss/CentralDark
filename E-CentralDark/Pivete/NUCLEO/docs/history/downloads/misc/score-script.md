# Task: Score Script (Quality Scoring)

## Metadata

| Field          | Value                                      |
|----------------|--------------------------------------------|
| **Task ID**    | `YTS-TASK-006`                             |
| **Task Name**  | Score Script                               |
| **Version**    | 1.0                                        |
| **Purpose**    | Perform a focused quality scoring of a YouTube script across 9 dimensions. Produces a formatted scorecard with visual indicators, niche benchmarks, top issues, and specific fixes. Lighter than full analysis (analyze-script). |
| **Executor**   | `script-analyst` agent                     |
| **Trigger**    | Manual invocation or pipeline step         |
| **Priority**   | Medium                                     |
| **Estimated Duration** | 2-3 minutes                        |

---

## Inputs

| Input            | Required | Type     | Description                                              |
|------------------|----------|----------|----------------------------------------------------------|
| `script_text`    | Yes      | string   | The full script text to score                            |
| `niche`          | No       | string   | Target niche (finance, crime, tech, education, etc.)     |
| `target_length`  | No       | string   | Expected video length for pacing assessment              |
| `title`          | No       | string   | Video title for hook alignment check                     |

---

## Prerequisites

- Script must be provided in full.
- If the script has already been analyzed (via analyze-script), the scoring dimensions should align with that analysis.

---

## Steps

### Step 1: Score Each of 9 Dimensions (1-10)

For each dimension, provide a score and **specific justification with evidence from the script**. No generic comments allowed.

#### Dimension 1: Hook Strength (Weight: 15%)

| Criteria                                  | Score Range | Evidence Required |
|-------------------------------------------|-------------|-------------------|
| Immediate attention grab in first 5 seconds | 0-2 pts   | Quote the opening line(s) |
| Video promise clear within 15 seconds      | 0-2 pts    | Quote the promise statement |
| Stakes established within 30 seconds       | 0-2 pts    | Quote the stakes line |
| No throat-clearing or generic opener       | 0-1 pt     | Pass/fail |
| Open loop planted in hook                  | 0-2 pts    | Quote the open loop |
| Title/thumbnail alignment (if title given) | 0-1 pt     | Assessment |

**Score:** Sum / 10 (scaled)

---

#### Dimension 2: PCCE Compliance (Weight: 10%)

| Criteria                                    | Score Range | Evidence Required |
|---------------------------------------------|-------------|-------------------|
| Progression sentences present throughout     | 0-3 pts    | Approximate % |
| Conflict/tension woven into body            | 0-2 pts    | Count instances |
| Context kept minimal, not excessive          | 0-2 pts    | Flag any context dumps (3+ consecutive Cx) |
| Emotion deliberately evoked                  | 0-2 pts    | Count emotional moments |
| FLAG content minimal (<5% of sentences)      | 0-1 pt     | Flag any filler |

**Score:** Sum / 10 (scaled)

---

#### Dimension 3: Open Loop Density (Weight: 10%)

| Criteria                                    | Score Range | Evidence Required |
|---------------------------------------------|-------------|-------------------|
| Master loop opened in hook                   | 0-2 pts    | Quote it |
| 3+ simultaneous loops at peak               | 0-3 pts    | Count max simultaneous |
| All loops closed by end                      | 0-2 pts    | List any dangling loops |
| At least 1 loop open at all times (post-hook)| 0-2 pts   | Identify any gaps |
| Loop variety (not all same type)            | 0-1 pt     | List types used |

**Score:** Sum / 10 (scaled)

---

#### Dimension 4: Pattern Interrupt Frequency (Weight: 10%)

| Criteria                                    | Score Range | Evidence Required |
|---------------------------------------------|-------------|-------------------|
| Average frequency 45-60 seconds             | 0-3 pts    | Calculate actual average |
| No gap exceeds 90 seconds                   | 0-3 pts    | Identify longest gap |
| Variety of interrupt types                  | 0-2 pts    | List types used |
| First interrupt within 30 seconds           | 0-1 pt     | Timestamp |
| Interrupts feel natural (not forced)        | 0-1 pt     | Assessment |

**Score:** Sum / 10 (scaled)

---

#### Dimension 5: Emotional Arc (Weight: 10%)

| Criteria                                    | Score Range | Evidence Required |
|---------------------------------------------|-------------|-------------------|
| Emotional register shifts every 90 seconds   | 0-3 pts    | Count shifts |
| No dead zones (flat emotion >90s)           | 0-2 pts    | Identify any dead zones |
| Emotional climax aligns with grand payoff    | 0-2 pts    | Identify climax point |
| Multiple emotional registers used            | 0-2 pts    | List registers |
| Ending leaves viewer satisfied or wanting more| 0-1 pt    | Assessment |

**Score:** Sum / 10 (scaled)

---

#### Dimension 6: Re-Hook Placement (Weight: 10%)

| Criteria                                    | Score Range | Evidence Required |
|---------------------------------------------|-------------|-------------------|
| Re-hook present at 25% mark                 | 0-3 pts    | Quote it or note absence |
| Re-hook present at 50% mark                 | 0-3 pts    | Quote it or note absence |
| Re-hook present at 75% mark                 | 0-3 pts    | Quote it or note absence |
| Re-hooks are strong (not weak teases)        | 0-1 pt     | Quality assessment |

**Score:** Sum / 10 (scaled)

---

#### Dimension 7: Stakes Escalation (Weight: 10%)

| Criteria                                    | Score Range | Evidence Required |
|---------------------------------------------|-------------|-------------------|
| Stakes introduced early                      | 0-2 pts    | First stakes mention |
| Stakes rise through the script               | 0-3 pts    | Trajectory description |
| No prolonged plateaus (>2 sections flat)    | 0-2 pts    | Identify plateaus |
| Highest stakes at/near climax               | 0-2 pts    | Climax stakes level |
| No stakes reset without rebuild             | 0-1 pt     | Identify resets |

**Score:** Sum / 10 (scaled)

---

#### Dimension 8: Value Density (Weight: 15%)

| Criteria                                    | Score Range | Evidence Required |
|---------------------------------------------|-------------|-------------------|
| Specific examples, data, numbers             | 0-3 pts    | Count specifics |
| No generic or vague advice                   | 0-2 pts    | Flag generic lines |
| Insights per minute are high                 | 0-2 pts    | Estimate insight density |
| Every section delivers tangible value        | 0-2 pts    | Section-by-section check |
| Actionable takeaways present                 | 0-1 pt     | List takeaways |

**Score:** Sum / 10 (scaled)

---

#### Dimension 9: Niche Optimization (Weight: 10%)

| Criteria                                    | Score Range | Evidence Required |
|---------------------------------------------|-------------|-------------------|
| Niche-appropriate structure used             | 0-3 pts    | Structure assessment |
| Common niche weaknesses avoided              | 0-3 pts    | Check against niche weakness list |
| Audience expectations met                    | 0-2 pts    | Audience fit assessment |
| Niche-specific language/framing correct      | 0-2 pts    | Language check |

**If no niche provided:** Score based on general best practices. Note that niche optimization is limited without niche context.

**Score:** Sum / 10 (scaled)

---

### Step 2: Calculate Weighted Composite Score

| #  | Dimension              | Weight | Score  | Weighted Score |
|----|------------------------|--------|--------|----------------|
| 1  | Hook Strength          | 15%    | ?/10   | ?              |
| 2  | PCCE Compliance        | 10%    | ?/10   | ?              |
| 3  | Open Loop Density      | 10%    | ?/10   | ?              |
| 4  | Pattern Interrupt Freq | 10%    | ?/10   | ?              |
| 5  | Emotional Arc          | 10%    | ?/10   | ?              |
| 6  | Re-Hook Placement      | 10%    | ?/10   | ?              |
| 7  | Stakes Escalation      | 10%    | ?/10   | ?              |
| 8  | Value Density          | 15%    | ?/10   | ?              |
| 9  | Niche Optimization     | 10%    | ?/10   | ?              |
| **COMPOSITE**           | **100%** | —    | **?/10**       |

**Verify:** Composite = Sum of (Score x Weight) for all dimensions.

---

### Step 3: Compare Against Niche Benchmarks

If niche is provided, compare against benchmark expectations:

| Niche        | Typical Strong Score | Key Differentiators                                |
|--------------|---------------------|----------------------------------------------------|
| Finance      | 7.5+                | Data density, trust signals, practical examples     |
| Crime        | 7.0+                | Emotional stakes, pacing, mystery maintenance       |
| Tech         | 7.0+                | Clarity, demo moments, benefit framing              |
| Education    | 7.5+                | Story integration, engagement, practical takeaways  |
| Motivation   | 6.5+                | Authenticity, specific actions, proof               |
| Listicle     | 7.0+                | Escalation, throughline, variety                    |
| Documentary  | 7.5+                | Narrative drive, conflict focus, emotional depth    |

**Assessment:** How does this script compare to niche benchmark? Above, at, or below expectations?

---

### Step 4: Identify Top 3 Issues

From the dimension scores, identify the 3 most impactful issues:

| Rank | Issue                          | Dimension Affected | Current Score | Impact |
|------|--------------------------------|--------------------|---------------|--------|
| 1    | [Most critical issue]          | [Dimension]        | [Score]       | High   |
| 2    | [Second most critical issue]   | [Dimension]        | [Score]       | High   |
| 3    | [Third most critical issue]    | [Dimension]        | [Score]       | Medium |

**Prioritization Logic:**
- Issues in higher-weighted dimensions rank higher.
- Issues that affect multiple dimensions rank higher.
- Issues that are easiest to fix rank higher (faster improvement).

---

### Step 5: Provide Specific Fix for Each Issue

For each of the top 3 issues, provide:

#### Issue 1: [Name]
- **Problem:** [Specific description with evidence from script]
- **Impact:** [What this costs in terms of viewer retention or engagement]
- **Fix:** [Exact, actionable instruction]
- **Example Before:** [Quote from script]
- **Example After:** [Rewritten version]
- **Expected Score Improvement:** [Current] -> [Projected]

#### Issue 2: [Name]
[Same format]

#### Issue 3: [Name]
[Same format]

---

### Step 6: Determine PASS/FAIL

**Threshold: 7.0 composite score**

| Composite Score | Verdict    | Recommendation                                      |
|-----------------|------------|-----------------------------------------------------|
| 9.0-10.0        | ELITE PASS | Publish-ready. Minor polish optional.               |
| 8.0-8.9         | STRONG PASS | Ready for production. Consider fixing top issue.   |
| 7.0-7.9         | PASS       | Acceptable. Fixing top 3 issues recommended.        |
| 6.0-6.9         | SOFT FAIL  | Needs revision. Fix top 3 issues before publishing. |
| 4.0-5.9         | FAIL       | Significant rewrite needed. Multiple dimensions weak.|
| Below 4.0       | HARD FAIL  | Fundamental restructuring required.                 |

---

## Output Format

```
## Script Scorecard

### Overview
- Word Count: [count]
- Estimated Duration: [duration]
- Niche: [niche or "Not specified"]
- Verdict: [PASS/FAIL with level]

### Dimension Scores
[Visual scorecard with bars]

1. Hook Strength ........... [##########] 8.0/10 (15%)
2. PCCE Compliance ......... [########--] 7.5/10 (10%)
3. Open Loop Density ....... [######----] 6.0/10 (10%)
4. Pattern Interrupt Freq .. [#########-] 9.0/10 (10%)
5. Emotional Arc ........... [########--] 7.5/10 (10%)
6. Re-Hook Placement ....... [#####-----] 5.0/10 (10%)
7. Stakes Escalation ....... [########--] 8.0/10 (10%)
8. Value Density ........... [#########-] 8.5/10 (15%)
9. Niche Optimization ...... [#######---] 7.0/10 (10%)

### Composite Score: [X.X]/10 — [VERDICT]

### Niche Benchmark Comparison
[Above/At/Below benchmark with context]

### Top 3 Issues
[Ranked issues with specific fixes and before/after examples]

### Recommendation
[1-2 sentence summary of what to do next]
```

---

## Validation Criteria

- [ ] All 9 dimensions scored with specific evidence from the script.
- [ ] No generic justifications (every score backed by quotes or counts).
- [ ] Composite score math is verified correct.
- [ ] Top 3 issues identified with impact ranking.
- [ ] Each issue has a specific, actionable fix with before/after example.
- [ ] PASS/FAIL determination made with appropriate threshold.
- [ ] Niche benchmark comparison included (or noted as unavailable).
- [ ] Output is formatted with visual score bars.
- [ ] Recommendation is clear and actionable.

---

## Error Handling

| Error Condition                     | Response                                                        |
|-------------------------------------|-----------------------------------------------------------------|
| Script text is empty                | Return error: "No script text provided."                        |
| Script under 100 words              | Warn: "Script may be too short for meaningful scoring."         |
| Niche not provided                  | Score Dimension 9 generically; note limitation.                 |
| Script is an outline, not full text | Warn: "Input appears to be an outline. Scoring accuracy reduced." |
| All dimensions score 9+             | Still identify 3 areas for marginal improvement.                |

---

## Related Tasks

- `analyze-script.md` — Full 10-step analysis (includes scoring as Step 9)
- `optimize-retention.md` — Takes scoring output to fix weak dimensions
- `adapt-niche.md` — Addresses Dimension 9 weaknesses specifically

---

*Task Version 1.0 — YouTube Scripts Squad*
