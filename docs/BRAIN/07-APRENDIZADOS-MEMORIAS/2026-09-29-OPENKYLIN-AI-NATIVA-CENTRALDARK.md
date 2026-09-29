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
