# openKylin 3.0 — Full Stack Discovery (VPS)

**Timestamp:** 2026-10-21T20:30Z (approx)  
**Host:** CENTRALDARK-OS (VPS Contabo)  
**Modo:** somente leitura  
**Critério da revisão:** declaração do projeto ≠ instalação ≠ processo ≠ endpoint ≠ teste funcional  
**Autor da coleta T0, conforme PR:** Grok via conectores CentralDark (`execute_command` + MCP admin). Logs brutos, captura de `systemctl`, `ss`, `dpkg` e identidade dos PIDs **não anexados**, portanto não reexecutados nesta revisão.

**PROVENIÊNCIA:** `DOC_OFICIAL` = recurso publicado pelo projeto; `RELATO_T0` = relato da coleta original; `PROCESSO_RELATADO` = PID/serviço citado na coleta; `API_T1` = conector respondendo nesta revisão; `TESTE_T1_FALHOU` = função executada e falha observada; `UNKNOWN` = não verificado. Seções 1–5 preservam **amostras históricas T0** exceto onde o texto indicar T1. Não projetar PIDs, portas nem estados relatados para o instante atual.

> Sandbox Grok (Debian container) ≠ esta VPS. O inventário anterior no sandbox é irrelevante para openKylin.

---

## 1. Identidade e base

| Campo | Valor da coleta T0, não revalidado no host |
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

| Componente | Versão/caminho em T0 | Estado reportado em T0 |
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

**RELATO_T0:** os estados `active`, `failed` e `auto-restart` foram informados pelo autor original; não houve `systemctl show` independente nesta revisão.

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

**RELATO_T0:** endereços e bindings inferidos da coleta original; readiness dos endpoints individuais permanece `UNKNOWN` até teste read-only com identificação do processo.

- `llama-server` 127.0.0.1:18434 (orchestrator Llama-3.2-3B)
- `llama-server` 127.0.0.1:39821
- `kytensor` model-repository: `/usr/share/kylin-ai/model-repository` + `/opt/appdata/kylin-ai/model-repository`
- binding observado: localWorker `kylin-qwen-plus` (hermes-config)

---

## 3. MCP / embeddings

### MCP CentralDark

- **API_T1:** `mcp_admin_status` retornou `ok=true`, **141 ferramentas internas**, **13 rotas**, `v1-f8ff6720fec3`, fingerprint `80f0a0fab518ab8d15bbf6651b5471813369c53e56902d905883caa97c7405c7`.
- **RELATO_T0:** bind `127.0.0.1:9100` (node). **A identidade PID↔porta↔SHA não foi comprovada aqui**; resposta administrativa não identifica automaticamente o PID da 9100.
- **API_T1 público:** `deploy_validate_mcp_catalog` consultou `/health` e retornou `ok=true` no health, **153 ferramentas** declaradas, versão `153-54e72b14201d`; o validador retornou `ok=false`, comparador 86, duas expectativas de limpeza não encontradas. São superfícies distintas; 141/153/86 não se somam.
- **Fonte GitHub:** `main@4c86124f01b7626108faf8f94e91a5cb6e9e5e17` declara 17 rotas; isso não equivale às 13 rotas ativas observadas.
- Rotas catalogadas (runtime MEASURE_AT_RUNTIME onde indicado):
  - MCP_VPS_NATIVE_HTTP
  - MCP_REMOTE_OAUTH
  - AIONUI_MCP_STDIO
  - RDC_DESKTOP_COMMANDER
  - SCREENPIPE_LOCAL_SENSOR
  - MCP_CASA_TO_VPS

### Embeddings / memória Kylin

- **RELATO_T0:** vector-engine e socket Unix, KB + document-qa com PIDs, bibliotecas de embedding instaladas. Não houve inspeção atual desses processos/pacotes.
- **API_T1:** `kylin_native_status` respondeu `ok=true` e identificou **Triton 2.49.0** e **30 nomes de modelos**, incluindo `embd_gte-base_uint8-text` e `ensemble-embd_gte-base_uint8-text`. Metadados não provam inferência/readiness.
- **TESTE_T1_FALHOU:** `kylin_text_embedding` com texto descartável retornou **HTTP 404 Not Found**. Não declarar embeddings funcionais neste caminho.
- **UNKNOWN:** disponibilidade de inferência dos modelos, protocolo KACP e acesso API do vector-engine. Não presumir banco vetorial externo além do que foi observado.

### KACP

- String/API `KACP`: NÃO_ENCONTRADA nesta medição

---

## 4. Portas e sockets (amostra)

**RELATO_T0:** a tabela é o instantâneo atribuído à coleta original, não `ss -ltnp` nem `/proc/PID` aferidos nesta revisão. Bind em porta não prova handshake, resposta HTTP ou identidade do processo; **`:9100` não foi vinculado independentemente ao PID/dispatcher**.

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

**RELATO_T0**, exceto a nova sonda: `remote_desktop_bridge_status` encontrou processos Remote Desktop Commander na VPS (`API_T1`), sem comprovar sessão gráfica, autenticação no provedor ou acesso à Casa.

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
| MCP :9100 | dispatcher tools | HTTP local em T0 | API admin T1 respondeu; identidade da porta local UNKNOWN | reutilizar catálogo, sem duplicação |
| Hermes gateway | orquestração | :9900/:8644 em T0 | PROCESSO_RELATADO; endpoints T1 UNKNOWN | reutilizar |
| kylin-ai-vector-engine | embeddings/retrieval | socket Unix relatado T0 | PROCESSO_RELATADO; embedding T1 HTTP 404 | bridge existente, sem novo MCP |
| kytensor | inferência | HTTP 8000–2 relatado T0 | metadados Triton API_T1; readiness por porta UNKNOWN | adapter modelo |
| kylin-bot | agente desktop Kylin | binário relatado T0 | INSTALAÇÃO_RELATADA, CLI/API UNKNOWN | precisa prova CLI/API |
| kylin-native-bridge | SDK bridge | systemd | active relatado em T0, handshake T1 UNKNOWN | dono existente |
| kylin-public-bridge | OpenAI-compat | systemd | auto-restart relatado T0; journal/readiness T1 UNKNOWN | 🟡 requer verificação |
| Desktop Commander | shell/desktop remoto | MCP remote | processos vistos T1; conexão autenticada UNKNOWN | rota RDC no catálogo |

**Regra:** priorizar reutilização do dispatcher MCP atual. Não criar segundo servidor MCP nem catálogo paralelo.

---

## 7. Matriz de evidências e contraprovas (2026-10-21)

| Classe | Elemento | Prova ou limite |
|---|---|---|
| Produto documentado | openKylin 3.0, Linux 7.0, KylinBot, UKUI | `DOC_OFICIAL`, lançamento do projeto. **Não prova instalação VPS**. |
| SO/pacotes instalados | `/etc/os-release`, kernel, `kylin-bot`, libs, `docker` | `RELATO_T0`, sem logs brutos preservados nesta PR. |
| Processos ativos | vector-engine, KB, doc-qa, Hermes, lightdm, AnyDesk | `PROCESSO_RELATADO`; PIDs voláteis e não revalidados por `/proc`/systemd. |
| Triton | `kylin_native_status` | `API_T1`: versão **2.49.0**, lista de **30 modelos**. |
| Embeddings funcionais | `kylin_text_embedding` | `TESTE_T1_FALHOU`: **HTTP 404 Not Found**; não certificar inferência. |
| MCP Admin | `mcp_admin_status` | `API_T1`: **141** ferramentas internas, **13** rotas; identidade de `:9100` ainda `UNKNOWN`. |
| MCP público | `deploy_validate_mcp_catalog` | Health `ok=true`, 153 ferramentas; validação `ok=false`, 86 no escopo legado, duas ausências. |
| Portas e sockets | 9100, 9900, 8644, 8098, 8000–8002, 18434, 39821, Unix | `RELATO_T0`, falta `ss`/inode/processo/HTTP por porta. |
| Desktop Commander | `remote_desktop_bridge_status` | Processos observados T1; login e sessão não verificados. |
| Kernel stream | `vps_kernel_delta_status` | `UNKNOWN`: `fetch failed`. Não implica falha geral da VPS. |
| KACP | API, mapeamento e enumeração | `UNKNOWN`, ausência de achado não prova ausência do produto. |

**Regras:** `RELATO_T0` não evolui automaticamente para `API_T1`; metadados de modelos não provam inference; HTTP 200 do MCP público não prova `127.0.0.1:9100` nem qual commit está em execução. `FIXED_POINT_RUNTIME=NO`.

**Fontes de produto/protocolo, não de instalação:**

- [Lançamento oficial openKylin 3.0](https://www.openkylin.top/news/4099-en.html).
- [NVIDIA — protocolo e readiness Triton](https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/protocol/README.html).
- [Código do dispatcher CentralDark na main](https://github.com/ServerVpss/CentralDark/blob/main/apps/modulos/mcp/src/tools/core/mcp-admin.js).

---

## 8. Próximos testes de aceitação (read-only)

1. `kylin-bot --help` / versão  
2. health kytensor `/v2/health/ready` por porta local (não executado nesta revisão)  
3. `systemctl status centraldark-kylin-public-bridge` + journal  
4. `/tools.json` público e catalog do dispatcher separados; conferir `ss` + PID + SHA na porta `:9100`  
5. Re-medir `deploy_status` após estabilizar sensor PM2  
6. Investigar a rota `kylin_text_embedding` que retornou 404; distinguir modelo disponível, caminho de inferência e readiness  
7. Recuperar evidência `systemctl show`, `ss` e `/proc/PID` da VPS sem alterar serviços  

---

## 9. Recibo — revisão documental da PR #1897

| Chave | Evidência / decisão |
|---|---|
| `PR` | [#1897](https://github.com/ServerVpss/CentralDark/pull/1897) |
| `OWNER` | `docs/ARQUITETURA/OPENKYLIN-3-FULL-STACK-DISCOVERY-2026-10-21.md` |
| `PR_ORIGINAL_SHA` | `0befbcc3b17baa9488177374f2e74c42c1c264ee` |
| `BASE_MAIN_SHA_T0` | `4c86124f01b7626108faf8f94e91a5cb6e9e5e17` |
| `T0_SOURCE` | Grok/execute_command e MCP Admin descritos pelo autor; raw logs não anexados |
| `T1_SOURCE` | GitHub PR/diff/commit, Kylin metadata, MCP Admin, HTTP público, embedding, Remote Desktop, kernel stream |
| `KYLN_TRITON` | `API_T1` version 2.49.0; 30 modelos listados |
| `EMBEDDING_T1` | `FAIL_HTTP_404`; **não aprovado como inferência funcional** |
| `MCP_T1` | 141 interno / 13 rotas; 153 público / 86 escopo validador, `ok=false` |
| `CHECKS` | PENDING/QUEUED no HEAD original; exigem revalidação no HEAD atualizado |
| `SECRETS` | Não coletados nem materializados; nenhum valor sensível incluído no arquivo |
| `DOC_SCOPE` | Exclusivamente este documento; sem código, workflow, configuração ou runtime modificados |
| `RUNTIME_CHANGED_BY_THIS_REVIEW` | `NO` |
| `MERGED_EQUALS_DEPLOYED` | `FALSE` |
| `MERGE_DECISION` | `NO_GO` até gates requeridos PASS no HEAD exato |
| `NEXT_CURSOR` | DOC_SHA → CI_PASS → REVIEW → AUTHORIZED_MERGE → MAIN_SHA_READBACK |

**Correções no mesmo owner:** distinção entre capacidade oficial, instalação relatada, processos, endpoints, teste funcional e desconhecidos; rotas/portas históricas sem falso verde; falha 404 de embedding; documentação das fontes consultadas. O SHA exato do commit que incorpora estas correções deve ser lido no GitHub.
