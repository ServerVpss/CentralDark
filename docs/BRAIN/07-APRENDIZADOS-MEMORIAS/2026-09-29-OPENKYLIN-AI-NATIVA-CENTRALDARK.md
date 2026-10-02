---
title: "openKylin AI nativa ↔ CentralDark"
date: 2026-09-29
status: PROVED_SCOPED_ARCHITECTURE
tags: [openkylin, centraldark-os, ai-runtime, mcp, interligados, reuse-before-create]
owner: "🔗 !># INTERLIGADOS"
---

# openKylin AI nativa ↔ CentralDark

## Estado medido

```text
OS=openKylin 3.0 (huanghe)
KERNEL=7.0.0-2-generic

AI_PACKAGES_PRESENT=PASS
AI_RUNTIME_PROCESSES_PRESENT=PASS
MCP_LIBRARIES_PRESENT=PASS
```

Capacidades encontradas incluem KylinBot, Kylin AI Assistant, AI Runtime/Subsystem, bibliotecas MCP, vector engine, ASR, TTS, OCR, embeddings e plugins/modelos de provedores.

Processos vivos observados incluíram `kytensor`, `kylin-assistant-systemdaemon.py` e backends de inferência para voz.

## Integração canônica

```text
CENTRALDARK
→ intenção / memória / regras / prova / coordenação / Reality Judge
→ INTERLIGADOS
→ medir capacidades nativas openKylin
→ reutilizar runtime / MCP / assistant / models quando aplicável
→ ação
→ readback
```

```text
REUSE_NATIVE_AI_BEFORE_CREATE=true
NO_SECOND_OS_AI_STACK=true
MODEL_OR_AGENT_IS_CAPABILITY_NOT_AUTHORITY=true
CLI_REQUIRED_FOR_ACCESS=false
CLI_OPTIONAL_FOR_HUMAN_UX=true
```

## Fronteira

```text
INSTALLED != EXPOSED_TO_CURRENT_SESSION
PACKAGE_PRESENT != TOOL_CALL_PASS
DOCUMENTED != EXECUTED
CLOUD_MODEL_PACKAGE != CLOUD_MODEL_AUTHENTICATED
UNKNOWN != PASS
```

Próximo cursor: inventariar as tools/capabilities MCP realmente expostas pelo openKylin nesta instalação e ligar somente o delta útil ao INTERLIGADOS.

## Exposição viva para Hermes/Casa

```text
kytensor native
  127.0.0.1:8000 HTTP
  127.0.0.1:8001 gRPC
  127.0.0.1:8002 metrics

systemd socket proxy
  100.67.163.91:8000 → 127.0.0.1:8000
  100.67.163.91:8001 → 127.0.0.1:8001
```

Readback provado:

```text
LOCAL_HTTP_READY=200
TAILSCALE_HTTP_READY=200
TAILSCALE_GRPC_TCP=PASS
REPOSITORY_ENTRIES=30
REPOSITORY_READY=22
SOCKETS_ENABLED=true
SOCKETS_ACTIVE=true
```

A porta de métricas 8002 permanece somente local. A exposição é pela malha Tailscale, não por Internet pública.

O repository index atual contém principalmente ASR/TTS/embeddings/visão e serviços auxiliares. Não há prova de LLM/chat DeepSeek ou Qwen carregado no Triton desta rodada.

```text
TAILNET_EXPOSURE != PUBLIC_EXPOSURE
CLOUD_MODEL_PACKAGE != TRITON_MODEL_READY
LOCALHOST_SURVIVES=true
FALLBACK_SURVIVES=true
```



## Delta 2026-10-01 — pesquisa upstream chinesa e leitura correta do desktop inteligente

A documentação oficial do openKylin 3.0 foi cruzada com o runtime já medido desta instalação. O upstream descreve o sistema como uma base nativa para agentes: modelos, memória, ferramentas, permissões do sistema e capacidades do desktop pertencem a uma arquitetura compartilhada; KylinBot e outros agentes podem usar MCP para chamar capacidades do desktop diretamente.

O código upstream do instalador do AI subsystem confirma que o conjunto é composto por peças compartilhadas — `kylin-ai-runtime`, document-QA/service, vector engine, `libkylin-coreai-embedding`, speech, vision e GenAI/NLP. O runtime também possui suporte a múltiplas conexões NLP separadas por `sessionId`.

Declaração do CHEFE: abas, janelas, pastas e outras superfícies parecem acionar inteligência integrada do sistema, e ele percebe atividade da GPU ao interagir com essas superfícies. A sessão não deve converter essa fala em “cada aba/pasta/lixeira sobe um LLM próprio”; essa formulação foi uma extrapolação do executor. O que o upstream sustenta é um substrate inteligente compartilhado e profundamente integrado. O vínculo causal exato de cada evento de UI com processos/modelos/GPU permanece UNKNOWN até instrumentação local.

```text
DESKTOP_AI_EVERYWHERE_AS_SHARED_CAPABILITY_FABRIC=SUPPORTED
ASSISTANT_REFRAME_PER_WINDOW_MODEL=RETRACTED
UI_EVENT_TO_AI_PROCESS_CAUSAL_MAPPING=UNKNOWN
SHARED_RUNTIME_CAN_SERVE_MULTIPLE_SESSIONS=true
MCP_DESKTOP_IS_SYSTEM_CAPABILITY_SURFACE=true
CENTRALDARK_SHOULD_BIND_NOT_REIMPLEMENT=true
```

Proveniência upstream:
- openKylin 3.0 release: https://www.openkylin.top/news/4098-cn.html
- openKylin 3.0 Beta / desktop MCP: https://www.openkylin.top/news/4083-cn.html
- AgentOS update: https://www.openkylin.top/news/4122-cn.html
- AI subsystem package manager: https://gitee.com/openkylin/kylin-ai-subsystem-plugin/blob/upstream/subsystempackagemanager.h
- AI runtime multi-session: https://gitee.com/openkylin/kylin-ai-runtime/pulls/31

## Delta 2026-10-01 — inventário local + contraprova do runtime vivo

Medição CURRENT feita diretamente na máquina `CENTRALDARK-OS` por Remote Desktop Commander, seguida de contraprova do inventário local executado pelo Codex. Este delta atualiza somente claims que tiveram evidência nova; não promove UNKNOWN.

```text
HOST=CENTRALDARK-OS
USER=CENTRAKDARK-OS
OS=openKylin 3.0 (huanghe)
SESSION=Wayland/UKUI
VMWARE_GUEST=true
REMOTE_DESKTOP_COMMANDER=ONLINE_AND_COMMAND_EXECUTION_PROVED
```

### KylinBot — estado real

```text
KYLINBOT_VERSION=0.7.5
KYLINBOT_DAEMON_PID=3019
KYLINBOT_MEMORY_BACKEND=sqlite
KYLINBOT_MEMORY_HEALTH=healthy
KYLINBOT_GATEWAY_TCP_42617=NOT_LISTENING
KYLINBOT_GATEWAY_UNIX_SOCKET=~/.kylinbot/gateway.sock
KYLINBOT_GATEWAY_UNIX_HEALTH=HTTP_200
KYLINBOT_RUNTIME_STATUS=ok
```

O `/health` via Unix socket respondeu `200 OK` e informou `daemon`, `gateway`, `heartbeat`, `scheduler`, `cron`, `channels` e `mqtt` com status `ok`. Portanto, `TCP_42617_DOWN != GATEWAY_DOWN` nesta instalação.

Existe drift de observabilidade: `kylin-bot status` reportou serviço parado enquanto o processo real `/usr/bin/kylin-bot daemon` estava ativo e o health via Unix socket estava verde.

```text
SERVICE_STATUS_STOPPED != DAEMON_DOWN
CONFIGURED_TCP_ENDPOINT != ACTIVE_TRANSPORT
UNIX_SOCKET_IS_CURRENT_LIVE_GATEWAY=true
```

Provider/model do chat KylinBot permanecem incompletos: `status` reportou `openrouter`, mas `doctor/models status` mostraram ausência de `default_provider/default_model` configurados para probe. O teste de agente falhou por ausência de `OPENROUTER_API_KEY`; portanto provider efetivo autenticado e modelo de chat utilizável continuam não provados.

```text
KYLINBOT_REPORTED_PROVIDER=openrouter
KYLINBOT_AUTHENTICATED_PROVIDER=UNKNOWN
KYLINBOT_ACTIVE_CHAT_MODEL=UNKNOWN
UNKNOWN_IS_NOT_PASS=true
```

### Kylin AI / kytensor — saúde e protocolos

Processos observados no runtime real:

```text
kytensor PID=754
kylin-ai-document-qa-service PID=1951
kylin-ai-knowledge-base-service PID=1956
kylin-ai-vector-engine PID=1980
kylin-ai-runtime PID=3015
```

Health discriminante:

```text
127.0.0.1:8000/v2/health/live  -> HTTP 200
127.0.0.1:8000/v2/health/ready -> HTTP 200
127.0.0.1:8001                 -> gRPC listener/protocol present
127.0.0.1:8002/metrics         -> HTTP 200 Prometheus metrics
TRITON_LIVE=PASS
TRITON_READY=PASS
```

A porta `8001` não deve ser julgada por `curl` HTTP comum; o erro de HTTP/0.9 observado foi compatível com probe usando protocolo errado sobre listener gRPC. A porta `8002` expõe métricas Triton e listou modelos registrados como ASR streaming/non-streaming, `tts_melo`, OCR/embeddings/ensembles e serviços auxiliares.

```text
PORT_8000_ROLE=TRITON_HTTP
PORT_8001_ROLE=TRITON_GRPC
PORT_8002_ROLE=TRITON_METRICS
PROTOCOL_MISMATCH_IS_NOT_SERVICE_FAILURE=true
```

### Modelos e fronteira

O inventário encontrou repositório ONNX/Triton nativo em `/usr/share/kylin-ai/model-repository`, incluindo ASR, TTS, OCR, embeddings, segmentação/matting e SAM. Processos `triton_python_backend_stub` provaram carregamento de partes do pipeline. Não foi encontrado LLM local clássico `.gguf`/`.safetensors` nem processo Ollama/llama.cpp/vLLM/LocalAI/LM Studio.

```text
NATIVE_ONNX_TRITON_MODELS=PROVED
LOCAL_ASR_TTS_OCR_EMBEDDING_VISION=PROVED
LOCAL_CLASSIC_LLM=NOT_PROVED
MODEL_FILE_PRESENT != MODEL_LOADED
MODEL_REGISTERED != CHAT_LLM
```

### Ferramentas/agentes coexistentes

Instalados: Codex CLI, Claude Code, Gemini CLI e KylinBot. Codex app-server e Remote Desktop Commander estavam ativos. Isso é coexistência de capacidades/superfícies, não criação de cérebros paralelos.

```text
CENTRALDARK_ONE_SYSTEM_ONLY=true
LOCAL_AI_RUNTIME=Kylin_AI+KylinBot
CODING_AGENT_SURFACES=Codex+Claude+Gemini
REMOTE_CONTROL_SURFACE=Desktop_Commander
MODEL_OR_CLI_IS_CAPABILITY_NOT_AUTHORITY=true
```

### Fixed point desta rodada

```text
PROVED:
- KylinBot daemon vivo via Unix socket health 200
- Kylin AI / Triton live e ready em 8000
- gRPC em 8001
- métricas em 8002
- runtime ONNX local ativo para ASR/TTS/OCR/embeddings/visão
- Remote Desktop Commander executando comandos na CENTRALDARK-OS

UNKNOWN:
- provider autenticado efetivo do KylinBot
- modelo de chat ativo do KylinBot
- LLM local de chat carregado

NEXT_CURSOR:
- consultar repository index Triton por método correto e registrar lista READY + versões; depois mapear somente capabilities úteis ao owner INTERLIGADOS, sem criar stack paralela.
```



## Delta 2026-10-01 — acesso direto RDC + gateway real + inferência Triton real

Medição feita diretamente no guest `CENTRALDARK-OS` via Remote Desktop Commander, sem depender de SSH da Casa.

```text
REMOTE_DESKTOP_COMMANDER_DIRECT_GUEST_ACCESS=PASS
HOST=CENTRALDARK-OS
USER=CENTRAKDARK-OS
OS=openKylin 3.0 (huanghe)
KERNEL=7.0.0-2-generic
VMWARE_GUEST=true
KYLINBOT_VERSION=0.7.5
```

### KylinBot gateway — transporte e pairing CURRENT

O schema/CLI instalado provou:

```text
gateway.host=127.0.0.1
gateway.port=42617
gateway.listen-tcp=false
gateway.unix-socket=/home/CENTRAKDARK-OS/.kylinbot/gateway.sock
gateway.require-pairing=true
gateway.paired-tokens=<unset>
```

O socket Unix existe e `GET /health` respondeu HTTP 200 com `paired=false`, `require_pairing=true` e componente `gateway.status=ok`.

O CLI expõe `gateway start`, `gateway restart` e `gateway get-paircode`. Portanto:

```text
TCP_42617_NOT_LISTENING=EXPECTED_WITH_LISTEN_TCP_FALSE
UNIX_GATEWAY_HEALTH=PASS
PAIRING_REQUIRED=true
PAIRED_CLIENT_TOKEN_PRESENT=false
GATEWAY_PAIRCODE_CAPABILITY=PROVED_BY_CLI
```

Autenticação de provider é outro cone: `auth` suporta OAuth para OpenAI Codex/Gemini e token de assinatura Anthropic, mas nesta medição `providers.fallback`, `providers.model-routes` e `providers.embedding-routes` estão unset; `models status` retorna `No configured providers to probe`.

```text
GATEWAY_PAIRING_CREDENTIAL != MODEL_PROVIDER_CREDENTIAL
KYLINBOT_CONFIGURED_PROVIDER=NONE_AT_MEASUREMENT
KYLINBOT_CHAT_MODEL=UNKNOWN
```

### Kylin AI/Triton — repository CURRENT e chamada real

Health local permaneceu verde:

```text
127.0.0.1:8000/v2/health/live=HTTP_200
127.0.0.1:8000/v2/health/ready=HTTP_200
127.0.0.1:8002/metrics=HTTP_200
```

O repository index CURRENT retornou:

```text
REPOSITORY_ENTRIES=30
REPOSITORY_READY=17
```

READY observados:

```text
asr_cif-search_streaming
asr_decoder_streaming
asr_encoder_nonstreaming
asr_encoder_streaming
asr_feature-extractor_nonstreaming
asr_feature-extractor_streaming
asr_fsmn-vad_streaming
asr_lfr-cmvn-pe_streaming
asr_scoring_nonstreaming
ensemble-asr_fsmn-vad_streaming
ensemble-asr_paraformer_nonstreaming
ensemble-asr_paraformer_streaming
ensemble-punc_ct-transformer_nonstreaming
ensemble-tts_melo
model_bank
punc_ct-transformer_nonstreaming
tts_melo
```

A contagem histórica de 22 READY fica como história; o CURRENT medido nesta rodada é 17.

Foi executada inferência real no próprio guest usando `ensemble-punc_ct-transformer_nonstreaming`:

```text
MODEL_METADATA_HTTP=200
INFER_HTTP=200
MODEL_VERSION=1
INPUT="你好今天系统运行正常吗"
OUTPUT="你好，今天系统运行正常吗？"
LOCAL_TWIN_NATIVE_CAPABILITY_CALL=PASS
```

Isso fecha a primeira chamada nativa real do twin pelo protocolo Triton. Não prova LLM/chat local.

### Tailscale CURRENT do guest

`tailscale status` retornou `Logged out` nesta medição. Logo o endereço histórico `100.67.163.91` e os listeners/proxies associados não podem ser usados como prova de transporte CURRENT até novo login/readback.

```text
GUEST_TAILSCALE_CURRENT=LOGGED_OUT
HISTORICAL_TAILSCALE_IP_IS_NOT_CURRENT_ROUTE=true
LOCALHOST_NATIVE_RUNTIME_SURVIVES=true
```

### Fixed point

```text
REMOTE_DESKTOP_COMMANDER_DIRECT_GUEST_ACCESS=PASS
UNIX_GATEWAY_HEALTH=PASS
TRITON_LIVE_READY=PASS
TRITON_REPOSITORY_CURRENT=30_TOTAL_17_READY
NATIVE_PUNCTUATION_INFERENCE=PASS
KYLINBOT_CHAT_PROVIDER=UNKNOWN
LOCAL_CHAT_LLM=NOT_PROVEN
GUEST_TAILSCALE_ROUTE=CURRENTLY_UNAVAILABLE_LOGGED_OUT
```

NEXT_CURSOR: bindar Hermes/AionUi somente a capability já provada ou provar a próxima capability nativa necessária; para KylinBot REST, gerar pairing pelo fluxo do próprio gateway e manter credencial de gateway separada de credencial de provider.

## Delta 2026-10-01 — Windows clients, pairing Bearer e Token Center

Delta material novo medido depois do registro anterior. Não repete o inventário Triton/gateway já cristalizado.

### 1. KylinBot companion + pairing de dispositivo

O CLI instalado na `CENTRALDARK-OS` provou que existe uma companion desktop app ligada ao mesmo gateway do CLI:

```text
kylin-bot desktop
kylin-bot desktop --install
COMPANION_CONNECTS_TO_SAME_GATEWAY=true
COMPANION_CAPABILITIES=dashboard+status_monitoring+device_pairing
```

O gateway expõe pairing explícito:

```text
kylin-bot gateway get-paircode
kylin-bot gateway get-paircode --new
PAIRCODE_IS_ONE_TIME_DEVICE_BOOTSTRAP_CREDENTIAL=true
```

Read-only probes contra o Unix socket confirmaram o contrato de autenticação sem revelar credenciais:

```text
GET /api/status without auth -> HTTP 401
response -> pair first via POST /pair, then send Authorization: Bearer <token>
POST /pair with invalid code -> HTTP 403 Invalid pairing code
POST /api/pair with invalid code -> HTTP 400 Invalid or expired pairing code
PAIRING_RESULT_IS_BEARER_AUTH_CONTRACT=PROVED
```

O binário também contém rotas de dispositivos e rotação de token; isso confirma que paircode e token persistente são camadas diferentes. Valor de paircode/token não foi lido nem registrado.

```text
PAIRCODE != BEARER_DEVICE_TOKEN
BEARER_DEVICE_TOKEN != MODEL_PROVIDER_API_KEY
SECRET_VALUES_NOT_RECORDED=true
```

### 2. Transporte para Windows

O help do gateway provou que o listener TCP pode ser iniciado com host/porta explícitos. Bind público em `0.0.0.0` exige `gateway.allow_public_bind=true` ou túnel; portanto a rota preferida para Casa/Windows continua túnel/rede privada, não exposição pública.

```text
GATEWAY_TCP_DEFAULT_PORT=42617
CURRENT_GATEWAY_LISTEN_TCP=false
PUBLIC_BIND_NOT_REQUIRED=true
PREFERRED_REMOTE_TRANSPORT=SSH_TUNNEL_OR_PRIVATE_TAILNET
```

Contraprova CURRENT feita no Windows `SEGREDO`:

```text
100.67.163.91:8000 -> timeout
Windows tailscale ping 100.67.163.91 -> no matching peer
GUEST_TAILSCALE_CURRENT_ROUTE=UNAVAILABLE
```

Isso converge com a medição anterior do guest em `Logged out`. Logo dois clientes Windows não devem depender do IP histórico até reautenticar/remedir a malha.

Para os endpoints nativos Triton `8000/8001/8002`, os probes locais usados nesta rodada não exigiram token de provider. O problema para Windows é transporte/reachability; autenticação de provider não é requisito para os endpoints locais já provados.

```text
TRITON_LOCAL_HTTP_HEALTH_WITHOUT_PROVIDER_TOKEN=PASS
TRITON_LOCAL_REPOSITORY_INDEX_WITHOUT_PROVIDER_TOKEN=PASS
LOCAL_INFERENCE_TRANSPORT != CLOUD_PROVIDER_AUTH
```

### 3. openKylin Token Center — outra camada

Pesquisa no upstream oficial openKylin 3.0 identificou uma terceira credencial, separada das duas acima: a API Key do Token Center. O fluxo oficial é abrir o cliente Token Center, solicitar/receber uma API Key e usar modelos por API OpenAI-compatible.

```text
OPENKYLIN_TOKEN_CENTER_KEY=CLOUD_MODEL_PROVIDER_KEY
OPENKYLIN_TOKEN_CENTER_ENDPOINT=https://llm-gateway.openkylin.top/v1/chat/completions
OPENAI_API_COMPATIBLE=true
DOCUMENTED_CLIENTS_INCLUDE=KylinBot+Codex+ClaudeCode+OpenClaw+WorkBuddy
TOKEN_CENTER_KEY != KYLINBOT_GATEWAY_PAIRCODE
TOKEN_CENTER_KEY != KYLINBOT_DEVICE_BEARER
TOKEN_CENTER_KEY != TRITON_LOCAL_INFERENCE_TOKEN
```

Fonte upstream oficial:
- https://www.openkylin.top/news/4131-cn.html
- https://www.openkylin.top/news/4098-cn.html

### 4. Regra de uso para dois Windows

```text
WINDOWS_WANTS_LOCAL_KYLIN_AI_TRITON:
  TOKEN_REQUIRED_FOR_PROBED_LOCAL_ENDPOINTS=false
  REQUIREMENT=reachable_private_transport_to_guest

WINDOWS_WANTS_KYLINBOT_AGENT_GATEWAY:
  STEP_1=reachable_gateway_transport
  STEP_2=one_time_paircode
  STEP_3=exchange_via_POST_/pair
  STEP_4=use_returned_Bearer_token_for_authenticated_gateway_calls

WINDOWS_WANTS_CLOUD_CHAT_MODEL_VIA_OPENKYLIN:
  REQUIREMENT=Token_Center_API_Key
  ENDPOINT=https://llm-gateway.openkylin.top/v1/chat/completions
```

### Fixed point

```text
TOKEN_LAYERS_SEPARATED=PASS
KYLINBOT_PAIRING_AUTH_CONTRACT=PASS
WINDOWS_CURRENT_TAILSCALE_PATH=DOWN_OR_STALE
LOCAL_TRITON_SURVIVES=PASS
OPENKYLIN_TOKEN_CENTER_ROUTE=DOCUMENTED_UPSTREAM
WINDOWS_COMPANION_BINARY_AVAILABILITY=NOT_YET_PROVEN_BY_DOWNLOAD_READBACK
```

NEXT_CURSOR: provar uma rota privada alcançável a partir dos dois Windows; depois parear cada cliente KylinBot sem transportar credencial por GitHub/log e, separadamente, decidir se o chat usará Token Center/cloud provider ou capability local já provada.

