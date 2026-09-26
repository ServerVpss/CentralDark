---
name: overclock-cinema-shot
description: "Use when a squad worker must WRITE and GENERATE a cinematic shot — a Seedance video prompt via overclock_video_generate, or a still / hero / product / character image via overclock_image_generate. Covers the six-slot Seedance formula, camera / lens / shot-size / lighting / color-grade vocabulary, the mandatory content-filter lint gate, image-to-video via imageUrl, and shot-level troubleshooting. Bind to the render-video / render-image worker. Triggers: cinematic video prompt, Seedance, shot prompt, product shot, hero image, AI video generation, AI image generation, image-to-video, camera move, color grade."
---

# Cinema Photography — The DP Skill

> **Scrub / web-hero?** This skill is only the **vocabulary** (camera moves, lenses, grades, lint). The OWNER skill for a scroll-driven hero, background loop, or web clip is **`overclock-site-scrub`** — it holds the scrub *contract* and the pre-generation lint. **Load `overclock-site-scrub` first**; pull this one in for the prompt string. Do not run a web hero on this skill alone.

The cinematographer's complete kit: write the visual prompt, lint it, fire the render. This skill OWNS the prompt string and the shot-level decision of what goes in it. The Overclock tools OWN execution. The skill never invents a tool param — there is none beyond `prompt` / `imageUrl` / `outPath`.

This is the render worker's skill. Bind it to the `render-video` / `render-image` worker pane. Sibling cinema skills: **overclock-cinema-plan** writes the shot list and fans shots to you; **overclock-cinema-cut** does ffmpeg frame-extraction + concat assembly; **overclock-cinema-voice** post-layers the ElevenLabs TTS track. You write the shot and call the render tool.

---

## Execution Surface — The Three Tools (fixed, never reinvent)

| Layer | Tool | Takes | Returns |
|-------|------|-------|---------|
| Video | `overclock_video_generate(prompt, imageUrl?, outPath?)` | Seedance via Replicate. Text-to-video; image-to-video when `imageUrl` is a png path. | mp4 path (async, **silent**) |
| Image | `overclock_image_generate(prompt, provider, imageUrl?, outPath?)` | `google-image` (nano-banana — cinematic/character/painterly) / `openai-image` (gpt-image — layout/text/branding). Text-to-image; image-to-image / edit / restyle when `imageUrl` is a png path or URL. | png path |
| Audio | `overclock_audio_generate(prompt, voiceId?)` | ElevenLabs **TTS only**. No music/SFX/BGM/lip-sync. | audio path (overclock-cinema-voice owns this) |

**The one fact that shapes every prompt:** `overclock_video_generate` takes `prompt`, `imageUrl`, `outPath` — and nothing else. **No aspect ratio, no duration, no fps, no resolution params.** Those are not knobs. They go in the **prompt body as style language**. Want 16:9, 10s, 24fps? Write that into the prompt string. The skill writes the string; it never invents a param that does not exist.

```
overclock_video_generate(
  prompt: "<six-slot prompt, with aspect/duration/fps as in-body style language>",
  imageUrl?: "<png path — starting frame / character ref / extracted continuation frame>",
  outPath?: "<where the mp4 lands>"
)
```

---

## The CSLA Formula (MCSLA minus M)

Higgsfield's formula was **MCSLA** — Model, Camera, Subject, Look, Action. On Overclock you do NOT write the model into the prompt string — but you do NOT assume which engine it is either. **Call `overclock_media_providers` and read the video provider's `selectedModel` + `enabledModels`** — that is the REAL engine you have (commonly Seedance, but a Kling model may be enabled). You select the model via the tool's `model` param (or the squad pin), never in the prose. What survives in the prompt body is **CSLA**.

| Letter | Element | Description | Example |
|--------|---------|-------------|---------|
| ~~**M**~~ | ~~Model~~ | **OUT OF THE PROMPT STRING** — never write "use Kling/Veo/Sora" in the prose. But the engine is whatever is ENABLED (check `overclock_media_providers`), not assumed-Seedance. Need a capability only Kling has (`endImageUrl` 2-keyframe, real-face animation)? Only flag a gap if no Kling is enabled — if one IS enabled, select it via `model`. | — |
| **C** | Camera | Named camera control written as plain language | "FPV Drone shot weaving through the alley" |
| **S** | Subject | Who/what + appearance | "A woman in a sand-colored suit, sharp eyes" |
| **L** | Look | Style + color + lighting | "Cinematic, golden hour, anamorphic flare" |
| **A** | Action | What happens in the scene | "She turns slowly, wind lifting her coat" |

Token-weight order: **Subject → Action → Camera → Style** is the most reliable order. Early tokens carry disproportionate weight. Camera names are plain language now, not host presets — there is no Director Panel to click; Seedance reads the prompt body.

---

## The Six-Slot Seedance Formula

Every Seedance prompt should hit these six slots, in this order:

```
[Camera movement] + [Subject] + [Action] + [Setting] + [Style] + [Lighting]
```

All six are technically optional — but a prompt that includes all six almost never gets flagged, because the filter has full context to interpret every word. A prompt missing 3+ slots is where flags come from.

**Minimum viable prompt (~30 words):**

> **Slow dolly-in on a figure in a dark overcoat standing alone at the end of a rain-slick alley. Cold teal shadows, single practical streetlamp, shallow depth of field.**

Camera ✓ Subject ✓ Action ✓ Setting ✓ Style ✓ Lighting ✓ — all six slots, passes the filter because the scene is fully legible.

### Delegation levels (prompt length by ambition)
- **L1** ≤30 words, known domains — let the model direct.
- **L2** 30–100 words — subject + action + environment + camera note + style anchor.
- **L3** 100–300 words — time-segmented (`0–3s: ...`).
- **L4** 300–1000+ words — full choreography.

---

## Prompt Types — T2V / I2V / Continuation

### Text-to-Video (T2V)
Start from nothing. Call `overclock_video_generate(prompt)` with **no** `imageUrl`. Best for establishing scenes, environments, abstract concepts without a specific character.

```
[Subject + appearance].
[Environment — location, time, weather, atmosphere].
[Action — what happens and how].
[Camera — named move, plain language].
[Look — style + color grade].
```

**Example:**
```
A lone astronaut stands on the surface of a red desert planet, helmet visor reflecting
twin moons rising on the horizon. Dust spirals slowly in the thin atmosphere.
She turns to face the camera, gloved hand raised in a slow salute.
Camera: slow Crane Up revealing the vast emptiness behind her.
Style: desaturated orange and deep blue, letterboxed anamorphic composition.
16:9, 10s, 24fps.
```

### Image-to-Video (I2V)
Animate a provided still. The image is the starting frame. Call `overclock_video_generate(prompt, imageUrl)` where `imageUrl` is a **png path** — usually a keyframe you built first with `overclock_image_generate`. Best for character consistency, product shots, portrait animation, storyboard bring-to-life, continuation.

```
[The provided image is the first frame — do NOT re-describe it].
[Describe what should move, change, or animate — not what is already visible].
[Camera — named move].
[Style/atmosphere cues].
```

**Example:**
```
The provided image is the first frame.
The woman's hair lifts gently in the wind. She blinks slowly and turns her gaze
slightly to the left, a faint smile forming.
Camera: subtle Dolly In toward her face.
Style: warm afternoon light, shallow depth of field.
```

**I2V — the single most violated rule:** Do **NOT** re-describe what is already in the image. Only describe what should *change* or *animate*. Over-describing static elements confuses the model and drifts identity. There is exactly **ONE** `imageUrl` slot — no multi-slot `@Image1`/`@Image2`. Character identity, costume, and environment all bake into that single keyframe png before you call video. I2V opener: `Starting from the provided image as the first frame.`

### Continuation (sequential continuity) — frame-extraction chain
To make shot N+1 continue seamlessly from shot N, extract the last frame of shot N as a png and pass it as the `imageUrl` of shot N+1. This is a **Bash ffmpeg step** (overclock-cinema-cut owns the chain), not a tool:

```bash
ffmpeg -sseof -0.1 -i shotN.mp4 -frames:v 1 -q:v 2 frameN.png
```

Then `overclock_video_generate(promptForShotN+1, imageUrl="frameN.png")`. The I2V rule applies — the frame is the first frame, describe only the new motion.

#### Continuation Five Rules
1. **Last-frame anchor.** Open with one sentence describing what the final frame of the prior clip shows — pose, position in frame, eyeline. Tells the model where to start rendering.
2. **Identity anchor pasted verbatim.** Paste the character's Identity Block **verbatim** into the continuation prompt. Do not paraphrase, do not shorten. Continuation boundaries are where identity drifts.
3. **Prior clip as secondary memory.** Name what just happened in one referential phrase ("following her glance back", "after the door opening"). Do not re-describe the action.
4. **Immediate continuation.** Start on the frame that follows the prior clip's last frame. No time skip, fade, or implied cut unless explicitly asked.
5. **No action repeat.** Extend, don't loop. If the prior clip ended on her drawing her weapon, the continuation describes what she does with it NEXT — not the draw.

**What must carry over:** character identity (face, build, marks), wardrobe (every garment + accessory), environment (architecture, light quality, color treatment, particulates), and emotional carryover (the state she was in at the last frame still reads on her body in the opening of the continuation).

**Anti-repeat phrase library** (pick the one whose verbs match the prior clip): `start immediately after the final frame` / `do not repeat the previous fight` / `do not restage the earlier beat` / `continue forward into the new action` / `preserve the same fatigue state and emotional carryover`.

---

## Reference Roles — what each `imageUrl` represents

You have **one** `imageUrl` slot per call. Higgsfield's `@Image1..4 / @Video / @Audio` multi-handle system does not exist here — capability gap (no multi-reference, no motion-reference video input, no audio reference). The single image plays exactly one of four semantic roles per shot:

| Role | What it locks | How to write it |
|---|---|---|
| **Character** | Main-character identity — face, build, marks | `The image is the main character. [Identity block verbatim.] [Action.]` |
| **Last-Frame** | Where a continuation starts rendering | `Continuing from the prior clip — [what the final frame shows]. [New action.]` |
| **Environment** | The world/setting — architecture, light, atmosphere | `The image is the environment. [Subject + action.] [Lighting consistent with the image.]` |
| **Prop** | A recurring object — hero costume piece, signature object, vehicle | `The image is the prop. [Subject interacts with it.] [Same geometry/material as the image.]` |

**Load-bearing rule:** References support memory; **text defines action.** The `imageUrl` carries persistent properties that must read consistently; the prompt text directs what happens in this generation. The image cannot drive new action; the text cannot replace what the image carries. Both layers stay in their lanes.

For highest character consistency across a sequence, generate ONE canonical character png once (`overclock_image_generate`, provider `google-image`) and reuse that same path as `imageUrl` on every shot that needs the character.

---

## Identity vs. Motion Separation Rule

When a character must stay consistent across shots, **always split the prompt into two labeled blocks**:

**Identity Block** — static visual descriptors ONLY: face features, skin tone, body type, marks, clothing, accessories, color palette. NO motion, NO camera, NO temporal language.

**Motion Block** — temporal + camera ONLY: camera movement, action choreography, speed, environmental motion, atmospheric changes. NO appearance repetition.

**BAD (mixed — identity drifts):**
```
A woman with sharp cheekbones and auburn hair in a blue trench coat runs through a
rain-soaked alley, her coat flapping, sharp cheekbones catching the neon light, camera
chasing her, auburn hair streaming behind her.
```
**GOOD (separated):**
```
Identity Block: The character — sharp cheekbones, auburn hair shoulder-length, blue
trench coat with silver buttons, lean athletic build.
Motion Block: She runs through a rain-soaked alley, coat flapping. Camera: low behind,
matching pace (Action Run). Neon reflections streak across wet concrete. Style:
cold blue shadows, warm neon accents.
```

WHY: the face morphs mid-clip because the model re-reads face descriptors while processing motion.

**Descriptor routing table:**

| Identity Block | Motion Block |
|---|---|
| Face shape / skin tone / eye color | Camera movement name |
| Hair style/color/length | Action verbs (runs, turns, sits) |
| Body type/height/build | Environmental motion (wind, rain, lights) |
| Clothing/accessories/jewelry | Speed and timing cues |
| Scars/tattoos/marks | Atmospheric changes (light shifts, fog) |
| Color palette of the character | Style and color grade of the scene |

**Overclock character-continuity substitute** (Higgsfield used Soul ID + `@Element` — Overclock has NEITHER; capability gap): generate ONE hero/character keyframe png with `overclock_image_generate`, then feed that same png as `imageUrl` into every shot. The Identity Block becomes the keyframe prompt; the Motion Block becomes the video prompt. Across a squad, every worker pane references the **same** hero png — that shared asset is how identity holds when shots render independently in parallel.

**I2V identity rule** — when the reference png already carries identity, re-describing it creates conflict. WRONG: `[image] — A woman with curly brown hair and green eyes in a red jacket walks through the park.` RIGHT: `[image] — She walks through the park, pausing to look up at falling leaves. Camera: slow tracking alongside.`

---

## CAMERA — Move Vocabulary (~70, descriptive prose, no macros)

Every entry is **descriptive prose, not a macro.** Higgsfield had preset dropdowns where a *name* fired an effect. Seedance has no presets — you drop the *described behavior* into the prompt body. The name is for *you* to find the entry; the prose goes in the string.

### Dolly
| Move | What it does | Prompt phrase |
|------|-------------|---------------|
| Dolly In | linear move toward subject | "Camera dollies in toward her face" |
| Dolly Out | linear move away | "Camera dollies out revealing the empty square" |
| Dolly Left/Right | lateral track | "Camera tracks left alongside the runner" |
| Dolly Zoom In | dolly forward + zoom out at once (Vertigo) | "Dolly-zoom: subject stays the same size as the background rushes away" |
| Super Dolly In/Out | exaggerated fast rush/pull | "A fast aggressive push straight onto the handprint" |
| Truck Left/Right | lateral translation (= lateral dolly) | "Camera trucks right, sliding parallel to her profile" |

### Crane / Vertical
Crane Up `crane up from the soldier's hands to the war-torn landscape` · Crane Down `crane down from skyline to the lone figure` · Crane Over The Head `top-down view directly over the crowd` · Levitation `the camera floats upward from her feet to her serene face` · Pedestal Up/Down `camera pedestals up from snow level to eye-level` · Tilt Up/Down `camera tilts up from her boots to the mountain peak`.

### Orbit / Arc
360 Orbit `camera orbits a full circle around the boxer` · Arc `camera arcs slowly around the two detectives` · Lazy Susan `slow turntable rotation around the antique watch` · Robo Arm `a precise mechanical arc sweeping from headlights over the roof`.

### Zoom
Crash Zoom In/Out `crash zoom snapping onto the bloody handprint` · Rack Focus `rack focus from the sword in foreground to her face behind`.

### Follow / Action
FPV Drone `FPV-drone weaving through the warehouse chasing the motorcycle` · Action Run `camera low behind him, matching his sprint` · Handheld `handheld, jostling with the crowd, subtle shake, not chaotic` · Head Tracking `camera locked to his head as the boxer staggers` · Snorricam `camera rigged to her body, the room swaying behind her`.

### Specialty
Bullet Time `time freezes, camera sweeps around the leaping assassin` · Dutch Angle `dutch angle, tilted horizon, as the conspirators whisper` · Fisheye `fisheye lens, curved barrel distortion` · Whip Pan `whip-pan blur from the thief to the officer` · Overhead `overhead top-down of the dancers forming patterns` · Flying `camera glides freely through open air over the valley`.

### Time-Based
Hyperlapse `hyperlapse down the boulevard from dawn to dusk` · Timelapse Human `time-lapse, fixed camera, people rushing the subway platform` · Timelapse Landscape `time-lapse of the mountain valley sunrise to dusk` · Low Shutter `slow-shutter motion blur smearing the spinning dancer's silhouette`.

### Through-Object & Vehicle
Through Object In/Out `camera glides through the keyhole into the dusty study` · Mouth In `camera enters the storyteller's open mouth into the fantasy world` · Car Chasing `camera hugs the side of the black car through the streets` · Car Grip `camera fixed to the hood, shaking on every bump` · Buckle Up `violent shaking as the car skids around the corner`.

### Reliable Phrasing Library
| Intent | Phrase |
|--------|--------|
| No camera motion | `locked-off static camera, no movement` |
| Slow approach | `slow dolly push from medium shot to tight close-up over 8 seconds` |
| Follow subject | `handheld tracking following the subject, subtle shake, not chaotic` |
| Reveal scale | `crane shot rising from ground level to overhead` |
| Circle subject | `smooth 180-degree orbit at eye level, constant distance` |
| Dramatic zoom | `crash zoom from wide to extreme close-up on impact` |
| POV movement | `FPV camera weaving through the environment at walking pace` |

### The One-Move Rule (load-bearing — #1 cause of jitter / failed gens)
For any single shot, specify **ONE primary camera move.** Do NOT stack moves (dolly push + pan left + tilt up). Wrong: `dolly push forward while panning left and tilting up to reveal the skyline`. Right: `slow dolly push from medium shot to tight close-up`. If you need multiple moves, **split into separate shots** (separate `overclock_video_generate` calls, stitched by overclock-cinema-cut).

- **Static pan vs glide:** a camera that **pans** rotates from a fixed position; a camera that **glides** translates through space. State which you mean.
- **Sequenced vs simultaneous:** the One-Move Rule governs *simultaneous* motion. *Sequenced* motion is fine with stated timing: `Camera holds 0–3s tracking the character, then pushes in on the face 4–8s` — rendered as discrete phases.
- **Compatible combos:** Dolly In + Dutch Angle (villain reveal); Crane Up + 360 Orbit (epic scale + isolation); FPV Drone + Crash Zoom In (chase climax); Handheld + Action Run (escape).
- **Anti-drift:** never combine locked-off + handheld, orbit + pan, tilt + dolly push. For subjects moving relative to camera (riding, flying): `CAMERA MOUNTED ON [SUBJECT], LOCKED-ON SHOT`.

### Camera Angles (pitch & perspective)
Low Angle (power/dominance) · High Angle (vulnerability) · Eye Level (neutral) · Bird's-Eye (god-like) · Worm's-Eye (towering scale) · Ground Level (impact) · Dutch/Canted (unease) · Static Oblique (stylized unease) · OTS (dialogue, shot-reverse-shot) · POV/First Person (immersion) · Two-Shot (relationship) · Cowboy Shot (standoff, mid-thigh up) · Selfie Angle (social-media casual).

### Shot Sizes (the framing ladder)
EWS/ELS (subject tiny, scale/isolation) · LS/WS (full body + environment) · Full Shot (head-to-toe, costume/intro) · MLS/Cowboy (mid-thigh up, stance/standoff) · MS (waist up, dialogue) · MCU (chest/shoulders up, emotional) · CU (face fills frame, raw emotion) · ECU (single feature, tension) · Macro (texture) · Insert (object detail).

### Focal length / aperture
8mm ultra-wide immersive distortion (action POV/disorientation) · 14mm wide environmental scale (establishing) · 35mm natural human FOV (documentary/two-shots) · 50mm classic portrait compression (character CU/product) · 75mm tight portrait compression (reaction/emotional climax). Aperture: f/1.4 shallow DOF creamy bokeh (intimacy) · f/4 balanced versatile · f/11 deep DOF everything sharp (product/landscape).

### Genre camera presets (Primary | Secondary | AVOID)
- Product/E-commerce: Orbit/slow push-in/static | crane-down reveal | handheld, whip pan.
- Lifestyle/Social: handheld/static/slow pan | dolly alongside | dutch angle, crash zoom.
- Drama/Narrative: slow push-in/dolly pull-out/tracking | crane up | fast moves, snap zoom.
- Music Video: whip pan/snap zoom/fast tracking | 360 orbit | static.
- Horror: slow creep (dolly in)/static hold/Dutch angle | crane down | fast tracking.
- Action/Chase: FPV drone/tracking/handheld run | crash zoom | static, slow orbit.
- Landscape/Travel: crane up/slow pan/drone flyover | dolly-out reveal | handheld, tight shots.
- Comedy/Social: static (deadpan)/snap zoom | whip pan | slow dramatic moves.

---

## Camera-Emotion Sync — 6 Registers

The camera is the emotional double of the focal character. Pick movement/lens/duration by the character's emotional state, not by what looks "cinematic" abstractly.

| Focal emotion | Camera prescription (write into the prompt) |
|---|---|
| Anger / rage / tension | Handheld breathing, jittery/unstable — broken breath rhythm, micro-twitches both axes, small amplitude, irregular rhythm. No stabilizer. |
| Calm / control / confidence | Handheld breathing, smooth — steady breath rate, regular micro-amplitude. Stabilizer-light but alive. |
| Sadness / vulnerability | Handheld, slow, low — lower breath frequency, slight downward drift, heavier weight. |
| Shock / revelation | Static + very slow push-in/pull-out — sharp freeze at the moment, then minimal movement 0.5–2s. |
| Action | 60fps, 180° shutter — clean shutter-bound motion blur; avoid pulled blur. |
| Final beat / verdict | Top-shot freeze, 0.3–0.5s — directly above, time stops, positions locked. |
| Emotional breakdown / needs space | Slow pull-back from medium/close to wide — "leave the character alone." |

**Emotion cues → camera quick-map:** Realization → slow Dolly In + eyes widening · Fear → Dutch Angle + Handheld · Power → Crane Up + 360 Orbit + wide stance · Vulnerability → Overhead + Dolly Out + small in frame · Intimacy → Dolly In + shallow DoF · Chaos → FPV Drone + Handheld + fast cuts.

**Emotional arcs in one shot:** when the emotion changes across a continuous take (rage → controlled), change the camera synchronously, written as phases: opening phase (entry emotion) → transition phase (amplitude reduces, drift settles, push-in slows) → closing phase (exit emotion). Decompose the generic emotion *before* picking the camera (see below).

**Conflict-resolution ladder** (when rules nominate different camera moves): 1. Explicit user direction wins. 2. Scene archetype next (Atmosphere → static/slow push-in; Action → handheld/whip-pan/FPV; Dialogue → shoulder-coverage/push-in on emotion). 3. Emotion-sync register last (default tiebreaker). When non-obvious, **surface it** — say which rule nominated what and why. Silent picking is the failure mode.

---

## LIGHTING Vocabulary

| Type | Description | Best for |
|------|-------------|----------|
| Golden / Magic hour | Warm directional, sun near horizon, long soft shadows | Romance, epic, beauty |
| Blue hour | Cool steel-blue ambient after sunset | Melancholy, urban solitude |
| Overcast / Softbox | Even soft light, no hard shadows | Documentary, portrait |
| Neon | Colored artificial from signs/screens | Cyberpunk, night, urban |
| Volumetric | Light rays through fog/dust/smoke | Fantasy, atmospheric |
| Practical only | Light from sources visible in frame | Realism, noir, intimate |
| Side-lit | Single strong source one side, deep shadow | Drama, tension |
| Backlit / Rim-lit | Light behind subject, edge glow / silhouette | Mystery, romance, reveal |
| Hard light | Strong single source, defined shadows | Confrontation, exposure |
| Soft light | Diffused, wrapped, minimal shadows | Portrait, beauty |
| Low-key | Deep shadows, small pools of light | Noir, thriller, horror |
| High-key | Bright, even, minimal shadows | Comedy, commercial, lifestyle |
| Harsh midday sun | Hard overhead, strong defined shadows | Desert, exposed vulnerability |

**Cinematic setups (Seedance responds by name):** Rembrandt (triangle of light on shadowed cheek, one eye lit) · Butterfly/Paramount (overhead, shadow under nose — glamour) · Split (half face lit, half shadow — duality/villain) · Chiaroscuro (extreme light/dark — high drama).

**Scene-physics lighting (replaces adjectives with mechanisms — the model reconstructs illumination from named pieces, can only approximate `moody`/`dramatic`):**
- Source position — `key light from screen-left, ~30° above eye line`
- Reflection / bounce — `warm bounce off the wooden floor lifting under-jaw shadow`
- Shadow geometry — `hard shadow on screen-right wall reading the silhouette of the desk lamp`
- Ambient density — `dense ambient haze in the foreground softening contrast 6m+ from camera`

---

## COLOR-GRADE Vocabulary

| Mood | Grade phrase |
|------|-------------|
| Blockbuster | "Teal shadows, orange highlights, high contrast" |
| Cold thriller | "Teal and orange, desaturated, high contrast" / "desaturated blue-grey, crushed blacks" |
| Warm nostalgia | "Golden-hour amber, soft shadows, low contrast" |
| Cyberpunk | "Neon magenta and cyan, deep shadows, HDR" |
| Horror | "Sickly green-yellow, crushed blacks, desaturated" |
| Romance | "Soft warm pink-gold, lifted shadows, dreamy" |
| Documentary | "Neutral, natural light, no grade" |
| Epic fantasy | "Rich jewel tones, deep shadows, volumetric light" |
| Noir | "High-contrast black and white, or near-monochrome" |
| Sci-fi cold | "Ice blue and silver, stark white light" |
| Post-apocalyptic | "Desaturated orange and brown, dust haze" |

**60/30/10 color rule:** a frame reads cleanest when 60% is one dominant color, 30% a secondary, 10% an accent. Name a single dominant tone + supporting palette, not five competing colors.

**Film-stock emulation (name + character):** Kodak Portra 400 (warm, rich skin tones, slight grain) · Fuji Velvia (vivid saturated, fine grain) · Kodak Vision3 500T (cinematic, natural, slight warmth) · Ilford HP5 (classic B&W, visible grain) · Kodak Ektachrome (bright, contrasty, clean slide).

**Period control — name materials + lighting, not the decade:**
- ~~"1970s style"~~ → `Kodachrome warm tones, wood paneling, orange shag carpet, tungsten bulbs casting amber light`
- ~~"1940s noir"~~ → `high-contrast black and white, Venetian-blind shadows, fedora silhouettes, wet asphalt reflecting streetlamps`
- ~~"1990s home video"~~ → `Hi8 camcorder grain, autofocus hunting, timestamp overlay, oversaturated greens`

---

## STYLE — Film-Look Anchors

| Look | Drop in the prompt | Pairs with |
|------|--------------------|-----------|
| Cinematic | (see warning) polished, high-contrast, vivid, modern blockbuster | Drama, action, commercial |
| VHS | retro videotape grain, color bleed, scanlines, washed warm yellows/reds, low contrast, `4:3 framing` | 80s/90s nostalgia, horror, flashback |
| Super 8MM | warm film grain, soft vignette, muted/golden/faded, home-movie feel, `4:3 framing` | Romance, nostalgia, indie |
| Anamorphic | `2.35:1 letterboxed framing`, horizontal lens flares, slight barrel distortion, deep blacks | Action, epic, war, sweeping landscapes |
| Abstract | non-representational, surreal color, unconventional shapes | Music video, dream sequence, experimental |

**Two style rules (load-bearing):**
- **One Style Anchor.** ONE primary anchor beats five adjectives. Pick the anchor, add 1–2 supporting tokens, stop. Wrong: `cinematic, anamorphic, moody, atmospheric, dramatic, film grain, desaturated, noir-inspired, high contrast, vintage`. Right: `anamorphic, subtle grain, muted palette`.
- **"Cinematic" does nothing.** Every Seedance clip is cinematic by default; the word adds zero information. Replace: ~~cinematic~~ → `shallow depth of field, warm highlights, cool shadows`; ~~cinematic look~~ → `anamorphic, letterboxed, horizontal lens flares`; ~~cinematic quality~~ → `35mm film stock, natural grain, Kodak Portra palette`.

**Aspect ratio vs anamorphic register:** output ratio is a hard spec stated in the prompt body (`vertical 9:16 framing`, `square 1:1 framing`). Anamorphic / 2.35:1 / scope is a *cinematography register* (letterboxed look, horizontal flares) rendered *within* the chosen framing. "16:9 anamorphic" requests two contradictory things — state framing as a spec, anamorphic as a look.

---

## Motion / VFX Phrase-Bank (describe literally — no macros)

Higgsfield named presets where a name fired a macro. **No macro exists on Seedance.** Drop the described behavior into the prompt at the beat it should occur.

- Higgsfield: `A swordsman draws his blade. Apply the Disintegration preset.`
- Overclock: `A swordsman draws his blade; his body breaks apart into a cloud of drifting embers and ash that scatter on the wind.`

Preset → literal phrase: Disintegration=`breaks apart into drifting particles`; Freezing=`freezes into ice`; Bullet Time=`Matrix-style frozen moment with camera sweep`; Levitation=`subject levitates upward`; Glow Trace=`moving subject leaves a glowing trail`; Flame On=`subject ignites and burns unharmed`; Earth Zoom Out=`camera pulls back from earth's surface`; Sakura Petals=`cherry blossom petals fill the air`; Glitch=`digital glitch artifacts across the image`; Portal=`a portal opens to another dimension`; Money Rain=`cash rains down from above`; Smoke Transition=`smoke fills frame then clears to new scene`. Place the effect at the END of the prompt; ensure the scene logically supports it.

### The 4-Layer Motion Hierarchy
Name each explicitly to avoid the multi-motion-overload failure (blur/morph). Leaving a layer unnamed lets the model invent it.
1. **Subject motion** — walks, turns, lifts hand.
2. **Internal motion** — breath, hair drift, fabric, eye motion, micro-expression.
3. **Camera motion** — pan, dolly, push-in, hold.
4. **Environmental motion** — rain, leaves, traffic, light shifting.

### Beat-Density (governs all action)
Seedance handles **1–2 distinct action beats every 5 seconds.** Blurry / jittery / morphing = too many actions packed in too short.

| Window | Beats | Example |
|--------|-------|---------|
| 3–5s | 1–2 | Jump + land |
| 5–8s | 2–3 | Jump + land + draw weapon |
| 8–12s | 3–5 | Jump + land + draw + fire + take cover |
| 12–15s | 4–6 | Full sequence — split across multiple shots |

**One action per clip** + 1–2 secondary max. Describe INTENT and CONSEQUENCE, not frame-by-frame. `She raises her arm, energy gathering in her palm until it erupts in a blinding flash; sparks scatter` — not `at 0s arm at 0°, at 1s arm at 45°`. Split dense action across separate `overclock_video_generate` calls (overclock-cinema-cut concats).

### Physics Language & Three-Act Rhythm
Use concrete physics consequences, not mood words:
- ~~"powerful punch"~~ → `fist connects, sweat flies off in slow motion, opponent's head snaps back`
- ~~"dramatic entrance"~~ → `door slams open, dust erupts from the frame, light floods the dark room`
- ~~"fast car"~~ → `tires spin, gravel sprays backward, chassis drops as acceleration kicks in`

Describe the **action**; let the model render the **impact** — don't describe the impact before the action. Action arc: **Charge-up** (tension builds) → **Burst** (action explodes) → **Aftermath** (physics consequences play out).

**Degree adverbs:** `slowly, dramatically, violently, gently, frantically, deliberately, cautiously, explosively`. For motion *speed*, prefer a physical-analogy or time anchor: `like dust suspended in honey` / `like embers floating in still air` / `one full revolution across the entire 10-second clip` / `roughly 6 degrees per second`.

**Default: in medias res** — scenes start already in progress unless the user says "starts with…". Open on the action.

---

## Micro-Expression Vocabulary (19 named endpoints)

Performance directions — combinations of the 8 channels below. Use the preset when one matches; decompose from first principles when none does.

| Expression | Description |
|-----------|-------------|
| Deadpan Neutral | Flat affect, no visible emotion |
| Fierce Focus | Intense locked gaze, total attention |
| Suppressed Smile | Fighting a grin, corner of mouth twitching |
| Quiet Devastation | Eyes glassy, jaw tight, holding it together |
| Cold Calculation | Eyes scanning, no leakage, clinical |
| Bitter Amusement | One-sided smirk, eyes not smiling |
| Frozen Shock | Mouth slightly open, eyes fixed, body still |
| Simmering Rage | Clenched jaw, flared nostrils, steady stare |
| Vulnerable Openness | Soft eyes, parted lips, unguarded |
| Realization | Eyes widening, slow dawning (pair w/ slow dolly in) |
| Fear | Wide eyes, frozen breath (pair w/ Dutch angle, handheld) |
| Defiance | Chin up, jaw set, direct stare |
| Grief | Crumpling brow, downturned mouth, wet eyes |
| Disgust | Wrinkled nose, raised upper lip |
| Contempt | One-sided lip raise, narrowed eyes |
| Relief | Exhaled shoulders, softening jaw, half-closed eyes |
| Anticipation | Leaning in, raised brows, held breath |
| Resolve | Steady gaze, settled breath, squared jaw |
| Exhaustion | Heavy lids, slack jaw, delayed reactions |

### Emotion as Visible Behavior — 8 Channels
Decompose abstract emotion ("she is afraid", "he is angry") into observable behavior the model can stage. The named expressions are what these channels produce.
- **Breath** — rate, depth, hold, exhale character
- **Eye behavior** — fixation, blink rate, gaze direction
- **Jaw tension** — clenched, slack, working, set
- **Loss of focus** — gaze drifting, attention slipping, response delay
- **Scanning pattern** — eye/head sweep direction, tracked target
- **Delayed recovery** — lag between stimulus and adjustment back to baseline
- **Control attempt** — visible suppression / regulation effort
- **Emotional residue after the peak** — what reads on the body after the dominant beat

### Generic-Emotion Decomposition — "Which kind of X?"
Never leave a generic emotion in a prompt. "Sad"/"angry"/"surprised"/"scared"/"thoughtful"/"in love" each is 3–4 distinct physical realizations; the model renders a different version each regen, degrading batch adherence. Decompose into specific muscle movements, breath, eyes, skin. If you can't decompose confidently, ask the user to choose. Clarification template (offer when you'd otherwise invent detail):

> Which kind of surprise?
> (a) Light positive — eyebrows lift, lips part softly, slow inhale, no other movement.
> (b) Shock — sharp inhale through the mouth, eyes widen, body freezes, hand lifts to chest.
> (c) Disbelief — slow blink, head tilts a fraction, lips press together, one eyebrow lifts.
> (d) Surprise-with-joy — catchlight shifts, smile builds gradually, shoulders relax.

**Layered emotion** (two registers stack): dominant state in the FACE, underlying state in BREATH/POSTURE/HAND-STATE, visible tell in the EYES. *Anxious determination* = set jaw + locked gaze (determination) with shallow chest breath + a hand flexing open-closed (anxiety underneath). **Tiny-detail compound:** base emotion + one specific cue (`the man is very upset, and his lower lip trembles`) renders better than over-decomposition. Don't out-decompose yourself.

---

## Image Generation — `overclock_image_generate`

**Text-to-image OR image-to-image.** `overclock_image_generate(prompt, provider?, imageUrl?, outPath?)`. Pass `imageUrl` (an http(s) URL or a local png path) to edit / restyle / reference an existing image — Gemini routes it as an inlineData part (nano-banana edit), OpenAI through `/images/edits` (gpt-image edit). No standalone mask/inpaint or background-removal param — describe the edit in the prompt. Provider pick: `google-image` (nano-banana — cinematic/character/painterly single-frame) vs `openai-image` (gpt-image — layout-dense/text/branding: UI mockups, ad layouts, infographics, reference sheets). Tie-break toward the layout register only when the output has discrete regions/chrome/text.

**Base pattern:**
```
[Shot keyword] of [character desc] + [pose/action] + [environment detail] + [lighting/atmosphere]
```

**Full layered formula (strongest):**
```
[Shot size] + [Angle] + [Movement keyword] of [character].
[Pose, expression, or action].
[Environment — location, weather, atmosphere].
[Lighting — time of day, source, quality].
[Style — film stock, color grade].
```

**Full example:**
```
Medium close-up, low angle, slow dolly in toward the warrior.
She stares past the camera with narrowed eyes, jaw set, braids over one shoulder.
A frozen battlefield stretches behind her, smoke rising from distant fires.
Golden-hour backlight rims her silhouette.
Style: 35mm film, Kodak Vision3 500T, desaturated teal shadows, warm highlights.
```

**6-element formula (nano-banana):** 1 Subject (who/what); 2 Composition (framing — ECU, low angle, wide); 3 Action (brewing coffee, steam rising); 4 Location (warm amber café); 5 Style (photorealistic, film noir, watercolor); 6 Camera/lighting (shallow DoF f/1.8, golden-hour backlight, muted teal grade).

**Plasticky-texture counter (google-image stills):** append at END — `light atmospheric haze, film grain, crush blacks, shadow depth`.

**CGI Material Contract** (2–4 properties per surface to avoid "plastic sheen"): Base (metal/glass/fabric/ceramic/wood/leather) · Roughness (matte/satin/glossy/mirror) · Imperfection (scratches/dust/wear/fingerprints/patina) · Edge (beveled/sharp/rounded/chamfered). Example: `A matte ceramic vase with hairline cracks and a subtle patina, soft rounded rim, resting on rough-hewn oak.`

**Hero-Frame Efficiency Method** (cheap-image-first economics): (1) generate 5–10 cheap `overclock_image_generate` variations → find the closest; (2) refine that one image → get it exactly right; (3) animate ONCE via `overclock_video_generate(imageUrl=...)` from the perfect hero frame. Spend on cheap image gen, far less on video gen.

**gpt-image safe-zone tail (verbatim):** `Safe zones: keep the top 10% and bottom 10% of the frame free from text, logos, icons, buttons, and UI elements — photographic content such as hands, arms, or product edges entering the frame is fine.`

---

## THE LINT GATE — Mandatory Before Every Render Call

Seedance's content filter is an **LLM reading full-scene intent**, not a keyword blacklist — but it reliably flags a handful of surface patterns, and Seedance runs via **Replicate** are async jobs where an instant-fail wastes a real generation. Run this gate on the prompt string **before** calling `overclock_video_generate` / `overclock_image_generate`. Same FAIL rules apply to both providers and to seed-frame prompts fed as `imageUrl`.

**Run order, every shot:** 1. Draft prompt → 2. Run lint → PASS/WARN/FAIL → 3. **FAIL** = do NOT call the tool; rewrite, re-lint → 4. **WARN** = harden the weak spot, proceed → 5. **PASS** = call the tool. In a squad, every worker pane runs this gate itself before its generate call — one bad shot must not burn a parallel Replicate run.

**Verdict aggregation:** any FAIL → **FAIL**; else any WARN → **WARN**; else **PASS**.

A runnable, deterministic copy of every rule below lives at **`scripts/seedance_lint.py`** (exit 0 = PASS/WARN-only, exit 1 = any FAIL):
```bash
python3 scripts/seedance_lint.py "<prompt text>"
echo "<prompt>" | python3 scripts/seedance_lint.py
python3 scripts/seedance_lint.py --file prompt.txt
```
The inline checklist is the **default gate**; the script is the optional equivalent.

### FAIL rules — do NOT generate if any hit

**FAIL 1 — real-person-name.** Any real public-figure name.
> elon musk, donald trump, joe biden, kamala harris, vladimir putin, xi jinping, barack obama, keanu reeves, tom cruise, brad pitt, leonardo dicaprio, taylor swift, beyoncé, rihanna, kanye, ye *(not "ye olde")*, kim kardashian, drake *(not "drake's equation")*, travis scott, messi, ronaldo, lebron, michael jordan, mr beast, mrbeast

**Fix:** `Replace the name with an archetype: age range, build, hair, wardrobe, expression.`

**FAIL 2 — brand-ip.** Any brand, franchise, IP, trademarked character.
> nike, adidas, puma, gucci, prada, louis vuitton, coca-cola, pepsi, mcdonald's, starbucks, apple *(not pie/tree/orchard/falls/juice)*, iphone, macbook, google, microsoft, windows *(not "are/were/of/into")*, tesla, ferrari, lamborghini, porsche, rolex, marvel, dc comics, disney, pixar, dreamworks, spider-man, batman, superman, iron man, captain america, thor, hulk, black widow, wolverine, deadpool, harry potter, hogwarts, pokémon, pikachu, mario, sonic, star wars, jedi, sith, darth vader, james bond, 007

**Fix:** `Describe visual traits only — geometry, color, material. Never name the brand, franchise, or character.`

**FAIL 3 — violence-verb.** Raw violence/harm verbs. **The filter flags the VERB, not the concept** — render it cinematically via aftermath/physics.
> kill(s/ed/ing), murder, assassinate, stab, shoot / shot, slash, behead, decapitate, torture, rape, blood / bloody, gore / gory, gutted, dismember, mutilate, fight, attack, punch, beat / beating *(not "beat the rug/eggs/drum/heat/path/odds")*

**Fix:** `Describe aftermath, tension, force, or direction — not the act. E.g. "driven into the car, metal buckling" instead of "punches".`

**FAIL 4 — weapon-noun.** Named weapons read as intent.
> gun, rifle, pistol, shotgun, handgun, machine gun, ak-47, m16, uzi, knife, dagger, sword *(not "sword fern/fish/dance")*, bomb, grenade, explosive

**Fix:** `Describe the standoff / silhouette / prop geometry, not the weapon by name.`

**FAIL 5 — age-marker.** Any age/minor marker. **Seedance is age-blind.**
> child(ren), kid(s/dies), baby, infant, toddler, boy(s), girl(s), teen(ager/aged), young man/woman/boy/girl, little boy/girl/kid/child, minor *(not "chord/key/scale/league/issue/detail")*, schoolboy, schoolgirl, preschool(er)

**Fix:** `Seedance is age-blind. Describe by role + clothing + action: "a figure in a wool cloak", "the rider", "the traveler".`

**FAIL 6 — overlength.** `word_count > 220` often hard-fails the text encoder.
**Fix:** `Cut to 30–180 words. Keep Style & Mood + camera + action; trim the rest.`

### WARN rules — likely passes, harden before generating

**WARN 1 — antislop.** Marketing-copy adjectives correlate with flags (signal vague intent).
> breathtaking, stunning, epic, mesmerizing, awe-inspiring, masterfully, meticulously, exquisitely, beautifully crafted, cinematic masterpiece, visual feast, seamlessly, effortlessly, flawlessly, cutting-edge, state-of-the-art, mind-blowing, jaw-dropping

**Fix:** `Replace with observable, measurable details.`

**WARN 2 — long.** `word_count > 180`. **Fix:** `Trim least essential details before generating.`

**WARN 3 — too-short.** `word_count < 15`. The filter has no scene. **Fix:** `Add at least Style & Mood + camera + setting so the shot is legible.`

**WARN 4 — no-style-mood.** No style/mood/lighting/palette clause. Cue list: style, mood, palette, color grade, lighting, atmosphere, golden hour, blue hour, overcast, neon, practical, noir, desaturated, teal and orange, high contrast, low-key, anamorphic, vhs, super 8, cinematic. **Fix:** `Add one sentence naming the palette, lighting, and atmosphere.`

**WARN 5 — no-camera.** No camera move. Cue list: camera, dolly, tracking, pan, tilt, crane, steadicam, handheld, aerial, drone, pov, push-in, pull-out, orbit, whip-pan, low-angle, high-angle, overhead, wide shot, medium shot, close-up, ecu, ots, over the shoulder. **Fix:** `Name an exact movement: "slow dolly-in", "low-angle tracking", "static medium". Not "the camera moves".`

**WARN 6 — no-setting.** No concrete setting. Cue list: room, hall, street, alley, forest, desert, beach, kitchen, bedroom, office, warehouse, studio, stage, city, town, village, rooftop, stairwell, parking, interior, exterior, indoor, outdoor, at night, by day, at dawn, at dusk. **Fix:** `Add a location (interior/exterior, room type, time of day).`

**WARN 7 — internal-contradiction.** Two mutually-exclusive directives in one shot. Checked pairs: (moving fast + frozen) · (bright + pitch black) · (dolly in + dolly out) · (crane up + crane down) · (zoom in + zoom out). **Fix:** `Pick one — split into two shots if you need both.`

### Length-window doctrine
| Words | Verdict |
|---|---|
| `< 15` | WARN too-short |
| `15 – 180` | **OK** (ideal **30 – 180**) |
| `> 180` | WARN long |
| `> 220` | **FAIL** overlength |

### Three required clauses (positive correlation with passing)
A passing prompt contains all three; absence of any → WARN: (1) Style/Mood/lighting/palette, (2) explicit camera move (exact term, not "the camera moves"), (3) concrete setting (interior/exterior, location, time of day).

### Voice rewrite — the "Filmmaker not Friend" pass
Even with every risk token removed, prompts get flagged if the voice is wrong. A prompt that reads like a **filmmaker describing a shot** tends to pass; one that reads like a **note to a friend** tends to fail. Do this pass on every prompt:
1. **Add a Style & Mood clause up front** (palette, lens, lighting, atmosphere) — never skip. Tells the filter "this is a shot."
2. **Name the camera move** ("slow dolly-in", not "the camera moves forward").
3. **Describe physics, not emotion** ("jaw clenches, nostrils flare", not "looks angry").
4. **Describe force and direction, not destruction sequence** ("driven into the car, metal buckling", not "thrown into door, glass shatters, sweep leg").
5. **Present tense, active voice** ("she turns", not "she is turning").
6. **Cut antislop words.**

### Rewrite Playbook — FAIL → PASS
| Trigger | Before → After |
|---|---|
| **real-name** | `Keanu Reeves` → `a lean man in his late 50s, dark shoulder-length hair, stubble, intense calm expression, dark suit` |
| **brand / IP** | `Spider-Man` → `blue-and-red form-fitting suit, face masked with white eye-shaped lenses, web fired from wrists`; `a Coca-Cola can` → `a slim red aluminium can, white ribbon graphic, condensation beading` |
| **violence-verb** | `he punches the man` → `the figure is driven into the car, metal buckling`; `blood drips from his hands` → `his hands tremble at his sides, something dark stains his sleeve` |
| **weapon-noun** | `he raises a gun` → `he raises a dark L-shaped object, arm locked, the other figure freezes` |
| **horror / dark** | gore → `unsettling`, `something is wrong`, `dread`; describe motion/light for the horror beat, never the explicit injury |
| **age-marker** | `a young boy runs` → `a small figure in a wool cloak runs`, `the rider`, `the traveler` |
| **real-face upload** | Don't feed a real photo. `overclock_image_generate` a synthetic character first → pass the returned png as `imageUrl`. |

**Positive-constraint conversion** (Seedance/fal has no negative-prompt field — fold exclusions into the positive prompt): `no shaky camera` → `locked-off static camera, no movement`; `no blur` → `sharp focus throughout, deep depth of field`; `don't make it dark` → `bright, evenly lit, overcast daylight`; `avoid jittery motion` → `smooth, fluid motion, one action per shot`; `no extra limbs` → `anatomically correct, all limbs naturally positioned`; `don't change the character` → `consistent character appearance, same outfit and features throughout`.

---

## Instant Fail vs. Delayed Fail — the Diagnostic

`overclock_video_generate` is async. When it comes back failed, the **timing** of the failure is the single most useful diagnostic:

| Failure timing | Meaning | What to do |
|----------------|---------|------------|
| **< 10 seconds** (instant) | Content filter rejection — prompt never reached the GPU | Rewrite for voice + remove risk tokens. Do NOT call again unchanged. |
| **> 30 seconds** (delayed) | Infrastructure / timeout / complexity — prompt passed the filter, render failed | Simplify action density, cut length, try again. |

**Instant fails in a loop = filter issue, never GPU.** Stop re-calling the tool before the rewrite. Re-calling with the same prompt and one word changed is the loop that wastes calls.

---

## Render-Failure Catalog — When the Render Itself Breaks (Delayed Fail)

These are render failures (the prompt passed the filter; the output is wrong), distinct from filter rejections. Each: symptom → mechanism → prompt-side counter.

**FPS drift.** Choppy playback, duplicate consecutive frames. Seedance drops the rate under load and pads with repeats. Counter: state the frame rate **in the prompt body** — `The video runs at 24 fps. No frame is repeated.` (No fps tool param — the prompt body is the *only* place fps lives.)

**NSFW false-positive.** A clean prompt comes back rejected as NSFW. Body-anatomy specificity / costume vocab / sensual-but-clean phrasing trips the classifier on benign content. Counter: (1) generalize anatomy specifics (`her bare shoulders` → `her shoulders`; `tight-fitting dress` → `fitted dress`); (2) replace sensual-register adjectives (`sultry` → `composed`; `seductive` → `direct`); (3) re-lint. Don't re-call unchanged.

**Keyframe invention.** The prompt requires an element absent from the source `imageUrl` (`pulls a Polaroid off the fridge`) and Seedance manufactures it AND its placement, contradicting geometry. Counter: state the absence — `The Polaroid is not visible on the fridge in the source frame; it appears when the character lifts their hand from below the frame.`

**Physics drift (adjacent-object).** An object behaves wrong when an adjacent object moves (magnet flies away with the Polaroid). No enforced physics sim. Counter: state the invariant — `The magnet stays attached to the fridge surface throughout. Only the Polaroid moves.`

**Multi-motion overload.** Stacked motions (handheld + rise + push-in + rack focus) read as instability. Counter: **one dominant motion per shot.** For a compound move, state phases in sequence with timing — `Camera rises 0–3s, holds, then pushes in 4–8s`.

**Spatial-awareness failures.** Door-entry/hallway/walk-through-furniture shots fail more than static. Under-specified geometry → plausible default that disagrees with intent. Counter: lock geometry with a Spatial Layout Block before the action — `Camera inside the room, facing the closed door. The couch sits between the character and the camera. The character walks around the couch from screen-left to screen-right.`

---

## Shot-Level Troubleshooting — Symptom → Cause → Fix

Seedance produces **~90% usable output** when the prompt is clean. **If output is CONSISTENTLY bad across multiple attempts, the PROMPT is the problem, not the model.** A single bad output is noise (re-roll once). A *pattern* is signal (fix the string) — a brute-force re-roll burns another async job and reproduces the flaw.

### The 6-Pass Diagnostic (run in order, stop at first hit)
```
Output bad?
├── 1. Blurry / jittery / morphing → prompt > 100 words?
│      ├── Yes → cut to 30–100 words; replace 50+ words of description with an imageUrl anchor
│      └── No  → too many action beats (>2/5s)? → split into multi-shot
├── 2. Camera chaotic / spinning → how many camera moves?
│      ├── Multiple → reduce to ONE primary move (One-Move Rule)
│      └── One      → name it exactly on its own line: "Camera: Dolly In"
├── 3. Character/product doesn't match → does the prompt describe its appearance?
│      ├── Yes → DELETE all physical description; keep only action + emotion (anchor carries identity)
│      └── No  → anchor image too weak → re-gen anchor (frontal + 3/4 + profile, even light)
├── 4. Action weak / stiff → physics language present?
│      ├── No  → add degree adverbs + physical consequences
│      └── Yes → reduce beat density (1–2 beats/5s)
├── 5. i2v static / barely moves → re-describing what's already in the image?
│      └── Yes → describe ONLY what changes/moves + explicit camera move + atmospheric motion
└── 6. "Just bad" (vague) → run the Anti-Slop linter
       ├── Found slop → replace with observable, measurable details
       └── Clean → try a different style/genre framing, or strengthen the imageUrl anchor
```

The pass order is token weight: Subject → Action → Camera → Style → Audio → Output. Most failures land Pass 1/2 because early-prompt tokens dominate. If you reach Pass 4 without moving the result, the prompt needs a structural rewrite, not iteration.

### Symptom table
| Symptom | Fix (rewrite the prompt) |
|---|---|
| Character face inconsistent / morphing | Pass an `imageUrl` anchor; remove contradictory appearance lines. For i2v, don't re-describe the face. |
| Character/product doesn't match the anchor | **Delete ALL physical descriptions. Describe ONLY action and emotion. The anchor carries identity.** |
| Camera move generic | Use an exact named move on its own line: `Camera: Dolly In`. |
| Camera chaotic / spinning | ONE primary move per shot; split the rest into separate shots. |
| Prompt ignored / doesn't match | Cut to <200 words. Remove contradictions. Lead Subject → Action → Camera → Style. |
| Blurry / jittery / morphing | Cut to 30–100 words; replace 50+ words with an `imageUrl` anchor. |
| Visual style wrong / generic | Add a named style (VHS/Super 8/Anamorphic) + color grade + lighting; state aspect as language. |
| Action stiff | Add degree adverbs + physics consequences (`dust erupts`, `sparks fly`). |
| VFX effect not visible | Describe the effect literally at the END; ensure the scene supports it. |
| VFX too cartoonish | Add `photorealistic, physically accurate`. |
| i2v barely moves | Describe ONLY what changes; add explicit camera move + atmospheric motion. **#1 i2v fix.** |
| Product shot cheap / over-lit | Specify background surface + specific lighting + texture cue. |
| Horror/dark blocked | Describe outcomes not acts (`aftermath`, `dread`); atmosphere language (`unsettling`, `wrong`). |
| "Not what I wanted" (vague) | Run the Anti-Slop linter. |

### Load-bearing rules (verbatim)
- **One-Move Rule** — ONE primary camera move per shot; multiple → split into multi-shot.
- **Beat-density split** — 1–2 beats/5s; >2/5s → split into multi-shot.
- **Delete-appearance-for-reference-match** — anchor `imageUrl` in play → delete ALL physical descriptions; describe ONLY action and emotion.
- **Anti-Slop linter** — replace `beautiful`/`stunning`/`epic`/`amazing`/`dynamic` with observable, measurable details. **The measurability test:** can a camera, light meter, or stopwatch measure this word? If no → delete it.
- **Overspecification fix** — cut to 30–100 words; use an anchor instead of 50+ words. Ceiling: under 200 words.
- **Lead order** — Subject → Action → Camera → Style.
- **Single-variable iteration** — change exactly ONE thing per re-roll. Otherwise you can't attribute the improvement and waste async jobs. (Exception: once the prompt is locked and you're varying purely for stylistic exploration, batching is fine.)
- **80% rule** — if 80% of the generation was right, keep that 80% (subject, style, camera, lighting); fix only the mistake.

### Blocked-content escalation
If three atmosphere-rewrites still block, the concept is out of policy — stop and tell the user. Don't brute-force variations.

---

## Output Format for a Seedance Prompt

Aspect/duration/fps are **content of the prompt**, not tool params:
```
Aspect ratio: 16:9. Duration: 10s. 24 fps, no repeated frames.

Style & Mood: [palette, lens, lighting, atmosphere — 1 sentence]

Dynamic Description: [camera move + subject + action, present tense, shot-by-shot if multi-cut — the main block]

Static Description: [location, props, ambient details — 1–2 sentences]

Camera: [exact movement name]
```
Section labels are craft opinion, not an engine rule. Default to a flowing paragraph for prompts under 50 words; use sectioned structure only when the prompt has discrete beats.

**Multi-shot runtime arithmetic:** runtime must agree in the meta line (`Duration: Xs`) and every per-shot timing label. Label each shot inline — `Shot 1 (0–3s): ... hard cut to Shot 2 (3–8s): ...` — and the per-shot labels must **sum** to the total. **Anti-pattern:** per-3-second time labels inside a single continuous shot — Seedance reads any per-segment timing block as cut instructions. For continuity, drop the time markers; for cuts, label `Shot 1 / Shot 2 / Shot 3` and use the arithmetic.

**Self-repair checklist (60–90s before every call):** frame rate stated in prompt body? aspect + duration stated as style language? body-anatomy/sensual tokens scrubbed? first-appearing elements marked absent from source `imageUrl`? adjacent-object invariants named? one dominant camera motion (compound split into phases)? geometry locked with a Spatial Layout Block when >1 subject or door-entry/hallway/around-furniture? lint passed (no FAIL, WARNs addressed)? voice pass done?

---

## Acceptance-Rate Reality

Production-grade AI-cinema runs at roughly **1.0% image-acceptance and 1.5% video-acceptance** (quadruple-confirmed across sessions). The iteration loop IS the craft — `iteration burn is the work, not the failure`. The 1.5% video anchor implies ~67 attempts to land one keeper; multiply by shot count. A 10s establishing shot ≈ 72 generations (treat as upper-bound). A character appearing in tens of shots justifies a ~800-iteration front-load to lock the anchor sheet; a character in 1–2 shots does not. Treating each rejected take as a failure ends the project on Day 7. Budget the generations.

---

## Capability Gaps — State Honestly, Don't Invent

| Higgsfield had | Overclock status |
|---|---|
| Multi-handle refs (`@Image1..4`, `@Video1`, `@Audio1`) | **Gap.** One `imageUrl` per call, one reference role per shot. |
| Motion-reference video input | **Gap.** Describe motion in text. |
| Named motion-preset macros | **Gap.** Describe the effect literally. Preset list survives as a vocabulary catalog only. |
| Native joint audio-video | **Gap.** Seedance mp4 is silent. Audio = separate ElevenLabs TTS track (overclock-cinema-voice). No music/SFX/BGM. |
| Image edit / restyle / reference | **Supported.** `overclock_image_generate(prompt, imageUrl=...)` does image-to-image (nano-banana edit / gpt-image edit). No discrete mask/inpaint param — describe the change in the prompt. Still route crisp text/logo/infographic OUT to Remotion (Seedance hallucinates text). |
| In-place Expand Shot / Edit Shot | **Gap.** Re-shoot via Reference-Based, or route to Remotion. |
| True lip-sync / talking-head | **Out of scope.** Documented MANUAL workaround only (per-character gen + PiP composite) — flag before promising. |
| Upscale / recast | **Gap.** Not available. |
| Soul ID character lock | **Gap.** Carry a character via a generated reference png passed as `imageUrl`, or an extracted tail frame. |
| Persistent filter-memory store | **Deferred.** The inline Rewrite Playbook is the memory for now. |

**Routing out for crisp typography:** any intent that is legible on-screen text, a logo lockup, an infographic, data-viz, lower thirds, or a title card does NOT belong in a Seedance prompt — route to Overclock's Remotion skills (`remotion-best-practices`, `video-post`, `reels-editor`) and composite. Seedance owns motion and atmosphere; Remotion owns crisp type. Symptom that means "wrong engine, not bad prompt": the user keeps re-rolling to get a word/number/logo to render legibly — no prompt fix lands this on Seedance.

---

## The Layer-Split Contract

This skill is the **prompt-construction + production-discipline** layer. The Overclock media tools are the execution layer — they own job submission, async polling, and returning an mp4/png path. The skill writes the prompt string and decides what goes in it; it **never invents tool params** (no aspect/duration/fps param — those go in the prompt body as style language).

Sibling cinema skills: **overclock-cinema-plan** owns the shot list and the orchestrator→worker fan-out; **overclock-cinema-cut** owns ffmpeg frame-extraction (continuation chains) and concat assembly + Remotion routing; **overclock-cinema-voice** owns the separate ElevenLabs TTS narration track. You — **overclock-cinema-shot** — own the shot: write it, lint it, fire `overclock_video_generate` / `overclock_image_generate`.
