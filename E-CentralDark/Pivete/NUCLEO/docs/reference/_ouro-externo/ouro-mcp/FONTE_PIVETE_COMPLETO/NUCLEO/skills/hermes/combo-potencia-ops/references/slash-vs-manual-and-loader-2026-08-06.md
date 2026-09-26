# Combo Potência — slash vs manual + loader (2026-08-06)

Session learning for class skill `combo-potencia-ops`.

## HARD: manual menu ≠ slash green
Pivete proved: a card can appear via hand `sendMessage` / direct adapter while
`/combo_potencia` still errors. Full green requires gateway slash dispatch only.

## Loader (do not regress)
```text
BAD:  importlib.util.spec_from_file_location + module_from_spec + exec_module
      → live: 'NoneType' object has no attribute '__dict__'
GOOD: sys.path += combo-potencia-menu; import combo_menu_engine; importlib.reload
      fallback: runpy.run_path into plain namespace object
```

## Path helper
```text
BAD:  bare Path when module only has `from pathlib import Path as _Path`
GOOD: inside _combo_engine_paths → from pathlib import Path as ComboPath
```

## Send resilience
```text
A) _send_message_with_thread_fallback + HTML
B) plain text helper
C) self._bot.send_message direct
LOG: logger.exception (traceback required)
```

## Activate
1. unittest combo-potencia-menu/tests → 10/10
2. optional venv: TelegramAdapter._combo_load_screen("combo:root")
3. gateway restart → new PID → Connected to Telegram
4. chat: /combo_potencia → 6 arms same message

## Ops style (Pivete)
Debug code and operate gateway/Telegram in parallel — surgical, real-time.
Do not serialize fix-then-operate.

## Not evidence
- Computing kaomoji / mulli photo
- Unit tests alone
- Hand-built Bot API keyboard without slash
- Old PID receipt
