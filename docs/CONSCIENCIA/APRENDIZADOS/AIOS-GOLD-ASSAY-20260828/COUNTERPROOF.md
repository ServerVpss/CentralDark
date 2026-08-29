---
title: "COUNTERPROOF"
date: 2026-08-28
tags: ["consciencia"]
updated: 2026-08-28
---

# Counterproof — AIOS/AIOX

Objetivo: impedir que quantidade de arquivos, nomes sofisticados ou documentação virem prova automática de qualidade/aderência.

## CP1 — arquivo encontrado não é capacidade provada

```text
FOUND != READ
READ != UNDERSTOOD
UNDERSTOOD != WORKING
WORKING_UPSTREAM != FIT_CENTRALDARK
FIT_CANDIDATE != ABSORBED
```

## CP2 — validator declarado, implementação ausente

O `package.json` raiz observado declara:

`validate:structure = node .aios-core/infrastructure/scripts/source-tree-guardian/index.js`

A busca no ZIP medido não encontrou esse caminho.

Veredito: `DECLARED != PRESENT`.

## CP3 — bug material em test-quality-assessment

Arquivo observado:

`aiox-core/.aios-core/infrastructure/scripts/test-quality-assessment.js`

SHA-256:

`300699a7a5003ef1f18b4e865f761a8e76d0b82e001f0ba17317ef05d41c79db`

Foram encontrados métodos como `analyzeTestOrganization(_content)` que internamente usam `content.match(...)`, além do mesmo padrão em outras funções.

Veredito: esta implementação não pode ser tratada como quality gate confiável sem reprodução/correção independente.

## CP4 — semantic merge não ganha Writer

A fonte contém `semantic-merge-engine.js` com coordenação de conflitos e resolução por IA.

CentralDark mantém:

```text
PARALLELIZE_PERCEPTION
SERIALIZE_MUTATION
ONE_WRITER_PER_SCOPE
```

Logo, no máximo a matéria pode inspirar detecção/classificação read-only. Nenhum mecanismo externo recebe autoridade para resolver merge automaticamente.

## CP5 — licença

`aiox-core/LICENSE` contém Commons Clause License Condition v1.0 seguida de texto MIT, enquanto package metadata declara MIT.

Esta rodada adota postura conservadora:

```text
RAW_CODE_COPIED=false
RAW_PACKAGE_VENDORED=false
BEHAVIORAL_DISTILLATION_ONLY=true
PROVENANCE_PRESERVED=true
```

## CP6 — sem conexão de terceiros

Nenhum CLI AIOS, MCP AIOS, provider AIOS, telemetria, memória ou agente da fonte passa a fazer parte do runtime CentralDark por este PR.

```text
NETWORK_INTEGRATION=NONE
THIRD_PARTY_RUNTIME_DEPENDENCY=NONE
EXTERNAL_GOVERNANCE=NONE
```

## CP7 — sem Red Team importado

Qualquer persona, squad, agente ou fluxo ofensivo/Red Team existente no pacote está fora do escopo e não é transplantado. Segurança da Casa permanece com seus owners e gates canônicos.

## CP8 — Design System não vira segundo Design System

A CentralDark já possui `visual-design-method` e design canônico. Tokens/DTCG/classificação/acessibilidade só podem entrar como extensão comprovada do mesmo owner.

## CP9 — sessão/memória não vira segundo cérebro

Session digest só é elegível se demonstrar delta sobre os owners de continuidade/memory-linker/session-intelligence-harvester existentes.

## CP10 — inventário não é impacto

House Inventory atual e um grafo de impacto podem se complementar, mas a diferença deve ser provada por fixture real. Novo nome de engine não é GAP.

## Stop conditions

Hermes deve bloquear qualquer proposta que resulte em:

- segundo MCP;
- segundo orquestrador;
- segunda memória/cérebro;
- segundo Design System;
- novo governo de agentes;
- runtime conectado ao AIOS;
- cópia bruta de código antes de decisão de licença;
- Writer automático de semantic merge;
- Red Team importado;
- PASS sem teste no owner/consumer correspondente.
