# Task: Optimize Retention (Retention-Focused Script Revision)

## Metadata

| Field          | Value                                      |
|----------------|--------------------------------------------|
| **Task ID**    | `YTS-TASK-009`                             |
| **Task Name**  | Optimize Retention                         |
| **Version**    | 1.0                                        |
| **Purpose**    | Take an existing YouTube script and optimize it specifically for viewer retention. Runs a PCCE analysis, identifies weak points, and systematically fixes open loops, pattern interrupts, re-hooks, emotional arc, transitions, and golden thread connections. |
| **Executor**   | `retention-architect` agent                |
| **Trigger**    | Manual invocation or pipeline step (often follows analyze-script or score-script) |
| **Priority**   | High                                       |
| **Estimated Duration** | 5-10 minutes (depending on script length and severity of issues) |

---

## Inputs

| Input            | Required | Type     | Description                                              |
|------------------|----------|----------|----------------------------------------------------------|
| `script_text`    | Yes      | string   | The full script text to optimize                         |
| `analysis_report`| No       | string   | Output from analyze-script task (if already run). Skips Step 1 if provided. |
| `score_report`   | No       | string   | Output from score-script task (if already run). Provides baseline scores. |
| `niche`          | No       | string   | Target niche for niche-aware optimization                |
| `target_length`  | No       | string   | Expected video length for pacing calibration             |
| `priority_dimensions` | No  | list     | Specific dimensions to prioritize (e.g., ["open_loops", "emotional_arc"]) |

---

## Prerequisites

- Script must be a full draft (not an outline).
- If an analysis report is provided, it must be from the analyze-script task format.
- The script should already have basic structure (sections, hook, body, outro).

---

## Steps

### Step 1: Run PCCE Analysis

**If `analysis_report` is provided, skip this step and use the provided analysis.**

If not, perform a quick PCCE pass:

1. **Tag every sentence** with P (Progression), C (Conflict), Cx (Context), E (Emotion), or FLAG.
2. **Calculate ratios:**
   - Target: 30% P, 20% C, 25% Cx, 20% E, <5% FLAG
   - Actual: [calculated]
3. **Flag sentences** that are pure filler, redundant, or momentum-killing.
4. **Identify context dumps** — 3 or more consecutive Cx sentences.
5. **Note emotional peaks and valleys** — where is emotion concentrated? Where is it absent?

**Quick Score Baseline:**
Run a rapid 9-dimension score to establish the starting point (or use provided `score_report`).

| Dimension              | Baseline Score | Target Score |
|------------------------|----------------|--------------|
| Hook Strength          | ?/10           | 8+           |
| PCCE Compliance        | ?/10           | 8+           |
| Open Loop Density      | ?/10           | 8+           |
| Pattern Interrupt Freq | ?/10           | 8+           |
| Emotional Arc          | ?/10           | 8+           |
| Re-Hook Placement      | ?/10           | 8+           |
| Stakes Escalation      | ?/10           | 8+           |
| Value Density          | ?/10           | 8+           |
| Niche Optimization     | ?/10           | 8+           |

**Output:** PCCE-tagged script, ratio analysis, baseline scores.

---

### Step 2: Identify Retention Weak Points

Map every point in the script where a viewer might leave:

#### Weak Point Categories

| Category              | Detection Method                                              | Severity  |
|-----------------------|---------------------------------------------------------------|-----------|
| Dead Zone             | No open loops, no tension, no curiosity gap for >30 seconds   | Critical  |
| Context Dump          | 3+ consecutive Cx sentences without P or C                    | High      |
| Missing Re-Hook       | 25%, 50%, or 75% mark without a re-hook                      | High      |
| PI Gap                | >90 seconds between pattern interrupts                        | High      |
| Emotional Flatline    | Same emotional register for >90 seconds                       | Medium    |
| Weak Transition       | "And then" connection instead of But/Therefore                | Medium    |
| Dangling Loop         | Open loop that is never closed                                | Medium    |
| Stakes Plateau        | Stakes level flat for 2+ consecutive sections                 | Medium    |
| Golden Thread Break   | Section that doesn't connect back to the main throughline     | Medium    |
| Filler/FLAG Content   | Sentence that adds no progression, conflict, or emotion       | Low       |

#### Weak Point Map

| # | Position (timestamp/word#) | Category          | Severity | Current Text (excerpt) | Impact Description |
|---|---------------------------|-------------------|----------|------------------------|--------------------|
| 1 | [position]                | [category]        | [sev]    | "[text excerpt]"       | [why viewers leave here] |
| 2 | [position]                | [category]        | [sev]    | "[text excerpt]"       | [why viewers leave here] |
| ...| ...                      | ...               | ...      | ...                    | ...                |

**Output:** Weak point map sorted by position (timeline order).

---

### Step 3: Add Missing Open Loops

Review the open loop inventory and add loops where needed:

#### Current Open Loop Status
| Loop ID | Open Position | Close Position | Type       | Status    |
|---------|---------------|----------------|------------|-----------|
| L1      | [pos]         | [pos]          | [type]     | OK / Fix  |
| ...     | ...           | ...            | ...        | ...       |

#### Required Additions

For each identified gap (any point after the hook where zero loops are open):

| Gap Position        | New Loop to Add                                      | Loop Type   |
|---------------------|------------------------------------------------------|-------------|
| [position]          | "[Exact text to insert]"                             | [type]      |

**Open Loop Types:**
- **Question Loop:** "But why does this actually work?" (answered later)
- **Mystery Loop:** "There's one detail nobody noticed..." (revealed later)
- **Promise Loop:** "In a minute, I'll show you exactly how..." (delivered later)
- **Teaser Loop:** "The third example is the one that changed everything..." (reached later)
- **Unresolved Conflict:** "But this created a massive problem..." (resolved later)

**Rules:**
- At least 1 open loop must be active at all times after the hook.
- Peak simultaneous loops should be 3-5 (not more — overwhelming).
- Every opened loop must be closed (dangling loops frustrate viewers).
- The Master Loop (grand payoff) must be opened in the hook and closed at the end.
- New loops should open just before potential drop-off points.

**Output:** Updated open loop map with additions marked.

---

### Step 4: Insert Pattern Interrupts

Review pattern interrupt frequency and add where gaps exist:

#### Current Pattern Interrupt Timeline
| PI ID | Position | Type            | Gap Since Last PI |
|-------|----------|-----------------|-------------------|
| PI-1  | [pos]    | [type]          | —                 |
| PI-2  | [pos]    | [type]          | [seconds]         |
| ...   | ...      | ...             | ...               |

#### Gaps Identified (>60 seconds between interrupts)

| Gap Start | Gap End | Duration | Insertion Point | New PI Text                        | PI Type      |
|-----------|---------|----------|-----------------|------------------------------------|--------------|
| [pos]     | [pos]   | [sec]   | [where]         | "[Exact text to insert]"          | [type]       |

**Pattern Interrupt Types:**
- **Tonal Shift:** Change from serious to light (or vice versa). `[VOICE: shift to conversational]`
- **Story Drop:** Mini anecdote that illustrates the point. "This reminds me of..."
- **Rhetorical Question:** "But here's what I don't understand..."
- **Analogy/Metaphor:** "Think of it like..." (unexpected comparison)
- **Data Drop:** Surprising statistic. "Studies show that 94% of..."
- **Humor:** Brief comedic aside or observation.
- **Visual Cue:** `[B-ROLL: dramatic shift]` or `[GRAPHIC: surprising chart]`
- **Direct Address:** Break fourth wall. "Now you might be thinking..."
- **Pace Change:** `[VOICE: slow down dramatically]` or `[VOICE: rapid fire]`

**Rules:**
- Average gap should be 45-60 seconds.
- No gap should exceed 90 seconds.
- Vary types — never two consecutive interrupts of the same type.
- Interrupts must feel organic, not bolted on.
- At least one interrupt in the first 30 seconds.

**Output:** Updated pattern interrupt timeline with insertions marked.

---

### Step 5: Strengthen Re-Hooks at Critical Marks

Verify and strengthen re-hooks at 25%, 50%, and 75% marks:

#### Re-Hook Assessment

| Mark | Position      | Current Re-Hook                    | Strength | Action Needed         |
|------|---------------|---------------------------------------|----------|----------------------|
| 25%  | [word/time]   | "[text]" or "MISSING"                | ?/10     | Keep / Strengthen / Add |
| 50%  | [word/time]   | "[text]" or "MISSING"                | ?/10     | Keep / Strengthen / Add |
| 75%  | [word/time]   | "[text]" or "MISSING"                | ?/10     | Keep / Strengthen / Add |

#### Re-Hook Templates (for additions or replacements)

**Stakes Escalation Re-Hook:**
"But here's where it gets really interesting..." / "And that's not even the worst part..."

**Teaser Re-Hook:**
"In just a moment, I'm going to show you something that most people never figure out..."

**Open Loop Re-Hook:**
"But there's one critical detail we haven't covered yet — and it changes everything."

**Curiosity Re-Hook:**
"Now, you might think you know where this is going. You don't."

**Value Preview Re-Hook:**
"The next part is the most important — and it's the reason I made this entire video."

**For each re-hook that needs action, provide:**
- Exact text to insert or replace.
- Why this re-hook works at this specific position.
- What open loop or stakes escalation it connects to.

**Output:** Updated re-hook placements with exact text.

---

### Step 6: Fix Emotional Arc Dead Zones

Address any segments where emotional engagement flatlines:

#### Emotional Arc Status

| Segment (10% blocks) | Current Register   | Duration | Status                  |
|-----------------------|--------------------|---------|-----------------------|
| 0-10%                | [register]         | [sec]   | OK / Dead Zone / Flat |
| 10-20%               | [register]         | [sec]   | OK / Dead Zone / Flat |
| 20-30%               | [register]         | [sec]   | OK / Dead Zone / Flat |
| 30-40%               | [register]         | [sec]   | OK / Dead Zone / Flat |
| 40-50%               | [register]         | [sec]   | OK / Dead Zone / Flat |
| 50-60%               | [register]         | [sec]   | OK / Dead Zone / Flat |
| 60-70%               | [register]         | [sec]   | OK / Dead Zone / Flat |
| 70-80%               | [register]         | [sec]   | OK / Dead Zone / Flat |
| 80-90%               | [register]         | [sec]   | OK / Dead Zone / Flat |
| 90-100%              | [register]         | [sec]   | OK / Dead Zone / Flat |

#### Fixes for Dead Zones

For each dead zone or flat segment:

| Segment | Problem                    | Fix                                    | New Register |
|---------|----------------------------|----------------------------------------|-------------|
| [seg]   | [what's wrong]             | "[Exact text/change to add]"           | [register]  |

**Emotional Register Options:**
Curiosity, Tension, Relief, Excitement, Awe, Humor, Fear, Sadness, Anger, Calm, Surprise, Empathy.

**Rules:**
- The pendulum must shift at least every 90 seconds.
- Consecutive segments should not have the same register (unless building to a climax).
- The emotional climax should align with the grand payoff.
- The ending should leave the viewer with a specific emotional state (satisfied, inspired, curious).

**Output:** Fixed emotional arc with dead zones resolved.

---

### Step 7: Apply But/Therefore Rule to Transitions

Review every transition between sections and between major ideas:

#### Transition Audit

| Transition # | From Section | To Section | Current Transition                   | Type          | Action    |
|-------------|-------------|-----------|--------------------------------------|---------------|-----------|
| T1          | [section]   | [section] | "[current text]"                     | And Then / But / Therefore | Keep / Fix |
| T2          | ...         | ...       | ...                                  | ...           | ...       |

#### Fixing "And Then" Transitions

For each "And Then" transition:

```
BEFORE: "[Current transition text]"
AFTER: "[Rewritten with But/Therefore logic]"
WHY: [How this maintains momentum]
```

**The But/Therefore Rule:**
- **"But..."** = introduces complication, twist, or unexpected turn.
  - "You'd think this solves everything. *But* there's a catch nobody talks about."
- **"Therefore..."** = shows consequence or logical next step.
  - "The data was clear. *Therefore*, they had no choice but to change course."
- **"And then..."** = adds information without tension (AVOID).
  - This tells the viewer nothing unexpected is coming — safe to leave.

**Rules:**
- Every section transition should use But or Therefore logic.
- "And then" is only acceptable for minor within-section connections.
- If a transition uses But, the next should ideally use Therefore (alternating creates rhythm).

**Output:** Transition audit table with all "And Then" transitions fixed.

---

### Step 8: Optimize Golden Thread Connections

Verify the golden thread (main throughline) is consistently referenced:

#### Golden Thread Statement
"[The one sentence that connects all sections — identified or inferred from script]"

#### Thread Check

| Section | Golden Thread Reference Present? | Reference Text                    | Strength |
|---------|----------------------------------|-----------------------------------|----------|
| Hook    | Yes / No                         | "[text]" or "Missing"             | ?/10     |
| Seg 1   | Yes / No                         | "[text]" or "Missing"             | ?/10     |
| Seg 2   | Yes / No                         | "[text]" or "Missing"             | ?/10     |
| Seg 3   | Yes / No                         | "[text]" or "Missing"             | ?/10     |
| ...     | ...                              | ...                               | ...      |
| Outro   | Yes / No                         | "[text]" or "Missing"             | ?/10     |

#### Fixes for Missing Thread References

For each section where the golden thread is missing or weak:

```
SECTION: [Name]
CURRENT: [Current text that should reference the thread]
IMPROVED: "[Text with golden thread woven in]"
CONNECTION: [How this ties back to the main throughline]
```

**Rules:**
- The golden thread should be explicitly or implicitly referenced in every section.
- References should not be repetitive (same phrasing) — vary the wording.
- The strongest thread reference should be at the grand payoff.
- At no point should a viewer forget what the video is about.

**Output:** Golden thread verification table with fixes.

---

## Output Format

```
## Retention Optimization Report

### Baseline Assessment
- Composite Score (Before): [X/10]
- Critical Weak Points: [count]
- High Weak Points: [count]
- Medium Weak Points: [count]

### Optimized Script
[Complete script with all changes highlighted]
[Changes marked with [RET-FIX: category] inline]

### Changes Summary

#### Open Loops
- Added: [count]
- Fixed: [count]
- Simultaneous Peak: [before] -> [after]

#### Pattern Interrupts
- Added: [count]
- Average Gap: [before] -> [after]
- Longest Gap: [before] -> [after]

#### Re-Hooks
- 25%: [status]
- 50%: [status]
- 75%: [status]

#### Emotional Arc
- Dead Zones Fixed: [count]
- Pendulum Shifts: [before] -> [after]

#### Transitions
- "And Then" Fixed: [count] / [total transitions]

#### Golden Thread
- Missing References Fixed: [count]

### Score Comparison

| Dimension              | Before | After  | Change |
|------------------------|--------|--------|--------|
| Hook Strength          | ?/10   | ?/10   | +/-    |
| PCCE Compliance        | ?/10   | ?/10   | +/-    |
| Open Loop Density      | ?/10   | ?/10   | +/-    |
| Pattern Interrupt Freq | ?/10   | ?/10   | +/-    |
| Emotional Arc          | ?/10   | ?/10   | +/-    |
| Re-Hook Placement      | ?/10   | ?/10   | +/-    |
| Stakes Escalation      | ?/10   | ?/10   | +/-    |
| Value Density          | ?/10   | ?/10   | +/-    |
| Niche Optimization     | ?/10   | ?/10   | +/-    |
| **Composite**          | ?/10   | ?/10   | +/-    |

### Remaining Issues
[Any issues not fully resolved, with suggestions for manual improvement]
```

---

## Validation Criteria

- [ ] PCCE analysis completed (or provided analysis used).
- [ ] All retention weak points identified and mapped.
- [ ] Open loop gaps filled — at least 1 loop open at all times.
- [ ] Pattern interrupt gaps filled — no gap >90 seconds.
- [ ] Re-hooks present and strong at 25%, 50%, 75%.
- [ ] Emotional dead zones resolved — pendulum shifts every 90s.
- [ ] All "And Then" transitions replaced with But/Therefore.
- [ ] Golden thread referenced in every section.
- [ ] Before/after scores calculated and compared.
- [ ] All changes marked inline in the optimized script.
- [ ] Changes feel organic — not forced or mechanical.
- [ ] Optimized script reads naturally when spoken aloud.

---

## Error Handling

| Error Condition                     | Response                                                        |
|-------------------------------------|-----------------------------------------------------------------|
| Script text is empty                | Return error: "No script text provided."                        |
| Script is an outline                | Warn: "Input appears to be an outline. Retention optimization requires full sentences. Proceeding with limited optimization." |
| Script already scores 9+ on retention dimensions | Still provide at least 3 marginal improvements. |
| Provided analysis_report format is unexpected | Warn and run fresh PCCE analysis instead. |
| Script has no clear sections        | Suggest sectioning first, then optimize.                        |
| Script under 200 words              | Warn: "Script is very short — some retention mechanics (re-hooks, multiple open loops) may not apply at this length." |

---

## Related Tasks

- `analyze-script.md` — Provides the analysis that feeds this optimization
- `score-script.md` — Provides baseline scores for comparison
- `write-script.md` — Step 4 (Wizard Hat) performs initial retention optimization
- `adapt-niche.md` — Can be combined with retention optimization

---

*Task Version 1.0 — YouTube Scripts Squad*
