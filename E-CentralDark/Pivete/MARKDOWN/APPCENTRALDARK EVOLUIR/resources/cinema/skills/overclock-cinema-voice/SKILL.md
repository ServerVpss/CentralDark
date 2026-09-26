---
name: overclock-cinema-voice
description: "Use when a squad worker must generate NARRATION or VOICEOVER for a video or ad via ElevenLabs TTS (overclock_audio_generate). Covers dialogue / VO writing craft, per-character voice pinning (voiceId), pacing for sync, and the hard rule that audio is a SEPARATE post-layered track. Bind to the render-audio worker. Triggers: voiceover, narration, TTS, dialogue, VO, spoken audio, voice."
---

# overclock-cinema-voice — The Voice Skill

Writes the spoken line and renders it through ElevenLabs TTS as a SEPARATE track. The smallest cinema role: VOICE only, layered in post, never baked into the silent Seedance mp4.

This is the render-audio worker kit. It owns the **narration/VO string** and the **TTS call** — nothing else. Its siblings: `overclock-cinema-plan` writes the Seedance video prompt, `overclock-cinema-shot` writes the still/keyframe image prompt, `overclock-cinema-cut` assembles and muxes with ffmpeg. This skill hands `overclock-cinema-cut` an audio file; `overclock-cinema-cut` lays it over the silent mp4.

## Execution surface (fixed — never reinvent the call)

| Layer | Tool | Takes | Returns |
|-------|------|-------|---------|
| Audio | `overclock_audio_generate(prompt, voiceId?)` | ElevenLabs TTS only. `prompt` = the spoken text. `voiceId` = optional ElevenLabs voice. | audio file path |

There is no other audio engine. No music gen, no SFX gen, no BGM, no lip-sync, no upscale. State this loudly when a brief asks for any of them (see Capability Gaps).

---

## The Hard Rule — Audio Is a Separate Layered Track

The mp4 returned by `overclock_video_generate` (Seedance) is **SILENT**. Audio is a separate, post-layered track produced here by `overclock_audio_generate` and muxed in by `overclock-cinema-cut` with ffmpeg.

Therefore:
- **NEVER** write `Audio:` / `BGM:` / `SFX:` blocks into a Seedance video prompt expecting them to render — they won't. Those blocks survive only as *planning direction* the assembly layer reads.
- **NEVER** assume the spoken line is "inside" the video. It is a discrete file. The order of operations is: (1) video renders silent, (2) you render the VO file here, (3) `overclock-cinema-cut` muxes `ffmpeg -i shot.mp4 -i vo.mp3 -c:v copy -c:a aac -shortest out.mp4`.
- The `Audio:` line in the Seedance 5-block body and any quoted dialogue in the video prompt are **direction**, not output. Spoken/quoted lines route HERE to `overclock_audio_generate`; ambient/SFX/`No music.` notes are mix guidance for assembly only.

---

## Dialogue / VO Writing Craft

You are writing for a TTS engine, not a screen actor. Everything that shapes the read must be in the **text** — there is no separate emotion/style/dialect parameter. Five rules:

**1. Short lines.** TTS degrades on long, comma-stacked sentences (run-on prosody, dropped breath). Write spoken-length sentences. One idea per line. Prefer 8–14 words per sentence for narration; shorter for punchy VO.

**2. Emotional tone is baked into the words and punctuation**, not a parameter.
- Pace via punctuation: a period is a full stop, a comma is a short beat, an em-dash is a held pause, ellipsis is a trailing drift.
- Emphasis via sentence shape and word choice, not ALL-CAPS (TTS may spell or shout caps unpredictably). Restructure so the stressed word lands at the end of the clause.
- Question marks and exclamation points DO shift prosody — use them deliberately, sparingly.

**3. Dialect / accent is baked into the TEXT**, because this is TTS. There is no "accent" knob. To color a read:
- Choose a `voiceId` whose native accent already matches (the reliable lever — pin the voice, see below).
- Shape the *spelling and phrasing* for cadence: contractions and dropped g's for casual register (`gonna`, `runnin'`), formal full words for clinical register. Phonetic spelling (`y'all`, `lemme`) nudges cadence but is a weak lever — voiceId choice dominates.
- Do not expect the engine to "perform an Irish accent" from a stage direction in the prompt. It reads the words; it does not take direction.

**4. Decompose generic emotional reads.** Same discipline as the visual emotion rule: "say it sadly" tells TTS little. Instead write the line so the *words and rhythm* carry the state — short fragments and trailing ellipsis for defeat; clipped declaratives for anger; rising clauses for hope. The performance lives in the script, not in an adjective.

**5. Lead with the spoken text only.** The `prompt` argument is the words to be spoken — do not stuff camera notes, scene description, or `[narrator, somber]` stage directions into it; they get read aloud. Keep the prompt clean spoken copy.

---

## Per-Character voiceId Pinning

For any sequence with more than one speaker, **pin a voiceId per character** and reuse it verbatim across every line that character speaks — the audio analogue of the verbatim Identity-Block reuse that locks a character's face across stills.

- One character = one `voiceId`, fixed for the whole project. Maintain a small table in your working notes: `Narrator → <voiceId>`, `Protagonist → <voiceId>`, etc.
- Omit `voiceId` only for a single-voice narration where the default voice is acceptable.
- Each spoken line is its OWN `overclock_audio_generate` call (one call per line / per character turn). Do not concatenate two characters into one prompt — you cannot switch voice mid-prompt. Render each turn separately; `overclock-cinema-cut` sequences them.
- Across squad worker panes, the per-character `voiceId` is the shared continuity contract for sound — every pane that renders that character's line passes the SAME `voiceId`, exactly as every pane that renders that character's face reuses the SAME Identity-Block / hero png.

---

## Pacing to Match Shot Runtime

The VO must fit the shot it lays over. There is no duration parameter on either the video or the audio call, so pace is controlled by **word count** and **punctuation**.

- Estimate read time at roughly **2.5–3 words per second** of natural narration speech (slower for somber/clinical, faster for energetic UGC). A 10-second shot ≈ 25–30 spoken words.
- Write to the shot length, then check: render the VO, read the returned file's duration, compare to the silent mp4's duration.
  - VO too long → cut words (not speed; there's no in-app retime). Tighten the sentence.
  - VO too short → add a beat, a held pause (em-dash), or a trailing clause — or let `overclock-cinema-cut` pad with ambient/silence.
- For multi-shot sequences, pace each line against ITS shot, not the whole film. One VO line per shot is the clean unit.
- Use punctuation to stretch or compress within a fixed word count: ellipses and em-dashes add held time without adding words; comma-light declaratives read faster.

---

## Capability Gaps — State These Loudly

`overclock_audio_generate` is **ElevenLabs TTS = VOICE only**. Surface these honestly; do not invent around them:

1. **NO music.** No BGM, no score, no jingle. Music comes from outside this skill entirely.
2. **NO SFX.** No whooshes, impacts, ambient beds, foley. Sound design is sourced/produced elsewhere; the mp4 is silent and stays silent except for the VO track you add.
3. **NO lip-sync.** There is no lip-sync tool. **Talking-head is OUT OF SCOPE.** The mouth in a Seedance clip will not match the phonemes of the TTS line.
   - The ONLY documented workaround is a **clearly-flagged MANUAL hack, not a supported path**: generate a per-character clip, render the TTS line separately here, and composite the speaking head as a picture-in-picture over a wide shot in ffmpeg/Remotion (via `overclock-cinema-cut`). **Lips will not match phonemes.** Flag this limitation to the user *before* promising any talking-head deliverable.
4. **NO music/SFX even when a Seedance `Audio:` block requests them** — that block is direction only and never renders.

When a brief needs music or SFX, say so plainly: "Music and sound design are out of scope for this tool — I can render the narration; the bed must be sourced separately." Do not silently drop the request or pretend a workaround exists.

---

## Worked Examples

**Single narrator, product ad (≈10s shot, ≈28 words):**
```
overclock_audio_generate(
  prompt: "Some mornings ask for more. The cup that holds the heat — and the
           quiet. Pour slow. Let it begin.",
  voiceId: "<narrator-voiceId>"
)
```
Period-driven, em-dash for a held beat, short declaratives. Tone is in the words.

**Two characters, DM/interview-style ad — TWO separate calls, voice pinned per speaker:**
```
overclock_audio_generate(prompt: "Wait — have you actually tried it yet?",
                         voiceId: "<friend-voiceId>")
overclock_audio_generate(prompt: "I was skeptical. Then I wasn't.",
                         voiceId: "<protagonist-voiceId>")
```
Each turn is its own call; `overclock-cinema-cut` orders and spaces them. Never one prompt for both.

**Casual UGC register (dialect baked into spelling/phrasing, not a knob):**
```
overclock_audio_generate(
  prompt: "Okay so I wasn't gonna post this, but... yeah. This is the one.",
  voiceId: "<ugc-voiceId>"
)
```

---

## Pre-Flight Checklist (before the TTS call)

1. **Spoken-only prompt** — the `prompt` is clean speakable copy; no stage directions, camera notes, or bracketed labels that would be read aloud.
2. **voiceId pinned** — each character maps to a fixed `voiceId`, reused verbatim; one call per character turn.
3. **Paced to the shot** — word count ≈ shot seconds × 2.5–3; verify against the silent mp4's duration after render.
4. **Tone in the text** — emotion/dialect carried by word choice, punctuation, and voiceId — not by an (absent) parameter.
5. **Separate track confirmed** — output is an audio file handed to `overclock-cinema-cut` for ffmpeg mux; nothing was written into the Seedance prompt expecting it to render.
6. **Gaps flagged** — if the brief implied music / SFX / lip-sync / talking-head, the limitation was stated to the user, not silently worked around.

---

## Cross-references

- `overclock-cinema-plan` — writes the Seedance video prompt; the `Audio:` block and quoted dialogue there are DIRECTION that route to this skill, not output the mp4 renders.
- `overclock-cinema-shot` — the visual continuity analogue: verbatim Identity-Block / hero-png reuse locks the face, exactly as per-character `voiceId` reuse locks the voice.
- `overclock-cinema-cut` — receives the VO audio file and muxes it over the silent mp4 with ffmpeg; owns the talking-head PiP composite (the manual, flagged lip-sync hack) and any padding/timing of the VO track against the cut.
