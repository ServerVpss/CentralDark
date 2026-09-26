# Task: Write Hook (Hook Variant Generator)

## Metadata

| Field          | Value                                      |
|----------------|--------------------------------------------|
| **Task ID**    | `YTS-TASK-004`                             |
| **Task Name**  | Write Hook                                 |
| **Version**    | 1.0                                        |
| **Purpose**    | Generate 3-5 high-quality hook variants for a YouTube video using proven frameworks. Score each variant and recommend the best option with reasoning. |
| **Executor**   | `retention-architect` agent                |
| **Trigger**    | Manual invocation or pipeline step         |
| **Priority**   | High                                       |
| **Estimated Duration** | 3-5 minutes                        |

---

## Inputs

| Input               | Required | Type     | Description                                              |
|---------------------|----------|----------|----------------------------------------------------------|
| `topic`             | Yes      | string   | The video topic or subject matter                        |
| `niche`             | Yes      | string   | Target niche (finance, crime, tech, education, etc.)     |
| `title`             | No       | string   | Video title — hooks must align with title promise        |
| `thumbnail_concept` | No       | string   | Thumbnail description — hooks must match viewer expectation |
| `audience`          | No       | string   | Target audience description                              |
| `tone`              | No       | string   | Desired tone (e.g., "serious and authoritative", "energetic and fun") |
| `script_context`    | No       | string   | Brief summary of what the full video covers (for Master Loop placement) |
| `grand_payoff`      | No       | string   | The script's grand payoff (if already defined)           |

---

## Prerequisites

- Topic must be clearly defined.
- If title and thumbnail concept are provided, all hooks must align with the promise they imply.
- If script context or grand payoff is provided, hooks must plant the Master Loop.

---

## Steps

### Step 1: Analyze Topic for Hook Angles

Before writing any hooks, identify the strongest angles:

1. **Core Question:** What is the viewer's burning question about this topic?
2. **Contrarian Angle:** What common belief about this topic can be challenged?
3. **Stakes Angle:** What are the consequences of ignoring this topic?
4. **Story Angle:** Is there a compelling story, case study, or anecdote to open with?
5. **Data Angle:** Is there a surprising statistic or number that grabs attention?
6. **Mystery Angle:** What unknown or hidden element creates a curiosity gap?
7. **Authority Angle:** What proof or credential establishes immediate trust?

For each angle, rate its hook potential (1-10) and note why.

**Output:** Angle analysis table with ratings.

---

### Step 2: Generate 3-5 Hook Variants

Write 3-5 complete hook variants (each covering the first 30-60 seconds of the video). Each variant must use a different framework or approach:

#### Hook Frameworks Available

**PVSS (Preview-Value-Social Proof-Story):**
```
[0:00-0:05] Bold claim or surprising statement (Preview)
[0:05-0:15] Why this matters to the viewer (Value)
[0:15-0:25] Proof/credentials/data (Social Proof)
[0:25-0:45] Mini story or case study teaser (Story)
[0:45-0:60] Transition + Master Loop plant
```

**TTS (Tease-Testimony-Segue):**
```
[0:00-0:10] Curiosity gap opener (Tease)
[0:10-0:25] Evidence this is worth watching (Testimony)
[0:25-0:45] Smooth transition into body (Segue)
```

**Cold Open Types:**
- **The Story Drop:** Start mid-story, no preamble.
  - "It was 3 AM when the phone rang..."
- **The Bold Claim:** Provocative, possibly controversial statement.
  - "Everything you've been told about [topic] is wrong."
- **The Question:** Rhetorical or direct question that triggers curiosity.
  - "What would you do with an extra $50,000 a year?"
- **The Stat Bomb:** Shocking data point.
  - "97% of people who try this fail. Here's why the other 3% don't."
- **The Confession:** Personal admission that creates vulnerability/trust.
  - "I lost $200,000 before I learned what I'm about to tell you."
- **The Countdown:** Urgency and scarcity.
  - "In the next 10 minutes, I'm going to show you something that most people will never figure out."
- **The Pattern Break:** Unexpected visual or tonal opener.
  - Start with dead silence, a loud sound, or mid-action footage.

#### For Each Variant, Include:

1. **Framework label** (PVSS, TTS, or Cold Open type).
2. **Full hook text** with timestamp markers ([0:00], [0:05], etc.).
3. **Estimated word count** and duration.
4. **Production cues** ([B-ROLL], [MUSIC], [VOICE] notes).
5. **Open loops planted** — identify what curiosity gaps are opened.
6. **Title/thumbnail alignment note** — how does this hook connect to the title/thumbnail?

---

### Step 3: Score Each Hook Variant

Score each variant on a 1-10 scale across these criteria:

| Criteria                     | Weight | Variant 1 | Variant 2 | Variant 3 | Variant 4 | Variant 5 |
|------------------------------|--------|-----------|-----------|-----------|-----------|-----------|
| Immediate Attention (0-5s)   | 20%    | ?/10      | ?/10      | ?/10      | ?/10      | ?/10      |
| Promise Clarity (5-15s)      | 20%    | ?/10      | ?/10      | ?/10      | ?/10      | ?/10      |
| Stakes / Why Care            | 15%    | ?/10      | ?/10      | ?/10      | ?/10      | ?/10      |
| Curiosity Gap Strength       | 15%    | ?/10      | ?/10      | ?/10      | ?/10      | ?/10      |
| Master Loop Planted          | 10%    | ?/10      | ?/10      | ?/10      | ?/10      | ?/10      |
| Natural/Conversational Tone  | 10%    | ?/10      | ?/10      | ?/10      | ?/10      | ?/10      |
| Title/Thumbnail Alignment    | 10%    | ?/10      | ?/10      | ?/10      | ?/10      | ?/10      |
| **Composite Score**          | 100%   | ?/10      | ?/10      | ?/10      | ?/10      | ?/10      |

**Provide specific justification for each score** — not just numbers.

---

### Step 4: Check Title/Thumbnail Alignment

For each hook variant, verify:

- [ ] Does the hook address what the title promises within the first 15 seconds?
- [ ] Would a viewer who clicked the thumbnail feel they are in the right place?
- [ ] Is there visual/tonal consistency between thumbnail mood and hook mood?
- [ ] Does the hook avoid introducing a topic that doesn't match the title?

**If no title/thumbnail is provided:** Note that alignment cannot be verified and suggest the creator check this manually.

**Flag any variant that has poor alignment** — even if it scores well on other criteria, a misaligned hook will cause early drop-off.

---

### Step 5: Recommend Best Variant

Provide a clear recommendation:

1. **Recommended Hook:** Which variant and why.
2. **Runner-Up:** Which variant would be the second choice and why.
3. **Niche Fit Assessment:** Which hook style best fits the target niche's audience expectations?
4. **A/B Test Suggestion:** If the creator wants to test, which two variants offer the most distinct approaches?
5. **Hybrid Suggestion:** Can elements from different variants be combined for an even stronger hook? If so, write the hybrid version.

---

## Output Format

```
## Hook Variant Report

### Topic & Context
- Topic: [topic]
- Niche: [niche]
- Title: [title or "Not provided"]
- Thumbnail: [concept or "Not provided"]

### Angle Analysis
[Table of 7 angles with ratings]

### Hook Variants

#### Variant 1: [Framework Label]
[Full hook text with timestamps and production cues]
- Word Count: [count]
- Duration: [estimate]
- Open Loops Planted: [list]
- Title Alignment: [assessment]

#### Variant 2: [Framework Label]
[...]

#### Variant 3: [Framework Label]
[...]

[Variants 4-5 if applicable]

### Scoring Matrix
[Criteria x Variant scoring table with justifications]

### Title/Thumbnail Alignment Check
[Per-variant alignment assessment]

### Recommendation
- **Best Hook:** Variant [#] — [reasoning]
- **Runner-Up:** Variant [#] — [reasoning]
- **Best Niche Fit:** Variant [#] — [reasoning]
- **A/B Test Pair:** Variants [#] and [#]
- **Hybrid Suggestion:** [Combined hook text or "Not applicable"]
```

---

## Validation Criteria

- [ ] At least 3 hook variants generated (maximum 5).
- [ ] Each variant uses a different framework or approach.
- [ ] Each variant includes full text with timestamps.
- [ ] Each variant has production cues.
- [ ] All variants scored on all 7 criteria with justification.
- [ ] Title/thumbnail alignment checked for each variant.
- [ ] Clear recommendation with reasoning provided.
- [ ] No variant begins with "Hey guys welcome back" or similar throat-clearing.
- [ ] All variants plant at least one open loop.
- [ ] Variants are written for spoken delivery (conversational, short sentences).

---

## Error Handling

| Error Condition                     | Response                                                        |
|-------------------------------------|-----------------------------------------------------------------|
| Topic is vague                      | Ask for clarification before generating hooks.                  |
| Niche not recognized                | Default to "General" hook patterns with warning.                |
| No title or thumbnail provided      | Proceed without alignment check; note in output.                |
| All variants score below 6/10       | Iterate — generate 2 additional variants with different angles. |
| Topic has limited hook angles       | Warn that the topic may need reframing; suggest alternative angles. |

---

## Related Tasks

- `write-script.md` — Full script creation (Step 6 uses hook from this task)
- `analyze-script.md` — Analyzes hook within full script context
- `score-script.md` — Includes hook strength as Dimension 1

---

*Task Version 1.0 — YouTube Scripts Squad*
