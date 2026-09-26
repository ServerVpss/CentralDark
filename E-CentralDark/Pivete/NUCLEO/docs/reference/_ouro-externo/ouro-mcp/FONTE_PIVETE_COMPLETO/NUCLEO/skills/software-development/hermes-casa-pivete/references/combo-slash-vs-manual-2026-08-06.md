# Combo Potência — slash vs manual (casa pointer)

Full procedure lives in class skill `combo-potencia-ops`:
- `references/slash-vs-manual-and-loader-2026-08-06.md`
- `references/live-gateway-activate.md`
- `references/pitfalls-session-2026-08-06.md`

## One-line HARD rules
1. Hand BotAPI/adapter menu ≠ `/combo_potencia` green.
2. Engine load: import/reload, not exec_module (NoneType.__dict__).
3. Path helper: local ComboPath.
4. After adapter patch: restart gateway + slash-only smoke.
5. Ops: debug and operate gateway/Telegram in parallel (Pivete).
