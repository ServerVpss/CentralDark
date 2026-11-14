# Mapa dos processos — PM2, Docker e systemd

> **Retrato documental, nao medicao.** Cada fonte abaixo tem data no proprio cabecalho.
> A VPS nao foi medida nesta janela. `RUNTIME = NOT_TESTED_BY_SCOPE`.

## 1. Por que existem listas diferentes

As listas de processos **nao se contradizem** — sao de **epocas diferentes** e nenhuma foi
desaposentada. Existem duas eras documentadas:

| Era | Dominio | Data | Documentos |
|---|---|---|---|
| **MultiZap** | `multizap.dev` | 2026-05-31 | `STATUS_ATUAL_DO_PROJETO.md`, `WHATSAPP_CONNECTION_MAP.md`, `MAPA_LEIGO_DO_SISTEMA.md` |
| **CentralDark** | `centralldark.com` | 2026-08-14 | `09-ESTADO-ATUAL.md`, `03-portas-e-rede.md` |

Nada foi aposentado: os documentos de maio seguem no repo, e os de agosto convivem com eles.

---

## 2. As quatro listas concorrentes

### Lista A — Painel `scripts/menu/cdstatus.sh` (era CentralDark) — **10 PM2**

```
MCP-CentralDark
CloneDeck-Supabase-Sync
MultiZap-TelegramBot
MultiZap-Gateway
MultiZap-GitHub-Webhook
CloneDeck-CRM
wabot-bridge
whatsapp-server
webhook-bot
github-webhook
```

Systemd: `caddy`, `docker`, `cron`.
Restart liberado pelo menu — **so 3**: `MCP-CentralDark`, `CloneDeck-Supabase-Sync`,
`MultiZap-TelegramBot`. Qualquer outro e bloqueado; Docker/WuzAPI/WhatsApp/Caddy
exigem confirmacao humana.

### Lista B — Checker `scripts/checker/04-pm2.sh` — **17 PM2**

```
CentralDark-BotServer
CentralDark-WebhookDeploy
CentralDark-HubBot
CentralDark-GuardiaoConsciencia
CentralDark-GuardiaoAnalista
CentralDark-ContasAdmin
CentralDark-Respiracao
CentralDark-MCP
CentralDark-TelePainelDeploy
CentralDark-EvolucaoIAs
CentralDark-SyncDrive
CentralDark-Zentinel
CentralDark-EliteWS
CentralDark-EliteHTTP
CentralDark-EliteAnthropic
CentralDark-GraphPanel
whatsapp-server           (mantido por compatibilidade)
```

Regra do checker: `online` com `restarts < 5` e OK; `online` com restarts altos e alerta de
possivel loop; qualquer outro estado e erro. Nome ausente do PM2 vira alerta.

### Lista C — `ecosystem.config.cjs` na raiz do repo — **1 PM2**

```javascript
name: "CentralDark-ScreenPipe"
script: "/root/CentralDark/apps/modulos/screenpipe-launcher.mjs"
PORT: 3030   SCREENPIPE_DATA_DIR: /root/.screenpipe
max_memory_restart: 1024M   max_restarts: 10
```

**Nao aparece em nenhuma das outras duas listas.** E o unico processo que o repo *declara*
como configuracao raiz — e ele nao esta no painel nem no checker.

### Lista D — `scripts/get-infra-map.sh` — **sem lista fixa**

Nao declara nomes. **Mede ao vivo** e gera o mapa:

```
pm2 ls          → Servicos PM2
docker ps       → Containers
systemctl       → Servicos systemd (filtra runner|caddy|nginx|actions)
ss -tlnp        → Portas em LISTEN
```

Uso declarado no proprio arquivo:

```bash
bash scripts/get-infra-map.sh > docs/CONSCIENCIA/INFRA-MAP.md
```

Rodape: *"Este arquivo e regerado a cada execucao. NAO editar manualmente."*

---

## 3. A divergencia viva

O **mesmo MCP** tem dois nomes em superficies diferentes:

| Onde | Nome usado |
|---|---|
| Painel `cdstatus.sh` | `MCP-CentralDark` |
| Checker `04-pm2.sh` | `CentralDark-MCP` |
| `09-ESTADO-ATUAL.md` | `CentralDark-MCP` |
| `03-portas-e-rede.md` | `MCP-CentralDark` |

O `docs/CONSCIENCIA/INVENTARIO-PM2-VPS.md` **ja preservava essa divergencia como historico**:

```
o nome do MCP divergia entre MCP-CentralDark e CentralDark-MCP em superficies diferentes
```

Ela continua — medida de novo em 2026-11-04.

---

## 4. Docker

**O unico container documentado e o WuzAPI.**

| Container | Porta | Protocolo | Fonte |
|---|---|---|---|
| WuzAPI | `127.0.0.1:8081` | `whatsmeow` (WebSocket com a nuvem Meta) | `WHATSAPP_CONNECTION_MAP.md` |

**Nao existe `docker-compose.yml` no repositorio.** Busca por `docker ps` / `Dockerfile` / `wuzapi`
retornou 4 arquivos, nenhum deles um compose. O `ORGANIZACAO_VPS.md` proibe mover o WuzAPI antes
de *"mapear volumes e docker-compose"* — ou seja, o compose existe **na VPS**, nao no repo.

---

## 5. Portas declaradas

| Porta | Servico | Escopo |
|---|---|---|
| 80 / 443 | Caddy | externo |
| 3000 | `CloneDeck-CRM` | loopback |
| 3100 | `MultiZap-Gateway` | loopback |
| 8080 | `elite-http-gateway` | — |
| 8081 | WuzAPI (Docker) | loopback |
| 8082 | `CentralDark-EliteAnthropicProxy` | — |
| 9000 | `webhook` (Go) | hook WhatsApp — **NAO mexer** |
| 9001 | `github-webhook` | hook Recargas — **NAO mexer** |
| 9002 | `MultiZap-GitHub-Webhook` | hook atendimentoo |
| 9003 | `webhook-bot` | hook clone-deck |
| 9010 | `wabot-bridge` | sync WuzAPI → Supabase |
| 9100 | MCP | `mcp.centralldark.com` |
| 9119 | `centraldark-vps-heartbeat.service` | so 127.0.0.1, HMAC obrigatorio |
| 3030 | `CentralDark-ScreenPipe` | do `ecosystem.config.cjs` |
| 5174→5173 | `CentralDark-Builder` | — |

---

## 6. Modelo de operacao

```
Arena/IA -> GitHub/branch/PR -> merge na main
  -> GitHub webhook -> VPS atualiza codigo
  -> post-deploy.sh -> scripts/run-once executam
  -> GitHub Actions -> Supabase migrations
```

**Papeis:** qualquer IA + MCP (orquestracao) · Lovable (UI) · Grok/Codex (auditoria) ·
GitHub Actions (automacao) · **VPS + PM2 (execucao real)**.

**Fonte da verdade declarada:** repo `ServerVpss/CentralDark@main` · espelho
`segredounlock/clone-deck` (passivo, nao usa a VPS como fonte) · pendencias **so** em
`docs/PENDENCIAS.md`.

**Arvore operacional:** somente `/root/CentralDark`. `/root/Multizap` e declarado
`OUT_OF_SCOPE` — `FALLBACK_PARA_MULTIZAP=PROIBIDO`.

---

## 7. Como fechar este mapa

O repo nao sabe quais processos rodam na VPS — sabe o que o painel **espera**, o que o
checker **cobra**, o que o ecosystem **declara**, e tem uma ferramenta para **medir**.
O caminho que o proprio repo prescreve:

```
MEDIR_RUNTIME_AUTORIZADO
-> SANITIZAR SOMENTE CAMPOS NECESSARIOS
-> LIGAR EVIDENCIA A TARGET + TIMESTAMP + HEAD
-> COMPARAR COM SNAPSHOT/HISTORICO
-> CLASSIFICAR DELTA
-> SOMENTE ENTAO PROPOR MUTACAO
```

Comando unico que resolve os quatro eixos numa tacada:

```bash
bash scripts/get-infra-map.sh > docs/CONSCIENCIA/INFRA-MAP.md
```

Sem VPS, a fronteira fica `UNKNOWN/BLOCKED`.

---

## 8. O que este documento NAO e

- **Nao e medicao.** E retrato do que os documentos declaram.
- **Nao substitui** `docs/CONSCIENCIA/INFRA-MAP.md` (gerado ao vivo) nem
  `docs/PENDENCIAS.md` (unica fonte de pendencias).
- **Nao aposenta** nenhuma das listas anteriores. Todas continuam validas no seu tempo.

`UNKNOWN != PASS` · `MAPA != RUNTIME` · `HISTORY != CURRENT_STATE`
