# Pivete — Gateway, .env, Dashboard, Meta-Lupa, Francisca

Sessão de referência: 2026-08-04 (CLI profile sticky + gateway + docs).

## Paths (Windows)

```text
ROOT_HOME     = %LOCALAPPDATA%\hermes\
PIVETE_HOME   = %LOCALAPPDATA%\hermes\profiles\pivete\
active_profile (CLI sticky) = ROOT_HOME\active_profile
Desktop pin                 = %APPDATA%\Hermes\active-profile.json
Pivete .env                 = PIVETE_HOME\.env
Root .env (default only)    = ROOT_HOME\.env
gateway_state               = PIVETE_HOME\gateway_state.json
gateway.log                 = PIVETE_HOME\logs\gateway.log
Francisca sample            = PIVETE_HOME\cache\audio\edge_francisca_mulher_BR.mp3
Meta-Lupa canon checkout    = E:\CentralDark\Pivete\CentralDark\.agents\skills\meta-lupa
Meta-Lupa remote            = github.com/ServerVpss/CentralDark/.agents/skills/meta-lupa
```

## Comandos nativos (preferir estes)

```bash
hermes profile use pivete
hermes -p pivete gateway status|start|stop|restart|run|setup
hermes gateway list
hermes -p pivete config set tts.provider edge
hermes -p pivete config set tts.edge.voice pt-BR-FranciscaNeural
hermes -p pivete config set display.language pt
hermes -p pivete dashboard --port 9119 --host 127.0.0.1 --no-open --skip-build
```

## Checklist Telegram healthy

```text
[ ] profiles/pivete/.env exists
[ ] TELEGRAM_BOT_TOKEN PRESENT (LEN only)
[ ] hermes -p pivete gateway start  (native)
[ ] hermes -p pivete gateway status → process running
[ ] gateway_state.json: gateway_state=running
[ ] platforms.telegram.state=connected
[ ] log: "✓ telegram connected" + "Gateway running with"
[ ] hermes gateway list → pivete ✓
```

Fail examples (do not greenwash):
- `startup_failed` / `No bot token configured` / SystemExit 78
- spawn PID printed then process gone
- 9119 `/api/status` says gateway stopped while pivete gateway is up (default scope)

## Dashboard vs messaging

- **9119** = Hermes web dashboard / serve backend (machine-level; may preselect profile).
- **8642** = api_server often co-located on the gateway process (pivete).
- **Open WebUI** = separate stack; absence on 3000/8080/7860 is normal here.

## Meta-Lupa SHA gate

```text
AUTOLUPA_CANONICAL_SHA → c124497474f381ec86047fb93407b9e04fbdcf58  .agents/skills/meta-lupa/SKILL.md
```

If pivete skill junction points at an old worktree (different SHA/size), realign to CentralDark checkout that matches remote before treating method as canonical. Load remote via `gh api` when session profile is default and skill is not in registry.

## Menu PT-BR reality

- Built-in BotCommand descriptions are English `CommandDef` strings.
- `platforms.telegram.extra.command_menu` = priority/max only.
- `display.language` / `locales/pt.yaml` = static gateway strings, **not** menu descriptions.
- Full PT menu = `setMyCommands` with EN backup + verify + rollback script.
- Pending if `cache/telegram_menu_pt.json` missing after attempt.

## Francisca

```yaml
tts:
  provider: edge
  edge:
    voice: pt-BR-FranciscaNeural
```

Voice mode file (optional, per chat):
`gateway_voice_mode.json` → `{"telegram:1901426549":"all"}`

Do not replace Francisca with STT/OpenAI voice paths.

## Config list pitfall

`hermes config set platforms.telegram.extra.command_menu.priority "['voice',...]"` may persist a **string**. After set, parse YAML and ensure `priority` is a real list.

## Doc-only mode

User: "é só ver documentação" → read-only. No gateway start, no .env copy, no menu patch until explicit order.
