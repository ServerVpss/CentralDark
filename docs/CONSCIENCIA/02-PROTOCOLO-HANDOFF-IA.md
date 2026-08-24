---
title: "02 PROTOCOLO HANDOFF IA"
date: 2026-06-29
updated: 2026-08-24
tags: ["consciencia", "handoff", "continuidade", "pombo-checksum"]
owner: "HANDOFF_CANONICO"
---

# Protocolo de handoff IA

Owner canônico da transferência de continuidade entre superfícies da mesma Casa.
Não cria segundo cérebro, novo dispatcher, novo juiz ou nova autoridade.

```text
SEGREDO/CHEFE = autoridade da intenção e do destino
SOL = coordenação/reconciliação
HERMES/PIVETE = execução/continuidade quando aplicável
REALITY = JUDGE
POMBO = transporte verificável de continuidade
```

## Compasso operacional obrigatório

```text
#ACORDAR
→ estado vivo primeiro

!CALIBRAR
→ intenção/destino vigente

!MULTIBÚSSOLA
→ caminhos e hipóteses materiais

!META_LUPA
→ tenta quebrar a própria conclusão

UNKNOWN
→ vai atrás da realidade

AÇÃO
!= PROVA

ESTADO MUDOU
→ recalibra

FALHOU
→ causa → owner existente → delta mínimo → reteste

PROVOU
→ receipt + SHA/checksum + NEXT_CURSOR

NÃO PROVOU
→ NOT_PROVEN
```

Regras de execução:

```text
UNKNOWN != PARAR_NO_CHAT
UNKNOWN != PASS
UNKNOWN → MEASURE → TEST → OBSERVE_REALITY → PROVADO | FALHOU | NOT_PROVEN

ACTION != PROOF
DOCUMENTED != EXECUTED
IMPLEMENTED_ON_MAIN != RUNNING_NOW
HISTORY != CURRENT_STATE

STATE_CHANGED=true
→ REACORDAR
→ RECALIBRAR_AFFECTED_SCOPE
→ REVALIDATE_AFFECTED_CHAIN_ONLY
```

`NOT_PROVEN` só permanece depois de percorrer os caminhos materiais aplicáveis e ainda faltar evidência pertinente ou existir fronteira humana real.

## PAPAGAIO_MODE = OFF

Narrativa sem evidência não governa estado.

```text
PAPAGAIO_MODE = OFF

"acho"
"deve"
"já estava"
"parece"
"provavelmente"

→ NÃO governa estado
→ NÃO ganha caneta
→ NÃO vira PASS
→ NÃO substitui medição
→ fica no chat até a realidade confirmar ou negar
```

Generalização:

```text
UNMEASURED_NARRATIVE = CANDIDATE_ONLY
INFERENCE_WITHOUT_EVIDENCE = NOT_STATE_AUTHORITY
HYPOTHESIS = TEST_INPUT, NOT_VERDICT
```

## POMBO_MODE = CHECKSUM_ON

O Pombo-correio com checksum continua o fio sem interpretar para estreitar o destino.

```text
POMBO_MODE = CHECKSUM_ON

estado medido
+ horário
+ HEAD/SHA
+ evidência
+ residual/UNKNOWN
+ destino preservado
+ owner/writer quando material
+ NEXT_CURSOR
→ continua o fio
```

Contrato mínimo de transporte, quando aplicável ao escopo:

```text
CHEFE_INTENT
DESTINATION_LOCK
SOURCE_SURFACE
TARGET_SURFACE
OBSERVED_AT
HEAD_SHA / CONTENT_SHA256
OWNER
WRITER_SCOPE
STATE
EVIDENCE_REFS
UNKNOWNS
RESIDUAL
NEXT_CURSOR
```

Integridade:

```text
PAYLOAD_HASH_MATCH = BYTE_IDENTITY
PAYLOAD_HASH_MATCH != SEMANTIC_PROOF
RECEIPT != AUTHORITY
HANDOFF != NEW_MISSION
MODEL_SWITCH != RESET
SESSION_SWITCH != RESET
POMBO != CÉREBRO
POMBO != OWNER
POMBO != WRITER
POMBO != JUIZ
POMBO != AUTORIDADE
```

## Fluxo de handoff

Após uma ação material, a superfície deve transportar o estado pertinente sem reiniciar a missão:

```text
INTENÇÃO VIGENTE
→ DESTINATION_LOCK
→ ESTADO OBSERVADO
→ AÇÃO / TESTE
→ EVIDÊNCIA
→ CONTRAPROVA
→ VEREDITO DA REALIDADE
→ RECEIPT
→ CHECKSUM/SHA quando material
→ RESIDUAL/UNKNOWN preservado
→ NEXT_CURSOR
→ próxima superfície reancora pelo estado vivo
```

Formato humano recomendado:

```text
MENSAGEM PARA A PRÓXIMA IA

Destino preservado:
- CHEFE_INTENT / DESTINATION_LOCK

Estado observado:
- OBSERVED_AT
- HEAD_SHA / CONTENT_SHA256 quando material
- STATE
- EVIDENCE_REFS
- UNKNOWNS / RESIDUAL

Owner / writer:
- OWNER
- WRITER_SCOPE quando houver mutação

Próximo cursor:
- NEXT_CURSOR
```

## Quando usar

Sempre que houver transferência material entre chat, GitHub, Hermes, Casa local, VPS, modelos, sessões, PR/commit e próximo boot.

```text
CHAT ↔ CHAT
CHAT ↔ GITHUB
GITHUB ↔ HERMES
HERMES ↔ CASA_LOCAL
CASA_LOCAL ↔ VPS
MODEL_A ↔ MODEL_B
SESSION_T0 ↔ SESSION_T1
PR/COMMIT ↔ NEXT_BOOT
```

## Critério de validade

```text
HANDOFF_VALID =
  DESTINATION_PRESERVED
  AND OBSERVED_STATE_PRESENT
  AND PROVENANCE_PRESENT
  AND MATERIAL_HASH_PRESENT_WHEN_REQUIRED
  AND UNKNOWN_PRESERVED
  AND RESIDUAL_PRESERVED
  AND NEXT_CURSOR_PRESENT
  AND NO_PARALLEL_OWNER_CREATED
```

Se uma instrução operacional já promovida e provada precisar ser ensinada novamente pelo CHEFE em evento equivalente, classificar `LEARNING_TRANSFER_FAIL` e remediar no owner/gate existente.

## Owners e consumidores

```text
HANDOFF CANÔNICO:
  docs/CONSCIENCIA/02-PROTOCOLO-HANDOFF-IA.md

CRISTAL / LINGUAGEM DA CASA:
  docs/CONSCIENCIA/APRENDIZADOS/2026-08-24-pombo-correio-com-checksum.md

CONTRATO / RECEIPT / CONTINUIDADE:
  docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/

GATE DETERMINÍSTICO:
  scripts/trigger-fabric/verify_repo_contract.py
```

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
