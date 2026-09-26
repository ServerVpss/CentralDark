# Task: Rewrite Script (Holistic Script Rewrite Based on Scorecard)

## Metadata

| Field          | Value                                      |
|----------------|--------------------------------------------|
| **Task ID**    | `YTS-TASK-010`                             |
| **Task Name**  | Rewrite Script                             |
| **Version**    | 1.0                                        |
| **Purpose**    | Take an existing script that scored below 9.5 and perform a holistic, root-cause-driven rewrite based on scorecard feedback. Determines whether the script needs structural replanning (4-Hat Method) or surface-level polish, applies targeted fixes, and re-optimizes all retention mechanics. |
| **Executor**   | Variable — the original specialist agent (e.g., `retention-architect`, `script-specialist`, etc.) |
| **Trigger**    | Manual invocation or pipeline step (after `score-script` task returns score < 9.5) |
| **Priority**   | High                                       |
| **Estimated Duration** | 10-25 minutes (depending on severity and whether structural replanning is needed) |

---

## Inputs

| Input            | Required | Type     | Description                                              |
|------------------|----------|----------|----------------------------------------------------------|
| `script_text`    | Yes      | string   | The original script that scored below 9.5                |
| `scorecard`      | Yes      | object   | Output from `score-script` task with all 9 dimension scores and feedback |
| `fix_list`       | Yes      | list     | Top 3 issues from scorecard with specific fixes and before/after examples |
| `target_score`   | No       | number   | Target composite score to achieve (default: 9.5)         |
| `niche`          | No       | string   | Target niche (if available from original script metadata)|
| `target_length`  | No       | string   | Expected video length (if available)                     |
| `preserve_intent`| No       | boolean  | If true, preserve the core message and topic. Default: true. |

---

## Prerequisites

- Original script must be complete (not an outline).
- Scorecard must be from `score-script` task with all 9 dimensions scored.
- Fix list must include at least 1 specific issue with actionable fix.

---

## Steps

### Step 1: Analyze Scorecard and Identify Root Causes

**DO NOT jump directly to applying fixes. First understand WHY the script scored low.**

#### Parse Scorecard Results

| Dimension              | Score | Weight | Weighted Score | Status        |
|------------------------|-------|--------|----------------|---------------|
| Hook Strength          | ?/10  | 15%    | ?              | Pass/Weak/Fail|
| PCCE Compliance        | ?/10  | 10%    | ?              | Pass/Weak/Fail|
| Open Loop Density      | ?/10  | 10%    | ?              | Pass/Weak/Fail|
| Pattern Interrupt Freq | ?/10  | 10%    | ?              | Pass/Weak/Fail|
| Emotional Arc          | ?/10  | 10%    | ?              | Pass/Weak/Fail|
| Re-Hook Placement      | ?/10  | 10%    | ?              | Pass/Weak/Fail|
| Stakes Escalation      | ?/10  | 10%    | ?              | Pass/Weak/Fail|
| Value Density          | ?/10  | 15%    | ?              | Pass/Weak/Fail|
| Niche Optimization     | ?/10  | 10%    | ?              | Pass/Weak/Fail|
| **Composite**          | ?/10  | 100%   | ?              | FAIL (<9.5)   |

**Status Definitions:**
- **Pass**: 8.0+ (no action needed)
- **Weak**: 6.0-7.9 (needs improvement)
- **Fail**: <6.0 (critical issue)

---

#### Identify Root Causes vs Symptoms

For each Weak or Fail dimension, determine if the issue is a **symptom** or a **root cause**:

**Common Root Cause Patterns:**

| Symptom (what scorecard shows) | Root Cause (actual problem) |
|--------------------------------|----------------------------|
| Low Open Loop Density (4/10)  | Structural: No clear grand payoff to tease. Script lacks throughline. |
| Weak Hook (5/10)              | Structural: Hook doesn't align with what the script actually delivers. Mismatch between promise and content. |
| Low PCCE (5/10) + Low Value Density (4/10) | Surface: Too much filler, no specific examples. Needs content polish, not restructuring. |
| Low Emotional Arc (4/10) + Flat Stakes (5/10) | Structural: Script is purely informational with no narrative tension. Needs STP restructuring. |
| Low Re-Hook Placement (3/10) + Low Pattern Interrupts (4/10) | Surface: Missing retention tactics. Can be fixed by inserting mechanics without changing structure. |
| Low Niche Optimization (5/10) | Structural: Using wrong format for niche (e.g., chronological crime story when non-chronological is preferred). |
| Multiple dimensions <5.0      | Structural: Fundamental script architecture is broken. Needs full replanning. |

**Root Cause Categories:**

1. **Structural Issues** — The script's architecture is flawed:
   - No clear grand payoff
   - Sections don't build toward anything
   - Wrong structure for niche
   - Hook promises something the script doesn't deliver
   - No throughline connecting sections
   - Chronological trap (boring buildup)

2. **Surface Issues** — The content exists but execution is weak:
   - Missing specific examples or data
   - Filler and redundancy
   - Missing retention mechanics (loops, interrupts, re-hooks)
   - Emotional flatness (no tonal variation)
   - Weak transitions (And Then instead of But/Therefore)
   - Generic language instead of specific

**Output:** Root cause assessment table with clear categorization of each weak dimension.

---

#### Root Cause Assessment Table

| Dimension (if Weak/Fail) | Score | Issue Description | Root Cause or Symptom? | Category | Severity |
|--------------------------|-------|-------------------|------------------------|----------|----------|
| [dimension]              | ?/10  | [what scorecard flagged] | [root/symptom]    | Structural/Surface | Critical/High/Medium |
| ...                      | ...   | ...               | ...                    | ...      | ...      |

**Severity Definitions:**
- **Critical**: Score <5.0 or affects multiple dimensions
- **High**: Score 5.0-6.9
- **Medium**: Score 7.0-7.9

---

### Step 2: Determine Rewrite Strategy

Based on the root cause analysis, choose ONE of two strategies:

#### Strategy Decision Matrix

| Condition | Strategy | Approach |
|-----------|----------|----------|
| 3+ dimensions with Structural root causes | **FULL REPLANNING** (4-Hat Method) | Go to Step 3 |
| Composite <6.0 with no clear grand payoff | **FULL REPLANNING** (4-Hat Method) | Go to Step 3 |
| Hook score <5.0 AND content doesn't match promise | **FULL REPLANNING** (4-Hat Method) | Go to Step 3 |
| All root causes are Surface issues | **TARGETED POLISH** | Go to Step 4 |
| Mix of 1-2 Structural + Surface issues | **TARGETED POLISH with Structural Fixes** | Go to Step 4 (address structural issues first) |

**Decision:**
```
STRATEGY SELECTED: [Full Replanning / Targeted Polish]
REASON: [Specific justification based on root cause analysis]
```

**Output:** Strategy decision with reasoning.

---

### Step 3: Full Replanning (4-Hat Method)

**ONLY execute this step if Strategy = FULL REPLANNING.**

If Surface issues are dominant, skip to Step 4.

---

#### Hat 1: Artist — Extract and Expand Core Ideas

**Goal:** Salvage the valuable ideas from the failing script and expand with fresh angles.

**Actions:**

1. **Extract core topic and key points** from original script:
   - What is the script actually about?
   - What are the 3-5 most valuable insights in the original?
   - What stories, data, or examples are worth keeping?

2. **Identify what was PROMISED but not DELIVERED:**
   - Review the original hook — what did it promise?
   - What did the viewer expect based on the opening?
   - What's missing from the current script?

3. **Brainstorm new angles and ideas:**
   - What additional stories, data, or examples could strengthen the topic?
   - What counterintuitive angles are missing?
   - What "oh!" moments could be added?

4. **Define the TRUE Grand Payoff:**
   - The original script may lack a clear payoff. What SHOULD the payoff be?
   - Write it in one sentence: "By the end, the viewer will understand/realize/be able to do: _______"

5. **List "oh!" moments to include:**
   - Minimum 5 moments of surprise, insight, or emotional impact.

**Rules:**
- Do NOT structure yet — this is pure ideation.
- Aim for 2x the ideas you'll actually use.
- The Grand Payoff must be specific and valuable.

**Output:** Raw idea dump, True Grand Payoff statement, list of "oh!" moments, salvaged content from original.

---

#### Hat 2: Architect — Rebuild Structure

**Goal:** Create a new, retention-optimized structure using STP segments.

**Actions:**

1. **Cut ruthlessly** — From the Artist phase, remove anything that does not serve the Grand Payoff. Be brutal. This is where most scripts fail — keeping too much fluff.

2. **Create 5-7 STP Segments:**
   - Each segment must have:
     - **S**etup: What context does the viewer need?
     - **T**ension: What problem, question, or conflict drives this segment?
     - **P**ayoff: What insight or resolution does this segment deliver?

3. **Sequence segments for maximum engagement:**
   - Start with the most attention-grabbing segment (NOT chronological unless necessary).
   - Build stakes progressively — each segment should feel higher stakes than the last.
   - Place the Grand Payoff segment last (or second-to-last with brief resolution).

4. **Map the Golden Thread:**
   - Write one sentence that connects all segments.
   - Every section must tie back to this thread.

5. **Plan Open Loops:**
   - Master Loop (Grand Payoff) opens in hook, closes at end.
   - Identify 5-8 additional loops throughout the script.
   - Ensure at least 3 simultaneous loops at peak.
   - Every loop must have an open point and close point.

6. **Plan Pattern Interrupts:**
   - Place interrupts every 45-60 seconds.
   - Vary types: tonal shift, story, question, analogy, visual cue, humor, data drop.

7. **Plan Re-Hooks at 25%, 50%, 75% marks:**
   - Each must tease upcoming content or escalate stakes.

8. **Calculate Timing:**
   - Hook: 200-450 words (1.5-3 min).
   - Body segments: proportional to importance.
   - Outro/CTA: 150-300 words.

**Output:** Segment outline with STP structure, golden thread statement, open loop map, pattern interrupt plan, re-hook placements, timing allocation.

---

#### Hat 3: Writer — Draft the Rewritten Script

**Goal:** Write the full script following the new structure.

**Actions:**

1. **Write each segment in full sentences** following the STP structure from Hat 2.

2. **Apply the But/Therefore Rule:**
   - Between sections, use "But..." or "Therefore..." transitions (NOT "And then...").
   - This ensures causal connections and maintains momentum.

3. **Build tension within each segment:**
   - Setup creates curiosity.
   - Tension creates suspense or conflict.
   - Payoff delivers resolution — but opens a new question for the next segment.

4. **Flesh out stories and examples with SPECIFICS:**
   - Use names, dates, numbers, places.
   - Show, don't tell.
   - Use present tense for immediacy.

5. **Write naturally for spoken delivery:**
   - Use contractions (it's, don't, you'd).
   - Keep sentences short (average 12-15 words).
   - Use rhetorical questions to engage.
   - Avoid academic phrasing.

6. **Rewrite the hook using PVSS + TTS frameworks:**
   - **PVSS**: Preview, Value, Social Proof, Story
   - **TTS**: Tease, Testimony, Segue
   - Ensure first 5 seconds are immediately engaging.
   - Title/thumbnail promise addressed within 15 seconds.
   - At least one open loop planted by second 30.

**Output:** Full rewritten script (Draft 0) with all segments written.

---

#### Hat 4: Wizard — Retention Optimization

**Goal:** Layer in all retention mechanics.

**Actions:**

1. **Highlight every "oh!" moment** with `[OH!]`.

2. **Add PCCE tags to every sentence:**
   - P (Progression), C (Conflict), Cx (Context), E (Emotion), FLAG (filler).
   - Target ratio: 30% P, 20% C, 25% Cx, 20% E, <5% FLAG.
   - Remove or rewrite any sentence tagged FLAG.

3. **Insert Pattern Interrupts:**
   - Mark each with `[PI: type]`.
   - Ensure one every 45-60 seconds.
   - Vary types.

4. **Add Re-Hooks at 25%, 50%, 75%:**
   - Mark each with `[RE-HOOK @ X%]`.
   - Each must tease or escalate.

5. **Map Emotional Arc:**
   - Assign emotional register to each segment.
   - Ensure pendulum shifts every 90 seconds.
   - Verify climax aligns with Grand Payoff.

6. **Verify Open Loops:**
   - All planned loops opened and closed at correct positions.
   - At least 1 loop open at all times after hook.
   - Master Loop closes at Grand Payoff.

7. **Verify Stakes Escalation:**
   - Stakes higher in each segment.
   - No resets without rebuild.

8. **Remove Dead Zones:**
   - Any point where viewer could leave without missing promise must be fixed.

9. **Add Production Cues:**
   - B-roll, graphics, music, voice direction throughout.

**Output:** Fully optimized rewritten script with all retention mechanics annotated.

---

**After completing Hats 1-4, skip to Step 6 (Cross-Check).**

---

### Step 4: Targeted Polish (Surface Fixes)

**ONLY execute this step if Strategy = TARGETED POLISH.**

If Full Replanning was executed, this step is skipped.

---

#### Apply Targeted Fixes to Each Flagged Dimension

For each dimension that scored Weak or Fail, apply the specific fix from the scorecard's `fix_list`.

**Process for each fix:**

1. **Identify the exact issue** in the original script.
2. **Understand the impact** — why this costs retention or engagement.
3. **Apply the fix** — make the specific change recommended in the scorecard.
4. **Verify the fix doesn't break other dimensions** (see Step 5: Cross-Check).

---

#### Fix Application Table

For each of the top 3 issues (and any additional Weak/Fail dimensions):

**Issue #1: [Name from Scorecard]**

- **Dimension Affected:** [Dimension name]
- **Current Score:** [Score]
- **Problem:** [Specific description with evidence from original script]
- **Impact:** [What this costs in retention/engagement]
- **Fix Applied:** [Exact change made]
- **Before (from original script):**
  ```
  [Quote exact text from original]
  ```
- **After (rewritten):**
  ```
  [New text with fix applied]
  ```
- **Expected Score Improvement:** [Current] → [Projected]

---

**Issue #2: [Name]**

[Same format as Issue #1]

---

**Issue #3: [Name]**

[Same format as Issue #1]

---

**Continue for all Weak/Fail dimensions.**

---

#### Address Specific Dimension Categories

**If Hook Strength is Weak/Fail (<8.0):**
- Rewrite opening 5 seconds with bold claim, surprising stat, or provocative question.
- Ensure video promise is clear within 15 seconds.
- Plant Master Loop by second 30.
- No throat-clearing.

**If PCCE Compliance is Weak/Fail (<8.0):**
- Tag every sentence.
- Remove all FLAG sentences (filler, redundancy).
- Break up context dumps (3+ consecutive Cx sentences).
- Target ratio: 30% P, 20% C, 25% Cx, 20% E, <5% FLAG.

**If Open Loop Density is Weak/Fail (<8.0):**
- Identify gaps where zero loops are open.
- Add loops at gaps (use question, mystery, promise, teaser, or unresolved conflict types).
- Ensure 3+ simultaneous loops at peak.
- Close all loops — no dangling.

**If Pattern Interrupt Freq is Weak/Fail (<8.0):**
- Identify gaps >90 seconds between interrupts.
- Insert interrupts (tonal shift, story, question, analogy, visual, humor, data).
- Vary types.
- Ensure first interrupt within 30 seconds.

**If Emotional Arc is Weak/Fail (<8.0):**
- Map current emotional registers by segment.
- Identify dead zones or flat segments (same register >90s).
- Add tonal shifts, contrast, or emotional spikes to break flatness.
- Ensure climax aligns with Grand Payoff.

**If Re-Hook Placement is Weak/Fail (<8.0):**
- Check 25%, 50%, 75% marks.
- Add missing re-hooks with stakes escalation, teaser, open loop, or value preview.
- Strengthen weak re-hooks (score <6).

**If Stakes Escalation is Weak/Fail (<8.0):**
- Identify plateaus (2+ sections at same stakes level).
- Escalate stakes progressively through script.
- Ensure highest stakes at climax.
- Fix any stakes resets without rebuild.

**If Value Density is Weak/Fail (<8.0):**
- Replace generic statements with specific examples, data, numbers, names.
- Remove vague advice.
- Add insights per minute (aim for 1-2 valuable moments per minute).
- Ensure every section delivers tangible value.
- Add actionable takeaways.

**If Niche Optimization is Weak/Fail (<8.0):**
- Load target niche pattern (see `adapt-niche.md` Step 2 for niche patterns).
- Apply niche-specific structure, evidence types, tone, pacing.
- Fix common niche weaknesses.
- Ensure benchmark alignment.

**Output:** Rewritten script with all targeted fixes applied and annotated with `[FIX: dimension]` inline.

---

### Step 5: Cross-Check for Unintended Consequences

**CRITICAL:** Fixes can introduce NEW problems. After applying fixes, verify that no new issues have been created.

#### Cross-Check Matrix

For every fix applied, check these potential side effects:

| Fix Applied | Check For | Potential Issue | Action if Found |
|-------------|-----------|-----------------|-----------------|
| Added Open Loops | All loops closed? | Dangling loop | Close it or remove it |
| Strengthened Hook | Hook aligns with body? | Overpromising | Adjust hook or add content to body |
| Removed FLAG content | Sections still have context? | Context gap | Add minimal necessary context |
| Added Pattern Interrupts | Interrupts feel organic? | Forced or mechanical | Rewrite to feel natural |
| Escalated Stakes | Stakes realistic? | Unbelievable stakes | Dial back to realistic level |
| Added Specifics | Data/examples accurate? | Factual errors | Verify or remove |
| Changed Emotional Arc | Tonal shifts smooth? | Jarring transitions | Smooth with transitional language |
| Reordered Sections | Golden thread intact? | Broken throughline | Reconnect sections to thread |
| Added Re-Hooks | Re-hooks deliver on promise? | Unfulfilled tease | Ensure payoff exists later |
| Increased Value Density | Pacing too fast? | Overwhelming viewer | Adjust pacing or spread insights |

**For each fix, explicitly verify:**
- [ ] Fix does NOT create a new problem in another dimension.
- [ ] Fix does NOT overpromise without delivering.
- [ ] Fix does NOT break the golden thread.
- [ ] Fix does NOT feel forced or unnatural.
- [ ] Fix maintains the original intent (if `preserve_intent` is true).

**Output:** Cross-check verification table with any secondary fixes needed.

---

### Step 6: Re-Optimize Retention Mechanics

**Even if Full Replanning was done, this is a final polish pass. If Targeted Polish was done, this ensures all mechanics are working together.**

#### Final Retention Audit

Run through each retention mechanic and verify optimal implementation:

**1. Open Loops — Final Verification**

| Loop ID | Type       | Open Position | Close Position | Status     | Action |
|---------|------------|---------------|----------------|------------|--------|
| Master  | [type]     | Hook          | Near end       | OK/Fix     | [action if needed] |
| L1      | [type]     | [position]    | [position]     | OK/Fix     | [action if needed] |
| L2      | [type]     | [position]    | [position]     | OK/Fix     | [action if needed] |
| ...     | ...        | ...           | ...            | ...        | ...    |

- [ ] At least 1 loop open at all times after hook.
- [ ] 3+ simultaneous loops at peak.
- [ ] All loops closed — no dangling.
- [ ] Master Loop closes at Grand Payoff.

---

**2. Pattern Interrupts — Final Verification**

| PI ID | Position | Type            | Gap Since Last PI | Status | Action |
|-------|----------|-----------------|-------------------|--------|--------|
| PI-1  | [pos]    | [type]          | —                 | OK/Fix | [action if needed] |
| PI-2  | [pos]    | [type]          | [seconds]         | OK/Fix | [action if needed] |
| ...   | ...      | ...             | ...               | ...    | ...    |

- [ ] Average frequency 45-60 seconds.
- [ ] No gap >90 seconds.
- [ ] Types vary.
- [ ] First interrupt within 30 seconds.

---

**3. Re-Hooks — Final Verification**

| Mark | Position      | Re-Hook Text (excerpt)             | Strength | Status | Action |
|------|---------------|------------------------------------|----------|--------|--------|
| 25%  | [word/time]   | "[text]"                           | ?/10     | OK/Fix | [action if needed] |
| 50%  | [word/time]   | "[text]"                           | ?/10     | OK/Fix | [action if needed] |
| 75%  | [word/time]   | "[text]"                           | ?/10     | OK/Fix | [action if needed] |

- [ ] All 3 re-hooks present.
- [ ] Each scores 7+.
- [ ] Each teases or escalates.

---

**4. Emotional Arc — Final Verification**

| Segment (10% blocks) | Register      | Duration | Status     |
|----------------------|---------------|----------|------------|
| 0-10%                | [register]    | [sec]    | OK/Fix     |
| 10-20%               | [register]    | [sec]    | OK/Fix     |
| 20-30%               | [register]    | [sec]    | OK/Fix     |
| 30-40%               | [register]    | [sec]    | OK/Fix     |
| 40-50%               | [register]    | [sec]    | OK/Fix     |
| 50-60%               | [register]    | [sec]    | OK/Fix     |
| 60-70%               | [register]    | [sec]    | OK/Fix     |
| 70-80%               | [register]    | [sec]    | OK/Fix     |
| 80-90%               | [register]    | [sec]    | OK/Fix     |
| 90-100%              | [register]    | [sec]    | OK/Fix     |

- [ ] Pendulum shifts every 90 seconds.
- [ ] No dead zones.
- [ ] Climax aligns with Grand Payoff.

---

**5. Stakes Escalation — Final Verification**

| Section | Stakes Level | Trend      | Status |
|---------|--------------|------------|--------|
| Hook    | [level]      | —          | OK     |
| Seg 1   | [level]      | Rising/Flat| OK/Fix |
| Seg 2   | [level]      | Rising/Flat| OK/Fix |
| Seg 3   | [level]      | Rising/Flat| OK/Fix |
| ...     | ...          | ...        | ...    |
| Climax  | [level]      | Peak       | OK/Fix |

- [ ] Stakes rise progressively.
- [ ] No plateaus >2 sections.
- [ ] Peak at climax.

---

**6. Golden Thread — Final Verification**

| Section | Golden Thread Reference Present? | Reference Text | Strength |
|---------|----------------------------------|----------------|----------|
| Hook    | Yes/No                           | "[text]"       | ?/10     |
| Seg 1   | Yes/No                           | "[text]"       | ?/10     |
| Seg 2   | Yes/No                           | "[text]"       | ?/10     |
| ...     | ...                              | ...            | ...      |
| Outro   | Yes/No                           | "[text]"       | ?/10     |

- [ ] Thread referenced in every section.
- [ ] References vary in wording.
- [ ] Strongest reference at Grand Payoff.

**Output:** Final retention audit tables with all mechanics verified or fixed.

---

### Step 7: Self-Score the Rewrite

**Before submitting to `score-script` for official re-scoring, perform an honest self-assessment.**

#### Self-Score Rubric

Using the same 9-dimension rubric from `score-script.md`:

| #  | Dimension              | Weight | Original Score | Rewrite Score | Self-Justification |
|----|------------------------|--------|----------------|--------------|--------------------|
| 1  | Hook Strength          | 15%    | ?/10           | ?/10         | [Specific reasoning with evidence from rewritten script] |
| 2  | PCCE Compliance        | 10%    | ?/10           | ?/10         | [P:C:Cx:E ratios, FLAG %] |
| 3  | Open Loop Density      | 10%    | ?/10           | ?/10         | [Count, simultaneous peak, all closed?] |
| 4  | Pattern Interrupt Freq | 10%    | ?/10           | ?/10         | [Average frequency, longest gap] |
| 5  | Emotional Arc          | 10%    | ?/10           | ?/10         | [Pendulum frequency, dead zones?] |
| 6  | Re-Hook Placement      | 10%    | ?/10           | ?/10         | [Present at 25/50/75? Strength?] |
| 7  | Stakes Escalation      | 10%    | ?/10           | ?/10         | [Trajectory, resets?] |
| 8  | Value Density          | 15%    | ?/10           | ?/10         | [Insights per minute, filler ratio] |
| 9  | Niche Optimization     | 10%    | ?/10           | ?/10         | [Niche requirements met?] |
| **COMPOSITE**           | **100%** | **?/10**     | **?/10**     | **Change: +/- ?**  |

**Self-Assessment Threshold:**
```
IF self-score >= 9.0: Proceed to Step 9 (Submit)
IF self-score 8.0-8.9: Review flagged dimensions, make minor adjustments, then proceed
IF self-score < 8.0: Go to Step 8 (Identify Blockers)
```

**Output:** Self-scorecard with honest composite score and threshold decision.

---

### Step 8: Identify Blockers (If Self-Score < 9.0)

**If the rewritten script still self-scores below 9.0, identify what is blocking higher scores.**

#### Blocker Analysis

For each dimension scoring <8.0 in the self-assessment:

| Dimension | Self-Score | Target | Gap  | Blocker Description | Can Be Fixed by Current Specialist? | Recommended Action |
|-----------|------------|--------|------|---------------------|-------------------------------------|--------------------|
| [dim]     | ?/10       | 9.0+   | ?    | [What's preventing higher score?] | Yes / No / Uncertain | [Continue polish / Reassign to X specialist / Request collaboration] |

**Common Blockers:**

| Blocker Type | Description | Solution |
|--------------|-------------|----------|
| **Insufficient Research** | Script needs deeper data, examples, or stories that specialist doesn't have access to | Reassign to `researcher` or request user input |
| **Niche Expertise Gap** | Script requires niche-specific knowledge (e.g., finance, crime) that specialist lacks | Reassign to niche specialist or request niche expert review |
| **Technical Limitation** | Script needs visual demonstrations, complex graphics, or production elements beyond scope | Flag for production team or request collaboration with `video-specialist` |
| **Content Volume** | Topic is too complex for target length, requires either expansion or topic narrowing | Request user decision: extend length or narrow scope |
| **Conflicting Goals** | Two requirements are incompatible (e.g., "make it exciting" + "keep it serious") | Request user clarification on priority |
| **Grand Payoff Weakness** | After replanning, the Grand Payoff is still not compelling enough | Request user input on stronger payoff or reassign to `concept-specialist` |

**Blocker Recommendation:**
```
BLOCKERS IDENTIFIED: [count]
SEVERITY: [Critical / Moderate / Minor]
RECOMMENDATION: [Continue polish / Reassign to [agent] / Request collaboration / Request user input]
REASON: [Specific justification]
```

**If blockers are identified:**
- Document them clearly.
- Provide suggested reassignment or collaboration path.
- Do NOT submit a script that self-scores <8.0 without flagging blockers.

**Output:** Blocker analysis table with recommendation.

---

### Step 9: Submit for Re-Scoring

**If self-score >= 9.0 OR blockers have been addressed, submit the rewritten script to `score-script` for official re-scoring.**

#### Submission Package

The output submitted to `score-script` should include:

1. **Rewritten script** (full text with all annotations)
2. **Change summary** (what was changed and why)
3. **Self-score** (for comparison with official score)
4. **Original scorecard** (for before/after comparison)
5. **Rewrite strategy used** (Full Replanning or Targeted Polish)

**Resubmission Request:**
```
TASK: score-script
INPUT:
  - script_text: [rewritten script]
  - niche: [niche]
  - target_length: [length]
  - context: "This is a rewrite of a script that originally scored [X/10]. Self-assessed rewrite score: [Y/10]."
```

**Expected Outcome:**
- Official score >= 9.5: **PASS** — script is ready for production.
- Official score 9.0-9.4: **NEAR PASS** — minor polish recommended, but acceptable.
- Official score 8.0-8.9: **SOFT FAIL** — additional revision pass needed.
- Official score <8.0: **FAIL** — significant issues remain; revisit root cause analysis or reassign.

**Output:** Submission package ready for `score-script` task.

---

## Output Format

```
## Script Rewrite Report

### Original Performance
- Composite Score: [X/10]
- Top 3 Issues: [list]
- Verdict: FAIL (below 9.5 threshold)

### Root Cause Analysis
[Root cause assessment table]

### Rewrite Strategy
- Strategy Selected: [Full Replanning / Targeted Polish]
- Reason: [Justification]

### Changes Made
[If Full Replanning: Summary of 4-Hat Method execution with new structure]
[If Targeted Polish: Fix application table with before/after for each issue]

### Cross-Check Results
[Cross-check verification table with any secondary fixes]

### Retention Optimization
[Final retention audit tables: Open Loops, Pattern Interrupts, Re-Hooks, Emotional Arc, Stakes, Golden Thread]

### Rewritten Script
[Full rewritten script with all annotations]
[Changes marked with [FIX: dimension] or [REPLAN] inline]

### Self-Assessment
[Self-scorecard with before/after comparison]

### Composite Score Change
- Original: [X/10]
- Self-Assessed Rewrite: [Y/10]
- Improvement: +[Z]

### Status
[READY FOR RE-SCORING / BLOCKERS IDENTIFIED / REASSIGNMENT RECOMMENDED]

### Next Step
[Submit to score-script / Address blockers / Reassign to [agent] / Request user input]

### Blockers (if any)
[Blocker analysis table with recommendations]
```

---

## Validation Criteria

**Before submission, verify:**

- [ ] Root cause analysis completed — not just symptoms, but actual causes identified.
- [ ] Rewrite strategy (Full Replanning vs Targeted Polish) chosen based on root cause analysis.
- [ ] If Full Replanning: All 4 Hats executed in sequence with outputs documented.
- [ ] If Targeted Polish: All Weak/Fail dimensions addressed with specific fixes.
- [ ] Cross-check performed — no new problems introduced by fixes.
- [ ] Retention mechanics re-optimized: Open Loops, Pattern Interrupts, Re-Hooks, Emotional Arc, Stakes, Golden Thread.
- [ ] Self-score completed honestly with all 9 dimensions.
- [ ] Self-score >= 8.0 OR blockers clearly identified with recommendations.
- [ ] Rewritten script reads naturally when spoken aloud.
- [ ] Original intent preserved (if `preserve_intent` is true).
- [ ] All changes annotated inline for transparency.
- [ ] Submission package prepared for `score-script` task.

---

## Error Handling

| Error Condition                     | Response                                                        |
|-------------------------------------|-----------------------------------------------------------------|
| Script text is empty                | Return error: "No script text provided for rewrite."            |
| Scorecard is missing                | Return error: "Scorecard required for rewrite. Run score-script first." |
| Fix list is empty                   | Return error: "Fix list required. Run score-script with full analysis." |
| Self-score < 8.0 with no blockers identified | Warn: "Self-score is low but no blockers flagged. Review blocker analysis step." |
| Original score >= 9.5               | Warn: "Original script already passed. Rewrite may not be necessary. Proceed with caution." |
| All dimensions score 9+ but composite <9.5 | Check math — weighted average may have calculation error. |
| Rewrite introduces more FLAG content than original | Warn: "Rewrite has MORE filler than original. Revisit PCCE pass." |
| Golden thread lost during rewrite   | Critical error: "Rewrite broke the throughline. Reconnect all sections to golden thread." |

---

## Related Tasks

- `score-script.md` — Provides the scorecard that triggers this rewrite task
- `write-script.md` — 4-Hat Method reference for Full Replanning
- `optimize-retention.md` — Retention mechanics optimization (used in Step 6)
- `adapt-niche.md` — Niche-specific optimization (used if Niche Optimization dimension is weak)
- `analyze-script.md` — Full analysis for deeper insights (optional, can replace scorecard)

---

## Quality Gate References

**From `script-quality-checklist.md`:**
- All Critical items must pass.
- No more than 3 Warning items can fail.

**Key Critical Items to Verify in Rewrite:**
- Hook: No throat-clearing, promise clear within 15 seconds, stakes within 30 seconds.
- Structure: Clear sections, STP per section, But/Therefore transitions, golden thread present.
- Retention: Open loops (3+ simultaneous), pattern interrupts (no gap >90s), re-hooks at 25/50/75%.
- Value: FLAG content <5%, specific examples present.
- CTA: Placed after value delivery, brief (max 8 sec), specific.

---

*Task Version 1.0 — YouTube Scripts Squad*
