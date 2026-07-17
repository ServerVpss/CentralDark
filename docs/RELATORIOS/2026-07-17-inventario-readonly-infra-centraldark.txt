# Inventário CentralDark — Missão Read-Only

Data/Hora: 2026-07-17 ~18:27 UTC (coleta original) / reenvio estruturado 2026-07-17  
Solicitante: Pivete  
Modo: 100% READ-ONLY  
Coordenador: Grok 4.5 (xAI) — CLI VPS `/root/CentralDark`  
Missão: Inventário 100% READ-ONLY da infraestrutura CentralDark (goal oficial)

---

## 0. Metadados da missão

| Campo | Valor |
|-------|--------|
| Tipo | Diagnóstico / Leitura |
| Autorização de escrita | NENHUMA |
| Ciclo | LER → NÃO AGIR → PROVAR → REGISTRAR |
| Kill-switch | TRAVA / PARA / !CALIBRA |
| Secrets no relatório | PROIBIDO |

---

## 1. Subdomínios e Rotas Públicas

Fonte: `/etc/caddy/Caddyfile` + imports **ativos** listados no main.  
Snippets em `centraldark-managed/` **não importados** = **dormants** (existem em disco, não definem o tráfego atual).

### 1.1 Ativos (carregados pelo Caddyfile principal)

| Host / rota | Tipo | Destino / resposta | Observação validada |
|-------------|------|--------------------|---------------------|
| `api.centralldark.com` default | `reverse_proxy` | `127.0.0.1:8090` | ArsenalAdapter OpenAI-compat |
| `api…/v1/audio/transcriptions` | `reverse_proxy` | Supabase edge (projeto kage…) | rewrite functions |
| `api…/memoria/*` | `reverse_proxy` | `127.0.0.1:3101` | Memoria escuta 3101 |
| `api…/lovable/v1/*` | `reverse_proxy` | `127.0.0.1:3102` | **3102 sem listener** (risco 502) |
| `api…/v1/audio/speech` | `respond 503` | `"bridge desligado (rota morta)"` | Kill switch |
| `builder.centralldark.com` | `reverse_proxy` | `localhost:3090` | ArtifactsBuilder |
| `ui.centralldark.com` | `respond 503` | `"ui desligado pelo Pivete (16/07)"` | Kill switch |
| `install.centralldark.com` | `respond 503` | `"install desligado pelo Pivete (16/07)"` | Via centralldark-origin |
| `hub.centralldark.com` | static + proxy | hub/dist; `/api\|/oauth\|/health` → `:8098` | OAuthBroker |
| `status.centralldark.com` | static + proxies | root status/ | ver sub-rotas |
| `status…/elite-proxy` | `reverse_proxy` | `127.0.0.1:8082` | elite-anthropic-proxy vivo |
| `status…/arsenal-api` | `reverse_proxy` | `127.0.0.1:8083` | ArsenalProxy |
| `status…/api/*` | `reverse_proxy` | `127.0.0.1:9400` | **9400 sem listener** |
| `status…/api/ai-diag/prompt` | `reverse_proxy` | `127.0.0.1:4189` | **4189 sem listener** |
| `status…/bot/*` | `reverse_proxy` | `127.0.0.1:9500` | **9500 sem listener** |
| `status…/mtproto/*` | `reverse_proxy` | `127.0.0.1:8790` | **8790 sem listener** |
| `elite.centralldark.com` | `reverse_proxy` | `127.0.0.1:8080` | **8080 morto → 502** |
| `mcp.centralldark.com` | `reverse_proxy` | `127.0.0.1:9100` | MCP online |
| `centralldark.com` / `www` | `file_server` | apps/web/dist | Institucional |
| `portal.centralldark.com` | `file_server` | mesmo dist web | Ativo |
| `telepainel.centralldark.com` | `file_server` | telepainel/dist | Ativo |
| `grafo.centralldark.com` | `reverse_proxy` | `127.0.0.1:3030` | GraphPanel |
| `bridge.centralldark.com` | `respond 503` | `"bridge desligado (rota morta)"` | Kill switch (não porta) |

### 1.2 Snippets managed DORMANTS (não importados no main)

| Arquivo | Conteúdo | Status |
|---------|----------|--------|
| root-imports/bridge…Caddyfile | reverse_proxy :8099 | Superseded pelo 503 no main |
| root-imports/builder… | proxy :5174 | Superseded (main usa 3090) |
| root-imports/install… | 503 install | Duplicata parcial |
| root-imports/deploy… | proxy :9300 | Não importado no main |
| root-imports/gateway… | proxy :3100 | Não importado |
| root-imports/bot… | bot → :9210 | Não importado |
| root-imports/portainer… | :9443 TLS | Não importado |
| bot-api.caddy | bot + api→9210 | Legado não importado |

---

## 2. Mapa de Portas (Porta | PID | Processo | Script | PM2)

Snapshot `ss -tlnp` + `/proc/<pid>/cmdline` + `pm2 jlist` (coleta ~18:27 UTC).

| Porta | Bind | PID (coleta) | Processo real | PM2 |
|------:|------|--------------|---------------|-----|
| 80/443 | * | caddy | Caddyfile | (não PM2) |
| 3030 | 127.0.0.1 | graph-panel | server.js | CentralDark-GraphPanel |
| 3090 | 0.0.0.0 | artifacts-builder | orchestrator.mjs | CentralDark-ArtifactsBuilder |
| 3101 | 127.0.0.1 | memoria-api | index.mjs | CentralDark-Memoria |
| 3102 | — | — | **sem listener** | Caddy aponta; backend ausente |
| 8080 | — | — | **sem listener** | elite.* → 502 |
| 8082 | 0.0.0.0 | uvicorn | elite-anthropic-proxy | **CentralDark-EliteHTTP** (nome ≠ função) |
| 8083 | 0.0.0.0 | uvicorn | apps/modulos/proxy | CentralDark-ArsenalProxy |
| 8090 | 0.0.0.0 | node | arsenal-openai-adapter | CentralDark-ArsenalAdapter |
| 8091 | 127.0.0.1 | node | **/tmp/cx/.../arsenal** | **órfão (fora PM2)** |
| 8098 | 127.0.0.1 | node | oauth-broker | CentralDark-OAuthBroker |
| 8099 | — | — | **sem listener** | bridge legado |
| 8899 | 0.0.0.0 | node | HERMES-CORE orchestrator | CentralDark-Hermes |
| 9100 | 127.0.0.1 | node | mcp/dist/index.js | CentralDark-MCP |
| 9210 | — | — | **sem listener** | BotServer só no ecosystem |
| 9300 | 127.0.0.1 | node | webhook deploy | CentralDark-WebhookDeploy |
| 9400 | — | — | **sem listener** | contas-admin não live |

---

## 3. Processos PM2 Relevantes

### 3.1 Runtime (status real)

| Nome PM2 | Status | Restarts | Fantasma? | Porta |
|----------|--------|---------:|-----------|-------|
| CentralDark-EliteHTTP | online | **5308** | Não (proxy :8082) | 8082 |
| CentralDark-ArsenalProxy | online | **5576** | Não | 8083 |
| CentralDark-ArsenalAdapter | online | 0 | Não | 8090 |
| CentralDark-MCP | online | 826 | Não | 9100 |
| CentralDark-GraphPanel | online | 260 | Não | 3030 |
| CentralDark-WebhookDeploy | online | 278 | Não | 9300 |
| CentralDark-LovableBridge | online | 0 | **SIM** — server.mjs ABSENT, sem listen | — |
| CentralDark-Hermes | online | 0 | Não | 8899 |
| CentralDark-HermesVerificador | online | 0 | Não | n/a |
| CentralDark-Memoria | online | 0 | Não | 3101 |
| CentralDark-OAuthBroker | online | 0 | Não | 8098 |
| CentralDark-HubBot | online | 0 | Não | n/a |
| CentralDark-GuardiaoConsciencia | online | 0 | Não | n/a |
| CentralDark-GuardiaoBot | online | 0 | Não | n/a |
| CentralDark-GuardiaoBridge | online | 0 | Não (worker em bot-telegram) | n/a |
| CentralDark-ArtifactsBuilder | online | 0 | Não | 3090 |
| CentralDark-ArtifactsCrafter | online | 0 | Não | n/a |
| CentralDark-GrafoVivo | online | 0 | Não | n/a |
| CentralDark-PiveteSync | online | 0 | Não | n/a |
| CentralDark-AiPromptAPI | online | 0 | Não | n/a |
| CentralDark-AiDiag | stopped | 3 | stopped | — |

### 3.2 Ecosystem vs realidade

- **Ecosystem declara (18)** vários apps **ausentes** no PM2 live (Zentinel, MultiZap, BotServer, EliteWS, ContasAdmin, EliteAnthropic, etc.).
- **PM2 live** tem dezenas de apps **não** no ecosystem (Hermes, ArsenalAdapter, LovableBridge, Memoria, OAuthBroker, …).
- **Mismatch crítico:** `CentralDark-EliteHTTP` no ecosystem aponta path `/root/dark/...` **inexistente**; runtime executa `elite-anthropic-proxy/start-fallback.sh` → uvicorn **:8082**.

Conclusão: **ecosystem.config.cjs NÃO é a fonte fiel** do que o PM2 roda hoje. Risco se alguém der `pm2 start ecosystem`.

---

## 4. Kill Switches e Rotas Desligadas

| Onde | Mecanismo | Intencional? |
|------|-----------|--------------|
| bridge.centralldark.com | respond 503 “bridge desligado (rota morta)” | **SIM** |
| api…/v1/audio/speech | mesma 503 | **SIM** |
| ui.centralldark.com | respond 503 “ui desligado 16/07” | **SIM** |
| install.centralldark.com | respond 503 “install desligado 16/07” | **SIM** |

**Não é kill switch (backend morto / ghost → 502 se hit):**  
elite :8080 · api/lovable :3102 · status 9400/4189/9500/8790

---

## 5. Inconsistências Graves

1. Nome PM2 **EliteHTTP** = elite-anthropic-proxy :8082 (não gateway Zendriver :8080).
2. **LovableBridge** fantasma (online + script sumido + sem porta).
3. Bridge pública 503 vs snippet managed dormant ainda com 8099.
4. elite.* → :8080 morto; proxy vivo em 8082.
5. Caddy lovable/v1 → :3102 sem backend.
6. Processo órfão `/tmp/cx` arsenal na 8091.
7. Restarts 5k+ EliteHTTP/ArsenalProxy (estáveis na coleta; histórico frágil).
8. Ecosystem vs PM2 divergente em massa.
9. Path `apps/modulos/guardiao-bridge/` ABSENT; worker real em bot-telegram.
10. bot-api.caddy legado api→9210 vs main api→8090.

### 5.1 Entrypoints módulos críticos

| Módulo | Entrypoint | Existe? |
|--------|------------|---------|
| elite-anthropic-proxy | proxy.py, start.sh, start-fallback.sh | SIM |
| lovable-openai-bridge | server.mjs | **NÃO** |
| arsenal-openai-adapter | server.mjs | SIM |
| proxy (ArsenalProxy) | main.py, start.sh | SIM |
| lovable-proxy | index.mjs | SIM (não no PM2 live) |
| guardiao-bridge (dir) | — | DIR ABSENT |
| GuardiaoBridge (PM2) | guardiao-grok-bridge-worker.cjs | SIM |
| mcp | dist/index.js | SIM |
| HERMES-CORE | core/orchestrator.mjs | SIM |
| /root/dark/scripts/elite_http_gateway.py | path ecosystem | ABSENT |

---

## 6. Resumo Executivo

### Saudável
- api → :8090 ArsenalAdapter  
- mcp → :9100  
- status/elite-proxy → :8082  
- status/arsenal-api → :8083  
- grafo → :3030 · builder → :3090 · hub broker → :8098 · memoria → :3101  
- Hermes · HubBot · Guardioes workers · WebhookDeploy :9300  

### Fantasma
- LovableBridge (PM2 online, script/porta mortos)  
- elite :8080 · :3102 · backends status sem listener · órfão 8091  

### Desligado de propósito (503 Caddy)
- bridge · speech · ui · install  

### Riscos (somente observação — sem ação nesta missão)
1. Nome EliteHTTP engana operadores/IAs.  
2. `pm2 start ecosystem` pode quebrar estado vivo.  
3. Fantasma LovableBridge polui inventário.  
4. Rotas Caddy → portas mortas = 502 silencioso.  
5. Restarts históricos altos em proxies.  
6. Snippets managed stale vs main.

---

## Encerramento

1. Missão foi **100% READ-ONLY**.  
2. **Nenhuma alteração** de estado na coleta (sem reload Caddy, restart PM2, kill, edit de config de runtime).  
3. Reenvio deste arquivo (2026-07-17): entrega estruturada em anexo Telegram por ordem do Pivete (regra 06).  
4. Zero secrets neste documento.

**Fim do inventário.**
