# CONVERGÊNCIA OMNIROUTE → CENTRALDARK

Autoridade: SEGREDO/CHEFE  
Issue-mãe: #722  
Missão global relacionada: #604  
Programa Casa/Mente relacionado: PR #554  

## Direção final

```text
OMNIROUTE = CHASSIS/BASE MADURA
CENTRALDARK = IDENTIDADE/ORGANISMO FINAL
RESULTADO = UM ÚNICO PRODUTO CENTRALDARK
```

Não criar painel, router, app, grafo, vault ou produto paralelo sem GAP_REAL comprovado.

## Padrão profissional de integração

```text
ISSUE-MÃE #722
→ intenção, escopo, decisões, dependências, gates e estado global

PR-MÃE DE INTEGRAÇÃO
→ única PR final que mira main
→ branch viva de integração
→ recebe somente deltas técnicos já revisados

ISSUES FILHAS
→ problema/capacidade/decisão específica
→ sempre referenciam #722

PRS FILHOS
→ um Writer por escopo
→ mudança pequena e testável
→ base = branch da PR-mãe
→ nunca competem pelo mesmo arquivo sem handoff
→ voltam à #722 com prova
```

Regra: várias issues podem alimentar uma única PR-mãe, mas mudanças independentes continuam em PRs-filhos pequenos para preservar revisão, bisect, rollback e autoria. O que deve ser único é o caminho final para `main`, não o diff de trabalho de todos ao mesmo tempo.

## Fluxo

```text
ISSUE FILHA
→ OWNER/WRITER
→ PR FILHO
→ TESTE + CONTRAPROVA + RECEIPT
→ MERGE NA BRANCH-MÃE
→ MATRIZ #722 ATUALIZADA
→ REPETIR
→ GATE GLOBAL
→ PR-MÃE → main
```

## Regras fixas

- GitHub remoto é a fonte da verdade técnica.
- `E:\CentralDark\` é Casa/fonte de trabalho local.
- OmniRoute é chassis, não módulo periférico.
- CentralDark entra no OmniRoute e o resultado final continua CentralDark.
- Pacotão 01–36 é a gramática do organismo; não criar pacote 37/38/39.
- Reuse-before-create.
- Um Writer por escopo.
- Judge/revisor não escreve no mesmo escopo.
- Sem V2/V3/final-final.
- Sem escrita direta na main.
- UNKNOWN/SKIPPED/QUEUED não são PASS.
- Zero regressão.
- Nenhuma capacidade histórica é removida antes de consumidor + prova + substituto.
- Estado vivo não deve poluir a main com commits periódicos.
- Labels novas/ativas devem usar o catálogo canônico PT-BR + emoji + MAIÚSCULO; labels legadas só saem após consumidores = 0.

## Trilhos que alimentam #722

- #604 — unificação operacional total;
- PR #554 — Casa + Mente Estendida;
- #711 — Obsidian segundo cérebro;
- PR #637 — base Obsidian/Casa já mergeada;
- PR #677 — residência Casa E: e perfis SOL/Pivete;
- PR #668 — artefato automático/contrato de aprendizado;
- PR #721 — Artifact Builder universal;
- PR #667 — cápsula/evolução observável;
- PR #662 — autoridade SEGREDO/SOL/PIVETE já mergeada;
- PR #704 — gate final HERMES já mergeado;
- PR #705 — lupa-conformance já mergeado.

Outras issues/PRs/branches devem ser classificados antes de criar trabalho novo:

```text
KEEP
ABSORB_GOLD
MERGE_INTO_MOTHER
SUPERSEDED
HISTORICAL
BLOCKED
UNKNOWN
```

## Gate da PR-mãe

```text
OMNIROUTE_PINNED=PASS
PACKAGE_01_36=36/36
HISTORICAL_GOLD_INVENTORIED=PASS
DUPLICATE_CAPABILITIES_RESOLVED=PASS
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

A PR-mãe permanece Draft enquanto servir como integração viva. Só fica pronta para `main` quando o gate global estiver provado no mesmo HEAD e SEGREDO/CHEFE autorizar a promoção.
