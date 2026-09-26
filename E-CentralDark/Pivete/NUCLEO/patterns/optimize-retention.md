# PADRAO - optimize-retention.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\squads\youtube-scripts\tasks\optimize-retention.md
**SHA:** 92e2ba797bc6eeae
**Timestamp:** 2026-08-28T02:19:39.802131
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- - Average Gap: [before] -> [after]
- - Longest Gap: [before] -> [after]

### Ouro Bruto (primeiros 5000 chars)
```
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

| # | Position (timestamp/word#) | Category          
```