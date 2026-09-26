# Task: Write Shorts Script (YouTube Shorts — Bookend Method)

## Metadata

| Field          | Value                                      |
|----------------|--------------------------------------------|
| **Task ID**    | `YTS-TASK-005`                             |
| **Task Name**  | Write Shorts Script                        |
| **Version**    | 1.0                                        |
| **Purpose**    | Create a complete, retention-optimized YouTube Shorts script using the Bookend Method. Targets the 34-second sweet spot with Stop-Hook-Payoff structure and rewatch triggers. |
| **Executor**   | `retention-architect` agent                |
| **Trigger**    | Manual invocation or pipeline step         |
| **Priority**   | Medium                                     |
| **Estimated Duration** | 2-3 minutes                        |

---

## Inputs

| Input            | Required | Type     | Description                                              |
|------------------|----------|----------|----------------------------------------------------------|
| `topic`          | Yes      | string   | The Shorts topic or subject matter                       |
| `hook_angle`     | Yes      | string   | The primary hook angle (contrarian, question, stat, story, mystery) |
| `target_emotion` | Yes      | string   | Primary emotion to evoke (curiosity, shock, humor, awe, fear, inspiration) |
| `niche`          | No       | string   | Target niche                                             |
| `audience`       | No       | string   | Target audience description                              |
| `format`         | No       | string   | Shorts format: "talking head", "voiceover", "text on screen", "mixed" |
| `cta_goal`       | No       | string   | Desired action: "watch full video", "follow", "comment", "save" |
| `series_context` | No       | string   | If part of a series, what came before and what comes next |

---

## Prerequisites

- Topic must be narrow enough for 30-60 seconds (not a full video topic).
- Hook angle should be pre-selected — Shorts need laser focus.
- Target emotion drives the entire script tone and structure.

---

## Steps

### Step 1: Write Hook and Last Line FIRST (Bookend Method)

**The Bookend Method:** In Shorts, the first line and the last line are the two most important elements. Write them first, then fill the middle.

#### The Hook (First Line)
Write 3 options for the opening line. Each must:
- Stop the scroll within 1-2 seconds.
- Create an immediate curiosity gap or emotional reaction.
- Be under 15 words.
- Feel incomplete — the viewer MUST keep watching to understand.

**Hook Types for Shorts:**
| Type              | Example                                             | Best For           |
|-------------------|-----------------------------------------------------|--------------------|
| Contrarian Claim  | "The worst financial advice everyone follows."       | Education, Finance |
| Unfinished Story  | "She walked into the room and everything changed."   | Story, Crime       |
| Shocking Stat     | "Only 1 in 1,000 people know this."                 | Tech, Education    |
| Direct Challenge  | "You're doing this wrong every single day."          | How-to, Fitness    |
| Mystery           | "Nobody can explain why this happens."               | Science, Mystery   |
| Emotional Trigger | "This is the moment he realized it was over."        | Motivation, Story  |

#### The Last Line (Payoff + Rewatch Trigger)
Write 3 options for the closing line. Each must:
- Deliver the emotional payoff promised by the hook.
- Create a reason to rewatch (new meaning to earlier content, or circular reference).
- Optionally tease a follow-up ("Part 2 drops tomorrow").
- Be under 20 words.

**Rewatch Triggers:**
- **Circular callback:** Last line recontextualizes the first line.
- **Hidden detail reveal:** "Watch again and look at [thing]."
- **Emotional crescendo:** End on the highest emotional note.
- **Cliffhanger:** "But what happened next..." (drives to profile/comments).
- **Mind-blown payoff:** The answer or reveal is so surprising, viewers rewatch to process.

**Select the best hook and last line pair** — they must work together as bookends.

**Output:** 3 hook options, 3 last line options, selected bookend pair with reasoning.

---

### Step 2: Fill the Middle

With the bookends locked, write the middle content:

**Structure Target:**
```
[0-3s]   HOOK — Stop the scroll
[3-10s]  SETUP — Minimum context needed
[10-25s] CONTENT — The meat (But/Then storytelling)
[25-30s] PAYOFF — Deliver the promise
[30-34s] LAST LINE — Rewatch trigger / emotional peak
```

**Rules for the Middle:**
- Every sentence must earn its place. Zero filler.
- Maximum 3-4 sentences for setup.
- Content section uses the But/Then structure (Step 3).
- No "let me explain" or "here's the thing" — just deliver.
- If it's a story, use present tense for immediacy.
- If it's educational, use one concrete example, not multiple.

**Word Count Target:** 80-130 words total (for ~34 seconds at natural speaking pace).

**Output:** Full middle section draft.

---

### Step 3: Apply But/Then Storytelling Tactic

Review the full script and ensure it follows the But/Then rhythm:

**Pattern:**
```
[Statement A] — Sets up an expectation.
BUT [Statement B] — Subverts or complicates it.
THEN [Statement C] — Shows the consequence or next development.
BUT [Statement D] — Another twist or complication.
THEN [Statement E] — Resolution or payoff.
```

**Why this works for Shorts:**
- Each "But" creates a micro-tension that prevents swiping.
- Each "Then" provides just enough resolution to feel satisfying.
- The rhythm keeps the viewer in a constant state of "what happens next?"

**Check:** Does every transition in the script use But/Then logic? If any transition uses "and then" or simply lists information, rewrite it.

**Example:**
```
BAD:  "He invested in crypto. And then he bought a house. And then he retired early."
GOOD: "He invested everything in crypto. But the market crashed 80%. Then, instead of
       selling, he did something no one expected..."
```

**Output:** Script revised with But/Then structure annotated.

---

### Step 4: Run Readability Check

YouTube Shorts must be immediately understandable. Target 5th-grade reading level.

**Readability Criteria:**
- [ ] Average sentence length: 8-12 words (not 15+).
- [ ] No jargon unless the niche demands it (and it's defined in context).
- [ ] No compound sentences with multiple clauses.
- [ ] Active voice throughout (not passive).
- [ ] Concrete words over abstract words.
- [ ] Present tense preferred over past tense for stories.
- [ ] No filler words: "basically", "actually", "literally", "you know", "like".
- [ ] One idea per sentence.

**Readability Test:**
Read the script aloud. If any sentence requires a second read to understand, simplify it.

**Calculate approximate readability score:**
- Count total words, sentences, and syllables.
- Flesch-Kincaid Grade Level target: 5.0 or below.
- If above 5.0, identify and simplify the offending sentences.

**Output:** Readability score, list of simplified sentences.

---

### Step 5: Optimize for Rewatch Triggers

Rewatch rate is the single most important metric for Shorts. Optimize:

**Rewatch Optimization Checklist:**
- [ ] Does the last line add new meaning to the first line? (Circular structure)
- [ ] Is there a detail that only makes sense on second viewing?
- [ ] Does the emotional peak hit at the very end (not the middle)?
- [ ] Is the pacing fast enough that viewers miss details on first watch?
- [ ] Is there a visual or verbal callback that rewards rewatching?
- [ ] Does the Short end abruptly enough to auto-replay before the viewer swipes?

**Rewatch Score (1-10):**
- 9-10: Multiple rewatch triggers, circular structure, auto-replay optimized.
- 7-8: Clear rewatch trigger, good ending punch.
- 5-6: Decent ending but no specific rewatch mechanism.
- Below 5: Viewer has no reason to rewatch — needs revision.

**If score < 7:** Revise the last line and/or add a hidden detail.

**Output:** Rewatch optimization assessment, rewatch score, revisions if needed.

---

### Step 6: Target the 34-Second Sweet Spot

Optimize script length for the 34-second sweet spot:

**Why 34 Seconds:**
- Short enough to feel fast and rewatchable.
- Long enough to deliver actual value.
- Hits the algorithmic sweet spot for watch-through rate.
- Auto-replay kicks in before the viewer has time to swipe.

**Length Validation:**
- Count total words. Target: 80-130 words.
- Read aloud at natural speaking pace. Target: 30-38 seconds.
- If over 38 seconds: Cut the weakest sentence from the middle.
- If under 28 seconds: Add one more But/Then cycle or a concrete example.

**Pacing Notes:**
- First 3 seconds: Fast and punchy.
- Middle: Steady pace, not rushed but no pauses.
- Last 5 seconds: Slightly slower for emphasis — then sharp cut.

**Output:** Final word count, estimated duration, pacing notes.

---

### Step 7: Ensure Stop-Hook-Payoff Structure

Final structural validation:

#### STOP (0-3 seconds)
- [ ] The first frame or word would make a scroller pause.
- [ ] Visual element is compelling (if applicable).
- [ ] Voice tone is immediately engaging (not flat or generic).
- [ ] No countdown, intro, or preamble.

#### HOOK (3-10 seconds)
- [ ] Curiosity gap is open — viewer cannot leave without knowing the answer.
- [ ] The "promise" is implicit or explicit — what will the viewer get?
- [ ] Stakes are clear — why should they care?
- [ ] Setup is minimal — no over-explaining.

#### PAYOFF (final 5-10 seconds)
- [ ] The promise from the hook is delivered.
- [ ] Emotional peak is reached.
- [ ] Rewatch trigger is embedded.
- [ ] The ending is clean — no trailing off or awkward silence.
- [ ] CTA (if any) is embedded naturally, not bolted on.

**Output:** Stop-Hook-Payoff validation checklist with pass/fail per item.

---

## Output Format

```
## YouTube Shorts Script

### Script Metadata
- Topic: [topic]
- Hook Angle: [angle]
- Target Emotion: [emotion]
- Niche: [niche]
- Format: [format]
- Word Count: [count]
- Estimated Duration: [duration]

### Bookend Selection
- Hook (selected): [text]
- Last Line (selected): [text]
- Reasoning: [why this pair works]

### Full Script
[Complete script with timing markers]
[0:00-0:03] [HOOK LINE]
[0:03-0:10] [SETUP]
[0:10-0:25] [CONTENT with But/Then annotations]
[0:25-0:30] [PAYOFF]
[0:30-0:34] [LAST LINE / REWATCH TRIGGER]

### Production Notes
[Voice direction, visual cues, music]

### Scores
- Readability: [grade level]
- Rewatch Score: [X/10]
- Stop-Hook-Payoff: [pass/fail per element]

### Alternative Hooks
[Other hook options that were generated but not selected]
```

---

## Validation Criteria

- [ ] Hook and last line were written first (Bookend Method followed).
- [ ] Script uses But/Then storytelling (no "and then" transitions).
- [ ] Readability at or below 5th-grade level.
- [ ] Rewatch score is 7+ (or revisions applied).
- [ ] Total duration is 30-38 seconds (sweet spot).
- [ ] Stop-Hook-Payoff structure validated.
- [ ] Zero filler words or sentences.
- [ ] One clear topic — not trying to cover too much.
- [ ] Emotional peak is at or near the end.
- [ ] Script reads naturally when spoken aloud.

---

## Error Handling

| Error Condition                     | Response                                                        |
|-------------------------------------|-----------------------------------------------------------------|
| Topic too broad for Shorts          | Suggest narrowing: "This topic is better suited for a long-form video. For Shorts, try focusing on just [specific angle]." |
| Script exceeds 45 seconds           | Force-cut to 34-second target. Remove weakest middle content.   |
| Script under 20 seconds             | Add one But/Then cycle or a concrete example.                   |
| Rewatch score below 5               | Rewrite last line with circular callback. Re-score.             |
| Readability above 7th grade         | Simplify all sentences above 15 words. Remove jargon.           |
| No clear emotional payoff           | Rewrite payoff section to match target emotion.                 |

---

## Related Tasks

- `write-hook.md` — Can provide hook options for the Shorts opening
- `write-script.md` — Full long-form script (Shorts may promote long-form content)
- `score-script.md` — Adapted scoring for Shorts format

---

*Task Version 1.0 — YouTube Scripts Squad*
