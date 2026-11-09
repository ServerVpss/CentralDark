---
title: Gaveta durável — cristalização exige recibo
date: 2026-08-16
tags:
  - aprendizado
  - memoria
  - obsidian
  - cristalizacao
  - prova
  - telemetria
  - linguagem-da-casa
  - reconciliacao
  - github
  - ACORDAR/GOAL
status: CANDIDATO_ATÉ_MERGE
authority: REFERENCIA_DE_MEMORIA; regras continuam nos owners canônicos
originator: SEGREDO/CHEFE
writer: SOL
centraldark_note_schema: "brain07.v1"
centraldark_category: "02-SESSOES"
centraldark_kind: "CRISTAL_DE_SESSAO"
centraldark_context_owner: "SEGREDO/CHEFE"
centraldark_intent_anchor: "Gaveta durável — cristalização exige recibo"
centraldark_agent_recall: "Recuperar a intencao, correcoes, limites e NEXT_CURSOR antes de continuar; sessao historica nao equivale ao estado atual."
centraldark_kaizen_policy: "docs/CONSCIENCIA/PROGRAMAS/KAIZEN-VIVO-INTENCAO-VIVA-20261008.md"
centraldark_kaizen_skill: ".agents/skills/kaizen-sistema-um/SKILL.md"
centraldark_kaizen_trigger: "MATERIAL_DELTA_WHEN_CONSUMED"
centraldark_kaizen_runtime: "UNKNOWN_UNTIL_CONSUMER_READBACK"
centraldark_metabolic_roles: ["yuji-identidade-e-continuidade","gojo-seis-olhos","goku-instinto-superior","kaizen-continuo"]
centraldark_metabolic_source: "apps/instinto-superior/src/components/central/MapaMetabolicoCristal.tsx"
centraldark_previous_blob_sha: "5d437f710f8f5e94e6dc9c6984b765600fcbf4ff"
centraldark_self_catalog: ".agents/skills/centraldark-operational-method/catalogo/META-RSI-40.md"
centraldark_self_primary: "Self-Documentation"
centraldark_self_related: ["Self-Memory","Self-Planning"]
centraldark_self_skill_refs: [".agents/skills/centraldark-operational-method/Skills/self-documentation/SKILL.md",".agents/skills/centraldark-operational-method/Skills/self-memory/SKILL.md",".agents/skills/centraldark-operational-method/Skills/self-planning/SKILL.md"]
centraldark_self_review: "APPLIED_OR_NOOP_JUSTIFIED_WHEN_RUNTIME_CONSUMES"
centraldark_self_activation: "RECALL_AND_REVIEW_ONLY_NOT_AUTOPATCH"
centraldark_self_runtime: "UNKNOWN_UNTIL_CONSUMER_READBACK"
---

# Gaveta durável — não malhar e perder o músculo

## Intenção humana

O SEGREDO/CHEFE apontou a regra prática:

> garimpar, aprender e trabalhar não adianta se o ouro reutilizável não for guardado numa memória durável recuperável pela próxima execução.

A metáfora da Casa é a **gaveta**.

## Achado medido

A arquitetura já prevê:

```text
CASA-VAULT/20-INBOX-HERMES
→ candidato
→ prova/teste
→ owner canônico
→ GitHub
→ recarga futura
```

Porém, no estado medido em 2026-08-16, os scripts físicos de sincronização/promoção do Obsidian estão fail-closed enquanto `RepoRoot` e `VaultRoot` locais não forem provados.

Portanto:

```text
OBSIDIAN_INTENDED=true
OBSIDIAN_WRITE_OBSERVED=false
OBSIDIAN_SYNC_STATUS=BLOCKED_LOCAL_PATHS_UNPROVEN
```

Não transformar intenção de gravar em prova de gravação.

## Aprendizado reutilizável

```text
PASS + CONTRAPROVA + DELTA_REUTILIZAVEL
→ CRISTALIZACAO_OBRIGATORIA
→ RECIBO_DE_PERSISTENCIA_DURAVEL_OBRIGATORIO
→ FIXED_POINT
```

Um booleano `crystallized=true` sozinho não basta. O recibo precisa identificar canal e alvo e confirmar que a persistência foi observada e é durável.

```text
persistence_receipt.channel
persistence_receipt.target
persistence_receipt.observed=true
persistence_receipt.durable=true
```

Sem recibo:

```text
SELF_ASSERTED_CRYSTALLIZATION != PROOF
FIXED_POINT=false
```

## Duas gavetas, uma Casa

```text
GITHUB_CANONICAL
= ouro sanitizado + reutilizável + provado + fonte durável da verdade

OBSIDIAN_INBOX
= memória/candidato local + material privado quando o canal físico estiver provado
```

Isso não cria segundo cérebro. O GitHub continua sendo fonte da verdade do projeto; o Obsidian continua sendo memória visual/local e canal de candidatos conforme o contrato já existente.

## Material externo minerado

Fonte recebida pelo SEGREDO/CHEFE:

- `OpenHands/OpenHands/AGENTS.md`

Essência útil observada:

- notas de repositório preservam contexto operacional para agentes futuros;
- ownership explícito reduz código/regra no lugar errado;
- informação de runtime explícita deve vencer tentativa de adivinhar serviços/endpoints.

A fonte é proveniência, não autoridade sobre a CentralDark.

## Implementação associada

PR: `#982`

Motor existente reutilizado:

- `scripts/lupa/sol-frequency-decision.mjs`
- `scripts/lupa/sol-frequency-decision.test.mjs`

Invariantes adicionados:

```text
CRYSTAL_REQUIRES_DURABLE_MEMORY_RECEIPT=true
SELF_ASSERTED_CRYSTALLIZATION_IS_NOT_PROOF=true
OBSIDIAN_WRITE_REQUIRES_PROVEN_LOCAL_CHANNEL=true
```

## Status deste registro

```text
GITHUB_BRANCH_PERSISTED=true
GITHUB_MAIN_CANONICAL=false_UNTIL_PR_982_MERGES
OBSIDIAN_PHYSICAL_SYNC=NOT_PROVEN
PRIVATE_RAW_MATERIAL_PUSHED_TO_GIT=false
```

Quando #982 entrar em `main`, este registro passa a fazer parte de `docs/BRAIN` e fica disponível para o fluxo de espelhamento do cofre quando o canal Obsidian for reativado com caminhos locais provados.
