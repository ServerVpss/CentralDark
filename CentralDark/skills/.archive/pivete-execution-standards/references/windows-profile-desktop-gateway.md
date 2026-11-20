# Windows: Profile sticky + Desktop pin + Gateway

Recibo operacional (sessão 2026-08-04). Classe: fixar profile `pivete` na CLI e alinhar atalho Desktop.

## Separação de 3 mecanismos

| Mecanismo | Arquivo / comando | Escopo |
|---|---|---|
| Sticky CLI | `hermes profile use pivete` → `%LOCALAPPDATA%\hermes\active_profile` | próximas invocações `hermes` sem `-p` |
| One-shot CLI | `hermes -p pivete …` / `hermes --profile pivete …` | só aquela chamada |
| Desktop pin | `%APPDATA%\Hermes\active-profile.json` → `{"profile":"pivete"}` | backend local do Electron com `--profile pivete` |

Sticky CLI ≠ Desktop pin. Os dois precisam estar alinhados quando o Pivete quer "tudo pivete".

UserData Electron observado: `%APPDATA%\Hermes` (mesmo inode que `…\Roaming\hermes` neste host).

## Atalhos .lnk — procedimento

Ler com PowerShell COM (não confiar só em strings do binário .lnk):

```powershell
$sh = New-Object -ComObject WScript.Shell
$l = $sh.CreateShortcut('C:\Users\danda\Desktop\Hermes.lnk')
$l.TargetPath; $l.Arguments; $l.WorkingDirectory
Test-Path -LiteralPath $l.TargetPath
```

Dois EXEs vistos neste host:

- Antigo (installer):  
  `C:\Users\danda\AppData\Local\Programs\hermes-desktop\hermes-agent.exe`
- Novo (unpacked build):  
  `C:\Users\danda\AppData\Local\hermes\hermes-agent\apps\desktop\release\win-unpacked\Hermes.exe`

Atalhos a alinhar (backup `.bak-<timestamp>` antes):

- `Desktop\Hermes.lnk`
- `Start Menu\Programs\Hermes.lnk`
- `Start Menu\Programs\Hermes One.lnk`

Alvo preferido quando o unpacked existe e é mais novo: `…\win-unpacked\Hermes.exe`, WorkingDirectory = pasta do exe.

## Marker de update stale

Arquivo: `%LOCALAPPDATA%\hermes\.hermes-update-in-progress`  
Conteúdo típico: PID + timestamp.

Se `Get-Process -Id <PID>` falhar → marker morto.  
Ação: copiar para `.bak-stale-<ts>` e remover.  
Motivo: desktop pode adiar/bloquear start de backend enquanto o marker "vivo" existir.

## Gateway (profile pivete) — comandos nativos only

Docs:
- https://hermes-agent.nousresearch.com/docs/user-guide/messaging
- https://hermes-agent.nousresearch.com/docs/user-guide/profiles
- https://hermes-agent.nousresearch.com/docs/user-guide/multi-profile-gateways
- https://hermes-agent.nousresearch.com/docs/user-guide/messaging/telegram

Pedido do Pivete: **usar os próprios comandos do Hermes** para ligar/status.

```bash
hermes -p pivete gateway status
hermes -p pivete gateway start
hermes -p pivete gateway run      # se start não levantar processo
hermes -p pivete gateway stop
hermes -p pivete gateway restart
hermes -p pivete gateway setup
hermes gateway list
```

Windows: login item pode existir  
`%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\Hermes_Gateway_pivete.vbs`  
e ainda assim status reportar "No gateway process detected". Isso = processo parado, não install ausente.

### `.env` POR PROFILE (causa raiz real desta sessão)

| Profile | Secrets |
|---|---|
| default | `%LOCALAPPDATA%\hermes\.env` |
| pivete | `%LOCALAPPDATA%\hermes\profiles\pivete\.env` |

- Cada profile é um `HERMES_HOME`. Gateway `pivete` **não herda** token do root.
- Não existe ".env do gateway" separado — só o `.env` do home do profile.
- Só `gateway start/restart` **sem** `TELEGRAM_BOT_TOKEN` no `.env` do pivete → `missing_credentials` / `SystemExit: 78` / `startup_failed`.
- Ao espelhar keys do root: copiar só `TELEGRAM_*` (+ allowlists). Prova = `PRESENT` + `LEN`, **nunca** o valor.
- Saúde real (anti falso-verde):

```text
hermes -p pivete gateway status     → process running
hermes gateway list                 → ✓ pivete PID …
gateway_state.json                  → gateway_state=running
platforms.telegram.state             → connected
logs/gateway.log                    → "✓ telegram connected"
```

`Gateway started (PID…)` sozinho é insuficiente.

Arquivos de prova no profile:
```text
%LOCALAPPDATA%\hermes\profiles\pivete\gateway_state.json
%LOCALAPPDATA%\hermes\profiles\pivete\logs\gateway.log
%LOCALAPPDATA%\hermes\profiles\pivete\.env
```

## Dashboard 9119 ≠ gateway Telegram

Docs:
- https://hermes-agent.nousresearch.com/docs/user-guide/features/web-dashboard
- https://hermes-agent.nousresearch.com/docs/user-guide/docker (porta 9119)

| Superfície | Comando | Prova |
|---|---|---|
| Messaging gateway | `hermes -p pivete gateway start` | telegram connected no state/log |
| Web dashboard | `hermes -p pivete dashboard --port 9119 --host 127.0.0.1 --no-open` | HTTP 200 em `http://127.0.0.1:9119/` |

- Default port dashboard = **9119**.
- `hermes -p pivete dashboard` pode rotear para machine dashboard com `--open-profile pivete` (não isola). `/api/status` pode mostrar gateway **default** stopped enquanto pivete messaging está running — isso não invalida o gateway pivete.
- UI profile: `http://127.0.0.1:9119/sessions?profile=pivete`
- HTTP 200 no 9119 **não** prova Telegram.

Ordem do Pivete **"só ver documentação"** = read-only. Não start/copy/restart nessa ordem.

## Meta-lupa canônica (remoto)

- Repo: `ServerVpss/CentralDark` path `.agents/skills/meta-lupa`
- Provar `AUTOLUPA_CANONICAL_SHA` via `gh api` (blob canônico visto: `c124497474f381ec86047fb93407b9e04fbdcf58`).
- `profiles/pivete/skills/meta-lupa` deve resolver para checkout que bate esse SHA (`E:\CentralDark\Pivete\CentralDark\.agents\skills\meta-lupa`), não worktree antiga divergente.
- No profile default, `skill_view('meta-lupa')` pode falhar — carregar via `gh`/disco do pivete.

## Truncate de resposta

Mensagem:
`Response truncated (finish_reason='length') - model hit max output tokens`

Causa: limite de tokens de **saída** da completion, não path/profile/exe.  
Ação: encurtar entrega, fatiar missão, ou delegar trecho longo. Não reabrir diagnóstico de atalho.

## Checklist de prova (mínimo)

```text
[ ] hermes profile list → ◆pivete
[ ] active_profile == pivete
[ ] %APPDATA%\Hermes\active-profile.json → profile pivete
[ ] Desktop/Start Menu .lnk TargetPath existe
[ ] .hermes-update-in-progress ausente OU PID vivo legítimo
[ ] profiles\pivete\.env tem TELEGRAM_BOT_TOKEN (PRESENT/LEN only)
[ ] hermes -p pivete gateway status → process running
[ ] gateway_state.json → running + telegram.connected
[ ] logs/gateway.log → "✓ telegram connected"
[ ] (opcional) http://127.0.0.1:9119/ → 200  — separado do Telegram
[ ] meta-lupa AUTOLUPA_CANONICAL_SHA bate remoto
```

## O que NÃO fazer

- Não apagar `Programs\hermes-desktop\` sem ordem (só realinha atalho).
- Não editar SOUL para "fixar profile".
- Não assumir que reescrever .lnk muda a sessão Desktop já aberta — precisa reabrir o app.
- Não tratar truncate length como bug de gateway.
- Não achar que token do root serve o gateway pivete.
- Não declarar gateway OK só com PID/login item.
- Não confundir dashboard 9119 com messaging gateway.
- Não spawnar processo paralelo se `hermes gateway *` basta.
- Não imprimir TELEGRAM_BOT_TOKEN.
- Não agir em ordem "só documentação".
