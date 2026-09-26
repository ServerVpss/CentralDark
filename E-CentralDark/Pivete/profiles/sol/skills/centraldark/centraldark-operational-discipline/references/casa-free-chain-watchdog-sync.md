# Casa Free Chain — Watchdog + Reconciliação Multi-Writer

Padrão extraído da sessão 31/08 (Hermes-Casa + Charizard + Codex rodando em paralelo
na mesma máquina/clone). Domínio: manter a cadeia free tier da Casa viva sem esbarrar
nos outros agentes e sem se perder no Fable Loop.

## Cadeia Free Tier (portas da Casa, PID provado)

| Porto | Serviço | Dono / Launcher | Health |
|---|---|---|---|
| 8788 | Hermes WebUI (voz iPhone via Tailscale) | `C:\Users\danda\hermes-webui\server.py` via `start.ps1` (`HERMES_WEBUI_HOST=0.0.0.0`) | `/health` → `{"status":"ok"}` |
| 8099 | Omni Router (free tier, sem NOUS_API_KEY) | `C:\Users\danda\AppData\Local\Temp\launch_omni_router.py` | `/health` ok, lista modelos free |
| 9119 | Hermes Dashboard | `hermes.exe dashboard --port 9119 --host 127.0.0.1 --no-open` | HTML |
| 3030 | Screenpipe (contexto) | `screenpipe-app.exe` | `/health` healthy |

Tailscale Serve: `segredo.tail6d7aa4.ts.net` → `http://127.0.0.1:8788` (iPhone acessa Hermex).

## Watchdog (cron 10min, no_agent)

Script: `E:\CentralDark\Pivete\scripts\cadeia-free-watchdog.ps1` (copiado p/ `~/.hermes/scripts/`).
Cron: `cronjob(action='create', no_agent=true, script='cadeia-free-watchdog.ps1', schedule='every 10m')`.

O script mede health real das 4 portas e sobe o que caiu (Omni Router / WebUI). Screenpipe
só marca pendência (precisa binário + tailscale, não força). Log em
`E:\CentralDark\_MAPA_CASA\C_HERMES_LOCAL\cadeia-free-watchdog.log`.

**Latência conhecida:** o watchdog recupera mas demora (sleep interno + sobe processo).
Se a cadeia caiu e tu precisa agora, força em foreground:
`pwsh.exe -NoProfile -ExecutionPolicy Bypass -File "C:\Users\danda\.hermes\scripts\cadeia-free-watchdog.ps1"`

## screenpipe-mcp (VS Code) FALHA — não é bloqueio de produção

Sintoma: `MCP screenpipe: Server disconnected` / `bunx resolve` não acha módulo.
Causa: `bunx` cache corrupto no temp dir (não o servidor).
Workaround: usar `screenpipe-app.exe` direto (porta 3030 continua `healthy`).
Não gastar CPU consertando o MCP do VS Code para objetivo de voz iPhone — é elo de dev.

## Reconciliação multi-writer (N agentes no mesmo clone)

- HEAD do clone PULA de SHA entre subcomandos (outro agente commitando).
- NUNCA commitar/push/pull em checkout que mudou durante a medição → Writer externo ativo.
- Re-medir `origin/main` toda rodada (`git fetch` + `git rev-parse origin/main`); não cachear
  divergência de turno anterior (bot de chore faz "0 behind" virar "2 behind").
- Outro agente abriu PR (ex: #1382 Codex gravando DELTA 4 em DELTA-CONTINUO.md) = ele é o
  Writer do escopo. Não mexer no mesmo arquivo, não empurrar. Aguardar CI + mão do CHEFE.
- Git pode travar (timeout 60s) em checkout móvel; separar medição de porta (não depende de git).
- Sempre cruzar: disco (`git hash-object`) vs HEAD (`git rev-parse HEAD:`) vs main.

## Padrão de resposta ao CHEFE (estilo baiano, sem papagaio)

- `#ACORDAR → !CALIBRAR → !DELTAUTIL → !RECONCILIAR → !REGISTRA` é o gatilho de continuar.
- Não re-perguntar o que já foi dito; não oferecer opções A/B/C quando a ordem é direta.
- Status em painel 🟢🟡🔴 + PID provado, não "HTTP 200" de mentira.
- Fable Loop: cada rodada salva acerto + checkpoint; não se perde; para em FIXED_POINT real.
- Delta útil = 1 PR canônico no dono existente, NUNCA arquivo paralelo.
