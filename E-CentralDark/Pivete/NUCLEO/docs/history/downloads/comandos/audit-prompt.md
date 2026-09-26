# Task: Audit Prompt (Lightweight Prompt Audit)

## Metadata

| Field          | Value                                      |
|----------------|--------------------------------------------|
| **Task ID**    | `YTS-TASK-007`                             |
| **Task Name**  | Audit Prompt                               |
| **Version**    | 1.0                                        |
| **Purpose**    | Perform a focused 10-category audit of a user's scriptwriting prompt. Identify critical gaps, score each category, generate an improved prompt with before/after comparisons. Lighter and faster than the full analyze-prompt task. |
| **Executor**   | `script-analyst` agent                     |
| **Trigger**    | Manual invocation or pipeline step         |
| **Priority**   | Medium                                     |
| **Estimated Duration** | 2-3 minutes                        |

---

## Inputs

| Input            | Required | Type     | Description                                              |
|------------------|----------|----------|----------------------------------------------------------|
| `prompt_text`    | Yes      | string   | The user's scriptwriting prompt to audit                 |
| `target_niche`   | No       | string   | Target niche for niche-specific recommendations          |
| `intended_use`   | No       | string   | What the prompt is meant to produce (e.g., "10-min YouTube script", "Shorts script") |

---

## Prerequisites

- The prompt must be provided in full.
- The prompt should be intended for generating YouTube scripts.

---

## Steps

### Step 1: Run 10-Category Analysis

Evaluate the prompt against 10 scoring categories. For each category, assess presence, quality, and completeness.

#### Category 1: Role Definition (Weight: 10%)

| Assessment Item                                    | Status          | Notes |
|----------------------------------------------------|-----------------|-------|
| Is a specific role/persona assigned?               | Present/Missing | ...   |
| Is the role relevant to scriptwriting?             | Yes/No/Partial  | ...   |
| Does the role include expertise level?             | Yes/No          | ...   |
| Are behavioral instructions included?              | Yes/No          | ...   |

**Score:** ?/10
**Justification:** [Specific reasoning]

---

#### Category 2: Audience Targeting (Weight: 10%)

| Assessment Item                                    | Status          | Notes |
|----------------------------------------------------|-----------------|-------|
| Is the target audience defined?                    | Present/Missing | ...   |
| Demographics specified? (age, interests, etc.)     | Yes/No/Partial  | ...   |
| Knowledge level specified? (beginner, advanced)    | Yes/No          | ...   |
| Audience pain points or desires mentioned?         | Yes/No          | ...   |

**Score:** ?/10
**Justification:** [Specific reasoning]

---

#### Category 3: Structure Guidance (Weight: 15%)

| Assessment Item                                    | Status          | Notes |
|----------------------------------------------------|-----------------|-------|
| Are script sections defined? (intro, body, outro)  | Present/Missing | ...   |
| Is section timing/length specified?                | Yes/No          | ...   |
| Is STP structure referenced for sections?          | Yes/No          | ...   |
| Is overall flow/sequencing addressed?              | Yes/No          | ...   |
| Is total target length specified?                  | Yes/No          | ...   |

**Score:** ?/10
**Justification:** [Specific reasoning]

---

#### Category 4: Retention Mechanics (Weight: 15%)

| Assessment Item                                    | Status          | Notes |
|----------------------------------------------------|-----------------|-------|
| Open loops mentioned/instructed?                   | Present/Missing | ...   |
| Pattern interrupts addressed?                      | Yes/No          | ...   |
| Re-hooks at key retention marks?                   | Yes/No          | ...   |
| Stakes escalation instructed?                      | Yes/No          | ...   |
| Hook creation addressed?                           | Yes/No          | ...   |
| "No dead zones" or equivalent instruction?         | Yes/No          | ...   |

**Score:** ?/10
**Justification:** [Specific reasoning]

---

#### Category 5: Emotional Arc (Weight: 10%)

| Assessment Item                                    | Status          | Notes |
|----------------------------------------------------|-----------------|-------|
| Emotional variation instructed?                    | Present/Missing | ...   |
| Specific emotional trajectory defined?             | Yes/No          | ...   |
| Pendulum concept or equivalent addressed?          | Yes/No          | ...   |
| Target emotion(s) specified?                       | Yes/No          | ...   |

**Score:** ?/10
**Justification:** [Specific reasoning]

---

#### Category 6: Examples Provided (Weight: 10%)

| Assessment Item                                    | Status          | Notes |
|----------------------------------------------------|-----------------|-------|
| Positive examples included? (do this)              | Present/Missing | ...   |
| Negative examples included? (don't do this)        | Yes/No          | ...   |
| Examples are YouTube-specific (not generic)?       | Yes/No          | ...   |
| Examples are annotated with explanations?          | Yes/No          | ...   |

**Score:** ?/10
**Justification:** [Specific reasoning]

---

#### Category 7: Constraints (Weight: 10%)

| Assessment Item                                    | Status          | Notes |
|----------------------------------------------------|-----------------|-------|
| What-to-avoid list present?                        | Present/Missing | ...   |
| Specific pitfalls addressed?                       | Yes/No          | ...   |
| Tone/style boundaries set?                         | Yes/No          | ...   |
| Length/format constraints clear?                   | Yes/No          | ...   |

**Score:** ?/10
**Justification:** [Specific reasoning]

---

#### Category 8: Success Criteria (Weight: 10%)

| Assessment Item                                    | Status          | Notes |
|----------------------------------------------------|-----------------|-------|
| Measurable quality standards defined?              | Present/Missing | ...   |
| Scoring rubric referenced or embedded?             | Yes/No          | ...   |
| Self-evaluation request included?                  | Yes/No          | ...   |
| Revision loop defined? (if score < X, revise)     | Yes/No          | ...   |

**Score:** ?/10
**Justification:** [Specific reasoning]

---

#### Category 9: Output Format (Weight: 5%)

| Assessment Item                                    | Status          | Notes |
|----------------------------------------------------|-----------------|-------|
| Expected output structure specified?               | Present/Missing | ...   |
| Formatting instructions included?                  | Yes/No          | ...   |
| Section headers or template provided?              | Yes/No          | ...   |
| Annotation/markup expectations clear?              | Yes/No          | ...   |

**Score:** ?/10
**Justification:** [Specific reasoning]

---

#### Category 10: Chain-of-Thought (Weight: 5%)

| Assessment Item                                    | Status          | Notes |
|----------------------------------------------------|-----------------|-------|
| Step-by-step reasoning encouraged?                 | Present/Missing | ...   |
| "Think before writing" instruction present?        | Yes/No          | ...   |
| Planning phase before drafting?                    | Yes/No          | ...   |
| Multi-pass approach (draft, then refine)?          | Yes/No          | ...   |

**Score:** ?/10
**Justification:** [Specific reasoning]

---

### Step 2: Score Each Category

Compile all 10 category scores:

| #  | Category            | Weight | Score  | Weighted |
|----|---------------------|--------|--------|----------|
| 1  | Role Definition     | 10%    | ?/10   | ?        |
| 2  | Audience Targeting  | 10%    | ?/10   | ?        |
| 3  | Structure Guidance  | 15%    | ?/10   | ?        |
| 4  | Retention Mechanics | 15%    | ?/10   | ?        |
| 5  | Emotional Arc       | 10%    | ?/10   | ?        |
| 6  | Examples Provided   | 10%    | ?/10   | ?        |
| 7  | Constraints         | 10%    | ?/10   | ?        |
| 8  | Success Criteria    | 10%    | ?/10   | ?        |
| 9  | Output Format       | 5%     | ?/10   | ?        |
| 10 | Chain-of-Thought    | 5%     | ?/10   | ?        |
| **COMPOSITE**        | **100%** | —    | **?/10** |

---

### Step 3: Identify Issues by Severity

Classify every finding into one of four severity levels:

#### Critical Missing (Score 0-2)
Items that are completely absent and will significantly harm script quality.
- [ ] [Finding 1]
- [ ] [Finding 2]
- ...

#### Weak/Vague (Score 3-5)
Items that are present but insufficient — too vague, too generic, or incomplete.
- [ ] [Finding 1]
- [ ] [Finding 2]
- ...

#### Enhancement Opportunity (Score 6-7)
Items that are adequate but could be significantly improved.
- [ ] [Finding 1]
- [ ] [Finding 2]
- ...

#### Optimization (Score 8-9)
Items that are good but could be fine-tuned for maximum effectiveness.
- [ ] [Finding 1]
- [ ] [Finding 2]
- ...

---

### Step 4: Rewrite Improved Prompt

Generate a complete, improved version of the user's prompt that:

1. **Fixes all Critical Missing items** — adds the missing elements.
2. **Strengthens all Weak/Vague items** — makes them specific and actionable.
3. **Incorporates Enhancement opportunities** — upgrades where beneficial.
4. **Preserves the user's voice and intent** — does not change what they're asking for, only how they ask for it.
5. **Follows a clean structure** with clear sections and formatting.
6. **Includes retention mechanics** that were missing.
7. **Adds a self-evaluation step** at the end of the prompt.

**The rewritten prompt must be a complete, copy-paste-ready prompt** — not fragments or suggestions.

---

### Step 5: Show Before/After Comparison

For the top 5 most impactful improvements, provide:

```
### Improvement [#]: [Category Name]

**BEFORE:**
[Exact text from original prompt, or "Not present"]

**AFTER:**
[Improved text from rewritten prompt]

**WHY:**
[1-2 sentence explanation of why this matters for script quality]

**IMPACT:**
[Which aspect of the final script this will improve]
```

---

## Output Format

```
## Prompt Audit Report

### Prompt Overview
- Word Count: [count]
- Detected Structure: [freeform / sectioned / framework-based]
- Detected Niche: [niche or "Not detected"]

### Category Scores
[10-category scoring table with composite]

### Issue Classification
#### Critical Missing
[List with explanations]

#### Weak/Vague
[List with explanations]

#### Enhancement Opportunities
[List with explanations]

#### Optimization Opportunities
[List with explanations]

### Before/After Comparisons
[Top 5 improvements with context]

### Improved Prompt
[Complete rewritten prompt — copy-paste ready]

### Summary
- Original Score: [X/10]
- Projected Improved Score: [X/10]
- Critical Fixes: [count]
- Total Improvements: [count]
```

---

## Validation Criteria

- [ ] All 10 categories have been scored with specific justification.
- [ ] Composite score math is correct (weighted average).
- [ ] Issues are properly classified into 4 severity levels.
- [ ] Rewritten prompt is complete and copy-paste ready.
- [ ] Before/after examples provided for at least 5 improvements.
- [ ] Rewritten prompt preserves the user's original intent.
- [ ] Every Critical Missing item is addressed in the rewritten prompt.
- [ ] Report is formatted consistently and readable.
- [ ] If niche is not provided or detected, this is flagged.

---

## Error Handling

| Error Condition                     | Response                                                        |
|-------------------------------------|-----------------------------------------------------------------|
| Prompt text is empty                | Return error: "No prompt text provided."                        |
| Prompt is under 20 words            | Warn: "Prompt is extremely short. Audit will reflect significant gaps." |
| Prompt is not for scripts           | Warn: "Prompt appears to be for [format]. Auditing as scriptwriting prompt anyway." |
| Prompt scores 9+ on all categories  | Still provide at least 3 optimization suggestions.              |
| Prompt is already structured well   | Focus on script-specific enhancements that could elevate output.|

---

## Related Tasks

- `analyze-prompt.md` — Full 5-stage prompt analysis (more comprehensive)
- `write-script.md` — Uses the improved prompt to generate a script
- `write-hook.md` — Improved prompt should produce better hooks

---

*Task Version 1.0 — YouTube Scripts Squad*
