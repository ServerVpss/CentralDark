---
title: "Protocolo de prova, rastro e anti-pendência eterna"
status: "ATIVO_SUBORDINADO_AO_PADRAO_DE_RESPOSTA"
date: 2026-09-05
owner: "docs/CONSCIENCIA/PADRAO-RESPOSTA-SEGREDO-CHEFE.md"
intent_authority: "SEGREDO/CHEFE"
repository: "ServerVpss/CentralDark"
---

# PROPÓSITO

Este protocolo ensina a Casa a responder e registrar prova sem criar falso verde, sem repetir pendência já fechada e sem apagar histórico.

Ele é **subordinado** ao owner canônico de comunicação:

```text
docs/CONSCIENCIA/PADRAO-RESPOSTA-SEGREDO-CHEFE.md
```

Não cria segundo padrão. Especializa somente a parte de **PROVA + RASTRO + RECONCILIAÇÃO DE PENDÊNCIAS**.

# LEI CENTRAL

```text
CLAIM
→ ALVO EXATO
→ CATEGORIA
→ TÓPICO
→ PAPEL DA FONTE
→ PROVA REF
→ HEAD/STATE ID
→ ESTADO
→ RASTRO
→ EFEITO
→ PRÓXIMO CURSOR
```

```text
UNKNOWN != PASS
DOCUMENTED != EXECUTED
COMMITTED != DEPLOYED
MERGED != DEPLOYED
RELEASE_EXISTS != CENTRALDARK_E2E_WORKS
SOURCE_PROVED != RUNTIME_PROVED
HISTORICAL_PROOF != CURRENT_STATE
```

# FORMATO CANÔNICO DE COMITÊ / RESPOSTA DE PROVA

Toda resposta material de `#ACORDAR`, auditoria, comitê, status ou contraprova deve organizar os fatos assim:

```text
# CATEGORIA
## TÓPICO

CLAIM=<afirmação atômica>
ESTADO=PROVADO|PARCIAL|UNKNOWN|BLOCKED|HISTORICAL|RESOLVIDO
ALVO=<onde exatamente vale>
OWNER=<dono real>
FONTE_PAPEL=<runtime|GitHub source|release upstream|CI|receipt|visual|trace|outro>
PROVA_REF=<URL|SHA|receipt|teste|output>
HEAD_OU_STATE_ID=<quando aplicável>
OBSERVADO_EM=<timestamp/data quando disponível>
RASTRO=<cadeia reconstruível>
EFEITO=<o que isso muda para o CHEFE>
PROXIMO_CURSOR=<só se ainda houver algo material>
```

Uma afirmação grande deve ser quebrada em claims menores. Exemplo:

```text
"Screenpipe funciona com Hermes na CentralDark"
```

não pode receber um único verde se as únicas provas forem releases upstream.

Correto:

```text
SCREENPIPE_RELEASE_EXISTS=PROVADO
HERMES_RELEASE_EXISTS=PROVADO
SCREENPIPE_TO_MCP_IN_CENTRALDARK=UNKNOWN
MCP_TO_HERMES_IN_CENTRALDARK=UNKNOWN
END_TO_END_PROVENANCE=UNKNOWN
```

# REGRA ANTI-PENDÊNCIA ETERNA

Pendência não é identidade permanente. É um claim ainda não fechado dentro de um alvo e tempo.

```text
PENDENCIA
→ DEFINIR CLAIM_KEY
→ BUSCAR PROVAS ANTERIORES
→ MEDIR CURRENT QUANDO O CLAIM FOR TEMPORAL
→ RECONCILIAR
```

Se o mesmo claim já foi provado e a prova continua aplicável ao estado atual:

```text
STATUS=RESOLVIDO
PENDENCIA_VIVA=false
HISTORY_PRESERVED=true
REOPEN_ONLY_WITH_NEW_CAUSAL_EVIDENCE=true
```

É proibido recolocar o mesmo claim em pendência apenas porque outra camada continua amarela.

Exemplo:

```text
SOURCE_ON_MAIN=PROVADO
RUNTIME_DEPLOY=UNKNOWN
```

Logo:

```text
"código ainda não está na main" = PENDÊNCIA INVÁLIDA
"runtime ainda não foi provado" = PENDÊNCIA VÁLIDA
```

# CHAVE DE DEDUPE DE PENDÊNCIA

Cada pendência material deve poder ser identificada por uma chave estável:

```text
CLAIM_KEY=<OWNER>::<ALVO>::<CLAIM>
```

Exemplo:

```text
CLAIM_KEY=KNOWLEDGE_HUB::MAIN_SOURCE::CONTRACT_EXISTS
```

Antes de criar ou repetir pendência:

```text
SEARCH_RECEIPTS
→ SEARCH_MAIN
→ SEARCH_PR/ISSUE
→ SEARCH_RUNTIME_IF_APPLICABLE
→ COMPARE_TARGET+HEAD+TIME
→ DEDUPE
```

Se houver prova anterior suficiente:

```text
PENDING_DUPLICATE=REJECTED
STATUS=RESOLVIDO|HISTORICAL
```

Se houve mudança causal depois da prova:

```text
REOPEN_ALLOWED=true
REOPEN_CAUSE_REF=<SHA|runtime event|failure|drift>
OLD_PROOF=HISTORICAL
CURRENT_STATE=REMEASURE_REQUIRED
```

# MATRIZ DE PROVA

| Claim | Prova mínima |
|---|---|
| arquivo/contrato existe na main | path + commit/SHA da main |
| PR contém mudança | PR + HEAD + diff/arquivo |
| release upstream existe | release oficial + tag + data |
| CI passou | run/check do HEAD exato |
| deploy ocorreu | SHA/artefato + evento de deploy |
| runtime está vivo | probe/log/processo/endpoint do runtime atual |
| integração E2E funciona | teste ponta a ponta no corredor real + receipt |
| proveniência preservada | source/time/id/owner ou campos equivalentes reconstruíveis |

# RASTRO OBRIGATÓRIO

Para qualquer verde material, o próximo agente deve conseguir reconstruir por que ficou verde sem confiar no narrador.

```text
CLAIM
→ PROOF_REF
→ TARGET
→ STATE_ID/HEAD
→ RESULT
```

Se faltar qualquer elo material:

```text
GREEN=FORBIDDEN
STATUS=UNKNOWN|PARCIAL
```

# RECONCILIAÇÃO DE PROVAS JÁ EXISTENTES — 2026-09-05

Fonte principal desta reconciliação:

```text
docs/RELATORIOS/2026-09-05-RANDOLF-HUB-DIRECT-MAIN.md
```

## Categoria: SOURCE / MAIN

### Tópico: arquitetura e owner vivo

```text
SOURCE_ON_MAIN=PROVADO
RANDOLF_ON_MAIN=PROVADO
KNOWLEDGE_HUB_CONTRACT_ON_MAIN=PROVADO
OBSIDIAN_TO_HUB_SOURCE_ON_MAIN=PROVADO
FIXED_POINT_CONFLICT_MARKERS_REPAIRED=PROVADO_FOR_TOUCHED_OWNERS
```

Consequência anti-pendência:

```text
SOURCE_IMPLEMENTATION_PENDING_FOR_THESE_CLAIMS=false
```

Esses claims só podem reabrir como pendência de source se surgir contraprova nova, drift material ou remoção/regressão em `main`.

## Categoria: RUNTIME / DEPLOY

O mesmo receipt **não** provou:

```text
OBSIDIAN_PLUGIN_LIVE_RUNTIME=UNKNOWN
MEMORIA_INGEST_LIVE_RUNTIME=UNKNOWN
FIRECRAWL_RUNTIME=UNKNOWN
MICRO_DEPLOY_EXECUTED_BY_THIS_PASSAGE=NOT_PROVEN
FULL_DEPLOY_EXECUTED_BY_THIS_PASSAGE=NOT_PROVEN
GLOBAL_RUNTIME_FIXED_POINT=NOT_PROVEN
```

Consequência:

```text
RUNTIME_PENDING_REMAINS_VALID=true
```

Não misturar essas lacunas com claims já provados na main.

# RECONCILIAÇÃO DESTA SESSÃO — SCREENPIPE / HERMES / MCP

## Categoria: UPSTREAM CAPABILITY

### Screenpipe

```text
SCREENPIPE_APP_V2_7_21_RELEASE_EXISTS=PROVADO
PROVA_REF=https://github.com/screenpipe/screenpipe/releases/tag/app-v2.7.21
```

Capacidades registradas pela release oficial incluem triggers de Email, Calendar, GitHub, Todoist e Linear e execução de tarefas agendadas em chat existente.

### Hermes Agent

```text
HERMES_V0_21_0_RELEASE_EXISTS=PROVADO
PROVA_REF=https://github.com/NousResearch/hermes-agent/releases/tag/v2026.8.31
```

Capacidades registradas pela release oficial incluem Bot Mode, bot-to-bot, cron com memória/continuidade, subagentes direcionáveis em execução e MCP command center.

## Categoria: CENTRALDARK INTEGRATION

Nenhuma release upstream prova por si só o corredor local da Casa:

```text
SCREENPIPE_CAPTURE_LIVE_IN_CENTRALDARK=UNKNOWN
SCREENPIPE_AUDIO_TRANSCRIPTION_LIVE=UNKNOWN
SCREENPIPE_FRAME_TO_MCP_TO_HERMES=UNKNOWN
SCREENPIPE_AUDIO_TO_MCP_TO_HERMES=UNKNOWN
MCP_2026_07_28_IN_CENTRALDARK_RUNTIME=UNKNOWN
SOURCE_TIME_SPEAKER_FRAME_RECEIPT=UNKNOWN
GLOBAL_RUNTIME_FIXED_POINT=NOT_PROVEN
```

# RASTRO DESTA PASSAGEM

```text
PR_LEDGER=https://github.com/ServerVpss/CentralDark/pull/1416
PR_COMMENT=https://github.com/ServerVpss/CentralDark/pull/1416#issuecomment-5553044933
PR_HEAD_AT_MEASUREMENT=400afde4d4f83a3007aa787137b2f4fd89d795f6
MAIN_BEFORE_THIS_PROTOCOL=e0e685695033e367bb32389dc4615e345c4886b9
```

O PR #1416 já funciona como ledger/proveniência da passagem; não é segundo owner da realidade atual.

# PLACAR DA RECONCILIAÇÃO

```text
PROVED_SOURCE_CLAIMS_RECONCILED=5
PROVED_UPSTREAM_RELEASE_CLAIMS_RECONCILED=2
CENTRALDARK_E2E_RUNTIME_CLAIMS_PROMOTED_TO_PASS=0
FALSE_GREENS_CREATED=0
```

# REGRA PARA BOTS / AGENTES

Antes de declarar pendência:

```text
1. definir claim atômico;
2. localizar owner;
3. buscar receipt/prova anterior;
4. verificar se a prova é do mesmo alvo;
5. se temporal, medir CURRENT;
6. deduplicar;
7. só então marcar PENDING/UNKNOWN;
8. se já provado e ainda aplicável, marcar RESOLVIDO e preservar o rastro;
9. nunca reabrir sem REOPEN_CAUSE_REF;
10. nunca usar pendência vizinha para rebaixar claim já provado.
```

# SAÍDA PADRÃO

```text
#ACORDAR

CATEGORIA
TÓPICO
CLAIM
ESTADO
PROVA
RASTRO
EFEITO
PENDÊNCIA REAL
PRÓXIMO CURSOR
```

Para resposta humana, aplicar depois as demais camadas do owner canônico `PADRAO-RESPOSTA-SEGREDO-CHEFE.md`.

# FIXED POINT DESTE PROTOCOLO

```text
METHOD_CRYSTALLIZED=true
TRACE_REQUIRED=true
ANTI_ETERNAL_PENDING=true
REOPEN_REQUIRES_CAUSAL_EVIDENCE=true
HISTORY_IS_PRESERVED=true
UNKNOWN_IS_NOT_PASS=true
ONE_RESPONSE_STANDARD_OWNER=true
```
