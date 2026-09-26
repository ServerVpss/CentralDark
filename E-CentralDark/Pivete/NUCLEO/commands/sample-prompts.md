# COMANDO - sample-prompts.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\skills\.system\imagegen\references\sample-prompts.md
**SHA:** 43307821f1db18e0
**Timestamp:** 2026-08-26T18:42:51.577783
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- When adapting a user's prompt:

### Ouro Bruto (primeiros 5000 chars)
```
# Sample prompts (copy/paste)

These prompt recipes are shared across both top-level modes of the skill:
- built-in `image_gen` tool (default)
- `scripts/image_gen.py` CLI fallback for explicit CLI/API/model requests or user-confirmed true-transparent-output fallback requests

Use these as starting points. They are intentionally complete prompt recipes, not the default amount of augmentation to add to every user request.

When adapting a user's prompt:
- keep user-provided requirements
- only add detail according to the specificity policy in `SKILL.md`
- do not treat every example below as permission to invent extra story elements

The labeled lines are prompt scaffolding, not a closed schema. `Asset type` and `Input images` are prompt-only scaffolding; the CLI does not expose them as dedicated flags.

Execution details such as explicit CLI flags, `quality`, `input_fidelity`, masks, output formats, and local output paths depend on mode. Use the built-in tool by default, including simple transparent-image requests. For transparent images, prompt for a flat chroma-key background and remove it locally with `python "${CODEX_HOME:-$HOME/.codex}/skills/.system/imagegen/scripts/remove_chroma_key.py"`; only apply CLI-specific controls when the user explicitly opts into fallback mode or explicitly confirms that the transparent request should use true CLI transparency.

CLI model notes:
- `gpt-image-2` is the fallback CLI default for new workflows.
- `gpt-image-2` supports `quality` values `low`, `medium`, `high`, and `auto`.
- For 4K-style `gpt-image-2` output, use `3840x2160` or `2160x3840`.
- If transparent output needs true CLI fallback, ask before using `gpt-image-1.5` unless the user already explicitly requested `gpt-image-1.5`, `scripts/image_gen.py`, or CLI fallback. Explain that built-in chroma-key removal is the default path, but `gpt-image-2` does not support `background=transparent`.
- Do not set `input_fidelity` with `gpt-image-2`; image inputs already use high fidelity.

For prompting principles (structure, specificity, invariants, iteration), see `references/prompting.md`.

## Generate

### photorealistic-natural
```
Use case: photorealistic-natural
Primary request: candid photo of an elderly sailor on a small fishing boat adjusting a net
Scene/backdrop: coastal water with soft haze
Subject: weathered skin with wrinkles and sun texture
Style/medium: photorealistic candid photo
Composition/framing: medium close-up, eye-level
Lighting/mood: soft coastal daylight, shallow depth of field, subtle film grain
Materials/textures: real skin texture, worn fabric, salt-worn wood
Constraints: natural color balance; no heavy retouching; no glamorization; no watermark
Avoid: studio polish; staged look
```

### product-mockup
```
Use case: product-mockup
Primary request: premium product photo of a matte black shampoo bottle with a minimal label
Scene/backdrop: clean studio gradient from light gray to white
Subject: single bottle centered with subtle reflection
Style/medium: premium product photography
Composition/framing: centered, slight three-quarter angle, generous padding
Lighting/mood: softbox lighting, clean highlights, controlled shadows
Materials/textures: matte plastic, crisp label printing
Constraints: no logos or trademarks; no watermark
```

### ui-mockup
```
Use case: ui-mockup
Primary request: mobile app home screen for a local farmers market with vendors and daily specials
Asset type: mobile app screen
Style/medium: realistic product UI, not concept art
Composition/framing: clean vertical mobile layout with clear hierarchy
Constraints: practical layout, clear typography, no logos or trademarks, no watermark
```

### infographic-diagram
```
Use case: infographic-diagram
Primary request: detailed infographic of an automatic coffee machine flow
Scene/backdrop: clean, light neutral background
Subject: bean hopper -> grinder -> brew group -> boiler -> water tank -> drip tray
Style/medium: clean vector-like infographic with clear callouts and arrows
Composition/framing: vertical poster layout, top-to-bottom flow
Text (verbatim): "Bean Hopper", "Grinder", "Brew Group", "Boiler", "Water Tank", "Drip Tray"
Constraints: clear labels, strong contrast, no logos or trademarks, no watermark
```

### scientific-educational
```
Use case: scientific-educational
Primary request: biology diagram titled "Cellular Respiration at a Glance" for high school students
Scene/backdrop: clean white classroom handout background
Subject: glucose turns into energy inside a cell; include glycolysis, Krebs cycle, and electron transport chain
Style/medium: flat scientific diagram with consistent icons, arrows, and readable labels
Composition/framing: landscape slide-style layout with clear hierarchy and generous whitespace
Text (verbatim): "Cellular Respiration at a Glance", "Glucose", "Pyruvate", "ATP", "NADH", "FADH2", "CO2", "O2", "H2O"
Constraints: scientifically plausible; avoid tiny text; no extra decoration; no watermark
```

###
```