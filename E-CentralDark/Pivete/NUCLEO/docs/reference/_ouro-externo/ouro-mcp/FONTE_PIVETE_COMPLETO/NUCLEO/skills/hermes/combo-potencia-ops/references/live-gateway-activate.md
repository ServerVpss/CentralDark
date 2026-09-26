# Combo Potência — activate after adapter/slash patch

## Goal
Prove the Telegram menu is live, not only unit-tested on disk.

## Sequence
```text
1. python -m unittest discover -s <HERMES_HOME>/combo-potencia-menu/tests -v
   expect 10/10
2. hermes --profile pivete gateway status   # note PID
3. hermes --profile pivete gateway restart
4. wait gateway.log: Connected to Telegram (polling mode)
5. set_my_commands OK … (58+ cmds) and getMyCommands contains combo
6. In GuardiaoCasa chat: /combo_potencia  or  /combo
7. Expect one message with 6 arms + Painel; edits in place on tap
```

## Known failure: Path not defined
```text
USER: Nao abri o menu Combo Potencia: name 'Path' is not defined
LOG:  combo menu load failed: name 'Path' is not defined
CAUSE: _combo_engine_paths used bare Path while module imports Path as _Path only
FIX:   inside helper → from pathlib import Path as ComboPath; use ComboPath(...)
THEN:  restart gateway again (old PID still has broken code)
```

## Evidence checklist
| Check | Pass means |
|---|---|
| Unit tests | 10/10 on combo-potencia-menu/tests |
| PID changed | status PID ≠ pre-restart |
| Telegram up | Connected to Telegram after restart timestamp |
| Command registered | combo / combo_potencia / combo-potencia in menu or getMyCommands |
| Slash opens menu | one inline message, 6 arms, not clarify 1/2/3/Other |
| ECC safe | first ECC screen is categories, ≤6 buttons of skills |
| No Path error | no combo menu load failed after fix timestamp |

## Not evidence
- Computing/busy kaomoji photo
- Old receipt from previous PID
- sendMessage of a hand-built keyboard without going through slash/adapter
- Vendor sitting under skills/ “because clone was easier”
