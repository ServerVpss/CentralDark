---
name: overclock-cinema-plan
description: "Use when a squad worker must PLAN a multi-shot video — decompose a brief into a shot list with beat structure, write a continuity bible, and lock character / style across shots. Covers the 6-scene arc, the cut rules (one transformation / one action / one camera move / 1-2 beats per 5s), genre + ad recipes, the two-layer brief (Layer-1 prose brief vs Layer-2 execution prompt), and shot-bridging (how shot N+1 continues from shot N). Bind to the planner / director worker — NOT the orchestrator. Triggers: shot list, storyboard, video plan, multi-shot decomposition, continuity bible, character consistency across shots, ad format, genre template, beat structure."
---

# overclock-cinema-plan — The Director Worker

Turn a brief into a shot list + a continuity bible + per-shot Layer-1 briefs, then hand them back to the orchestrator for fan-out. This is the decomposition intelligence of the cinema crew.

> **Where this skill lives.** Bind `overclock-cinema-plan` to the **director / planner WORKER** pane, never to the orchestrator. The orchestrator is fixed and generic — it carries no skill and only routes, spawns, and collects. The director worker is the brain that reads the brief and emits the plan. Its deliverable is **three artifacts**: (1) a shot list (the squad DAG), (2) one Layer-1 prose brief per shot, (3) the shared anchor spec (continuity bible + reference-PNG plan + locked style preamble). The orchestrator consumes those and fans each shot to a **overclock-cinema-shot** DP worker that writes the Layer-2 execution prompt and calls the tool.

> **Layer split (governing law).** This skill OWNS planning + decomposition + continuity policy. It writes plan documents and prose briefs — it never invents tool params. Execution is fixed and lives in sibling skills:
> - **Video** → `overclock_video_generate(prompt, imageUrl?, outPath?)` — Seedance via fal.ai, the ONLY video engine. Text-to-video; image-to-video when `imageUrl` is a png path. Silent mp4. **No aspect/duration/fps params** — those go into the prompt body as style language.
> - **Image** → `overclock_image_generate(prompt, provider, imageUrl?, outPath?)` — `google-image` (nano-banana: cinematic/character/painterly) | `openai-image` (gpt-image: layout/text/branding). Text-to-image; image-to-image / edit / restyle when `imageUrl` is a png path or URL.
> - **Audio** → `overclock_audio_generate(prompt, voiceId?)` — ElevenLabs TTS only. No music/SFX/BGM. Separate post-layered track, never baked into the mp4.
> - **Frame extraction / assembly** → Bash ffmpeg. **Crisp typography / logos / infographics route OUT** to Remotion skills (Seedance hallucinates text).

Sibling cinema skills: **overclock-cinema-shot** (writes the Layer-2 Seedance/image prompt strings the DP worker fires) · **overclock-cinema-cut** (ffmpeg concat assembly + cut grammar) · **overclock-cinema-voice** (ElevenLabs TTS narration track). This skill cross-references all three; it does not duplicate their craft.

---

## The director worker's job, in order

A project planned at the script-and-bible level lands consistently; a project assembled prompt-by-prompt drifts on character, style, and continuity within three or four generations. The director worker runs these passes **itself**, before any DP worker is spawned. Each pass produces an artifact the next consumes.

> Concept → Project script → Scene breakdown → **Shot list** → per-shot **Layer-1 briefs** → **continuity bible + anchor spec** → (hand back to orchestrator) → DP workers write Layer-2 prompts → generate → review → fix and finalize.
>
> The power is not in one perfect prompt. The power is in the plan.

**Pass 1 — Lock the project, not the prompt.** Nine fields, first:

> Project type · Main subject · Visual style · Scene goal · Audience · Mood · Length · Setting · **What must stay consistent**

The last field is load-bearing — it decides the continuity contract. If you don't know what must stay consistent, every other field can be locked and the result still feels disjointed.

**Pass 2 — Master Script.** The single project blueprint (NOT a screenplay — it explains the full idea clearly). Must include: the story/concept · the scene order · the main characters or products · the visual style · the camera rules · the setting · the emotional tone · the continuity rules · what should never happen. Without it, each shot is its own random island.

**Pass 3 — Separate the script from the prompt.** "The script is what happens; the prompt is how the AI shows it." Keep them in separate documents; don't let prompt-shaped instructions leak into the script. Each story beat decomposes into four production-instruction categories: **Camera Notes · Lighting Direction · Subject Movement · Environment Detail.**

**Pass 4 — Give every scene one job** (the 6-scene arc, below).

**Pass 5 — Cut the scenes into pane-sized shots** (the cut rules, below). The shot list IS the squad.

**Pass 6 — Build the continuity bible + anchor spec** (the bible, below). This is the shared persisted contract every downstream worker reads.

**Pass 7 — Write one Layer-1 brief per shot** (the two-layer authoring section, below).

**Pass 8 — Write the falsifiable success rubric BEFORE handing back** (below), so acceptance is binary, not post-hoc.

---

## The 6-scene decomposition arc (narrative → shot list)

A reusable narrative-to-shotlist mapping. The arc gives the *purpose* sequence; the cut rules below decide where each scene splits into pane-sized generations.

> **Scene 1 — Establishing shot** — wide, sets location.
> **Scene 2 — Character introduction** — medium, shows protagonist.
> **Scene 3 — Action beat** — closer, movement.
> **Scene 4 — Reaction** — close-up, emotion.
> **Scene 5 — Consequence / turn** — medium or wide.
> **Scene 6 — Resolution / button** — varies.

Six scene purposes cover most work: **Introduce the character · Show the location · Build tension · Reveal the product · Create emotion · Deliver the action.** A good scene answers six questions: *Who is in the shot? · Where is the camera? · What is the subject doing? · What should the viewer notice first? · What must stay visible? · What should not happen?* Trying to make one scene do too much causes blending — messy motion, wrong angles, extra people, broken hands, missing objects.

A scene may span multiple shots. The arc tells you the purpose order; the cut rules tell you the splits.

---

## The cut rules — where the script breaks into shots

Each shot is one pane's job. Four rules decide where the script cuts.

**Cut rule 1 — One transformation per shot.** Plan exactly **one state change per generation** — one location to one location, one emotional beat to the next, one action to its consequence. Multi-beat shots ("she enters, sees the body, draws her weapon, advances") force the model to interpolate between two or three different intents and the result drifts on at least one of them. **Cut the shot at the first beat. Generate the second beat as its own shot.**

**Cut rule 2 — One primary action per clip.** One primary action per Seedance clip, with one or two secondary actions max. (This is the per-shot action-count rule, distinct from each scene's narrative purpose.) See overclock-cinema-shot § One Action Per Clip.

**Cut rule 3 — One camera move per shot.** One dominant camera move per generation. Stacking moves ("dolly in then whip-pan then crane up") is a multi-transformation in disguise and drifts the same way. If a scene needs two moves, it is two shots.

**Cut rule 4 — Beat-density gate (1–2 beats per 5 seconds → split).** Budget **1–2 beats per 5 seconds** of clip. A "beat" is any state change the eye registers (an action, a reaction, a reveal, a camera move, a lighting shift). If a planned shot exceeds ~2 beats per 5s, the model has too much to interpolate — **split it** into more, shorter shots / more panes. Denser scripts mean more panes, not longer clips.

### Beat-density table

| Window | Beats | Example |
|---|---|---|
| 3–5s | 1–2 | Jump + land |
| 5–8s | 2–3 | Jump + land + draw weapon |
| 8–12s | 3–5 | Jump + land + draw + fire + take cover |
| 12–15s | 4–6 | Full action sequence → **use multi-shot** |

> **One-action exemplar.** WRONG (one shot): "She jumps over the wall, rolls on landing, draws her weapon, and fires three shots while running." RIGHT (3 shots): Shot 1 "She leaps over the wall, coat flaring. Landing hard, she rolls forward." · Shot 2 "Rising from the roll, she draws her weapon in one fluid motion." · Shot 3 "Running at full sprint, she fires three shots. Muzzle flash lights up the alley."

**Single-generation discipline.** Plan the shot well enough that the **first generation is the work**. Generate-and-pick-from-twenty is a budgeting failure, not a workflow. Treat each generation as the deliverable — even though a *keeper* may still cost dozens of attempts (that's the funnel, not the plan).

> **Scroll-driven web heroes are a different crew.** A *scrub hero* (scroll = playback time), a seamless background loop, or a site hero clip is NOT narrative video — it is one continuous take with zero stillness, and the cut rules / 6-scene arc / 2-second stillness contract here are wrong for it. That craft lives in the **Cinema Site** squad (`overclock-site-scrub` / `overclock-site-encode`), not here. If the brief says scrub / scroll / scrollytelling / scrubbable / background loop / web hero, route it there.

---

## Dependency taxonomy → the squad DAG

The shot list becomes a DAG. Separate every shot by **what it actually depends on** — this separation produces speed without sacrificing structural control, and it *is* the DAG the director hands back.

| Bucket | What it is | Placement in the DAG |
|---|---|---|
| **Depends on a final frame** | needs the previous generation's output (continuation anchors, edits to a rendered frame) | **SEQUENTIAL edge** — shot N waits on shot N-1's extracted end-frame as `imageUrl` |
| **Writable in parallel** | independent shots; no rendering dependency | **PARALLEL fan-out** — DP workers run simultaneously |
| **Backbone building** | scene order, bridge identification, continuity-arc mapping | **the director worker itself** (this skill, before fan-out) |
| **Waits for later refinement** | shot-level inserts, micro-prompts, beat adjustments | **refinement wave** — after the structure is locked |

**Topology picker (the director's first call per cluster):**

| You are planning | Topology |
|---|---|
| Single cinematic shot | **No squad.** One image (Hero Frame) → one video. Over-engineering a single 5s clip is a pitfall. |
| Short film / series, consistent style | **Parallel fan-out** — all shots share ONE reference PNG + locked style preamble; DP workers run simultaneously. |
| Social series, same character | **Parallel fan-out** — character locked once, per-post template, identical style modifier every post. |
| Quick A/B speed run (≤5 directions) | **Parallel fan-out**, no assembly — single clips, direct export. |
| Style changes per scene OR each shot needs the prior shot's end-frame | **Sequential continuity chain** — shot N receives shot N-1's extracted end-frame as `imageUrl` + shot N-1's prompt as context. |
| Mixed | **Hybrid DAG** — parallel clusters of same-style shots, joined by sequential edges where continuity is load-bearing. |

Draw the DAG explicitly before handing back — nodes are shots/panes, edges are end-frame handoffs (the bridges, below).

### Shot-density heuristic (how many panes)

Denser script = **more panes, not longer clips.** Each shot caps at one transformation / one primary action / one camera move / ~2 beats per 5s. When a planned shot exceeds any of those, split it and add a pane. The director sizes the squad by counting the beats in the Master Script and dividing by the beat-density budget — not by guessing a shot count.

---

## TWO-LAYER PROMPT AUTHORING (the brief the director writes vs the prompt the DP writes)

This is the load-bearing handoff and the most common point of failure. There are **two distinct documents**, written by **two distinct panes**:

**Layer 1 — the per-shot PROSE BRIEF (the director worker writes this).** Plain-language, structured, complete. It tells the DP worker everything needed to write the execution prompt **without re-deriving the project**. A Layer-1 brief names:

- **Subject** — who/what is in frame (by reference handle when a recurring character; by visual markers otherwise — never by proper name or age label).
- **Beat** — the single transformation/action this shot delivers, and its place in the 6-scene arc.
- **Look** — the locked style preamble (palette / grade / lighting / optical feel), copy-pasted from the bible, identical every shot.
- **Continuity refs** — which reference PNG path is this shot's `imageUrl`; for a bridged shot, the end-frame path AND a short text description of that frame (see Bridging).
- **Constraints** — the project negative-rules list, the one camera move, the per-genre artifact class to self-check, the 2-second stillness bookend mandate.

**Layer 2 — the EXECUTION PROMPT (the overclock-cinema-shot DP worker writes this).** The tight Seedance/image string the tool actually receives — CSLA / six-slot formula, Identity-vs-Motion split, named camera move in plain language, anti-slop scrubbed. **This skill does not write Layer 2.** It hands Layer 1 to the DP and lets overclock-cinema-shot compile it.

> **Failure mode — thin Layer-1 briefs cause restaged, broken-continuity output.** When the director hands back a brief that says only "shot 3, she runs," the DP worker invents the wardrobe, re-stages the location, re-describes the face, and picks a random camera — and across N parallel panes every invention diverges. The continuity bible exists precisely so the brief is **thick**: the DP fills in *motion only*, never *identity, style, location, or look*, because the brief already pinned them by reference. **Rule of thumb: if the DP worker has to guess any appearance, location, or style fact, the Layer-1 brief was too thin — thicken it before fan-out.**

### Per-shot Layer-1 brief schema (what the director emits per shot)

```
[SHOT]       index · purpose (6-scene arc) · topology (parallel | sequential edge from shot K)
[ANCHOR]     imageUrl = <shared reference PNG path>   (identical across same-asset shots)
             — or, for a bridged shot: frameK.png (extracted end-frame of shot K) + its text description
[IDENTITY]   <verbatim Identity Block — copy-paste from the bible, NEVER reworded>
[LOOK]       <locked style preamble — palette/grade/lighting/optical, identical every shot>
[BEAT]       the ONE transformation/action this shot delivers; one camera move (named in plain language)
[MOTION NOTE]← what MOVES or CHANGES (the DP expands this into the Layer-2 Motion Block). One primary
             action, ≤2 secondary. Bookend with the 2-second stillness contract.
[NEGATIVE]   <project negative-rules list — grows as failures become rules>
[GATE]       per-genre artifact class to self-check first (Action→Body/Motion; Horror→Content/Safety;
             Character→Face/Identity); run the overclock-cinema-shot pre-flight lint before generating.
```

The orchestrator receives one of these per shot, plus the shared anchor spec, and fans each to a DP (overclock-cinema-shot) worker.

---

## BRIDGING — how shot N+1 continues from shot N

Sequential continuity is the single highest-leverage method for any image-to-video model: **feed the previous scene's end-frame + a description of it into the next scene's brief.** Style can change radically scene-to-scene while character, props, and story continuity hold.

A bridged DP worker receives **three** inputs in its Layer-1 brief:

1. **The motion note** (the DP expands it into its own Motion Block over the locked Look).
2. **The end-frame of shot N as `imageUrl`** — passed as the start image of shot N+1.
3. **A short TEXT DESCRIPTION of that end-frame, pasted into the brief.**

> **Why the text description is non-negotiable.** The prompt-writer (DP worker) is a **different pane** from the generator and from the pane that rendered shot N. The DP cannot see the pixels of `frameN.png` while it writes — so the look of that frame must be **described, not assumed**. Bridge = `imageUrl` (the pixels) **AND** a 1–2 sentence prose description of the frame (the look the DP writes toward): pose, framing, light state, what's settled and ready to move. Omit the description and the DP re-describes from imagination, breaking the seam it was supposed to make invisible.

**The extraction step (Bash ffmpeg — the director plans it, overclock-cinema-cut / the DP runs it):**

```bash
ffmpeg -sseof -0.1 -i shotN.mp4 -frames:v 1 -q:v 2 frameN.png
```

`-sseof -0.1` seeks to 0.1s before end; `-frames:v 1` grabs one frame; `-q:v 2` keeps it near-lossless. Then `frameN.png` becomes shot N+1's `imageUrl`. **End frame of shot A = start frame of shot B = seamless continuity.** End frames carry the model's own physics (motion blur, weight, momentum) and compositions you'd never prompt directly.

**Pairs with the 2-second stillness contract.** Every shot bookends with stillness so cuts land cleanly and the extracted end-frame feeds the next shot without a mid-action jolt:

> Prompt an explicit **~2-second still-or-near-still moment at the START and END of every shot** — a held look, a settled pose, a held pause before motion begins, a held breath after motion stops. Editors land morph/smooth cuts on **stillness, not motion**. The middle can be as kinetic as the script demands; the boundaries earn the cuts.

This is a mandatory line in every Layer-1 brief's `[MOTION NOTE]`.

**Continuation five rules** (the director encodes these into bridged briefs): (1) Last-frame anchor. (2) Identity Block pasted verbatim. (3) Prior clip as secondary memory — one referential phrase. (4) Immediate continuation — next frame, no skip/fade/cut. (5) No action repeat — extend, don't loop. Anti-repeat phrases to seed: `start immediately after the final frame` / `do not restage the earlier beat` / `continue forward into the new action` / `preserve the same fatigue state and emotional carryover`.

> **Capability gap — no true keyframe interpolation.** `overclock_video_generate` accepts a single `imageUrl` (start anchor only); there is **no end-frame param**. The frame-extraction chain above is the substitute — chain short shots, each starting from the previous shot's extracted last frame. Document this; don't promise start/end interpolation.

---

## The continuity bible (the anchor spec the director hands back)

Independently-running DP workers will each reinterpret the character, the room, the product — unless identity is **referenced, not re-described.** Re-describing an asset inside each prompt is the root cause of every-shot-reinterprets-the-X drift. The director enforces a four-part contract in the bible:

1. **ONE shared reference PNG → SAME `imageUrl` to every worker.** Each recurring asset is generated ONCE via `overclock_image_generate`, then the *identical* file path is distributed as `imageUrl` to every shot that needs it. Build a reference sheet when a property appears in **3+ shots**; single-shot details get written inline.

2. **Verbatim Identity Block in every brief.** Copy-paste the character description **identically** into every brief. Even small wording differences drift the character between panes. Identity (face, build, hair, costume, marks) lives in the reference PNG + Identity Block; **never** put face/clothing descriptors into the Motion note where an identity reference is active.

3. **Locked Look preamble in every brief.** The style modifier (palette, grade, lighting technique, optical feel) is **identical every time; only the scene changes.** Written once, prepended to every brief, locked.

4. **Workers author ONLY motion.** Identity, Look, location are bible-owned and locked. Each DP authors only what *moves* in its shot.

> For multi-character shots, the director also approves ONE top-down spatial-blocking schema and every brief references it in **absolute** terms — "Gandelfina stands behind the table, facing east at the window; Roko stands 2m from her, facing north toward the door" beats "Gandelfina near the table, Roko nearby." See overclock-cinema-shot § Spatial Blocking.

### Identity vs. Motion split (the anti-drift law)

When a reference PNG is active, every prompt MUST split into two blocks. The director writes the Identity Block once into the bible; the DP writes the Motion Block per shot.

| Identity Block (bible-owned, verbatim) | Motion Block (DP-owned, per shot) |
|---|---|
| Face shape, skin tone, eye color | Camera movement name |
| Hair style, color, length | Action verbs (runs, turns, sits) |
| Body type, height, build | Environmental motion (wind, rain, lights) |
| Clothing, accessories, jewelry | Speed and timing cues |
| Scars, tattoos, distinguishing marks | Atmospheric changes (light shifts, fog) |
| Color palette of the character | Style and color grade of the scene |

**Why it works:** the model morphs the face mid-clip when it re-reads face descriptors *while* processing motion. Keeping descriptors out of the motion text locks identity. **Key rule:** the PNG already carries the face — describe only what is *different* from the base character (changed clothing, setting, expression, action).

### Character sheet (build-time geometry for the reference PNG)

A multi-angle reference dramatically improves consistency across extreme angles and profiles. Generate the whole sheet in **one prompt → one 16:9 image → 3×2 grid, six labeled panels**, identity described once (single-pass keeps identity maximally locked; multi-step assembly drifts panel-to-panel). Use `overclock_image_generate(provider:'google-image')`.

- **P1 — Front body** (straight-on neutral, head-to-toe) · **P2 — 3/4 turn** (~30°, weight on back hip) · **P3 — Back body** · **P4 — Waist-up portrait** · **P5 — Hands detail close-up** (ring stack, nail finish, held prop) · **P6 — Face detail close-up** (collarbone-up; keep as the cut-and-paste face source for plasticky wide-shot faces).

Close with: `Identical character identity locked across all six panels. Uniform studio backdrop and lighting across all six panels.`

> **Capability fact — refine by re-prompting, never editing.** Both image providers are **text-to-image only**; `overclock_image_generate` takes no image input. To fix a detail, tighten that ONE clause in the Identity Block (single-variable rule) and **regenerate** — same locked block + the fix. There is no edit/inpaint call. For continuity across multiple **stills**, paste the **identical Identity Block + locked Look preamble** into every text-to-image prompt — verbatim reuse is the *only* cross-image identity mechanism (no reference-image input exists).

### Character anchor block (shot-time, per character in frame)

The director names, per character per shot, ten attributes the DP must honor: **1 Identity · 2 Screen position (qualitative + %) · 3 Depth layer (fg/mg/bg) · 4 Frame occupancy (%) · 5 Body orientation (toward camera / away / profile-left / profile-right / three-quarter) · 6 Pose · 7 Gaze direction (frame-position or `looking at Character B`) · 8 Contact points · 9 State lock (calm/exhausted/injured/soaked/in motion) · 10 Facial expression.**

**Multi-form state tracking (script supervising).** When a character changes state across the project — persistent wounds, a costume change, a multi-stage transformation — generate a **separate reference PNG per state**. A five-stage character (initial → fight-injuries → partially-transformed → almost-fully → completely-transformed) gets **five distinct reference PNGs**. The shot list references the matching PNG by path; the brief names the stage in the Identity Block. One `overclock_image_generate` pass per state; payoff is no continuity bug surfacing at frame-review time.

### Project Bible — copy-paste character block

Maintain a plain-text bible the director and every DP worker share, one block per character:

```
CHARACTER: Anna
  reference PNG: char_anna.png        (state variants: char_anna_injured.png)
  face/body: late 20s, oval face, green eyes, light freckles, tall slim build
  hair: shoulder-length auburn, loose waves
  wardrobe (default): fitted black leather jacket, dark indigo jeans, white sneakers
  signature: silver pendant, left-wrist watch
  state notes: SHOT 4+ uses char_anna_injured.png (cut on cheek, torn sleeve)
```

The bible is the single source of truth for identity. A DP worker pastes the matching block into its Identity Block and the matching PNG path into `imageUrl` — so identity holds across panes, not just across shots.

---

## Genre recipe bank (9 core beat-structures → shot decompositions)

Each genre = a **core pattern** (the reusable narrative spine, also the shot-decomposition map) + a camera vocabulary rendered as plain prose. The director picks the pattern, splits the beat-structure into N shots, and writes one Layer-1 brief per shot. The DP compiles each into a Seedance prompt. (Camera names are **prose descriptions of the move**, never preset/control IDs — Seedance reads camera description.)

| # | Genre | Core pattern (beat structure) | Camera (prose) | Squad shape |
|---|---|---|---|---|
| 1 | **Action / Chase** | `Establish → Pursuit → Obstacle → Climax` | Action Run, FPV Drone, Crash Zoom In, Bullet Time | 4 shots → 4 panes |
| 2 | **Emotional Drama** | `Establish space → Reveal character state → Emotional beat` | Dolly In, Arc, Head Tracking, Focus Change | usually 1 continuous take |
| 3 | **Product Ad** | `Texture reveal → Feature showcase → Emotional connection → End frame` | Lazy Susan, Dolly In, Robo Arm | hero still first → I2V reveal |
| 4 | **Sci-Fi / Futuristic** | `World establish → Reveal tech/threat → Action beat` | Crane Up, FPV Drone, Super Dolly Out, Dutch Angle | 3 shots |
| 5 | **Horror / Supernatural** | `False calm → Wrong detail → Escalation → Reveal` | Dolly In, Dutch Angle, Handheld, Crash Zoom In | 3–4 shots |
| 6 | **Romance / Intimate** | `Meeting of eyes → Tension → Connection moment` | Arc, Dolly In, Focus Change, slow push to near-kiss | 1–3 shots |
| 7 | **Documentary / Nature** | `Environment establish → Subject in context → Observational moment` | Crane Down, Timelapse, Dolly L/R, Overhead | 3 shots; **no artificial effects — pure observational** |
| 8 | **Dance / Music Video** | `Establish space → Performance builds → Beat sync climax` | 360 Orbit, Dolly In/Out on beat, Overhead, Crash Zoom In | 3+ shots; mp4 silent — music layered in overclock-cinema-cut |
| 9 | **Transformation / Before & After** | `Before state → Trigger → Transformation → After state` | Dolly In to trigger, single continuous take where possible | 1 continuous take; **name the explicit midpoint** |

**Per-genre negative-constraint routing (keep verbatim).** Pick the genre, then pre-empt that genre's typical artifact class in the `[GATE]` slot before the DP generates:

> **Action recipes → Body/Motion. Horror → Content Filter/Safety. Character-focused → Face/Identity.**

**Transformation requires an explicit midpoint.** A single-take state change MUST name the in-between (seams pulling, hairline fissures of blue light tracing the sternum). Without it the model snap-cuts or renders an ambiguous blur. One continuous take inside one clip.

---

## Ad preset bank (9 marketing recipes → prompt prefixes)

For marketing work the director picks a preset, then the brief = `preset camera/register + (optional hook scenario) + (setting) + product/concept + Camera Contract + Look + negative cluster`. The DP compiles it to a Seedance prompt. (All the Higgsfield routing API — `marketing_studio_video`, `hook_id`, `setting_id`, avatars/medias, credits — is **dropped**; these are named prompt templates only.)

| # | Preset | Camera / register | Notes |
|---|---|---|---|
| 1 | **UGC** | Phone-native selfie framing, handheld, eye-level, single continuous take; casual conversational | ASMR variant = intimate setting + TTS narration + NO hook |
| 2 | **Tutorial** | Stable camera (tripod / overhead / locked handheld); cuts allowed between steps; imperative voice ("apply," "hold," "press") | step-by-step how-to / recipe |
| 3 | **Unboxing** | Top-down or 3/4 angle; hands in frame; tactile close-ups on reveal moments | needs a packaging asset image (gen via `overclock_image_generate`, pass as `imageUrl`) |
| 4 | **Hyper Motion** | Kinetic product hero (splash / pour / spin / drop); whip pans, orbits, speed ramps; auto pack-shot; **works without a person** | runs on **5-word prompts** when an asset reference carries the load; logos can be the hero |
| 5 | **Product Review** | Medium shot of presenter + B-roll inserts of product detail | measured, observational, third-person |
| 6 | **TV Spot** | Composed dolly / crane; structured arc (establishing → product → lifestyle → hero/logo) | 5-word-prompt capable; **default packshot beat must be explicitly negated** when unwanted |
| 7 | **Wild Card** | Surreal one-shot; permission to break ad grammar — impossible geometry, surreal scale | — |
| 8 | **UGC Virtual Try-On** | Selfie or mirror framing; casual environment; natural movement (turn / walk / gesture); phone-native | try-before-buy, casual register |
| 9 | **Pro Virtual Try-On** | Studio quality; clean backdrop (cyc wall / seamless); controlled lighting; composed poses; orbit / push-in / static editorial | editorial / lookbook |

**Hook library** (visual scene *structures* pasted into the brief, not captions): **Stunt** — Product Hit · Random Object Mic · Blizzard · Product Dodge. **Subtle** — Spicy · Interview · Product Crash · Camera Bump · Epic Fail.

**Setting library:** **Realistic** — Bedroom · Bathroom · Kitchen · Office · In Car · Street · Gym · Nature. **Unrealistic** — Airplane Wing · Roofing · Volcano Rim · Tiny Reviewer · Car Roof · Train Surf.

**Load-bearing ad prompt-craft the director seeds into briefs:**

- **Camera Contract** — open with a hard camera rule, reinforce per beat: `CAMERA: COMPLETELY STATIC throughout. Fixed position, fixed angle, zero movement. Only subjects and objects move within the frame.` (or the side-on drift variant: `Camera stays strictly side-on the entire time, drifting smoothly alongside him at constant speed and height, never ahead, never behind, never rotating. One continuous uncut shot.`)
- **Identity lock** (avatar system dropped; the craft survives via the reference PNG): `the female model — use her exact face, hair, and body throughout the entire video without any changes.`
- **Multi-clip campaign header** propagated to every clip/pane, then one named `## CLIP N` per shot — this IS shot decomposition: the director writes the shared LOCATION + CAMERA contract, fans each `## CLIP N` to a DP, then overclock-cinema-cut assembles in order via ffmpeg concat. Continuity = identity lock + a shared reference PNG passed as `imageUrl` + each clip's "already wearing X" state handoff.
- **Single-color anchor** — name ONE saturated color as "the only saturated color" and pin a hex (`#d1fe17`) so it stays exact across regenerations.

**Per-format negative-constraint clusters (keep verbatim):**

| Cluster | Use when |
|---|---|
| `NO bag, NO backpack, NO purse` (per clip) | model keeps adding incidental props to a person |
| `No VFX. No box unpacking.` | TV Spot / clean street look |
| `NO visual effects, NO lightning, NO energy beams, NO particles, NO light trails on the character.` | model over-adds energy FX |
| `ABSOLUTELY NO PACKSHOT. NEVER SHOW ISOLATED PRODUCTS.` | TV Spot's default packshot ending unwanted |
| `no shadows, no gradients, no clipping, no cropping` | clean product-shot isolation |
| `NO text, NO callouts, NO labels` / `NO letters, NO text, NO words` | Seedance hallucinates text — keep it out |

**Engine-limit workarounds (transferable creative devices the director plans around):** multi-location in one take → **portal cuts** ("hard straight-edged cuts in open air, he runs straight through"); outfit change → **levitating items** ("the moment he passes through a levitating item it is instantly on his body, perfectly fitted"); **liquid scan transition** (a mercury wave dissolves the environment and materializes a new one).

---

## Hero-Frame-first ordering (cheap before expensive)

The director sequences the DAG so cheap image gens gate before expensive video gens:

```
Step 1: 5–10 image variations (very low cost)        → find the one closest to vision
Step 2: refine that one image (low cost, re-prompt)  → get it exactly right
Step 3: animate ONCE from the perfect Hero Frame     → first animation already has a strong foundation
```

In the squad this means: the director plans a **reference/Hero-Frame cluster that fans out cheap parallel image gens and GATES on the stills being right BEFORE any video pane runs.** Never plan straight-to-text-to-video for a shot you care about.

> **Crisp text routes OUT.** Any shot whose intent is legible on-screen text, a logo lockup, an infographic, or a captioned title card does **not** belong in a Seedance prompt — Seedance hallucinates text. Route those to Remotion skills (`remotion-best-practices` / `video-post` / `reels-editor`) and composite. The director flags these in the plan as out-of-Seedance.

---

## Iteration-budget anchors (size the schedule honestly)

A squad video is a multi-hundred-generation async job. The director budgets with these conservative planning anchors (not guarantees):

> **Image acceptance ~1.0%. Video acceptance ~1.5%.** "1 in 64 video, 1 in 100 made it in."

- **Per accepted asset:** budget ~64 video gens / ~100 image gens. This is *why* parallelism is essential — heavy per-keeper gen counts make any schedule impossible without fanning out.
- **Per-character anchor:** locking a reusable character identity ≈ **~800 iterations** (~600 initial across pose/costume/expression + ~200 refinement). Front-load **only** when the character recurs across many shots — a character in 1–2 shots cannot justify ~800.
- **Per-shot anchor:** a single iteration-heavy 10-second establishing shot ran **72 generations**. Use **72-gens-per-10s as an UPPER BOUND**, not an average. Counterintuitively, conceptually-simple shots (a single pan + push-in) can be the *most* iteration-heavy. Cap a single shot at ~72 video gens before redesigning the prompt rather than brute-forcing.
- **Scale reference:** a 90-min fully-AI feature took **108,859 generations over 14 days** with a 15-person team. Heavy iteration is the **expected mode** of AI cinema — not a signal of failure.

**Two-wave schedule discipline.** **Wave 1 — full rough assembly:** fan **every** shot and get a complete rough cut — every scene present, even if rough. **Wave 2 — key-moment refinement:** re-fan **only** the emotionally-weighted shots, concentrating the remaining budget there; accept rougher takes everywhere else. Without this split, iteration cost blows the budget before the project is even assembled.

---

## Falsifiable success rubric (the director writes this BEFORE handing back)

Write the criteria first, then check binary (proved / gaps cataloged) on the assembled cut. This prevents post-hoc rationalization.

1. Viewer **stops perceiving AI generation** across the full runtime.
2. **Narrative coherence** — structured opening, middle, resolution; setups have payoffs.
3. **Characters register as inhabited people** — not model-produced figures with AI-cinema tells.
4. **Intended emotional beats produce the intended audience response.**
5. **Audience experiences unanticipated emotional impact** beyond script intent.

---

## Cut grammar the director hands to overclock-cinema-cut

The director annotates the shot list with sequencing so overclock-cinema-cut assembles correctly:

**Double-contrast cut rule** — order adjacent clips so they **contrast on two axes at once** (wide→close *and* static→moving, or cold→warm *and* slow→fast). A cut that changes two things reads as intentional editing; a cut that changes one reads as a continuity wobble. Scale: `extreme wide → wide → medium → MCU → close-up → ECU`. Camera character: `Handheld | Static | Stabilized tracking | Crane | Aerial` — never repeat across a cut. The 6-scene arc already alternates shot size and energy — preserve that alternation when sequencing. For action sequences, alternate reference-locked face shots with plain-text action shots; the viewer's brain fills in continuity between cuts.

Final assembly (ffmpeg concat in double-contrast order) and the separate TTS layer belong to **overclock-cinema-cut** and **overclock-cinema-voice** — this skill plans them, it does not run them.

---

## Capability gaps — surface honestly, do not invent

- **Video provider is FIXED to Seedance.** No model selection; drop all non-Seedance model IDs / CLI / MCP / credit machinery.
- **No music / SFX / BGM generation** — `overclock_audio_generate` is ElevenLabs TTS only; the mp4 is silent. Music/sound design come from outside the crew (overclock-cinema-voice handles the TTS narration track only).
- **No true lip-sync.** Talking-head is out of scope; the per-character-gen + picture-in-picture composite is a clearly-flagged **MANUAL workaround**, not a supported path. Flag before promising a talking-head.
- **No motion-reference input, no upscale/recast** — no motion-transfer param, no re-render-to-higher-fidelity, no character-swap on already-animated video (re-animate an edited keyframe instead).
- **No keyframe interpolation** — single `imageUrl` start anchor only; use the frame-extraction bridge chain.
- **Image edit / img2img IS supported** — both providers do image-to-image when `imageUrl` is set (nano-banana inlineData edit / gpt-image `/images/edits`). No discrete mask/inpaint param — describe the change in the prompt. Preserve a character/product across stills by passing the shared anchor PNG as `imageUrl`, NOT by re-describing it in prose.
- **Crisp typography / logos / infographics route OUT** to Remotion.

---

## Cross-references

- **overclock-cinema-shot** — compiles each Layer-1 brief into a Layer-2 Seedance/image prompt: CSLA / six-slot formula, Identity-vs-Motion split, One-Action-Per-Clip, Spatial Blocking, I2V "describe only what moves," the pre-flight lint gate.
- **overclock-cinema-cut** — Bash ffmpeg concat assembly in double-contrast cut order; the frame-extraction bridge step; routing-out to Remotion for crisp text.
- **overclock-cinema-voice** — the separate ElevenLabs TTS narration track, muxed in at assembly (no music/SFX).
