# Combo Potência — live ops addendum (06/08/2026)

Companion to `references/combo-potencia-pack.md`.

## After any adapter/slash edit
1. unittest `combo-potencia-menu/tests` → 10/10  
2. `hermes --profile pivete gateway restart`  
3. Prove PID changed + `Connected to Telegram`  
4. Chat: `/combo_potencia` → 6 arms, same-message navigation  

## Bug fixed this session
`_combo_engine_paths` must use local `ComboPath`, not bare `Path` when module has `Path as _Path` only.

## HARD
- Vendor outside `skills/`
- Prefixes `cp-` / `sp-`; Casa wins collisions with Claude friends
- graphify branch **v8**, path `graphify/skill.md`
- Menu = Hermes adapter, not MultiZap, not clarify
- Computing indicator ≠ mission receipt

## Class skill
`combo-potencia-ops` (+ `references/live-gateway-activate.md`, `references/pitfalls-session-2026-08-06.md`)
