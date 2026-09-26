# VPS Reality Check — 2026-08-31

Mission: `CENTRALDARK_VPS_REALITY_CHECK` (READ_ONLY, MUTATIONS=0)
Host:    vmi3256920.contaboserver.net (89.117.78.124, root)
Method:  direct SSH (Segredo-VPS), 6 parallel batches in execute_code, no mutation.

## Sistema
- HOST:    vmi3256920
- OS:      Ubuntu 22.04.5 LTS (jammy)
- KERNEL:  5.15.0-181-generic
- ARCH:    x86_64 / KVM (full virt)
- CPU:     AMD EPYC, 8 vCPU, 1 socket
- RAM:     23Gi total / 3.3Gi usado / 16Gi livre / 19Gi disponível
- SWAP:    2.0Gi / 352Mi usado
- DISCO:   /dev/sda1 194G — 147G (76%) / 48G livre
- LOAD:    5.31 / 5.63 / 5.69 sustained
- USERS:   11 root pts em tmux (06-08/jul)
- UPTIME:  70 dias, 17h

## Rede
- eth0:        89.117.78.124/21
- docker0:     172.17.0.1/16
- br-5ecff…:   172.20.0.1/16 (multizap-wuzapi)
- br-25c2d3…:  172.21.0.1/16 (webui)
- br-ec4921…:  172.23.0.1/16 (hermes-thinker)
- DNS:         systemd-resolved 127.0.0.53
- GW:          89.117.72.1

## Portas (ss -tulnp, owners)
| Porta | Owner | Status HTTP |
|---|---|---|
| 22 | sshd | — |
| 53 (UDP/TCP) | systemd-resolved | — |
| 80 | caddy | 308 |
| 443 | caddy (TCP+UDP) | 400 (sem Host) |
| 2019 | caddy (admin) | — |
| 3000 | docker-proxy (WebUI) | 200 |
| 3030 | node /root/Cent (GraphPanel) | 404 |
| 3090 | node /root/Cent (ArtifactsBuilder) | — |
| 3101 | node /root/Cent (Memoria) | — |
| 40493 | code-f6cfa2ea24 (codex?) | — |
| 7801 | docker-proxy (HermesThinker) | — |
| 8000 | docker-proxy (portainer) | — |
| 8081 | docker-proxy (wuzapi) | — |
| 8082 | uvicorn (ArsenalProxy / elite-anthropic) | 401 |
| 8083 | uvicorn (EliteHTTP) | 401 |
| 8090 | node /root/Cent (ArsenalAdapter) | 401 |
| 8091 | node (HubBot) | 401 |
| 8098 | node /root/Cent (OAuthBroker) | 404 |
| 8099 | — (vazio) | 000 |
| 8880 | — (vazio) | 000 |
| 9000 | webhook (portainer) | — |
| 9077 | uvicorn | 404 |
| 9100 | node /root/Cent (MCP) | 404 |
| 9300 | node /root/Cent (WebhookDeploy) | 404 |
| 9443 | docker-proxy (portainer TLS) | — |
| 9500 | PM2 daemon | 404 |

## Domínios
| Domínio | Backend declarado | Verdict |
|---|---|---|
| api.centralldark.com | :8090 ArsenalAdapter | 401 (app viva) |
| ui.centralldark.com | :3000 OpenWebUI | 200 ✓ |
| grafo.centraldark.com | :3030 GraphPanel | 000 (timeout — rota morta) |
| elite.centralldark.com | :8082 EliteHTTP | (não testado nesta passada) |
| bridge.centralldark.com | — Origin | (não testado) |
| builder.centralldark.com | — static | (não testado) |

## Caddyfile (resumo)
- api.centralldark.com → 8090 + audio/transcriptions → supabase; audio/speech → 503 "bridge desligado"
- ui.centralldark.com → :3000
- grafo.centraldark.com → :3030
- 7 imports (origin/status/managed/portal/telepainel)
- 100+ backups acumulados em /etc/caddy (Caddyfile.bak-*, *.Caddyfile.bkp-*, etc)

## PM2 (21 processos)
- 🟢 online (19): Hermes, MCP, HubBot, Memoria, ArsenalAdapter, ArsenalProxy,
  OAuthBroker, AiPrompt, PiveteSync, EliteHTTP, LovableBridge, GuardiaoBot,
  GuardiaoBridge, GuardiaoConsciencia, WebhookDeploy, ArtifactsBuilder,
  ArtifactsCrafter, GrafoVivo, GraphPanel
- 🔴 stopped (1): CentralDark-AiDiag (pid 0, restarts 4)
- ❌ errored (1): CentralDark-HermesVerificador (pid 0, restarts 158+)

## Docker (7 containers)
- CentralDark-WebUI (open-webui:main) 4w healthy — 0.0.0.0:3000→8080
- CentralDark-HermesThinker 7w — 127.0.0.1:7801
- CentralDark-Tools 7w — sem porta host
- CentralDark-MCPO 5d — 8000
- portainer-ce 7w — 8000/9443 + 9000
- multizap-gateway-wuzapi-1 7w — 127.0.0.1:8081
- multizap-gateway-postgreswuzapi-1 7w healthy — 5432

Networks: bridge, hermes-thinker_default, host, multizap-wuzapi-net, none, webui_default

## CentralDark repo
- PATH:    /root/CentralDark
- REMOTE:  https://github.com/ServerVpss/CentralDark.git
- BRANCH:  pr_resolve_1358
- HEAD:    5c85bf577b (chore(painel): IA atualiza painel)
- DIVERG:  origin/main está 141 commits atrás, local 9297 ahead
- STATUS:  13 M (status/, BRAIN/, RETOMADA, .next_run)
- UNTRACKED: 30+ drift-*.json em apps/modulos/grupo-evolucao/missions/
  (range: 1787914807553 → 1787961607025, ie ~24h de dumps)
- WORKTREES: 13 acumulados
  - /root/CentralDark (pr_resolve_1358)
  - /root/.grok/worktrees/root-centraldark/centraldark (detached)
  - /tmp/audit-wt (auditoria/sessao-2026-07-27)
  - /tmp/cd-audit-sessao-1435023, /tmp/cd-auto-reg-wt-1336107
  - /tmp/cd-grok-wt (detached), /tmp/cd-pr234-clean
  - /tmp/claude-0/-root-CentralDark/.../wt-pr147 (detached) ← Claude Code
  - /tmp/grok-ouro-inventario-telegram-2951998
  - /tmp/wt-deploy, /tmp/wt-guard, /tmp/wt-mcp-148-204

## Áudio
- TTS:        NÃO ENCONTRADO em /opt, /root, nem docker (centraldark-voice/ = Chrome ext)
- STT:        NÃO ENCONTRADO (Whisper runtime ausente)
- KOKORO:     NÃO ENCONTRADO
- SPEECH2SP:  NÃO ENCONTRADO
- audio/transcriptions → proxied supabase.co (workaround)
- audio/speech → respond 503 "bridge desligado (rota morta)" — INTENTIONAL ROUTE DEAD

## Findings
FACT
- 70d uptime, recursos OK (RAM 19Gi livre, disco 48G livre)
- 19/21 PM2 online, 7/7 Docker up
- 5/16 portas testadas respondem (200/401/404); 2 domínios TLS ativos
- TTS rota 503 declarada no Caddy (rota morta intencional)
- 13 worktrees, 30+ drift-*.json, 100+ caddy backups = acúmulo
- Load 5.6 sustained + 11 tmux root abertas = ruído operacional

UNKNOWN
- Whisper/Kokoro em container não-rotulado?
- Real health de HermesThinker (sem healthcheck)
- Por que HermesVerificador loop 158x restarts
- Por que AiDiag parou

PROBLEM
- P0: TTS rota 503 explícito (HTTP contraprovado)
- P1: grafo.centraldark.com timeout (silencioso, app morta ou rota quebrada)
- P1: HermesVerificador errored loop
- P2: worktree drift + drift-*.json spam + caddy backups

## Veredito
- VPS_STATUS: DEGRADED
- CENTRALDARK_STATUS: DEGRADED
- MUTATIONS_PERFORMED: false ✓

## Como reproduzir
```bash
# Sistema
ssh Segredo-VPS 'uname -a; lsb_release -a; uptime; lscpu | head -5; free -h; swapon --show; df -h /; mount | grep "^/dev"'

# Rede
ssh Segredo-VPS 'ip -4 addr show; ip route; ss -tulnp; cat /etc/resolv.conf'

# Runtimes
ssh Segredo-VPS 'pm2 list'
ssh Segredo-VPS 'docker ps -a; docker images; docker volume ls; docker network ls'

# CentralDark
ssh Segredo-VPS 'cd /root/CentralDark && git remote -v; git branch --show-current; git log -1 --oneline; git status --short | head -20; git worktree list; git rev-list --left-right --count origin/main...HEAD'

# Caddy
ssh Segredo-VPS 'cat /etc/caddy/Caddyfile | head -50; find /etc/caddy -name "*.Caddyfile" -not -name "*.bak*" -not -name "*.bkp*"'

# Portas HTTP
ssh Segredo-VPS 'for p in 80 443 3000 8080 8082 8083 8090 8091 8098 8099 8880 9077 9100 9300 9500; do code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 http://127.0.0.1:$p); echo "PORT $p HTTP=$code"; done'

# Domínios
ssh Segredo-VPS 'for d in api.centralldark.com ui.centralldark.com grafo.centraldark.com; do code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 -k https://$d); echo "DOMAIN $d HTTP=$code"; done'

# Módulos (TTS/STT?)
ssh Segredo-VPS 'ls /root/CentralDark/apps/modulos/'
```
