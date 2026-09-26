# Caso: /combo_potencia — manual OK, slash quebra

## Sintoma
- Comando real: `/combo_potencia` ou `/combo` no Telegram GuardiaoCasa.
- Disparo manual (Bot API `sendMessage` + inline keyboard) mostrava o menu.
- Caminho slash → adapter `send_combo_menu` falhava.

## Erros (ordem)
1. `name 'Path' is not defined` — helper usava `Path` bare; adapter importa `Path as _Path`.
2. `'NoneType' object has no attribute '__dict__'` — `importlib` loader None / `exec_module` frágil ao carregar `combo_menu_engine.py`.

## Matriz
| Check | Significado |
|---|---|
| BASELINE_DIRECT_OK | engine root com 6 braços |
| BASELINE_SLASH_BUG_REPRO | padrão loader quebrado detectável |
| CORRIGIDO_SLASH_OK | `TelegramAdapter._combo_load_screen` no venv Hermes |
| MUTANTE_DETECTA_REGRESSAO | loader mutante → teste vermelho |
| ZERO_REGRESSAO_DIRECT | manual/direct continua OK |

```bash
python C:\Users\danda\AppData\Local\hermes\profiles\pivete\debug-cirurgico\cli.py combo-case
```

## Fix mínimo (padrão reutilizável)
- Path local no helper (`ComboPath`).
- Load: `import` + `reload` (fallback `runpy.run_path`).
- InlineKeyboard import na hora do build.
- Send: helper HTML → plain → `bot.send_message`.
- Após patch de adapter: restart **só** gateway do profile; retestar o **mesmo** slash.

## Arquivos do caso
- `hermes-agent/plugins/platforms/telegram/adapter.py`
- `profiles/pivete/combo-potencia-menu/`
- `gateway/slash_commands.py` + `gateway/run.py`
- `hermes_cli/commands.py` (`combo-potencia`)

## Lei
Manual/BotAPI ≠ PASS do comando. Restart quieto ≠ PASS. Prova = evento original do usuário.
