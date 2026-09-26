# COMANDO - visual-styles.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\hyperframes\skills\hyperframes\visual-styles.md
**SHA:** d173663b4342d830
**Timestamp:** 2026-08-26T18:31:12.655700
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- The pattern: **named style → palette → typography → motion rules → transition → avoids.**

### Ouro Bruto (primeiros 5000 chars)
```
# Visual Style Library

Named visual identities for HyperFrames videos. Each style is grounded in a real graphic design tradition. Use them to give your video a specific visual personality, not just generic "clean" or "bold."

**How to pick:** Match mood first, content second. Ask: _"What should the viewer FEEL?"_

**How to use:** Reference the style in your scene plan. Translate the style's principles into concrete composition decisions — palette choice, font selection, entrance patterns, transition type, ambient motion feel.

## Quick Reference

| Style           | Mood                  | Best for                           | Primary shader                    |
| --------------- | --------------------- | ---------------------------------- | --------------------------------- |
| Swiss Pulse     | Clinical, precise     | SaaS, data, dev tools, metrics     | Cinematic Zoom or SDF Iris        |
| Velvet Standard | Premium, timeless     | Luxury, enterprise, keynotes       | Cross-Warp Morph                  |
| Deconstructed   | Industrial, raw       | Tech launches, security, punk      | Glitch or Whip Pan                |
| Maximalist Type | Loud, kinetic         | Big announcements, launches        | Ridged Burn                       |
| Data Drift      | Futuristic, immersive | AI, ML, cutting-edge tech          | Gravitational Lens or Domain Warp |
| Soft Signal     | Intimate, warm        | Wellness, personal stories, brand  | Thermal Distortion                |
| Folk Frequency  | Cultural, vivid       | Consumer apps, food, communities   | Swirl Vortex or Ripple Waves      |
| Shadow Cut      | Dark, cinematic       | Dramatic reveals, security, exposé | Domain Warp                       |

---

## 1. Swiss Pulse — Josef Müller-Brockmann

**Mood:** Clinical, precise | **Best for:** SaaS dashboards, developer tools, APIs, metrics

- Black (`#1a1a1a`), white, ONE accent — electric blue (`#0066FF`) or amber (`#FFB300`)
- Helvetica or Inter Bold for headlines, Regular for labels. Numbers large (80–120px)
- Grid-locked compositions. Every element snaps to an invisible 12-column grid
- Animated counters count up from 0. Hard cuts, no decorative transitions
- Transitions: Cinematic Zoom or SDF Iris (precise, geometric)

**GSAP signature:** `expo.out`, `power4.out`. Entries are fast and snap into place. Nothing floats.

```
Swiss Pulse: Black/white + one electric accent. Grid-locked compositions.
Numbers dominate the frame at 80-120px. Counter animations from 0.
Hard cuts or geometric transitions. Nothing decorative.
```

---

## 2. Velvet Standard — Massimo Vignelli

**Mood:** Premium, timeless | **Best for:** Luxury products, enterprise software, keynotes, investor decks

- Black, white, ONE rich accent — deep navy (`#1a237e`) or gold (`#c9a84c`)
- Thin sans-serif, ALL CAPS, wide letter-spacing (`0.15em+`)
- Generous negative space. Symmetrical, centered, architectural precision
- Slow, deliberate. Sequential reveals with long holds. No frantic motion
- Transitions: Cross-Warp Morph (elegant, organic flow between scenes)

**GSAP signature:** `sine.inOut`, `power1`. Nothing snaps — everything glides with intention.

```
Velvet Standard: Black, white, one rich accent. Thin ALL CAPS type with wide tracking.
Generous negative space. Sequential reveals, long holds.
Cross-Warp Morph transitions. Slow and deliberate — luxury takes its time.
```

---

## 3. Deconstructed — Neville Brody

**Mood:** Industrial, raw | **Best for:** Tech news, developer launches, security products, punk-energy reveals

- Dark grey (`#1a1a1a`), rust orange (`#D4501E`), raw white (`#f0f0f0`)
- Type at angles, overlapping edges, escaping frames. Bold industrial weight
- Gritty textures: scan-line effects, glitch artifacts baked into the design
- Text SLAMS and SHATTERS. Letters scramble then snap to final position
- Transitions: Glitch shader or Whip Pan (breaks the rules, feels aggressive)

**GSAP signature:** `back.out(2.5)`, `steps(8)`, `elastic.out(1.2, 0.4)`. Intentional irregularity.

```
Deconstructed: Dark grey #1a1a1a + rust orange #D4501E. Type at angles, escaping frames.
Scan-line glitch overlays. Text SLAMS and scrambles into place.
Glitch shader transitions. Industrial and raw — nothing should feel polished.
```

---

## 4. Maximalist Type — Paula Scher

**Mood:** Loud, kinetic | **Best for:** Big product launches, milestone announcements, high-energy hype videos

- Bold saturated: red (`#E63946`), yellow (`#FFD60A`), black, white — maximum contrast
- Text IS the visual. Overlapping type layers at different scales and angles, filling 50–80% of frame
- Everything is kinetic: slamming, sliding, scaling. 2–3 second rapid-fire scenes
- Text layered OVER footage — never empty backgrounds
- Transitions: Ridged Burn (explosive, dramatic, impossible to ignore)

**GSAP signature:** `expo.out`, `back.out(1.8)`. Fast arrivals, hard stops.

```
Maximalist Type: Red, yellow, black, white — max contrast. Text IS the visual.
Overlapping at d
```