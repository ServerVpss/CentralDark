# Task: Write Script (Complete YouTube Script — 4-Hat Method)

## Metadata

| Field          | Value                                      |
|----------------|--------------------------------------------|
| **Task ID**    | `YTS-TASK-003`                             |
| **Task Name**  | Write Script                               |
| **Version**    | 1.0                                        |
| **Purpose**    | Create a complete, retention-optimized YouTube script using the 4-Hat Method. Produces a fully annotated, scored, publish-ready script. |
| **Executor**   | `retention-architect` agent                |
| **Trigger**    | Manual invocation or pipeline step         |
| **Priority**   | High                                       |
| **Estimated Duration** | 10-20 minutes (depending on target length) |

---

## Inputs

| Input               | Required | Type     | Description                                              |
|---------------------|----------|----------|----------------------------------------------------------|
| `topic`             | Yes      | string   | The video topic or subject matter                        |
| `niche`             | Yes      | string   | Target niche (finance, crime, tech, education, motivation, listicle, documentary, general) |
| `target_length`     | Yes      | string   | Target video duration (e.g., "8 min", "12 min", "15 min") |
| `audience`          | Yes      | string   | Target audience description (demographics, interests, knowledge level) |
| `title`             | No       | string   | Video title — if provided, script must deliver on title promise |
| `thumbnail_concept` | No       | string   | Thumbnail description — used for hook/visual alignment   |
| `key_points`        | No       | list     | Specific points or data the creator wants included       |
| `tone`              | No       | string   | Desired tone (e.g., "authoritative but conversational", "high energy") |
| `cta_goal`          | No       | string   | Specific call-to-action goal (subscribe, product, next video, etc.) |
| `reference_scripts` | No       | list     | Reference scripts or videos for style matching           |

---

## Prerequisites

- Topic must be clearly defined (not vague like "something about money").
- Niche must be specified — this drives structure and retention pattern selection.
- Target length determines section count and pacing requirements.

---

## Steps

### Step 1: ARTIST HAT — Brainstorm Freely

**Mindset:** No judgment, no structure, no editing. Pure creative exploration.

**Actions:**
1. Brain-dump every angle, idea, story, data point, analogy, and example related to the topic.
2. Research key facts, statistics, and quotes that support the topic.
3. List potential stories (personal, case studies, historical) that illustrate the topic.
4. Identify the **Grand Payoff** — the single most valuable insight or revelation the viewer will receive. Write it in one sentence.
5. List potential "oh!" moments — points where the viewer will feel surprise, insight, or emotion.
6. Note any counterintuitive angles or contrarian takes.
7. Brainstorm analogies and metaphors that make complex ideas accessible.

**Rules:**
- Do NOT organize or filter yet.
- Do NOT worry about length.
- Aim for quantity — 2-3x more ideas than will be used.
- The Grand Payoff must be crystal clear before moving to the next hat.

**Output:** Raw idea dump, Grand Payoff statement, list of "oh!" moments.

---

### Step 2: ARCHITECT HAT — Structure and Organize

**Mindset:** Ruthless organizer. Every element must serve the Grand Payoff.

**Actions:**
1. **Cut ruthlessly** — Remove any idea from Step 1 that does not serve the Grand Payoff. Be aggressive. If it's interesting but irrelevant, cut it.
2. **Create STP Segments** — Organize remaining ideas into 5-7 segments, each with:
   - **S**etup: What context does the viewer need?
   - **T**ension: What problem, question, or conflict drives this segment?
   - **P**ayoff: What insight or resolution does this segment deliver?
3. **Sequence segments** for maximum engagement:
   - Start with the most attention-grabbing segment (not necessarily chronological).
   - Build stakes progressively — each segment should feel higher stakes than the last.
   - Place the Grand Payoff segment last (or second-to-last with a brief resolution after).
4. **Map the Golden Thread** — Write one sentence that connects all segments. This thread must be traceable throughout the entire script.
5. **Plan Open Loops:**
   - Identify where each open loop will be planted.
   - Ensure at least 3 simultaneous open loops at peak.
   - The Master Loop (Grand Payoff) opens in the hook.
6. **Plan Pattern Interrupts:**
   - Place a pattern interrupt every 45-60 seconds.
   - Vary types: tonal shift, story, question, analogy, visual cue, humor, data drop.
7. **Plan Re-Hooks:**
   - Place re-hooks at 25%, 50%, and 75% marks.
   - Each re-hook must tease upcoming content or escalate stakes.
8. **Calculate Timing:**
   - Allocate word count per segment based on target length (150 wpm).
   - Hook: 200-450 words (1.5-3 min).
   - Each body segment: proportional to importance.
   - Outro/CTA: 150-300 words.

**Output:** Segment outline with STP structure, golden thread statement, open loop map, pattern interrupt plan, re-hook placements, timing allocation.

---

### Step 3: WRITER HAT — Draft the Script

**Mindset:** Storyteller. Connect ideas with compelling transitions. Build tension.

**Actions:**
1. **Write each segment in full sentences** following the STP structure from Step 2.
2. **Apply the But/Therefore Rule:**
   - Between sections, use "But..." or "Therefore..." transitions (not "And then...").
   - This ensures each section causally connects to the next, maintaining momentum.
   - Example: "You'd think this solves the problem. But there's a catch nobody talks about..."
3. **Build tension within each segment:**
   - Setup should create curiosity.
   - Tension should create suspense or conflict.
   - Payoff should deliver a satisfying resolution — but open a new question for the next segment.
4. **Flesh out stories and examples:**
   - Use specific details (names, dates, numbers, places).
   - Show, don't tell.
   - Use present tense for stories to increase immediacy.
5. **Write naturally for spoken delivery:**
   - Use contractions (it's, don't, you'd).
   - Keep sentences short (average 12-15 words).
   - Use rhetorical questions to engage the viewer.
   - Avoid academic or formal phrasing.
6. **This produces "Draft 0"** — a complete but unpolished script.

**Output:** Full Draft 0 script with all segments written.

---

### Step 4: WIZARD HAT — Retention Optimization

**Mindset:** Data-driven retention engineer. Every second must earn the viewer's attention.

**Actions:**
1. **Highlight every "oh!" moment** — Mark each moment of insight, surprise, or emotion with `[OH!]`.
2. **Add PCCE tags** — Tag every sentence:
   - P (Progression), C (Conflict), Cx (Context), E (Emotion), FLAG (filler — remove or rewrite).
   - Target ratio: 30% P, 20% C, 25% Cx, 20% E, <5% FLAG.
   - Any sentence tagged FLAG must be rewritten or removed.
3. **Insert Pattern Interrupts:**
   - Mark each with `[PI: type]` (e.g., `[PI: story]`, `[PI: question]`, `[PI: analogy]`).
   - Ensure one every 45-60 seconds.
   - Vary types — no two consecutive pattern interrupts of the same type.
4. **Add Re-Hooks at 25%, 50%, 75%:**
   - Mark each with `[RE-HOOK @ X%]`.
   - Each must tease upcoming content or escalate stakes.
   - Example: "[RE-HOOK @ 50%] But the real story — the part that changes everything — is coming up."
5. **Map Emotional Arc:**
   - Assign emotional register to each segment: Curiosity, Tension, Relief, Excitement, Awe, Humor, Fear.
   - Ensure the "pendulum" — no single register lasts more than 90 seconds.
   - Verify emotional climax aligns with Grand Payoff.
6. **Check Pendulum Shifts:**
   - Every 90 seconds, the emotional register must shift.
   - If a section is too long in one register, add a tonal shift or contrast.
7. **Verify Open Loops:**
   - All planned loops are opened and closed at correct positions.
   - At least 1 loop is open at all times after the hook.
   - The Master Loop closes at the Grand Payoff.
8. **Verify Stakes Escalation:**
   - Stakes must be higher in each subsequent segment.
   - No "stakes reset" without immediate rebuild.
9. **Remove Dead Zones:**
   - Any point where a viewer could safely leave without missing what was promised must be fixed.
   - Add an open loop or tease before any potential drop-off point.

**Output:** Retention-optimized script with all PCCE tags, pattern interrupts, re-hooks, and emotional arc annotations.

---

### Step 5: Add Production Cues

Add visual and audio production annotations throughout the script:

| Cue Type          | Format                    | Usage                                         |
|-------------------|---------------------------|-----------------------------------------------|
| B-Roll            | `[B-ROLL: description]`   | Describe the visual needed                    |
| Graphic/Text      | `[GRAPHIC: description]`  | On-screen text, chart, diagram                |
| Music             | `[MUSIC: mood]`           | Background music mood shift                   |
| Voice Direction   | `[VOICE: direction]`      | Speaking pace, tone, emphasis                  |
| Sound Effect      | `[SFX: description]`      | Sound effect cue                              |
| Camera Direction  | `[CAMERA: direction]`     | Angle change, zoom, cut                       |

**Rules:**
- Place B-roll cues at every potential visual moment (aim for every 15-30 seconds).
- Music mood annotations at every emotional shift.
- Voice direction notes at tonal changes and emphasis points.
- Keep cue descriptions specific enough for an editor to act on.

**Output:** Script with full production cue annotations.

---

### Step 6: Write Hook Using PVSS + TTS Frameworks

Write the hook (first 30-60 seconds) using both frameworks, then combine:

#### PVSS Framework
- **P** — Preview: What will the viewer learn/experience?
- **V** — Value: Why should they care? What's at stake?
- **S** — Social Proof: Why should they trust you? (credentials, data, results)
- **S** — Story: Brief story hook or case study teaser.

#### TTS Framework
- **T** — Tease: Open a curiosity gap.
- **T** — Testimony: Proof this is worth watching.
- **S** — Segue: Smooth transition into the first body segment.

#### Hook Structure
```
[0:00-0:05] — ATTENTION GRAB: Bold claim, surprising stat, or provocative question.
[0:05-0:15] — VIDEO PROMISE: What the viewer will get from watching.
[0:15-0:30] — STAKES + PROOF: Why it matters + why they should trust you.
[0:30-0:45] — FIRST OPEN LOOP: Plant the Master Loop.
[0:45-0:60] — SEGUE: Transition to first body segment.
```

**Validation:**
- No "Hey guys welcome back" or throat-clearing.
- First 5 seconds must be immediately engaging.
- Title/thumbnail promise addressed within 15 seconds.
- At least one open loop planted by second 30.

**Output:** Complete hook with PVSS/TTS labels and timestamp markers.

---

### Step 7: Design CTA Strategy (3-Point Placement)

Place 3 CTAs throughout the script:

| CTA # | Position              | Type          | Trigger                                | Duration |
|-------|-----------------------|---------------|----------------------------------------|----------|
| 1     | After biggest value moment (mid-script) | Soft CTA | "If you're finding this valuable..." | ≤5 sec  |
| 2     | After Grand Payoff    | Primary CTA   | Direct ask after delivering promise    | ≤8 sec  |
| 3     | End screen            | Next Video CTA | Tease related content                 | ≤10 sec |

**Rules:**
- Never place a CTA before delivering significant value.
- Keep CTAs brief — maximum 8 seconds each.
- Make CTAs specific (not "like and subscribe" — instead "If you want to see the exact template I used for this, I put it in the description").
- The Primary CTA should feel earned, not forced.
- The Next Video CTA should seamlessly connect to suggested content.

**Output:** 3 CTAs with exact placement, text, and duration.

---

### Step 8: Self-Score Using 9-Dimension Rubric

Score the completed script honestly:

| #  | Dimension              | Weight | Score | Self-Justification                              |
|----|------------------------|--------|-------|--------------------------------------------------|
| 1  | Hook Strength          | 15%    | ?/10  | [Specific reasoning]                             |
| 2  | PCCE Compliance        | 10%    | ?/10  | [P:C:Cx:E:FLAG ratios and any FLAG remnants]     |
| 3  | Open Loop Density      | 10%    | ?/10  | [Count, simultaneous peak, all closed?]          |
| 4  | Pattern Interrupt Freq | 10%    | ?/10  | [Average frequency, any gaps >90s?]              |
| 5  | Emotional Arc          | 10%    | ?/10  | [Pendulum frequency, dead zones?]                |
| 6  | Re-Hook Placement      | 10%    | ?/10  | [Present at 25/50/75%? Strength?]                |
| 7  | Stakes Escalation      | 10%    | ?/10  | [Trajectory, any resets?]                        |
| 8  | Value Density          | 15%    | ?/10  | [Specific insights per minute, filler ratio]     |
| 9  | Niche Optimization     | 10%    | ?/10  | [Niche-specific requirements met?]               |

**Composite Score** = Weighted average.

**Honest Assessment:**
- If composite < 7.0: Identify the weakest dimensions and iterate before finalizing.
- If composite < 8.0: Flag areas for optional improvement.
- If composite >= 8.0: Script is ready for review.

**Output:** Completed self-scorecard with composite and honest assessment.

---

## Output Format

The final script deliverable must include:

```
## YouTube Script: [Title]

### Script Metadata
- Topic: [topic]
- Niche: [niche]
- Target Length: [duration]
- Target Audience: [audience]
- Estimated Word Count: [count]
- Grand Payoff: [one sentence]
- Golden Thread: [one sentence]

### Hook
[Full hook with PVSS/TTS labels and timestamps]

### Body
[Full script organized by STP segments]
[All production cues included]
[PCCE tags on every sentence]
[Pattern interrupts marked]
[Open loops marked with open/close]
[Re-hooks marked at 25/50/75%]

### CTA Strategy
[3 CTAs with placement and text]

### Self-Score
[9-dimension scorecard with composite]

### Production Notes
[Any additional notes for filming/editing]
```

---

## Validation Criteria

- [ ] Script follows the 4-Hat Method in sequence (no skipping hats).
- [ ] Grand Payoff is clearly identified and delivered.
- [ ] Golden thread is traceable through every segment.
- [ ] 5-7 STP segments are present with clear structure.
- [ ] But/Therefore rule applied to all transitions (no "and then").
- [ ] PCCE tags present on every sentence; FLAG ratio <5%.
- [ ] Pattern interrupts present every 45-60 seconds.
- [ ] Re-hooks present at 25%, 50%, 75% marks.
- [ ] Emotional pendulum shifts at least every 90 seconds.
- [ ] Open loops: 3+ simultaneous at peak, all closed by end.
- [ ] Hook uses PVSS/TTS frameworks, no throat-clearing.
- [ ] 3 CTAs placed appropriately.
- [ ] Production cues included throughout.
- [ ] Self-score completed honestly with all 9 dimensions.
- [ ] Word count matches target length (within 10%).
- [ ] Script reads naturally when spoken aloud.

---

## Error Handling

| Error Condition                     | Response                                                        |
|-------------------------------------|-----------------------------------------------------------------|
| Topic is vague or unclear           | Ask for clarification before proceeding.                        |
| Niche not recognized                | Default to "General" with warning.                              |
| Target length unreasonable (<2 min or >30 min) | Warn and suggest adjustment.                         |
| Key points conflict with each other | Flag conflict and ask creator to prioritize.                    |
| Self-score below 6.0                | Automatically iterate on weakest dimensions before finalizing.  |
| Cannot find sufficient data/angles  | Warn that the topic may need more research; proceed with available material. |

---

## Related Tasks

- `write-hook.md` — Focused hook creation (can be used independently)
- `analyze-script.md` — Full analysis of the completed script
- `score-script.md` — Quick scoring without full analysis
- `optimize-retention.md` — Retention-focused revision pass

---

*Task Version 1.0 — YouTube Scripts Squad*
