# Combo Potência — pitfalls (2026-08-06)

## Path NameError (live slash)
```text
USER: Nao abri o menu Combo Potencia: name 'Path' is not defined
LOG:  combo menu load failed: name 'Path' is not defined
CAUSE: adapter top-level imports `Path as _Path`; combo helper used bare Path
FIX:   inside `_combo_engine_paths` → `from pathlib import Path as ComboPath`
THEN:  restart gateway (old PID keeps broken bytecode/code)
```

## Disk green ≠ Telegram green
Unit tests 10/10 on `combo-potencia-menu/tests` do not prove slash works.
Must: restart → new PID → `Connected to Telegram` → `/combo_potencia` opens 6 arms.

## Vendor location
Never put `combo-potencia-vendor` under `skills/`. Hermes indexes every SKILL.md → ECC flood.

## Anti-briga
Keep local claude-code / codex / opencode / hermes-agent.
Superpowers colliders only as `sp-*`. ECC only via `cp-ecc` router.

## Surfaces
GuardiaoCasa menu = Hermes telegram `send_combo_menu` + `combo:*`.
Not MultiZap `apps/bot-telegram` hub Painel.
Not tool `clarify` (numbered 1/2/3/Other).

## Evidence hygiene
Computing kaomoji / `mulli` photo is busy indicator, not PASS receipt.
Hand-built Bot API keyboard without slash path is partial proof only.

## Official URL gate
skillsllm View on GitHub → real repo → default_branch (graphify **v8**) → tree path.
Never invent raw.githubusercontent.com/.../main/SKILL.md first.

## Activate sequence
See `references/live-gateway-activate.md`.
