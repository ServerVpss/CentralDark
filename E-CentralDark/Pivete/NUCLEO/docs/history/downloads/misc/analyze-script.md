# Task: Analyze Script (Full PCCE Analysis)

## Metadata

| Field          | Value                                      |
|----------------|--------------------------------------------|
| **Task ID**    | `YTS-TASK-001`                             |
| **Task Name**  | Analyze Script                             |
| **Version**    | 1.0                                        |
| **Purpose**    | Run a comprehensive PCCE analysis on a YouTube script, scoring it across 9 dimensions, mapping retention mechanics, and generating prioritized improvement recommendations. |
| **Executor**   | `script-analyst` agent                     |
| **Trigger**    | Manual invocation or pipeline step         |
| **Priority**   | High                                       |
| **Estimated Duration** | 3-5 minutes (depending on script length) |

---

## Inputs

| Input            | Required | Type     | Description                                              |
|------------------|----------|----------|----------------------------------------------------------|
| `script_text`    | Yes      | string   | The full script text to analyze                          |
| `niche`          | No       | string   | Target niche (e.g., finance, crime, tech, education). If omitted, agent will attempt auto-detection. |
| `target_length`  | No       | string   | Expected video length (e.g., "10 min", "15 min"). Used for pacing and re-hook placement validation. |
| `title`          | No       | string   | Video title — used for hook/title alignment check        |
| `thumbnail_concept` | No   | string   | Thumbnail description — used for promise alignment       |

---

## Prerequisites

- Script text must be provided in full (not summarized or truncated).
- If the script contains timestamps, they will be used for precision mapping. If not, the agent will estimate based on word count (~150 words/minute).

---

## Steps

### Step 1: Read Entire Script

- Ingest the full script text.
- Normalize formatting (strip extraneous whitespace, standardize line breaks).
- Count total words and estimate video duration at 150 wpm.
- Identify any existing production cues ([B-ROLL], [GRAPHIC], [MUSIC], etc.) and note them separately.
- Segment the script into logical sections if not already segmented.

**Output:** Cleaned script text, word count, estimated duration, section map.

---

### Step 2: PCCE Sentence Classification

Classify **every sentence** in the script into one of the following PCCE categories:

| Tag    | Category      | Definition                                                                 |
|--------|---------------|----------------------------------------------------------------------------|
| **P**  | Progression   | Moves the narrative or argument forward. Delivers new information.         |
| **C**  | Conflict      | Introduces tension, a problem, a question, or an obstacle.                 |
| **Cx** | Context       | Background, explanation, or setup. Necessary but not momentum-building.    |
| **E**  | Emotion       | Evokes a feeling — curiosity, fear, excitement, humor, awe.               |
| **FLAG** | Flag        | Filler, redundant, off-topic, or momentum-killing. Candidate for removal. |

**Rules:**
- A sentence may have a primary and secondary tag (e.g., P+E = Progression with Emotion).
- FLAG sentences must include a justification for why they break momentum.
- Consecutive Cx sentences (3+) should be flagged as a "context dump" warning.
- Track the P:C:Cx:E:FLAG ratio for the overall script and per section.

**Output:** Annotated script with per-sentence tags, section ratios, overall ratio.

---

### Step 3: Open Loop Inventory

Map every open loop in the script:

| Field              | Description                                                       |
|--------------------|-------------------------------------------------------------------|
| Loop ID            | Sequential identifier (L1, L2, L3...)                             |
| Open Position      | Timestamp/word-count position where the loop is opened            |
| Close Position     | Timestamp/word-count position where the loop is resolved          |
| Loop Type          | Question, Mystery, Promise, Teaser, Unresolved Conflict           |
| Loop Text          | The exact sentence(s) that open the loop                          |
| Simultaneous Count | How many loops are open at this point in the script               |

**Validation Checks:**
- Are there at least 3 open loops simultaneously at the script's peak?
- Is there at least 1 open loop at all times after the hook?
- Are all opened loops eventually closed (no dangling loops)?
- Are loops opened before or at the moment the viewer might consider leaving?
- Is the "master loop" (grand payoff) opened in the hook and closed at the end?

**Output:** Open loop map table, simultaneous loop chart, validation pass/fail per check.

---

### Step 4: Pattern Interrupt Frequency

Identify every pattern interrupt in the script:

| Field           | Description                                              |
|-----------------|----------------------------------------------------------|
| PI ID           | Sequential identifier (PI-1, PI-2, PI-3...)              |
| Position        | Timestamp/word position                                  |
| Type            | Tonal shift, Visual cue, Story pivot, Question, Analogy, Humor, Data drop, B-roll shift |
| Gap (seconds)   | Time since previous pattern interrupt                    |

**Validation Checks:**
- Average gap between pattern interrupts should be 45-60 seconds.
- No gap should exceed 90 seconds (critical red flag).
- Pattern interrupts should vary in type (not all the same kind).
- At least one pattern interrupt should appear in the first 30 seconds.

**Output:** Pattern interrupt timeline, average frequency, gap warnings.

---

### Step 5: Emotional Arc Mapping

Map the emotional register of the script across its timeline:

- Divide the script into 10% segments (deciles).
- For each segment, assign an emotional register: Curiosity, Tension, Relief, Excitement, Awe, Humor, Fear, Sadness, Anger, Calm.
- Track the "pendulum" — how frequently the emotional register shifts.
- Identify "dead zones" where the emotional register stays flat for more than 90 seconds.
- Note the emotional climax point and whether it aligns with the grand payoff.

**Validation Checks:**
- Emotional register should shift at least every 90 seconds.
- The arc should not be monotone (same emotion throughout).
- There should be an emotional build toward the climax.
- The ending emotional register should leave the viewer satisfied or wanting more.

**Output:** Emotional arc chart (10 segments), pendulum frequency, dead zone warnings.

---

### Step 6: Re-Hook Presence Verification

Check for re-hooks at the critical retention marks:

| Mark  | Position       | Re-Hook Present? | Re-Hook Text | Strength (1-10) |
|-------|----------------|-------------------|--------------|------------------|
| 25%   | ~Quarter mark  | Yes/No            | Exact text   | Score            |
| 50%   | ~Halfway       | Yes/No            | Exact text   | Score            |
| 75%   | ~Three-quarter | Yes/No            | Exact text   | Score            |

**What qualifies as a re-hook:**
- A new open loop or promise.
- A stakes escalation ("But it gets worse...").
- A teaser for upcoming content ("In a moment, I'll show you...").
- A pattern interrupt that re-engages curiosity.

**Validation:** All three marks must have a re-hook scoring at least 6/10.

**Output:** Re-hook verification table.

---

### Step 7: Stakes Escalation Trajectory

Assess whether stakes increase throughout the script:

- Map the "stakes level" at each section (1-10 scale).
- Check that stakes never plateau for more than 2 consecutive sections.
- Verify the highest stakes moment is at or near the climax.
- Check for "stakes reset" — where tension drops too much after a payoff without rebuilding.

**Scoring:**
- Consistently rising: 9-10
- Generally rising with minor dips: 7-8
- Flat with occasional spikes: 4-6
- Declining or no clear trajectory: 1-3

**Output:** Stakes trajectory map, trajectory score.

---

### Step 8: Niche-Specific Weakness Identification

Based on the detected or provided niche, check for common weaknesses:

| Niche        | Common Weaknesses to Check                                                    |
|--------------|-------------------------------------------------------------------------------|
| Finance      | Too much jargon, no real-world examples, missing "what this means for you"    |
| Crime/True Crime | Chronological trap, no emotional stakes, missing "why it matters"         |
| Tech         | Feature listing without benefits, no demonstration moments, too dry           |
| Education    | Lecture mode, no stories, missing "so what?" connections                       |
| Motivation   | All emotion no substance, generic advice, no specific actionable steps        |
| Listicle     | No ranking logic, items feel random, no throughline connecting entries         |
| Documentary  | Too much context, not enough conflict, narrator distance                      |
| General      | Apply universal checks only                                                   |

**Output:** Niche-specific findings list with severity (Critical, Warning, Suggestion).

---

### Step 9: Composite Score Calculation

Score each of the 9 dimensions on a 1-10 scale with specific justification:

| #  | Dimension              | Weight | Score | Justification |
|----|------------------------|--------|-------|---------------|
| 1  | Hook Strength          | 15%    | ?/10  | ...           |
| 2  | PCCE Compliance        | 10%    | ?/10  | ...           |
| 3  | Open Loop Density      | 10%    | ?/10  | ...           |
| 4  | Pattern Interrupt Freq | 10%    | ?/10  | ...           |
| 5  | Emotional Arc          | 10%    | ?/10  | ...           |
| 6  | Re-Hook Placement      | 10%    | ?/10  | ...           |
| 7  | Stakes Escalation      | 10%    | ?/10  | ...           |
| 8  | Value Density          | 15%    | ?/10  | ...           |
| 9  | Niche Optimization     | 10%    | ?/10  | ...           |

**Composite Score** = Weighted average of all 9 dimensions.

**Rating Thresholds:**
- 9.0-10.0: Elite — publish-ready
- 7.5-8.9: Strong — minor polish needed
- 6.0-7.4: Adequate — specific improvements needed
- 4.0-5.9: Weak — significant rewrite recommended
- Below 4.0: Critical — fundamental restructuring required

**Output:** Completed scorecard with all dimensions, composite score, and rating.

---

### Step 10: Prioritized Improvement Recommendations

Generate a ranked list of improvements:

| Priority | Issue                      | Dimension Affected | Current | Target | Specific Fix                        |
|----------|----------------------------|--------------------|---------|--------|-------------------------------------|
| 1        | (most impactful issue)     | ...                | ...     | ...    | (exact, actionable recommendation)  |
| 2        | ...                        | ...                | ...     | ...    | ...                                 |
| 3        | ...                        | ...                | ...     | ...    | ...                                 |
| ...      | ...                        | ...                | ...     | ...    | ...                                 |

**Rules for recommendations:**
- Maximum 10 recommendations, minimum 3.
- Each recommendation must be specific and actionable (not "improve the hook" but "Replace the opening question with a bold claim backed by a number").
- Include before/after examples where possible.
- Prioritize by impact: which fix will improve the composite score the most?
- Group related fixes when they address the same section.

**Output:** Prioritized recommendation table with specific fixes and examples.

---

## Output Format

The final analysis report must include all 10 sections in order:

```
## Script Analysis Report

### 1. Script Overview
[Word count, estimated duration, section map]

### 2. PCCE Classification
[Annotated script or summary with ratios]

### 3. Open Loop Map
[Table of all loops with positions]

### 4. Pattern Interrupt Timeline
[Table with frequency analysis]

### 5. Emotional Arc
[Segment-by-segment arc with dead zone warnings]

### 6. Re-Hook Verification
[25/50/75% check table]

### 7. Stakes Escalation
[Trajectory map and score]

### 8. Niche-Specific Findings
[Weakness list with severity]

### 9. Composite Scorecard
[9-dimension scored table with composite]

### 10. Improvement Recommendations
[Prioritized fix table with examples]
```

---

## Validation Criteria

- [ ] All 9 dimensions have been scored with specific justification (no generic comments).
- [ ] Every recommendation is actionable — a writer could implement it without further clarification.
- [ ] Open loop map accounts for every loop opened (none missed).
- [ ] Pattern interrupt frequency has been calculated with actual timestamps or word positions.
- [ ] Emotional arc covers the full script (no segments skipped).
- [ ] Re-hooks checked at all three critical marks.
- [ ] Niche-specific analysis applied (or "General" noted if no niche detected).
- [ ] Composite score math is correct (weighted average matches individual scores).
- [ ] Report is formatted consistently and readable.
- [ ] Before/after examples included for top 3 recommendations.

---

## Error Handling

| Error Condition                    | Response                                                        |
|------------------------------------|-----------------------------------------------------------------|
| Script text is empty               | Return error: "No script text provided."                        |
| Script is under 100 words          | Warn: "Script may be too short for full analysis. Proceeding with available content." |
| Niche not provided or detected     | Default to "General" niche checks; note in report.              |
| Timestamps inconsistent            | Fall back to word-count estimation; note in report.             |
| Script appears to be an outline    | Warn: "Input appears to be an outline, not a full script. Analysis accuracy may be reduced." |

---

## Related Tasks

- `score-script.md` — Lighter scoring-only task (subset of this analysis)
- `optimize-retention.md` — Takes this analysis as input to rewrite weak sections
- `adapt-niche.md` — Uses niche findings from this analysis

---

*Task Version 1.0 — YouTube Scripts Squad*
