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

