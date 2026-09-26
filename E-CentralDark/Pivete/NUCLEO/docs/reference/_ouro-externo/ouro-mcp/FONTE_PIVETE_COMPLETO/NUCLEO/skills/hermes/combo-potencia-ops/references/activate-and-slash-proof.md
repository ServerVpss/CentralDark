# Activate + slash proof (2026-08-06)

## Sequence after adapter/gateway code change
1. Disk tests green (menu + combo-case).
2. `hermes --profile pivete gateway restart`
3. Confirm Telegram connected in `logs/gateway.log`
4. User runs `/combo_potencia` or `/combo` in GuardiaoCasa
5. Expect 6 arms; ECC categories; same-message edit

## Failures seen live
| Error | Cause | Fix |
|---|---|---|
| `name 'Path' is not defined` | adapter imports `Path as _Path` only | local `from pathlib import Path as ComboPath` |
| `NoneType` has no `__dict__` | `module_from_spec` + `exec_module` with null loader | `import`/`reload` or `runpy.run_path` |
| Menu appears after agent manual BotAPI | not slash path | do not call PASS until slash works |

## Proof hierarchy
```text
DISK_TESTS < GATEWAY_RESTART < SLASH_LIVE < CLICK_NAV < USAR_AGORA→SOL
```
Manual `api.telegram.org` send is below SLASH_LIVE.
