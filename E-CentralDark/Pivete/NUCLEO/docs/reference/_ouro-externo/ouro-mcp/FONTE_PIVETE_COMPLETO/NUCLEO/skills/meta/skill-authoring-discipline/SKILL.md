---
name: skill-authoring-discipline
description: "Before authoring a skill, scan the library for reuse."
triggers:
  - "about to create a new skill"
  - "need a skill for X"
  - "create a skill that does Y"
  - user asks to add a capability that might already exist
  - "before creating new skills"
---

# Skill Authoring Discipline (Pivete profile)

## Rule of thumb
Before writing or proposing a NEW skill, ALWAYS confirm one does not already
exist that covers the territory. Pivete corrected this directly (session
2026-08-03):
> "verifica se vc tem skil de visao ou plugins! antes de criar noos skils
> asvezes vooce ja tem em suas skils"

## Mandatory pre-create checklist
1. `skills_list` (optionally with `category`) to enumerate the library.
2. `skill_view` on any candidate that sounds related — read its triggers AND body.
3. If a loaded or existing skill covers >=80% of the need, PATCH it (add a
   subsection / pitfall / broaden a trigger) instead of creating new.
4. Only create a NEW skill when NOTHING fits, and then make it CLASS-LEVEL
   (e.g. `vision-provider-setup`), never a narrow one-session artifact
   (`fix-gemini-400-today`, `audit-z-today`).

## Pitfalls
- Do NOT proliferate narrow one-session skills. Target shape is class-level
  umbrellas with a `references/` dir for session-specific detail.
- User-owned / profile-local skills (under `profiles/<p>/skills/` that Pivete
  hand-wrote) are OFF-LIMITS to patch. If wrong/outdated, recommend
  `hermes curator adopt <name>`.
- Bundled / hub-installed / pinned skills are off-limits to this actor.
- A skill that "sounds related" is not proof of coverage — read it first.
- Creating a skill to encode "don't create skills" is fine ONCE; do not
  recreate it per session.
- **Official path before guessed URL** (2026-08-06): if UI/docs already show
  View on GitHub / link / button, use that first. Never invent
  `raw.githubusercontent.com/.../SKILL.md` (404). Confirm default_branch
  (graphify=`v8`, not main) and real tree path (ECC has no root SKILL.md).
- **Vendor never inside `skills/` scan**: Hermes indexes every `**/SKILL.md`
  under the profile skills tree. Clone big packs (ECC ~281) to a path
  *outside* `skills/` (e.g. `profiles/pivete/combo-potencia-vendor/`). Expose
  only thin prefixed entry skills (`cp-*`, `sp-*`) + one easy map name.
- **Anti-briga / anti-delta with Claude friends**: do not overwrite
  `claude-code`, `codex`, `opencode`, `hermes-agent`. On name collision,
  prefix and keep Casa canonical unless Pivete orders override.
- **Easy find name**: when installing a multi-pack offline set, give ONE
  boom name + bundle (here: `combo-potencia` / `/combo-potencia`), not a
  scatter of unprefixed foreign names.

## Why this matters
Duplicates waste the user's review time and fragment behavior across skills.
Reuse keeps triggers, pitfalls, and card/format conventions consistent.

## References
- `references/vision-provider-findings-20260803.md` — session proof: scanned
  before authoring (found 3 existing vision skills), Gemini rate-limit facts
  (per-project, not per-key), and the broken `routellm` vision primary.
- `references/combo-potencia-install-20260806.md` — offline Power Combo layout,
  official-link-before-guess, vendor-outside-skills scan, anti-Claude-delta,
  easy boom name `/combo-potencia`.
