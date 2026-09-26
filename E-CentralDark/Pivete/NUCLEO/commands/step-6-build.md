# COMANDO - step-6-build.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\hyperframes\skills\website-to-hyperframes\references\step-6-build.md
**SHA:** 4b497e94ea9c8b4f
**Timestamp:** 2026-08-26T18:31:13.836318
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - [ ] **Every `<template>` root element** — not just `index.html`, but every sub-composition's root — has `data-start="0"`. The linter warns `root_composition_missing_data_start` when missing. Authori
- - **Narration**: `<audio id="narration" src="narration.wav" data-start="0" data-duration="..." data-track-index="0" data-volume="1">`
- - **Underscore/music** (if storyboard specifies): `<audio id="underscore" src="underscore.mp3" data-start="0" data-duration="..." data-track-index="3" data-volume="0.15">`

### Padroes
- 5. Check for the inline anti-pattern: if the HTML contains `<svg xmlns=` or `data:image/` but no `../capture/assets/` references, the assets were inlined instead of referenced. Replace inline content 

### Ouro Bruto (primeiros 5000 chars)
```
# Step 6: Build Compositions

**Before building, fully re-read these files:**

- **DESIGN.md** — your color palette, fonts, components, and Do's/Don'ts. Every composition must use EXACT hex colors and font families from this file. If it says "white backgrounds" — use white, not dark.
- **STORYBOARD.md** — the beat-by-beat plan you're executing. Each beat specifies assets, animations, transitions, and which techniques to use.
- **`capture/extracted/asset-descriptions.md`** — when the storyboard assigns an asset to a beat, re-read the description to understand what it shows and how to position/style it correctly.
- **[techniques.md](techniques.md)** — code patterns for the 10 visual techniques. When the storyboard says "SVG path drawing" or "per-word kinetic typography" — read the code pattern from this file and adapt it.
- **transcript.json** — word-level timestamps that drive scene durations.

**Split the work: spawn a sub-agent for each beat.** By this step your context is full of captured data, DESIGN.md, SCRIPT, STORYBOARD, and transcript. Building compositions on top of all that means the detailed rules below compete with thousands of tokens of prior work. Each sub-agent gets a fresh context focused on one beat — dramatically better output.

**How to dispatch each sub-agent:**

Pass file PATHS, not file contents. The #1 failure mode is reading an asset file and pasting its SVG/image data into the sub-agent prompt. The sub-agent then uses inline content instead of referencing the file on disk. Same with fonts — pass the local woff2 path, don't substitute Google Fonts.

```
Build the composition for beat 1. Save to compositions/beat-1-hook.html.

STORYBOARD for this beat:
[paste the beat section from STORYBOARD.md]

ASSETS — reference by path, do NOT read/inline the file contents:
- Logo: <img src="../capture/assets/favicon.svg"> (top-left, 40x40px)
- Hero image: <img src="../capture/assets/hero-bg.png"> (full-bleed background)
- Noise texture: ../capture/assets/noise.png (full-frame overlay, 3% opacity)

FONTS — use @font-face with the captured font files, NOT Google Fonts:
@font-face { font-family: 'BrandFont'; src: url('../capture/assets/fonts/BrandFont-Regular.woff2'); }

Read DESIGN.md for exact colors and Do's/Don'ts.
Read techniques.md for animation code patterns.
Load the `hyperframes` skill for composition structure rules.
```

After each sub-agent finishes, verify the composition references `../capture/assets/` — if it used inline SVGs or Google Fonts instead of the captured files, fix it before moving on.

Load the `hyperframes` skill first — it has the rules for data attributes, timeline contracts, deterministic rendering, and layout. Everything below supplements those rules, not replaces them.

---

## Per-Composition Process

For each beat in the storyboard:

### 1. Read the beat's storyboard section

Know the mood, visual description, assets, animation choreography, transition, and SFX before writing any HTML.

### 2. Build the static end-state first

Position every element where it should be at its **most visible moment** — the frame where everything is fully entered and correctly placed. Write this as static HTML+CSS. No GSAP yet.

This is the "Layout Before Animation" principle from the compose skill. The CSS position is the ground truth. Animations describe the journey to and from it.

### 3. Verify the static layout

Look at it. Check:

- Are elements where the storyboard says they should be?
- Are depth layers present (foreground / midground / background)?
- Do any elements overlap unintentionally?
- Are assets sized correctly? (hero images should fill 50-70% of frame, not sit at 100x100px)

### 4. Add entrance animations

Use `gsap.from()` — animate FROM offscreen/invisible TO the CSS position. The CSS position is where the element ends up.

### 5. Add mid-scene activity

Every visible element must have continuous motion. A still image on a still background is a JPEG with a progress bar.

| Element type                           | Mid-scene activity                                                                                                                           |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Image / screenshot                     | Slow zoom (scale 1→1.03), slow pan, or Ken Burns                                                                                             |
| Stat / number                          | Counter animates from 0 to target                                                                                                            |
| Logo grid                              | Subtle shimmer sweep, or gentle scale pulse                                                                                                  |
| Any persistent element                 | Subtle float (y ±4-6px, sine.inOut, yoyo)
```