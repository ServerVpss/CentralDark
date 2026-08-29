---
title: "CLAUDE.md"
date: 2026-08-24
updated: 2026-08-29T17:10:00-03:00
status: DERIVED_VIEW
tags: [boot, contrato, claude, ponte]
category: "A-Agentes"
sensitivity: INTERNAL
source: AGENTS.md + LEIA-ME-IA.md
source_class: INTERNAL
source_rule: "CANONICO -> ARTEFATO; artefato nao inventa canonico"
owner: AGENTS.md
consumer: Claude Code / engines Claude
---

# CLAUDE.md — ponte para o contrato canônico

Este arquivo **não** é segundo cérebro nem contrato paralelo.

```text
CANONICAL_BOOT = LEIA-ME-IA.md
CANONICAL_AGENTS = AGENTS.md
TRIGGER_FABRIC = docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/
ARTIFACT_PROPERTIES = docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ARTIFACT-PROPERTIES.yml
```

Antes de agir:

1. Ler `LEIA-ME-IA.md`
2. Ler `AGENTS.md`
3. Medir branch/HEAD/PR/writer/tools
4. Emitir `CENTRALDARK_AI_BOOT` uma vez
5. Todo material entra no moinho canônico; não criar memória/governança paralela
6. Artefato derivado sem propriedades obrigatórias **não** é `FLASH_READY`

```text
ENGINE=CLAUDE
ENGINE_IS_OWNER=false
COPY_BRAIN=false
SEGREDO/CHEFE > SOL > PIVETE/HERMES
```

## Claude ↔ subagentes, sem inversão de autoridade

```text
SUBAGENT_ROOT=.claude/agents
CLAUDE_DISCOVERS_SUBAGENTS=true
SUBAGENTS_INHERIT_CLAUDE_BRIDGE=true
SUBAGENTS_INHERIT_CANONICAL_CORE=true
SUBAGENTS_ARE_CAPABILITY_ADAPTERS=true
SUBAGENT_IS_AUTHORITY=false
CAPABILITY_SELECTION_OWNER=.agents/skills/capability-contract-router/SKILL.md
DELEGATION_OWNER=scripts/agent-call.mjs
PROVIDER_LOCAL_MEMORY_ROLE=WORKING_CACHE_ONLY
PROVIDER_LOCAL_MEMORY_IS_CANONICAL=false
```

O “vice-versa” é descoberta de capacidade e handoff: Claude pode localizar subagentes especializados; todo subagente Claude volta por esta ponte ao core. Nem Claude nem subagente redefine intenção, autoridade, owner, Writer, memória canônica ou Judge.

## Assinatura de adapter fino

```text
CANONICAL_AGENT_CORE=LEIA-ME-IA.md
ONE_SOL=true
ONE_CORE=true
LAZY_LOAD_BY_DEMAND=true
ENGINE_IS_REPLACEABLE=true
TOOLS_REQUIRE_RUNTIME_MEASUREMENT=true
DO_NOT_DUPLICATE_GOVERNANCE=true
DO_NOT_DEFINE_IDENTITY=true
DO_NOT_DEFINE_AUTHORITY=true
DO_NOT_DEFINE_MERGE_POLICY=true
DO_NOT_DEFINE_MEMORY=true
DO_NOT_CREATE_PARALLEL_AGENT=true
FUTURE_RULES_CONSUMED_FROM_CORE=true
```
