# Task: Adapt Niche (Niche-Specific Script Adaptation)

## Metadata

| Field          | Value                                      |
|----------------|--------------------------------------------|
| **Task ID**    | `YTS-TASK-008`                             |
| **Task Name**  | Adapt Niche                                |
| **Version**    | 1.0                                        |
| **Purpose**    | Adapt an existing YouTube script for a specific niche by applying niche-appropriate structure, fixing common niche weaknesses, and optimizing against niche benchmarks. |
| **Executor**   | `script-analyst` agent                     |
| **Trigger**    | Manual invocation or pipeline step         |
| **Priority**   | Medium                                     |
| **Estimated Duration** | 3-5 minutes                        |

---

## Inputs

| Input            | Required | Type     | Description                                              |
|------------------|----------|----------|----------------------------------------------------------|
| `script_text`    | Yes      | string   | The full script text to adapt                            |
| `target_niche`   | Yes      | string   | Target niche to adapt for (finance, crime, tech, education, motivation, listicle, documentary) |
| `current_niche`  | No       | string   | Current niche of the script (if known)                   |
| `audience`       | No       | string   | Target audience description for the new niche            |
| `preserve_core`  | No       | boolean  | If true, preserve core content and only adjust framing. If false, allow structural changes. Default: true. |

---

## Prerequisites

- Script must be provided in full (not an outline).
- Target niche must be one of the supported niches or "general".
- If current niche is not provided, agent will attempt auto-detection.

---

## Steps

### Step 1: Identify Current Niche Assumptions in Script

Analyze the existing script for niche-related characteristics:

#### Content Analysis
- **Current niche indicators:** What elements suggest the script's current niche?
- **Tone and voice:** Formal/informal, authoritative/conversational, serious/playful?
- **Structure pattern:** Chronological, problem-solution, listicle, narrative, tutorial?
- **Evidence types used:** Data, stories, case studies, expert quotes, personal experience?
- **Audience assumptions:** What knowledge level does the script assume?
- **Hook style:** What hook approach is currently used?
- **Retention patterns:** What retention mechanics are currently employed?

#### Current Niche Assessment
| Aspect              | Current State                    | Niche Alignment |
|---------------------|----------------------------------|-----------------|
| Tone                | [detected]                       | [aligned/misaligned with target] |
| Structure           | [detected]                       | [aligned/misaligned with target] |
| Evidence Types      | [detected]                       | [aligned/misaligned with target] |
| Hook Style          | [detected]                       | [aligned/misaligned with target] |
| Pacing              | [detected]                       | [aligned/misaligned with target] |
| Audience Level      | [detected]                       | [aligned/misaligned with target] |

**Output:** Current niche assessment table, list of misalignments with target niche.

---

### Step 2: Load Target Niche Pattern from Knowledge Base

Retrieve the target niche's specific requirements, patterns, and benchmarks:

#### Finance Niche Pattern
| Requirement              | Description                                                        |
|--------------------------|--------------------------------------------------------------------|
| Structure                | Problem-Solution or Myth-Busting. Data-heavy but story-driven.    |
| Hook Style               | Stat bomb or contrarian claim. Money-specific stakes.              |
| Evidence                 | Numbers, percentages, real examples, case studies. NO vague claims.|
| Common Weakness          | Too much jargon, missing "what this means for you" translation.    |
| Audience Expectation     | Practical, actionable, trustworthy. Show math, show proof.         |
| Retention Key            | Each section must answer "how does this make/save me money?"       |
| Tone                     | Authoritative but accessible. Never condescending.                 |
| Trust Signals            | Credentials, track record, third-party data sources cited.         |
| Pacing                   | Medium — allow time for data to sink in, but no dwelling.          |
| Benchmark Score          | 7.5+ composite for competitive performance.                       |

#### Crime / True Crime Niche Pattern
| Requirement              | Description                                                        |
|--------------------------|--------------------------------------------------------------------|
| Structure                | Narrative-driven. Non-chronological is preferred (start with the crime, then backtrack). |
| Hook Style               | Cold open mid-action, or eerie setup. Atmospheric.                |
| Evidence                 | Court documents, witness accounts, police reports, timeline.       |
| Common Weakness          | Chronological trap (boring buildup), missing emotional stakes.     |
| Audience Expectation     | Tension, mystery, emotional investment in victims/characters.      |
| Retention Key            | "Who did it?" or "How did this happen?" tension throughout.        |
| Tone                     | Serious, respectful, suspenseful. Never sensationalist.            |
| Trust Signals            | Source citations, "according to court records", specific details.  |
| Pacing                   | Slow build with frequent tension spikes. Deliberate pacing.        |
| Benchmark Score          | 7.0+ composite for competitive performance.                       |

#### Tech Niche Pattern
| Requirement              | Description                                                        |
|--------------------------|--------------------------------------------------------------------|
| Structure                | Comparison, tutorial, or revelation format. Demo moments essential.|
| Hook Style               | Bold claim about impact, or surprising capability reveal.          |
| Evidence                 | Demonstrations, benchmarks, specifications, real-world usage.      |
| Common Weakness          | Feature listing without benefits, too dry, no demo moments.        |
| Audience Expectation     | Clear explanations, practical applications, "should I buy/use?"    |
| Retention Key            | Each feature/point must answer "what can I do with this?"          |
| Tone                     | Enthusiastic but not hype-y. Knowledgeable, hands-on.              |
| Trust Signals            | Hands-on experience, comparison data, real-world testing.          |
| Pacing                   | Fast — tech audience has low patience for fluff.                   |
| Benchmark Score          | 7.0+ composite for competitive performance.                       |

#### Education Niche Pattern
| Requirement              | Description                                                        |
|--------------------------|--------------------------------------------------------------------|
| Structure                | Story-lesson-application. Each concept gets a story + takeaway.   |
| Hook Style               | Fascinating question or surprising fact. "Did you know?" approach. |
| Evidence                 | Research studies, expert citations, historical examples.            |
| Common Weakness          | Lecture mode, no stories, missing "so what?" connections.          |
| Audience Expectation     | Learn something new, feel smarter, understand a complex topic.     |
| Retention Key            | Each section must have a "mind-blown" or "aha!" moment.            |
| Tone                     | Enthusiastic teacher. Curious and exploratory.                     |
| Trust Signals            | Study citations, expert quotes, logical reasoning.                 |
| Pacing                   | Medium — fast enough to maintain interest, slow enough to learn.   |
| Benchmark Score          | 7.5+ composite for competitive performance.                       |

#### Motivation Niche Pattern
| Requirement              | Description                                                        |
|--------------------------|--------------------------------------------------------------------|
| Structure                | Story-principle-action. Real story, universal principle, specific steps. |
| Hook Style               | Personal confession or bold promise. Vulnerability opens.          |
| Evidence                 | Personal stories, client results, specific action steps.           |
| Common Weakness          | All emotion no substance, generic advice, no specific actions.     |
| Audience Expectation     | Feel inspired AND know what to do next. Proof it works.            |
| Retention Key            | "This specific action changed everything" — concrete, not abstract.|
| Tone                     | Authentic, passionate, direct. Never preachy.                      |
| Trust Signals            | Personal results, client testimonials, specific numbers.           |
| Pacing                   | Varied — slow for emotional moments, fast for action steps.        |
| Benchmark Score          | 6.5+ composite for competitive performance.                       |

#### Listicle Niche Pattern
| Requirement              | Description                                                        |
|--------------------------|--------------------------------------------------------------------|
| Structure                | Ranked or themed list. Must have throughline connecting items.      |
| Hook Style               | Preview the best item or tease the ranking logic.                  |
| Evidence                 | Variety — each item needs its own evidence type.                   |
| Common Weakness          | No ranking logic, items feel random, no throughline.               |
| Audience Expectation     | Efficient value delivery, surprise in rankings, completeness.      |
| Retention Key            | "What's #1?" — save the best for last, tease it early.            |
| Tone                     | Confident, opinionated. Rankings need conviction.                  |
| Trust Signals            | Clear criteria for ranking, data where applicable.                 |
| Pacing                   | Fast — each item should be punchy. Vary length by importance.      |
| Benchmark Score          | 7.0+ composite for competitive performance.                       |

#### Documentary Niche Pattern
| Requirement              | Description                                                        |
|--------------------------|--------------------------------------------------------------------|
| Structure                | Narrative arc with conflict at center. Three-act structure works.  |
| Hook Style               | Dramatic opening scene or provocative thesis statement.            |
| Evidence                 | Primary sources, interviews, archival material, expert analysis.   |
| Common Weakness          | Too much context, not enough conflict, narrator distance.          |
| Audience Expectation     | Deep understanding, emotional connection, revelations.             |
| Retention Key            | Central mystery or conflict that drives the entire narrative.      |
| Tone                     | Authoritative narrator with emotional undercurrent.                |
| Trust Signals            | Source diversity, expert voices, primary documents.                |
| Pacing                   | Deliberate but never stagnant. Tension drives pace.                |
| Benchmark Score          | 7.5+ composite for competitive performance.                       |

**Output:** Target niche pattern loaded with all requirements.

---

### Step 3: Apply Niche-Specific Structure

Transform the script to match the target niche pattern:

#### Structural Adaptation
1. **Reorganize sections** to match niche-preferred structure (if `preserve_core` is false).
2. **Reframe the hook** to match niche audience expectations.
3. **Adjust evidence types** — replace or supplement with niche-appropriate evidence.
4. **Modify tone** throughout the script to match niche expectations.
5. **Adjust pacing** — speed up or slow down sections as niche requires.
6. **Add niche-specific retention triggers** (e.g., "what this means for your money" in finance).

#### Changes Log
For each change made, document:

| Change # | Section    | Type               | Before (Summary)           | After (Summary)            | Reason                    |
|----------|------------|--------------------|-----------------------------|----------------------------|---------------------------|
| 1        | [section]  | Structure/Tone/Evidence/Pacing | [what it was]       | [what it is now]           | [niche requirement]       |
| 2        | ...        | ...                | ...                         | ...                        | ...                       |

**Output:** Adapted script sections with change annotations.

---

### Step 4: Fix Common Niche Weaknesses

Cross-reference the script against the target niche's "Common Weaknesses" and fix each one:

| Weakness                          | Present in Script? | Fix Applied                          | Severity |
|-----------------------------------|--------------------|--------------------------------------|----------|
| [niche weakness 1]               | Yes/No             | [Specific fix or "N/A"]             | Critical/Warning/Suggestion |
| [niche weakness 2]               | Yes/No             | [Specific fix or "N/A"]             | ... |
| [niche weakness 3]               | Yes/No             | [Specific fix or "N/A"]             | ... |

**For each weakness found and fixed, show before/after:**

```
WEAKNESS: [Name]
BEFORE: "[Original text from script]"
AFTER: "[Fixed text]"
WHY: [How this fix addresses the niche weakness]
```

**Output:** Weakness fix table with before/after examples.

---

### Step 5: Optimize for Niche Benchmarks

Compare the adapted script against the niche benchmark score and optimize:

#### Pre-Adaptation vs Post-Adaptation Scores

| Dimension              | Pre-Adaptation | Post-Adaptation | Change | Niche Benchmark |
|------------------------|----------------|-----------------|--------|-----------------|
| Hook Strength          | ?/10           | ?/10            | +/-    | [benchmark]     |
| PCCE Compliance        | ?/10           | ?/10            | +/-    | [benchmark]     |
| Open Loop Density      | ?/10           | ?/10            | +/-    | [benchmark]     |
| Pattern Interrupt Freq | ?/10           | ?/10            | +/-    | [benchmark]     |
| Emotional Arc          | ?/10           | ?/10            | +/-    | [benchmark]     |
| Re-Hook Placement      | ?/10           | ?/10            | +/-    | [benchmark]     |
| Stakes Escalation      | ?/10           | ?/10            | +/-    | [benchmark]     |
| Value Density          | ?/10           | ?/10            | +/-    | [benchmark]     |
| Niche Optimization     | ?/10           | ?/10            | +/-    | [benchmark]     |
| **Composite**          | ?/10           | ?/10            | +/-    | [benchmark]     |

**If any dimension is below niche benchmark:** Flag it and provide one additional targeted fix.

**Output:** Comparison scorecard with benchmark alignment.

---

## Output Format

```
## Niche Adaptation Report

### Adaptation Summary
- Original Niche: [detected or provided]
- Target Niche: [target]
- Preserve Core: [yes/no]
- Total Changes Made: [count]

### Current Script Analysis
[Current niche assumptions table]

### Target Niche Requirements
[Key requirements summary for target niche]

### Adapted Script
[Full adapted script with change annotations]
[Changes marked with [NICHE-CHANGE: description] inline]

### Changes Log
[Table of all changes with before/after and reasoning]

### Weakness Fixes
[Common niche weaknesses checked and fixed]

### Score Comparison
[Pre vs Post adaptation scorecard against niche benchmarks]

### Remaining Gaps
[Any niche requirements not fully addressed, with suggestions]
```

---

## Validation Criteria

- [ ] Current niche assumptions correctly identified.
- [ ] Target niche pattern fully loaded and applied.
- [ ] All structural changes documented with reasoning.
- [ ] Common niche weaknesses checked and fixed where present.
- [ ] Before/after examples provided for each fix.
- [ ] Pre/post adaptation scores calculated and compared.
- [ ] Adapted script meets or exceeds niche benchmark.
- [ ] Changes preserve the core content and message (if preserve_core is true).
- [ ] Script reads naturally in the new niche context.
- [ ] No niche-inappropriate content remains.

---

## Error Handling

| Error Condition                     | Response                                                        |
|-------------------------------------|-----------------------------------------------------------------|
| Script text is empty                | Return error: "No script text provided."                        |
| Target niche not recognized         | Warn: "Niche '[niche]' not in knowledge base. Applying General patterns with closest match suggestions." |
| Current and target niche are the same | Warn: "Script appears to already be in [niche]. Running optimization pass instead of adaptation." |
| Script is too short for niche adaptation | Warn: "Script under 200 words — adaptation may be limited." |
| Structural changes would fundamentally alter content | Warn if preserve_core is true; suggest setting to false for better results. |

---

## Related Tasks

- `analyze-script.md` — Full analysis (Step 8 provides niche findings that feed this task)
- `score-script.md` — Pre/post adaptation scoring
- `optimize-retention.md` — Retention optimization can be combined with niche adaptation

---

*Task Version 1.0 — YouTube Scripts Squad*
