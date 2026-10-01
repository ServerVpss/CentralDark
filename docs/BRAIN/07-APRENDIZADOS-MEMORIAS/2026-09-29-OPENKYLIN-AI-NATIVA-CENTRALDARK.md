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

A observação humana de que “até abas/janelas/pastas parecem ter IA por dentro” é compatível com um desktop em que muitos componentes consomem o mesmo substrate inteligente. Não há suporte para promover a interpretação literal “cada aba/pasta/lixeira sobe um LLM próprio”.

```text
DESKTOP_AI_EVERYWHERE_AS_SHARED_CAPABILITY_FABRIC=SUPPORTED
PER_WINDOW_DISTINCT_MODEL_PROCESS=UNKNOWN_NOT_PROVEN
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
