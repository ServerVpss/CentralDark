# openKylin 3.0 — Full Stack Discovery (VPS)

**Timestamp:** 2026-10-21T20:30Z (approx)  
**Host:** CENTRALDARK-OS (VPS Contabo)  
**Modo:** somente leitura  
**Critério:** nada declarado sem evidência local  
**Autor da medição:** Grok via conectores CentralDark (`execute_command` + MCP admin)

> Sandbox Grok (Debian container) ≠ esta VPS. O inventário anterior no sandbox é irrelevante para openKylin.

---

## 1. Identidade e base

| Campo | Valor medido |
|-------|----------------|
| OS | openKylin 3.0 (huanghe) |
| `/etc/os-release` | `ID=openkylin` `VERSION_ID="3.0"` `PRETTY_NAME="openKylin 3.0"` |
| Kernel | `Linux CENTRALDARK-OS 7.0.0-2-generic #0ok7-KYLINOS SMP PREEMPT_DYNAMIC` x86_64 |
| Init | systemd (PID 1) |
| apt | `/usr/bin/apt` |
| docker | 24.0.7-ok3 (`/usr/local/bin/docker`) |
| node | v22.22.1 |
| python3 | 3.12.2 |
| go / podman | não no PATH |
| Desktop session | sem `$DISPLAY`; UKUI/kwin/peony instalados; `lightdm.service` **failed** |

---

## 2. Agentes e runtimes

### 2.1 Kylin nativo

| Componente | Versão / path | Estado |
|------------|---------------|--------|
| `kylin-bot` | 0.7.5-ok1.8 `/usr/bin/kylin-bot` | INSTALADO; unit `kylin-bot.service` **não existe** |
| `kylin-ai-runtime` | 1.1.0.1-ok0.21 | inactive |
| `kylin-ai-vector-engine` | 1.2.0.1-ok0.11 PID 1929 | PROCESSO_ATIVO; sock `/tmp/kylin-ai-vector-engine-0.sock` |
| `kylin-ai-document-qa-service` | PID 1926 | PROCESSO_ATIVO; unix abstract Knowledgebase |
| `kylin-ai-knowledge-base-service` | PID 1928 | PROCESSO_ATIVO |
| `kytensor` | unit active PID 745 | Triton HTTP 127.0.0.1:8000/8001/8002 |
| `kylin-aiassistant` | 5.0.0.0-0k1.32 | INSTALADO |
| embedding libs | `libkylin-coreai-embedding`, `libkylin-ondevice-embedding-engine` | INSTALADAS |
| Xiao K / Kylin-CUA / KACP nomeado | — | NÃO_ENCONTRADO |

### 2.2 CentralDark (systemd)

| Unit | Estado |
|------|--------|
| `centraldark-hermes-core.service` | active |
| `hermes-gateway.service` | active |
| `centraldark-native-mcp-http.service` | active |
| `centraldark-kylin-native-bridge.service` | active |
| `centraldark-kylin-public-bridge.service` | activating / auto-restart |
| `centraldark-oauth-broker.service` | active |
| `desktop-commander-remote.service` | active |
| `centraldark-desktop-commander-conta2.service` | active |
| `actions.runner.ServerVpss-CentralDark.centraldark-vps-1.service` | active |

**PM2:** `pm2 list` / sensor em `deploy_status` falhou (JSON parse). Processos node/hermes observados via PID e systemd — não declarar PM2 “online” sem prova nova.

### 2.3 Inferência local

- `llama-server` 127.0.0.1:18434 (orchestrator Llama-3.2-3B)
- `llama-server` 127.0.0.1:39821
- `kytensor` model-repository: `/usr/share/kylin-ai/model-repository` + `/opt/appdata/kylin-ai/model-repository`
- binding observado: localWorker `kylin-qwen-plus` (hermes-config)

---

## 3. MCP / embeddings

### MCP CentralDark

- Dispatcher admin: ok, **141 tools**, catalog `v1-f8ff6720fec3`
- Bind: **127.0.0.1:9100** (node)
- Rotas catalogadas (runtime MEASURE_AT_RUNTIME onde indicado):
  - MCP_VPS_NATIVE_HTTP
  - MCP_REMOTE_OAUTH
  - AIONUI_MCP_STDIO
  - RDC_DESKTOP_COMMANDER
  - SCREENPIPE_LOCAL_SENSOR
  - MCP_CASA_TO_VPS

### Embeddings / memória Kylin

- Vector engine PROCESSO_ATIVO + unix socket
- KB + document-qa PROCESSO_ATIVO
- Libs de embedding instaladas
- **Não** presumir banco vetorial externo além do que o vector-engine expõe

### KACP

- String/API `KACP`: NÃO_ENCONTRADA nesta medição

---

## 4. Portas e sockets (amostra)

| Porta / sock | Processo | Bind |
|--------------|----------|------|
| 9100 | node MCP | 127.0.0.1 |
| 9900 | hermes | 127.0.0.1 |
| 8644 | hermes | 0.0.0.0 |
| 8098 | oauth-broker | 127.0.0.1 |
| 8000–8002 | kytensor | 127.0.0.1 |
| 18434 / 39821 | llama-server | 127.0.0.1 |
| 80 / 443 | caddy | * |
| 22 | sshd | * |
| AnyDesk 7070 | anydesk | 0.0.0.0 |
| `/tmp/kylin-ai-vector-engine-0.sock` | kylin-ai-vector | unix |
| `@/tmp/.kylin-ai-business-unix/0/*.sock` | kylin-ai-* | unix abstract |

---

## 5. Desktop

| Capacidade | Status |
|------------|--------|
| Sessão gráfica local | NÃO_ATIVA |
| UKUI / kwin / peony | INSTALADOS |
| AnyDesk | PROCESSO_ATIVO |
| Desktop Commander remote | PROCESSO_ATIVO |
| Automação GUI local full | BLOQUEADA sem display |

---

## 6. Matriz de integração CentralDark × openKylin

| Componente | Função | Protocolo | Estado | Integração |
|------------|--------|-----------|--------|------------|
| MCP :9100 | dispatcher tools | HTTP local | ENDPOINT_RESPONDENDO | **já é o catálogo** — não duplicar |
| Hermes gateway | orquestração | :9900/:8644 | PROCESSO_ATIVO | reutilizar |
| kylin-ai-vector-engine | embeddings/retrieval | unix sock | PROCESSO_ATIVO | tool/bridge no dispatcher existente |
| kytensor | inferência | HTTP 8000–2 | PROCESSO_ATIVO | adapter modelo |
| kylin-bot | agente desktop Kylin | binário | INSTALADO, sem unit | precisa prova CLI/API |
| kylin-native-bridge | SDK bridge | systemd | active | dono existente |
| kylin-public-bridge | OpenAI-compat | systemd | auto-restart | 🟡 instável |
| Desktop Commander | shell/desktop remoto | MCP remote | RUNNING | rota RDC no catálogo |

**Regra:** priorizar reutilização do dispatcher MCP atual. Não criar segundo servidor MCP nem catálogo paralelo.

---

## 7. Estado operacional (medição)

```
PROVADO:
- VPS = openKylin 3.0 huanghe
- Kylin AI stack (vector/KB/doc-qa/kytensor) vivo
- MCP CentralDark 141 tools :9100
- Hermes core + gateway vivos
- Embeddings nativos instalados + vector-engine up

QUEBRADO / ALERTA:
- deploy_status ERRO (PM2 JSON parse)
- VPS atrás da main (3 commits no momento da medição)
- Fila Actions com runs queued
- kylin-public-bridge auto-restart
- Desktop session local morta

EVIDÊNCIA FALTANTE:
- handshake kylin-bot CLI
- tools expostas pelo vector-engine (se API listável)
- KACP formal

FIXED_POINT: NÃO
```

---

## 8. Próximos testes de aceitação (read-only)

1. `kylin-bot --help` / versão  
2. health kytensor `/v2/health/ready`  
3. `systemctl status centraldark-kylin-public-bridge` + journal  
4. `/tools.json` ou catalog full do MCP :9100  
5. Re-medir `deploy_status` após estabilizar sensor PM2  

---

## 9. Recibo

| Campo | Valor |
|-------|--------|
| SYSTEM_ID | openKylin 3.0 / CENTRALDARK-OS / x86_64 / systemd |
| MÉTODO | `centraldark___mcp_admin_call` → `execute_command` + status tools |
| SECRETS | não coletados |
| ALTERAÇÃO RUNTIME | zero |
| CURSOR | SYSTEM_ID → PACKAGE → LIVE → PORTS → MCP_KACP → EMBEDDINGS → DESKTOP → CENTRALDARK_MAPPING → RECEIPT |
