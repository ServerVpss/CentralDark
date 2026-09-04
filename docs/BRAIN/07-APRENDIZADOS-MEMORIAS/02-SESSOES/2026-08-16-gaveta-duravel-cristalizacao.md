---
title: "Gaveta durável — cristalização exige recibo"
date: 2026-08-16
tags: ["aprendizado", "memoria", "obsidian", "cristalizacao", "prova"]
status: "CANDIDATO_ATÉ_MERGE"
authority: "REFERENCIA_DE_MEMORIA; regras continuam nos owners canônicos"
originator: "SEGREDO/CHEFE"
writer: "SOL"
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
