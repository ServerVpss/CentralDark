# Windows Casa — cloudflared, WebUI 8788, e bugs de cron no git-bash

Detalhe operacional reutilizável. Três frentes apareceram e foram resolvidas
em 30/08 (Pivete pediu tunnel pro app 8788 + depois mandou ligar jobs/mineração).

## 1. cloudflared em Windows (tunnel rápido pra WebUI)

Erro típico do CHEFE: `cloudflared : O termo 'cloudflared' não é reconhecido`.
Não está no PATH. Não é erro do app.

Passo determinístico (prova 30/08, HTTP 200 no download):

```bash
# achar asset oficial (nome muda por release, NUNCA chutar .zip)
curl -s "https://api.github.com/repos/cloudflare/cloudflared/releases/latest" \
  | grep -i "browser_download_url" | grep -i "windows-amd64.exe"
# baixar o .exe direto (NÃO é zip — o asset zip dá 404)
curl -L -o cloudflared.exe \
  "https://github.com/cloudflare/cloudflared/releases/download/<VER>/cloudflared-windows-amd64.exe"
# rodar (foreground pra ver, ou background pra deixar no ar)
./cloudflared.exe tunnel --url http://localhost:8788
```

- A URL pública (quick tunnel) aparece no log em:
  `INF |  https://<id>.trycloudflare.com                                     |`
- Quick tunnel é TEMPORÁRIO (some se o processo fechar). Pra URL estável
  precisa conta Cloudflare + tunnel nomeado (R4, pergunta ao CHEFE).
- Pro CHEFE não digitar caminho: adicionar a pasta do `.exe` no PATH do Windows
  (`setx PATH "%PATH%;E:\CentralDark\cloudflared"`), ou chamar por caminho cheio
  no Powershell: `E:\CentralDark\cloudflared\cloudflared.exe tunnel --url ...`

## 2. Hermes WebUI na 8788 + erro provider 'nous' sem API key

Sintoma que o CHEFE viu: `Provider 'nous' is set in config.yaml but no API key
was found. Set the NOUS_API_KEY environment variable...`

- O app 8788 é o **Hermes WebUI** (sobe via `Iniciar-Hermes-iPhone.bat` ou
  `hermes.html` + server). Config dele NÃO é o `.bat`, é:
  `E:\CentralDark\Pivete\config.yaml`
- `config.yaml` da Casa já aponta `provider: centraldark-router` (base_url
  `http://127.0.0.1:8099/v1`, `api_key: local-no-auth`) — esse é o caminho
  interno que não exige NOUS_API_KEY.
- O erro `nous` surge quando o WebUI cai no `default: nous/tencent/hy3:free`
  direto (sem o omni-router no ar, ou sem a env NOUS_API_KEY).
- **Correção real**: subir o omni-router (porta 8099) OU exportar
  `NOUS_API_KEY` no ambiente que roda o WebUI. Não mexer no binário.
- `python3` no git-bash deste PC resolve pro stub `WindowsApps/python3`
  (não roda). Usar `python` (Python313 real em
  `C:\Users\danda\AppData\Local\Programs\Python\Python313\python`).

## 3. Bugs de cron scripts no git-bash Windows (CORRIGIDO 30/08)

Os jobs `scripts/screenpipe-monitor.sh` e `scripts/dependabot-monitor.sh`
estavam caindo em `last_status: error`. Causa real (não era "job desligado"):

### Bug A — formato de date com espaço
```bash
# ERRADO (GNU date entende %H:%M:%S como operando extra):
date -u +%Y-%m-%d %H:%M:%S UTC
# CORRETO (sem espaço solto / usar T como separador):
date -u +%Y-%m-%dT%H:%M:%SUTC
```
Sintoma: `date: extra operand ‘%H:%M:%S’`.

### Bug B — python3 inexistente no PATH útil
`python3` → `C:\Users\danda\AppData\Local\Microsoft\WindowsApps\python3`
(stub que não executa). Trocar por `python` nos scripts.

### Verificação pós-fix (prova 30/08)
```bash
bash scripts/screenpipe-monitor.sh; echo $?   # 0 (ou stop limpo das 18h)
bash scripts/dependabot-monitor.sh;  echo $?   # 0
```
Log correto após conserto:
`2026-08-31T00:02:43UTC | horário >= 18:00 Brasil — ciclo stop.`

### Comportamento por design (NÃO é erro)
Esses dois scripts **param sozinhos após 18:00 Brasil** (`if [ "$HORA_BRASIL" -ge 18 ]; then exit 0`).
Se o CHEFE olhar às 21h e ver "error"/stop, é o corte de horário, não falha.
Voltam 00:00. Se quiser minerar mais tarde, mexer no corte de 18h (pergunta).

## Jobs da Casa (estado 30/08)
`cronjob action=list` → 10 jobs. Vários com `last_status: error` eram só o
corte das 18h + os bugs A/B acima. Um estava `paused` (`8a7b98f04c7c`
telemetry SOLAR PRO 4) — reativado com `cronjob action=resume`.
Mineração/destilação = `screenpipe-monitor` + `dependabot-monitor` (operantes,
só dormem 18h→00h). Screenpipe vivo confirmado na :3030 (HTTP 403 = rodando,
path bloqueado, normal).

## 4. cua-driver WinError 740 (Windows, interagir no browser)
- `computer_use` da Hermes sobe o cua-driver SEM admin → falha `[WinError 740] A operação requer elevação`.
- Fix: rodar o driver elevado via `Start-Process -Verb RunAs` num `.ps1`:
  `Start-Process -FilePath "C:\Users\danda\AppData\Local\hermes\bin\cua-driver.exe" -ArgumentList "list_windows" -Wait -PassThru -RedirectStandardOutput "C:\Users\danda\cua_list.txt" -RedirectStandardError "C:\Users\danda\cua_err.txt" -WindowStyle Hidden`
  e disparar com `powershell.exe -NoProfile -Command "Start-Process ... -Verb RunAs -Wait"`.
- `list_windows` elevado funciona (árvore de PID/title). `capture`/`call` via MCP precisam do servidor `serve` ativo.
- Se o CHEFE mandar "NÃO reinicia o Hermes": não sobe o Hermes como admin só p/ clicar. Usa screenshot do Windows (PowerShell/PrintScreen) pra VER a tela, e o driver elevado só pra `list_windows`/diagnóstico. Interagir (clicar/digitar) exige Hermes admin OU driver `call` com servidor — avaliar com o CHEFE.
- `cua-driver` NÃO tem subcomando `capture` direto; é via `call` (MCP server). Subcomandos úteis: `list_windows`, `status`, `doctor`, `autostart enable` (task de logon Windows).
