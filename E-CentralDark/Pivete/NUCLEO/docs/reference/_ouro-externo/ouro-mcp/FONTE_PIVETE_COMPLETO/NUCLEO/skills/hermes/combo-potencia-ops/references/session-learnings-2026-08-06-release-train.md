# Session learnings — Combo + debug + release train (2026-08-06)

## User mandates (hard)
- ZERO regressão sempre.
- ZERO comando destrutivo salvo ordem explícita pontual.
- NUNCA V1/V2/V3 / sistema paralelo — estender canônico.
- Goal/skill duplicada → **parar** (`srr`), não reimplementar.
- Só o que falta; intenção humana + lógica; Instinto Superior.
- Felicidade mensurável = distância erro → prova nos olhos (tocar/clicar).

## Combo pack
- Easy name aliases without hyphen: combo potencia / combo-tencia / potoencia.
- Vendor **outside** `skills/` (`combo-potencia-vendor/`) or Hermes indexes 281 ECC as top-level skills.
- Prefixes `cp-*` / `sp-*`; Casa wins collisions (claude-code, codex, opencode, hermes-agent).
- Official URL gate: View on GitHub before raw guess; graphify default branch **v8**; ECC no root SKILL.md.

## Telegram menu
- Surface = Hermes telegram adapter (`send_combo_menu`), not MultiZap bot-telegram.
- Same message edit; max 6/page; ECC by category; callbacks `combo:*`.
- Slash: `/combo_potencia` / `/combo` via gateway run + commands.py.
- **Manual** `api.telegram.org` send ≠ slash path green.
- Live bugs fixed this session:
  - `name 'Path' is not defined` → use local `from pathlib import Path as ComboPath`
  - `'NoneType' object has no attribute '__dict__'` → drop fragile `module_from_spec`/`exec_module`; use import/reload or runpy
- After adapter edit: restart gateway pivete; prove with user slash.

## Debug cirúrgico
- Canonical code: `profiles/pivete/debug-cirurgico/` + skill `debug-realtime-cirurgico`.
- Loop: watch → fingerprint → dedup → lock writer → patch min → test → mutant → notify short card (no full TB on Telegram).
- 15/15 tests including combo matrix.

## Release train CI
- PR #679 self-hosted fallback on 6 canonical workflows.
- Detail: `centraldark-pr/references/deterministic-ci-fallback-pr679.md`
- Next: green #679 → #662→#663→#664 → Casa PR3 combo → notify PR4 → canary only with READY_FOR_FINAL_PROMOTION.

## Ops style
- Parallel surgical: debug agent + operate gateway/Telegram same turn when safe.
- One Writer per file/mission; no dual-write with Claude on same WF file.
