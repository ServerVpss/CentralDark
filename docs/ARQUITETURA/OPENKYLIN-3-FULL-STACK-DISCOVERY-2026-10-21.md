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

---

<!-- KYLINBOT_NATIVE_MCP_VM_CONTRAPROOF_20261112 -->
## 10. T2 — Casa VMware openKylin: CLI, Gateway e MCP (2026-11-12)

**Proveniencia:** medicao SSH na Casa (SEGREDO -> openkylin-vm, hostname CentralDark-OS), NAO na VPS historica das secoes T0/T1. Nao projetar dados de um host no outro.

- SO: openKylin 3.0. Pacotes instalados: kylin-bot 0.7.5-ok1.9, kylin-ai-runtime 1.1.0.1-ok0.21, kylin-aiassistant 5.0.0.0-0k1.33.
- CLI nativa confirmada pelo --help: agent, gateway, acp, daemon, service, doctor, status, cron, models, providers, channel, integrations, skills, sop, memory, config e self-test.
- Gateway nativo: HTTP/WebSocket, pareamento, host local por padrao. ACP: JSON-RPC 2.0 via stdio; nao equiparar ACP a A2A. Daemon: gateway, canais, cron e heartbeat.
- MCP nativo: cliente de MCP externo, com transporte stdio, http ou sse, headers por servidor e schema proprio. Nao existe subcomando kylin-bot mcp na versao aferida.
- Config real (somente metadados sem segredos): ~/.kylinbot/config.toml em modo 0600; mcp.enabled=false, mcp.servers=[] e deferred_loading=true; gateway.host=127.0.0.1, gateway.port=42617, require_pairing=true e allow_public_bind=false; node_transport requer HTTPS por padrao.
- Porta 9100: PID transitorio 660929, node, owner apps/modulos/mcp/dist/index.js, systemd user centraldark-native-mcp-http.service; listener 0.0.0.0:9100. GET /health=HTTP 200, service=mcp-centraldark, catalogVersion=160-45340263b107; GET /mcp sem autenticacao=401; GET /sse=410.
- Rota canonica neste processo e POST /api/mcp (Streamable HTTP), conforme apps/modulos/mcp/src/index.js. Nao confundir com o servidor alternativo em src/mcp-server.js. A porta 8099 Omni Router e 8080 Cockpit tambem estavam em 0.0.0.0.
- Teste efemero do Gateway nativo na interface 127.0.0.1:42617: processo criado, nenhuma porta pronta na janela de ~7 s, processo encerrado; nao foi instalado servico persistente.
- Prova de MCP autenticado foi bloqueada por controle de seguranca antes da execucao. Nao foi contornada. Nenhum token foi exibido, copiado ou persistido; initialize/tools/list/tools/call autenticados NAO foram provados.
- Hermes Windows e instalacao isolada; CLI CentralDark na Hostinger NAO foi aferida nesta rodada. Evidencia atual da VMware nao e evidencia da VPS.

**Menor delta / NEXT_CURSOR:** (1) diagnosticar inicio do Gateway local sem expor pareamento; (2) obter autorizacao de cliente MCP com escopo restrito, sem reutilizar token administrativo de processo; (3) usar mecanismo atomico nativo de config para mcp.enabled e um servidor HTTP no endpoint /api/mcp; (4) testar initialize, tools/list e chamada permitida com receipt; (5) conferir caminhos CentralDark CLI Hostinger e Hermes Windows separadamente. Reutilizar os owners existentes e o inventario unico; sem novo dispatcher.

CASA_KYLIN_CLI=PASS | CASA_MCP_HTTP_HEALTH=PASS | KYLIN_MCP_CLIENT_CONFIGURED=NO | KYLIN_GATEWAY_READY=NOT_PROVEN | MCP_AUTH_E2E=NOT_PROVEN | FIXED_POINT=PENDING

<!-- /KYLINBOT_NATIVE_MCP_VM_CONTRAPROOF_20261112 -->

---

<!-- KYLINBOT_NATIVE_GATEWAY_UNIX_PROOF_20261112 -->
## 11. T3 — Contraprova corrigida do Gateway KylinBot na Casa (2026-11-12)

- **Causa exata da falsa suspeita de falha TCP:** o proprio KylinBot informou Gateway TCP disabled — Unix socket only. O contrato atual usa ~/.kylinbot/gateway.sock, nao a porta 42617, apesar de o comando aceitar --port.
- **Prova funcional real:** iniciar o gateway nativo temporariamente em loopback e enviar GET /health sobre AF_UNIX retornou HTTP/1.1 200 OK. Socket existe e tem permissao 0600.
- **Preservacao:** o processo temporario foi encerrado e recolhido; antes do teste nenhum gateway respondia naquele socket. Nenhum daemon KylinBot permanente foi instalado; nenhum codigo de pareamento foi lido ou exposto.
- **Contraprova:** o teste anterior que esperava listener TCP era inadequado para esta configuracao; manter seu registro como historico, mas nao interpretar falta de porta como falha de Gateway.
- **Seguranca:** manter bind isolado no socket Unix; nao habilitar allow_public_bind, nao abrir 42617 e nao duplicar Gateway ou MCP para satisfazer sondas TCP.
- **NEXT_CURSOR:** localizar consumer ja existente da CentralDark capaz de usar HTTP sobre socket Unix (ou adaptador existente, se houver); testar autorizacao com escopo adequado e consentido para o MCP em /api/mcp sem extrair token administrativo de processo; medir fluxo bidirecional real antes de habilitar mcp.enabled e antes de instalar servico persistente.

GATEWAY_NATIVE_UNIX_HEALTH=PASS | GATEWAY_UNIX_SOCKET_MODE=0600 | GATEWAY_TCP=DISABLED_BY_CONFIG | GATEWAY_PROCESS_AFTER_TEST=STOPPED | MCP_CLIENT_CONFIGURED=NO | FIXED_POINT=PENDING

<!-- /KYLINBOT_NATIVE_GATEWAY_UNIX_PROOF_20261112 -->

---

<!-- CENTRALDARK_VPS_VMWARE_IDENTITY_RASTRO_PR1900_20261112 -->
## 12. T4 — VPS operacional VMware, identidade e !RASTRO / PR #1900 (2026-11-12)

**Intencao expressa do CHEFE:** a VMware openKylin e a VPS operacional da CentralDark. Usar `ROLE=VPS` para esta maquina, preservando `HOST_ID`, `KERNEL`, `RUNNER_NAME`, origem e timestamp para evitar mistura com instalacoes distintas, inclusive Hostinger. `SAME_ROLE != SAME_HOST` e `SOURCE != RUNTIME`.

### Contraprova comparativa: parecer fornecido vs leitura SSH da VPS/VMware

| Indicador | Parecer consultivo fornecido pelo CHEFE | VPS/VMware medida via SSH |
|---|---|---|
| Host | `CENTRALDARK-OS` | `CentralDark-OS` |
| OS | openKylin 3.0 | openKylin 3.0 |
| Kernel | `7.0.0-2-generic` | `7.0.0-3-generic` |
| Load 1/5/15 | `10.06 / 10.49 / 10.56` | `0.02 / 0.03 / 0.03` |
| Runner | `centraldark-vps-1` | `centraldark-vm-1`, servico systemd ativo |
| Triton readiness/live | `200 / 200` | `200 / 200` |
| MCP health | `200` | `200` |
| Kylin Bridge health | `200` | `200` |
| `darkai` | ABSENT | ABSENT |
| `kylinbot` sem hifen | ABSENT | ABSENT |
| `kylin-bot` com hifen | Nao medido no parecer | `/usr/bin/kylin-bot`, pacote `0.7.5-ok1.9` |
| Hermes | active no parecer | `hermes` nao encontrado no PATH; processos pesquisados nao confirmaram Hermes na VM |
| Modelo `Llama-3.2-3B-Instruct-Q4_K_M` | Declarado no parecer | inferencia nao testada; catalogo Triton consultado mostrou modelos ASR e embeddings; disponibilidade deste modelo permanece UNKNOWN |

**Causa raiz a investigar no resolvedor existente:** o sensor usa `kylinbot` sem hifen, mas o binario instalado e `kylin-bot`; o papel VPS e o hostname sao confundidos com a identidade de host; o runner e kernel divergem; `TRITON_READY=200` nao prova modelo especifico carregado; `HERMES_ACTIVE` precisa de PID, unidade ou resposta autenticada no mesmo host. O parecer `NEEDS_HUMAN`/`Fonte:none` nao supera os gates deterministicos.

### !RASTRO / delegacao PR #1900

- PR #1900 aberto, branch `feat/casa-hermes-pid-catalog-20261021`: owners `scripts/casa/discover-operational-channels.ps1`, `apps/modulos/mcp/src/tools/core/mcp-admin.js`, `mcp-diagnostics.js`, `tests/mcp-catalog-scope.test.mjs`, `skills/centraldark-delegacao/SKILL.md`.
- Contrato da receita no PR: `HOST + PID + SESSION + AUTH + TASK_ID + ACK`; `PID != transport != auth`, `PORT_OPEN != SSH_AUTH`, `ENQUEUED != ACKED`, `SOURCE != RUNTIME`.
- O diff do PR nao contem o literal `!RASTRO`; **nao declarar implementacao do comando**, apenas o contrato de rastreabilidade encontrado. Descobrir o owner real do comando antes de vincular.
- O diff original do PR continha marcadores literais de conflito `<<<<<<< HEAD`, `=======`, `>>>>>>> origin/main` em `mcp-admin.js`; **marcadores removidos no commit dbb4dc6847**; gates de integracao e readback ainda obrigatorios.
- A descoberta do Gateway nativo via socket Unix e o inventario MCP (secoes T2/T3) foram sincronizados da main para esta branch no mesmo owner documental; nao criar CLI, gateway, script ou writer paralelo.

**NEXT_CURSOR:** localizar o owner do resolvedor de identidade VPS e do literal `!RASTRO`; corrigir apenas esses owners com dry-run, escritor unico e teste; reconciliar conflito do PR #1900; comparar `HOST_ID/KERNEL/RUNNER/PID` em runtime; confirmar modelo local por inferencia; validar gates no HEAD exato; somente entao considerar merge/deploy.

`VPS_VMWARE_ROLE=CHEFE_CONFIRMED` · `SERVICE_HEALTH=MEASURED` · `HOST_IDENTITY_MATCH=NOT_PROVEN` · `RASTRO_LITERAL_IN_PR=NOT_FOUND` · `PR1900_CONFLICT=FOUND` · `FIXED_POINT=PENDING`

<!-- /CENTRALDARK_VPS_VMWARE_IDENTITY_RASTRO_PR1900_20261112 -->
