---
name: overclock-cinema-cut
description: "Use when a squad worker must ASSEMBLE generated clips into a finished video — Bash ffmpeg concat in beat order, last-frame extraction for sequential continuity (feeds the next shot’s imageUrl), and pre-delivery QA (runtime-sum invariant, 2-second-stillness cut landing, double-contrast cut grammar). Bind to an editor / executor worker that has Bash. Triggers: stitch clips, assemble video, ffmpeg concat, final cut, video editing, frame extraction, runtime check."
---

# overclock-cinema-cut — The Editor (Assembly + QA)

The worker that owns ffmpeg: it stitches the rendered Seedance clips into a finished cut, extracts end-frames to feed sequential continuity, layers the narration track, and runs the pre-delivery QA gate. The render panes generate; this skill assembles.

> **Layer split (governing law).** This skill owns the **assembly intelligence and the QA gate** — cut order, frame extraction, the runtime-sum invariant. The Overclock tools own generation. You do not write Seedance prompts here (that's **overclock-cinema-shot** for stills and **overclock-cinema-plan** for motion); you do not generate narration here (that's **overclock-cinema-voice**). You receive mp4 paths + an audio track and you produce `final.mp4` with Bash ffmpeg. There is **no Overclock NLE** — assembly is raw ffmpeg, every time.

This skill is bound to an **editor / executor worker** with Bash. It runs in two places in the squad DAG: (1) **mid-flight** on each SEQUENTIAL edge — extracting shot N-1's end-frame so the next render worker can pass it as `imageUrl`; (2) **at the end** as the assembly pass — concat in cut order, layer audio, QA.

---

## What feeds in / what ships out

| In | Source |
|---|---|
| Worker mp4 paths (one per shot, silent) | `handoff_list` — collected from each render worker's `handoff_submit` |
| Cut order (double-contrast sequence) | The orchestrator's shot list / 6-scene arc |
| Narration track (`narration.mp3`) | **overclock-cinema-voice** (`overclock_audio_generate`, ElevenLabs TTS) — a SEPARATE track, never baked into the mp4 |
| Per-shot duration targets | The orchestrator's shot spec (for the runtime-sum invariant) |

| Out |
|---|
| `frameN.png` — extracted end-frame, handed back so the next SEQUENTIAL render worker passes it as `imageUrl` |
| `assembled.mp4` — silent concat in cut order |
| `final.mp4` — assembled video + narration track, QA-passed |

---

## Job 1 — Last-frame extraction (the sequential continuity edge)

The single highest-leverage continuity method for any image-to-video model: **end frame of shot A = start frame of shot B = seamless continuity.** When the DAG has a SEQUENTIAL edge (shot N needs shot N-1's output), this skill extracts shot N-1's final frame and hands the path back so the next render worker passes it as `imageUrl` on `overclock_video_generate`. Style can change radically scene-to-scene while character, props, and physics (motion blur, weight, momentum) carry through — end frames produce compositions you'd never prompt directly.

The frame-extraction loop (verbatim recipe):

```bash
ffmpeg -sseof -0.1 -i shotN.mp4 -frames:v 1 -q:v 2 frameN.png
```

- `-sseof -0.1` seeks to 0.1s before end-of-file → grabs the **last** frame (not the first).
- `-frames:v 1` → exactly one frame.
- `-q:v 2` → near-lossless PNG quality (low number = high quality).

Then `frameN.png` becomes shot N+1's `imageUrl`. This builds long connected sequences without any multi-shot mode. The render worker that receives it follows the **delete-appearance-for-reference-match** rule — when an `imageUrl` anchor is in play it describes only what MOVES, never re-describes the face (that's overclock-cinema-plan's job, but the editor enforces the handoff exists).

> First frame instead (rarely needed — e.g. to verify the start state matches the previous end-frame): `ffmpeg -i shotN.mp4 -frames:v 1 -q:v 2 firstN.png`.

---

## Job 2 — Concat assembly (double-contrast cut grammar)

### Sequence the shots: double-contrast cut grammar

Order the assembled shots so adjacent clips **contrast on two axes at once** (e.g. wide→close *and* static→moving, or cold-palette→warm *and* slow→fast). A cut that changes two things at once reads as **intentional editing**; a cut that changes only one reads as a **continuity wobble**. The 6-scene arc already alternates shot size and energy — preserve that alternation when sequencing the workers' outputs. For action sequences specifically, alternate reference-locked face shots with plain-text action shots; the viewer's brain fills in continuity between the cuts.

### Cuts land on stillness, not motion

Every render worker is contracted to bookend its shot with a **~2-second still-or-near-still moment at the START and END of every shot** (a held look, a settled pose, a held breath before/after motion). The middle can be as kinetic as the script demands; the boundaries earn the cuts. The editor's job is to **verify** that boundary stillness exists (see QA) and to land each cut **on it** — concat-demuxer cuts are hard cuts at clip boundaries, so the stillness is what makes the seam invisible. If a clip arrives with motion running right to its last frame, the cut will pop — kick it back to the render worker (overclock-cinema-plan) for a stillness bookend; do not paper over it in the edit.

### ffmpeg concat-demuxer pass

Collect the mp4 paths via `handoff_list`, write a concat list in cut-grammar order, run the demuxer:

```bash
# concat.txt — one line per shot, in double-contrast cut order, absolute paths:
#   file '/abs/path/shot1.mp4'
#   file '/abs/path/shot2.mp4'
#   file '/abs/path/shot3.mp4'
ffmpeg -f concat -safe 0 -i concat.txt -c copy assembled.mp4
```

- `-c copy` → stream copy, no re-encode (fast, lossless) — works when every clip shares codec/resolution/fps (they do: all Seedance mp4s).
- `-safe 0` → allows absolute paths in the list.
- If a clip has a mismatched stream and `-c copy` produces glitches at a seam, re-encode that pass instead: drop `-c copy` and let ffmpeg normalize (`-c:v libx264 -pix_fmt yuv420p`). Re-encode is the fallback, not the default.

### Layer the narration track

Seedance mp4s are **silent** — audio is never baked in. The narration arrives as a separate `narration.mp3` from **overclock-cinema-voice**. Layer it last:

```bash
ffmpeg -i assembled.mp4 -i narration.mp3 -c:v copy -c:a aac -shortest final.mp4
```

- `-c:v copy` → don't touch the picture.
- `-c:a aac` → encode the audio track.
- `-shortest` → end output at the shorter of the two streams.

---

## Job 3 — Pre-delivery QA gate

Diagnose before you ship. The QA gate is binary (proved / gaps cataloged) — write it before assembling so there's no post-hoc rationalization.

### The runtime-sum invariant

**The assembled runtime MUST equal the sum of the shot runtimes** (within rounding). If `assembled.mp4` is shorter than `Σ shot durations`, a clip was dropped, truncated, or the concat list is missing a line. Check it:

```bash
# Per-shot durations:
for f in shot*.mp4; do
  ffprobe -v error -show_entries format=duration -of csv=p=0 "$f"
done
# Assembled total — must equal the sum above:
ffprobe -v error -show_entries format=duration -of csv=p=0 assembled.mp4
```

If the totals diverge: the concat list is wrong (missing/dup line), or a source clip is corrupt. Fix the list; do **not** re-render to "pad" the runtime.

### QA checklist (run before delivering `final.mp4`)

- [ ] **Runtime-sum invariant holds** — `assembled.mp4` duration == Σ shot durations (within rounding).
- [ ] **Shot count matches the shot list** — concat list has exactly one line per planned shot, in cut order.
- [ ] **Cuts land on stillness** — each clip is near-still at its first and last ~0.5s (the 2-second-stillness bookend). Scrub the seams; a cut on motion pops.
- [ ] **Double-contrast cut grammar** — adjacent clips contrast on two axes (size + energy, or palette + speed). No cut changes only one thing.
- [ ] **Continuity holds across SEQUENTIAL edges** — the start of shot N+1 visually matches the end-frame of shot N (the `imageUrl` handoff landed).
- [ ] **Audio present and in sync** — `final.mp4` has the narration track; `-shortest` didn't clip the picture early; narration isn't baked into a silent gap.
- [ ] **Uniform streams** — all clips share resolution / fps / codec (so `-c copy` is valid); if not, re-encode the concat pass.
- [ ] **No crisp-text artifacts** — any title card / logo / lower-third / stat-reveal is a Remotion segment, not a hallucinated Seedance frame (see boundary below).

Verify resolution/fps uniformity quickly:

```bash
for f in shot*.mp4; do
  ffprobe -v error -select_streams v:0 \
    -show_entries stream=width,height,r_frame_rate,codec_name \
    -of csv=p=0 "$f"
done
# Every row must match. A mismatch → re-encode that clip before concat.
```

---

## The diffusion-vs-code boundary — crisp text is NOT assembled here

**Seedance hallucinates text.** Diffusion video and code motion-graphics are different engines. The editor does not try to fix illegible words/numbers/logos in the cut — that's the wrong engine, not a bad edit.

| AI Video (Seedance) | Code Motion Graphics (Remotion) |
|---|---|
| Predicts pixel sequences | Generates Remotion code |
| Text can hallucinate / distort | Text is always crisp (it's code) |
| Each change = full async re-render | Real-time, non-destructive edits |
| Output: silent mp4 | Output: mp4 + deployable source |
| Good for: cinematic scenes | Good for: brand, typography, data, structure |

**Route OUT to Overclock's Remotion skills** (`remotion-best-practices` / `video-post` / `reels-editor`) whenever a segment is: kinetic typography / quote cards, logo animation / brand intro-outro / bumper, counting / number infographics / stat reveals / bar charts, exact-hex brand-color text, lower thirds / title cards / CTAs, countdown timers / scoreboards. **Symptom that means "wrong engine, not bad edit":** someone keeps re-rolling a Seedance clip to get a word/number/logo legible. Stop tuning — that segment renders in Remotion and gets **concatenated in** as another file in the same `concat.txt`.

**Hybrid assembly is the right answer for most ads** — the editor stitches both engines on the same concat demuxer:

> 1. hook text 0–2s (Remotion motion-graphic — stops the scroll)
> 2. product / lifestyle footage 2–8s (Seedance video gen — shows the thing)
> 3. CTA + offer card 8–12s (Remotion motion-graphic — drives the action)

All three are `file '...'` lines in `concat.txt`; ensure the Remotion exports match the Seedance resolution/fps before `-c copy` (else re-encode the pass).

---

## Capability gaps — surface honestly, do not invent

This skill cannot manufacture what the engines don't produce:

- **No music / SFX / BGM** — `overclock_audio_generate` (via overclock-cinema-voice) is ElevenLabs **TTS only**. The editor layers a narration track and nothing else. If a brief needs a music bed or sound effects, flag it as out of scope.
- **No true lip-sync / talking-head.** Seedance mp4s are silent with no in-video lip engine. The per-character-gen + picture-in-picture composite is a clearly-flagged **MANUAL workaround only** (lips will not be frame-accurate), never a supported path. For real lip-sync, route the user OUT of cinema.
- **No upscale / recast / character-swap** on already-animated video — re-animate an edited keyframe instead (back to overclock-cinema-shot → overclock-cinema-plan), don't ask the editor to "fix" a rendered clip.
- **No motion-reference input.**

If a clip is structurally broken (drift, morphing, cut-on-motion, mismatched stream), the fix is upstream: kick it back to the render worker via the orchestrator — the editor does not re-roll renders or invent ffmpeg filters to mask a generation flaw.

---

## Sibling cinema skills

- **overclock-cinema-shot** — generates the stills / Hero Frames / reference sheets (`overclock_image_generate`). Supplies the keyframes the SEQUENTIAL chain feeds back into.
- **overclock-cinema-plan** — writes the Seedance motion prompts (`overclock_video_generate`), owns the 2-second-stillness bookend and one-move / beat-density cut rules. The editor enforces that those bookends actually arrived in the clips.
- **overclock-cinema-voice** — generates the narration track (`overclock_audio_generate`, ElevenLabs TTS). The editor layers its `narration.mp3` last with `-shortest`.
- **overclock-cinema-cut** (this skill) — extracts end-frames, concats in double-contrast order, runs the runtime-sum QA gate, ships `final.mp4`.
