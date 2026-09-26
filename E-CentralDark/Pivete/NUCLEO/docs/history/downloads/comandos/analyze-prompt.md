# Task: Analyze Prompt (Scriptwriting Prompt Audit)

## Metadata

| Field          | Value                                      |
|----------------|--------------------------------------------|
| **Task ID**    | `YTS-TASK-002`                             |
| **Task Name**  | Analyze Prompt                             |
| **Version**    | 1.0                                        |
| **Purpose**    | Audit a user's scriptwriting prompt to evaluate structural completeness, script-readiness, quality assurance, and niche optimization. Produce a scorecard, improved prompt, and before/after examples. |
| **Executor**   | `script-analyst` agent                     |
| **Trigger**    | Manual invocation or pipeline step         |
| **Priority**   | High                                       |
| **Estimated Duration** | 2-4 minutes                        |

---

## Inputs

| Input            | Required | Type     | Description                                              |
|------------------|----------|----------|----------------------------------------------------------|
| `prompt_text`    | Yes      | string   | The user's scriptwriting prompt to audit                 |
| `target_niche`   | No       | string   | Target niche (e.g., finance, crime, tech). If omitted, agent attempts auto-detection from prompt content. |
| `intended_model` | No       | string   | Which AI model the prompt is intended for (e.g., GPT-4, Claude). Affects recommendation specificity. |

---

## Prerequisites

- The prompt must be provided in full, not summarized.
- The prompt should be intended for generating YouTube scripts (not blog posts, emails, etc.). If it appears to be for a different format, warn the user but proceed.

---

## Steps

### Step 1: Read the Prompt Completely

- Ingest the full prompt text.
- Identify the prompt structure: Is it a single block of text? Sectioned? Uses a framework (RISEN, CRISPE, etc.)?
- Count total words and estimate complexity level.
- Note any explicit instructions, constraints, examples, or meta-instructions present.

**Output:** Prompt overview — word count, detected structure type, framework usage.

---

### Step 2: Stage 1 — Structural Analysis

Evaluate the prompt against standard prompt engineering frameworks. Check for the presence and quality of each element:

#### RISEN Framework Elements

| Element          | Present? | Quality (1-10) | Notes                                          |
|------------------|----------|----------------|-------------------------------------------------|
| **R** — Role     | Yes/No   | ?/10           | Does the prompt assign a clear role/persona?    |
| **I** — Instructions | Yes/No | ?/10         | Are the instructions specific and unambiguous?  |
| **S** — Steps    | Yes/No   | ?/10           | Are sequential steps defined?                   |
| **E** — End Goal | Yes/No   | ?/10           | Is the desired output clearly described?        |
| **N** — Narrowing | Yes/No  | ?/10           | Are constraints and boundaries set?             |

#### CRISPE Framework Elements

| Element          | Present? | Quality (1-10) | Notes                                          |
|------------------|----------|----------------|-------------------------------------------------|
| **C** — Context  | Yes/No   | ?/10           | Background information provided?                |
| **R** — Role     | Yes/No   | ?/10           | (Overlaps with RISEN-R)                         |
| **I** — Instructions | Yes/No | ?/10         | (Overlaps with RISEN-I)                         |
| **S** — Style    | Yes/No   | ?/10           | Writing style or tone specified?                |
| **P** — Parameters | Yes/No | ?/10           | Specific parameters (length, format, etc.)?     |
| **E** — Examples | Yes/No   | ?/10           | Are examples of desired output included?        |

**Stage 1 Score (Structural Completeness):** Average of all element quality scores, weighted by presence.

**Output:** Framework element table, structural completeness score.

---

### Step 3: Stage 2 — Script-Specific Analysis

Evaluate whether the prompt addresses YouTube script-specific requirements:

#### Hook Strategy
- [ ] Does the prompt instruct on hook creation?
- [ ] Is a specific hook framework referenced (PVSS, TTS, Cold Open)?
- [ ] Are hook timing constraints specified (first 5s, 15s, 30s)?
- [ ] Is title/thumbnail alignment mentioned?

#### Retention Mechanics
- [ ] Open loops — Does the prompt instruct the model to create and manage open loops?
- [ ] Pattern interrupts — Is there guidance on frequency and variety?
- [ ] Re-hooks — Are re-hook placement points specified (25%, 50%, 75%)?
- [ ] Stakes escalation — Does the prompt instruct on building tension over time?

#### Emotional Arc
- [ ] Is the prompt asking for emotional variation?
- [ ] Is there a specified emotional trajectory (build, climax, resolve)?
- [ ] Is the "pendulum" concept addressed (shifting registers)?

#### Pacing
- [ ] Is speaking pace mentioned?
- [ ] Are section lengths or timing constraints provided?
- [ ] Is the total target duration specified?

#### PCCE Compliance
- [ ] Does the prompt reference PCCE tagging?
- [ ] Is there instruction to minimize FLAG content?
- [ ] Is there a P:C:Cx:E ratio target?

#### Section Structure with Timing
- [ ] Are sections defined (intro, body segments, outro)?
- [ ] Are time allocations given per section?
- [ ] Is the STP (Setup-Tension-Payoff) structure referenced for each section?

**Stage 2 Score (Script-Readiness):** Percentage of checkboxes satisfied, weighted by importance.

**Output:** Checklist results, script-readiness score.

---

### Step 4: Stage 3 — Quality Criteria

Evaluate whether the prompt includes quality assurance mechanisms:

#### Success Criteria
- [ ] Does the prompt define what "good" looks like?
- [ ] Are measurable success metrics provided (e.g., "hook must be under 30 seconds")?
- [ ] Is there a scoring rubric referenced or embedded?

#### Examples
- [ ] Are positive examples (do this) provided?
- [ ] Are negative examples (don't do this) provided?
- [ ] Are the examples specific to YouTube scripts (not generic writing)?
- [ ] Do examples include annotations explaining why they work?

#### What-to-Avoid
- [ ] Is there an explicit "avoid" or "don't" list?
- [ ] Are common YouTube script pitfalls addressed (e.g., "no Hey guys welcome back")?
- [ ] Are niche-specific pitfalls mentioned?

#### Self-Evaluation Request
- [ ] Does the prompt ask the model to self-score its output?
- [ ] Is the self-evaluation against specific criteria (not just "rate your work")?
- [ ] Is there a revision loop (if score < X, revise)?

**Stage 3 Score (Quality Assurance):** Percentage of checkboxes satisfied, weighted by importance.

**Output:** Checklist results, quality assurance score.

---

### Step 5: Stage 4 — Niche-Specific Analysis

#### Niche Detection
- Auto-detect niche from prompt content if not provided.
- If no niche is detectable, flag as "No niche specified" (this is itself a weakness).

#### Niche Requirements Check

| Niche        | Required Elements                                                              | Present? |
|--------------|--------------------------------------------------------------------------------|----------|
| Finance      | Data/number requirements, disclaimer handling, "what this means for you" framing | ...     |
| Crime        | Chronological structure guidance, emotional stakes, ethical sensitivity          | ...     |
| Tech         | Demo moments, benefit-over-feature framing, comparison structure                | ...     |
| Education    | Story integration, "so what?" connections, knowledge scaffolding                | ...     |
| Motivation   | Specific action steps, proof/credibility, anti-generic safeguards               | ...     |
| Listicle     | Ranking logic, throughline, escalation order                                    | ...     |
| Documentary  | Conflict-first structure, narrator voice guidance, context-to-conflict ratio    | ...     |

#### Unaddressed Weaknesses
- For each niche requirement not present, flag it as a weakness.
- Severity: Critical (will result in poor script) / Warning (script will be mediocre) / Suggestion (nice to have).

**Stage 4 Score (Niche Optimization):** Percentage of niche requirements addressed.

**Output:** Niche detection result, requirements table, weakness flags, niche optimization score.

---

### Step 6: Stage 5 — Recommendation Engine

#### Generate Specific Improvements

For each identified weakness (from Stages 1-4), produce:

| # | Weakness                  | Stage | Severity | Specific Improvement                          |
|---|---------------------------|-------|----------|-----------------------------------------------|
| 1 | (identified weakness)     | 1-4   | Crit/Warn/Sug | (exact text or instruction to add to prompt) |
| 2 | ...                       | ...   | ...      | ...                                           |

**Rules:**
- Maximum 15 improvements, minimum 3.
- Each must be specific enough to copy-paste into the prompt.
- Prioritize by severity, then by impact on script quality.

#### Before/After Examples

For the top 3-5 improvements, show:

```
BEFORE:
[Exact text from original prompt or "Not present"]

AFTER:
[Improved text to add or replace]

WHY:
[Brief explanation of why this improves the prompt]
```

#### Rewritten Prompt

Produce a complete, improved version of the user's prompt that:
- Incorporates all Critical and Warning improvements.
- Preserves the user's intent and voice.
- Is formatted clearly with sections.
- Includes all missing script-specific instructions.
- Adds a self-evaluation step at the end.

**Output:** Improvement table, before/after examples, complete rewritten prompt.

---

### Step 7: Calculate Final Scores

#### 4 Core Scores

| Score                     | Weight | Value  | Calculation Method                    |
|---------------------------|--------|--------|---------------------------------------|
| Structural Completeness   | 25%    | ?/100  | From Stage 1 framework element analysis |
| Script-Readiness          | 35%    | ?/100  | From Stage 2 script-specific checklist  |
| Quality Assurance         | 20%    | ?/100  | From Stage 3 quality criteria checklist |
| Niche Optimization        | 20%    | ?/100  | From Stage 4 niche requirements check   |

**Composite Prompt Score** = Weighted average of all 4 scores.

#### 10-Category Scoring Rubric

| #  | Category            | Weight | Score  | Description                                           |
|----|---------------------|--------|--------|-------------------------------------------------------|
| 1  | Role Definition     | 10%    | ?/10   | Clarity and specificity of assigned role/persona       |
| 2  | Audience Targeting  | 10%    | ?/10   | How well the prompt defines the target audience        |
| 3  | Structure Guidance  | 15%    | ?/10   | Script structure instructions (sections, flow, timing) |
| 4  | Retention Mechanics | 15%    | ?/10   | Open loops, pattern interrupts, re-hooks, stakes       |
| 5  | Emotional Arc       | 10%    | ?/10   | Emotional variation and trajectory guidance             |
| 6  | Examples Provided   | 10%    | ?/10   | Quality and relevance of included examples             |
| 7  | Constraints         | 10%    | ?/10   | Boundaries, limitations, what-to-avoid                 |
| 8  | Success Criteria    | 10%    | ?/10   | Measurable quality standards defined                   |
| 9  | Output Format       | 5%     | ?/10   | Clarity of expected output structure                   |
| 10 | Chain-of-Thought    | 5%     | ?/10   | Does prompt encourage step-by-step reasoning?          |

**Rating Thresholds:**
- 90-100: Elite Prompt — likely to produce excellent scripts as-is
- 75-89: Strong Prompt — minor additions will significantly improve output
- 60-74: Adequate Prompt — several important elements missing
- 40-59: Weak Prompt — substantial rewriting recommended
- Below 40: Critical — prompt needs fundamental restructuring

**Output:** 4 core scores, 10-category rubric, composite score, rating.

---

## Output Format

The final audit report must include:

```
## Prompt Audit Report

### 1. Prompt Overview
[Word count, detected structure, framework usage]

### 2. Structural Completeness (Stage 1)
[RISEN/CRISPE element table, score]

### 3. Script-Readiness (Stage 2)
[Script-specific checklist results, score]

### 4. Quality Assurance (Stage 3)
[Quality criteria checklist, score]

### 5. Niche Optimization (Stage 4)
[Niche detection, requirements, weakness flags, score]

### 6. Scorecard
[4 core scores + 10-category rubric + composite]

### 7. Improvement Recommendations
[Prioritized table with specific fixes]

### 8. Before/After Examples
[Top 3-5 improvements with context]

### 9. Improved Prompt
[Complete rewritten prompt]
```

---

## Validation Criteria

- [ ] All 4 core scores have been calculated with clear methodology.
- [ ] All 10 rubric categories have been scored with justification.
- [ ] Every recommendation is specific enough to copy-paste into the prompt.
- [ ] Before/after examples are provided for at least 3 improvements.
- [ ] The rewritten prompt incorporates all Critical and Warning improvements.
- [ ] The rewritten prompt preserves the user's original intent.
- [ ] Niche has been detected or noted as missing.
- [ ] The report is formatted consistently and readable.
- [ ] Composite score math is correct.
- [ ] If no niche is provided or detected, this is flagged as a weakness.

---

## Error Handling

| Error Condition                     | Response                                                          |
|-------------------------------------|-------------------------------------------------------------------|
| Prompt text is empty                | Return error: "No prompt text provided."                          |
| Prompt is under 20 words            | Warn: "Prompt is extremely short. Analysis will be limited."      |
| Prompt is not for YouTube scripts   | Warn: "Prompt appears to be for [detected format], not YouTube scripts. Proceeding with YouTube-specific analysis anyway." |
| Niche not provided or detected      | Flag as weakness; apply General checks only.                      |
| Prompt is already near-perfect      | Still provide at least 3 suggestions for marginal improvement.    |

---

## Related Tasks

- `audit-prompt.md` — Lighter prompt audit (subset of this analysis)
- `write-script.md` — Uses the improved prompt to generate a script
- `analyze-script.md` — Analyzes the script produced from the prompt

---

*Task Version 1.0 — YouTube Scripts Squad*
