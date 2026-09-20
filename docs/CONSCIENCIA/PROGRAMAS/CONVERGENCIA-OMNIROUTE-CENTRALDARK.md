---
title: "CONVERGENCIA OMNIROUTE CENTRALDARK"
date: 2026-08-27
tags: ["consciencia"]
updated: 2026-08-27
---

# CONVERGÊNCIA OMNIROUTE → CENTRALDARK

Autoridade: SEGREDO/CHEFE
Issue de referência: #722
PR histórica: #724 — `CLOSED`, não mergeada, proveniência somente
Branch histórica: `program/centraldark-convergencia-omniroute-722`
Missão global relacionada: #604
Programa Casa/Mente relacionado: PR #554

> **Estado reconciliado em 2026-08-14:** a antiga #724 não é mais control plane operacional nem base obrigatória de trabalho novo. A fonte de verdade vigente é `main` + canônicos vivos + estado real medido. O histórico #722/#724 permanece como proveniência da convergência e não deve ser ressuscitado como governança paralela.

## Direção final

```text
OMNIROUTE = CHASSIS/BASE MADURA
CENTRALDARK = IDENTIDADE/ORGANISMO FINAL
RESULTADO = UM ÚNICO PRODUTO CENTRALDARK
```

Não criar painel, router, app, grafo, vault ou produto paralelo sem `GAP_REAL` comprovado.

## Antiga PR-mãe — proveniência, não control plane

A #724 foi a espinha histórica de integração. O estado vivo atual é:

```text
PR_724=CLOSED_NOT_MERGED
ROLE=HISTORICAL_PROVENANCE
OPERATIONAL_AUTHORITY=NAO
SOURCE_OF_TRUTH=main + canônicos vivos
```

Nenhum trabalho novo deve usar a branch histórica como base obrigatória ou reabrir a #724 para recriar o control plane antigo.

Fluxo atual:

```text
INTENÇÃO DO SEGREDO/CHEFE
→ ISSUE/LANE QUANDO NECESSÁRIA
→ 1 WRITER POR ESCOPO
→ BRANCH PEQUENA A PARTIR DE main
→ PR PEQUENA PARA main
→ TESTE + CONTRAPROVA + RECEIPT
→ PROMOÇÃO PELO FLUXO CANÔNICO
→ main
→ REGISTRO
```

PR legado ligado à antiga mãe deve ser reconciliado contra o `main` vivo. Não retargetear automaticamente para a branch fechada e não usar force-push.

## Promoção para `main`

A promoção vigente segue o contrato canônico de `LEIA-ME-IA.md`, `AGENTS.md`, `docs/CONSCIENCIA/02-PERMISSOES.md` e `docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json`.

```text
INTENCAO_AUTORIZADA
→ BRANCH/PR PEQUENA BASEADA EM main
→ TESTE/SCAN APLICAVEL
→ SEM CONFLITO
→ HEAD/BASE REVALIDADOS
→ SQUASH main
→ RECEIPT
```

Não criar segunda PR-mãe nem segundo promotor. O fluxo de promoção continua em `.github/workflows/autonomia-promocao.yml`.

## API única CentralDark

```text
API_OFICIAL=https://api.centralldark.com
API_AI_COMPAT=https://api.centralldark.com/v1
CONSUMIDORES_INTERNOS→API_OFICIAL
PROVEDORES_EXTERNOS→ATRÁS_DO_GATEWAY/ROUTER
NOVO_BYPASS_DIRETO_DE_PROVIDER=PROIBIDO
```

Regras:

- Hermes, SOL, Bolt, WebUI, revisores e novos consumidores não inventam endpoint próprio de IA;
- roteamento, fallback free/pago/local, quotas e analytics devem ficar atrás da API oficial;
- chamada direta a provider só pode existir dentro de componente explicitamente classificado como implementação interna de gateway/proxy/OAuth;
- dívida histórica existente é inventariada e migrada sem quebrar consumidor;
- nenhuma dívida nova de bypass entra.

Gate técnico desta frente: #708 / PR #709.

## Labels = contrato de trabalho

Catálogo canônico:

- `.github/workflows/bots-labels-seed.yml`;
- `docs/CONSCIENCIA/GITHUB-LABELS-OPERACIONAIS.md`.

```text
SEM_LABEL_CANÔNICA = WORK_BLOCKED
PR_FILHO_SEM_LABEL = NÃO PROMOVE
ISSUE_SEM_LABEL = AGENTE NÃO ASSUME
LABEL_LEGADA = COMPATIBILIDADE SOMENTE DURANTE MIGRAÇÃO #707
```

O GitHub nativo permite criar Issue/PR sem label. O enforcement é operacional/determinístico: pode existir, mas agentes não trabalham e gates não liberam promoção até a classificação canônica existir.

Labels visíveis novas/ativas seguem `EMOJI + PT-BR + MAIÚSCULO`.

## Paralelismo profissional

Paralelo por escopo, não vários Writers no mesmo arquivo. As associações abaixo são referências históricas da convergência e não model-lock atual:

```text
#707  CLAUDE
      → migração do dialeto de labels/produtores/dispatcher

#709  CHATGPT/SOL
      → porta-de-entrada
      → API única

#721  SONNET/CLAUDE
      → Artifact Builder

#725  CHATGPT/SOL
      → Sentinela → Hermes → Telegram

CODEX/JUDGE
      → revisão/read-only no HEAD exato
```

Regras:

- um Writer por arquivo/escopo;
- leitores/revisores podem trabalhar em paralelo;
- handoff explícito transfere Writer sem model-lock;
- Judge/revisor não disputa escrita;
- mensagem atrasada não reinicia missão;
- evidência nova vence contexto antigo;
- sem V2/V3/final-final.

A existência deste desenho não prova subagentes reais numa determinada sessão. Só chamar de agente independente quando houver processo/contexto realmente independente.

## Regras fixas

- GitHub remoto é a fonte da verdade técnica.
- `E:\CentralDark\` é Casa/fonte de trabalho local.
- OmniRoute é chassis, não módulo periférico.
- CentralDark entra no OmniRoute e o resultado final continua CentralDark.
- Pacotão 01–36 é a gramática do organismo; não criar pacote 37/38/39.
- Reuse-before-create.
- Um Writer por escopo.
- Sem escrita direta na `main`; usar branch/PR e promoção canônica quando aplicável.
- `UNKNOWN/SKIPPED/QUEUED` não são `PASS`.
- Zero regressão.
- Nenhuma capacidade histórica é removida antes de consumidor + prova + substituto.
- Estado vivo não deve poluir a `main` com commits periódicos.
- #722/#724 preservam proveniência; não governam contra o canônico vivo.

## Trilhos históricos da convergência

- #604 — unificação operacional total;
- PR #554 — Casa + Mente Estendida;
- #708 / PR #709 — fronteira, workflows, API e gate de labels;
- #711 — Obsidian segundo cérebro;
- PR #637 — base Obsidian/Casa já mergeada;
- PR #677 — residência Casa E: e perfis SOL/Pivete;
- PR #668 — artefato automático/contrato de aprendizado;
- PR #721 — Artifact Builder universal;
- PR #725 — Sentinela → Hermes → Telegram;
- PR #667 — cápsula/evolução observável;
- PR #662 — autoridade SEGREDO/SOL/PIVETE já mergeada;
- PR #704 — gate final HERMES já mergeado;
- PR #705 — lupa-conformance já mergeado.

Outras issues/PRs/branches devem ser classificados antes de criar trabalho novo:

```text
KEEP
ABSORB_GOLD
MERGE_INTO_CANONICAL
SUPERSEDED
HISTORICAL
BLOCKED
UNKNOWN
```

## Gate histórico da antiga PR-mãe

O gate abaixo preserva o desenho que existia quando #724 era control plane. Ele não é gate operacional atual e não autoriza reabrir a PR:

```text
OMNIROUTE_PINNED=PASS
PACKAGE_01_36=36/36
HISTORICAL_GOLD_INVENTORIED=PASS
DUPLICATE_CAPABILITIES_RESOLVED=PASS
MOTHER_SPINE_ROUTING=HISTORICAL
CANONICAL_LABELS_REQUIRED=PASS
CENTRALDARK_API_SINGLE_ENTRY=PASS
NEW_PROVIDER_BYPASS=0
OBSIDIAN=PASS_OR_EXPLICIT_BLOCK
SOL_HERMES_PROFILE_SWITCH=PASS_OR_EXPLICIT_BLOCK
GRAPH_2D_3D_CELESTIAL=PASS_OR_EXPLICIT_BLOCK
VOICE_LOCAL=PASS_OR_EXPLICIT_BLOCK
LOCAL_MODEL=PASS_OR_EXPLICIT_BLOCK
ARTIFACTS=PASS_OR_EXPLICIT_BLOCK
TELEGRAM_EVENT_MODEL=PASS_OR_EXPLICIT_BLOCK
SECRET_SCAN=PASS
ZERO_REGRESSION=PASS
SAME_SHA=PASS
WRITER_COLLISION=0
P0_OPEN=0
P1_OPEN=0
```

Estado final deste artefato:

```text
#722=REFERENCE_TRACKER
#724=HISTORICAL_CLOSED_NOT_MERGED
OLD_MOTHER_BRANCH=PROVENANCE_ONLY
NEW_WORK_BASE=main
PROMOTION=CANONICAL_SQUASH_FLOW
PARALLEL_CONTROL_PLANE=NO
```

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
