---
title: "Pombo-correio com checksum"
date: 2026-08-24
tags: ["consciencia", "linguagem-da-casa", "handoff", "continuidade"]
status: "CRISTAL OPERACIONAL DERIVADO"
owner: "docs/CONSCIENCIA/02-PROTOCOLO-HANDOFF-IA.md + Trigger Fabric"
---

# Pombo-correio com checksum

Linguagem humana da Casa para um comportamento operacional já pertencente aos
owners canônicos. **Não é segundo cérebro, novo gate, novo dispatcher ou nova
autoridade.** O Pombo nomeia a transferência verificável entre superfícies,
sessões, modelos e executores sem perder intenção, destino, proveniência ou
estado.

## De onde veio (fato, não invenção)

Na sessão de 2026-08-24, um agente devolveu trabalho mecânico ao CHEFE em vez
de resolver sozinho ("papagaio"). Depois de corrigido, passou a: medir causa
raiz real (não assumir), reproduzir cada gate localmente antes de empurrar,
citar hash/SHA como prova de que um arquivo é exatamente o que ele diz ser, e
preencher o receipt canônico (`Intent-Authorized`, `Merge-Policy`,
`Intent-Scope`, `Writer`, `Writer-Scope`) já definido em
`scripts/github-autonomia-varredura.mjs` para que o selo de autoridade
materializasse sem reperguntar ao CHEFE.

O CHEFE resumiu essa evolução em uma frase que pegou:

```text
PAPAGAIO
  ↓ evolução
POMBO-CORREIO
  ↓ + SHA-256
POMBO-CORREIO COM CHECKSUM
  ↓
CENTRALDARK CONTINUA O FIO
```

## Definição operacional

`POMBO-CORREIO COM CHECKSUM` é o **transporte verificável de continuidade**.
Ele carrega um handoff/receipt para outra superfície sem ganhar autoridade
sobre o conteúdo transportado.

```text
POMBO != CÉREBRO
POMBO != OWNER
POMBO != WRITER
POMBO != JUIZ
POMBO != AUTORIDADE

POMBO =
TRANSPORTE
+ DESTINO_TRAVADO
+ ESTADO_REFERENCIADO
+ PROVENIÊNCIA
+ CHECKSUM/SHA
+ RECEIPT
+ PRÓXIMO_CURSOR
```

A autoridade continua sendo do SEGREDO/CHEFE. O destino continua sendo o da
intenção vigente. O Pombo não interpreta para estreitar, não escolhe novo
destino e não inventa canônico.

## Contrato de transferência

Todo handoff material que usar a semântica do Pombo deve preservar, quando
aplicável ao escopo:

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

Regra de integridade:

```text
PAYLOAD_HASH_MATCH = BYTE_IDENTITY
PAYLOAD_HASH_MATCH != SEMANTIC_PROOF
RECEIPT != AUTHORITY
HANDOFF != NEW_MISSION
MODEL_SWITCH != RESET
SESSION_SWITCH != RESET
```

## Generalização fixa da Casa

O Pombo não vale somente entre duas IAs específicas. A mesma semântica deve
ser herdada por qualquer superfície que faça transporte de continuidade do
mesmo organismo:

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

Isso **não obriga cada superfície a usar o nome “Pombo”**. A metáfora é
cultural; o comportamento técnico é herdado por referência aos owners
canônicos de handoff, receipt, Trigger Fabric e continuidade.

```text
SAME_ORGANISM_TRANSFER
→ REUSE_CANONICAL_HANDOFF
→ PRESERVE_DESTINATION
→ PRESERVE_PROVENANCE
→ VERIFY_HASH_WHEN_MATERIAL
→ PRESERVE_UNKNOWN
→ NEXT_CURSOR
```

## Transferência de aprendizado

Uma regra só conta como aprendida quando o próximo evento equivalente consegue
reutilizá-la sem o CHEFE ter de ensinar novamente a mesma mecânica.

```text
HUMAN_CORRECTION
→ SIGNATURE
→ CAUSE / INVARIANT
→ OWNER CANÔNICO
→ TESTE
→ CONTRAPROVA
→ RECEIPT
→ CRYSTAL
→ POMBO/HANDOFF
→ NEXT EVENT REUSES
```

Se a mesma instrução mecânica precisar ser repetida depois de promovida e
provada, isso é `LEARNING_TRANSFER_FAIL`.

## Anti-papagaio / anti-falso-verde

```text
SEM_CHECKSUM_QUANDO_EXIGIDO = ENTREGA_INCOMPLETA
SEM_PROVENIÊNCIA = ENTREGA_INCOMPLETA
SEM_DESTINO_PRESERVADO = HANDOFF_INVÁLIDO
UNKNOWN_REMOVIDO_PARA_PARECER_VERDE = FAIL
HANDOFF_QUE_CRIA_OWNER_PARALELO = FAIL
HANDOFF_QUE_DEVOLVE_TRABALHO_MECÂNICO_AO_CHEFE = PAPAGAIO
```

O oposto cultural continua sendo `🚨 POMBO SEM CHECKSUM`: entrega sem prova de
integridade/proveniência quando materialmente exigidas, ou devolução ao CHEFE
de uma descoberta mecânica que a Casa conseguia realizar.

## Modo operacional anti-papagaio

Este shorthand consolida, sem criar comando, owner ou gate paralelo, a ordem já
existente entre `#ACORDAR`, `!CALIBRAR`, `!MULTIBUSSOLA`, MetaLupa, remedição e
handoff. Ele é um **cristal de execução**, não uma nova autoridade.

```text
#ACORDAR
→ estado vivo primeiro

!CALIBRAR
→ intenção/destino vigente

!MULTIBUSSOLA
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

Regra curta da Casa:

```text
PAPAGAIO_MODE=OFF
ACHO_NAO_GOVERNA_ESTADO=true
DEVE_NAO_GOVERNA_ESTADO=true
JA_ESTAVA_NAO_GOVERNA_ESTADO=true
PARECE_NAO_GOVERNA_ESTADO=true
PROVAVELMENTE_NAO_GOVERNA_ESTADO=true

POMBO_MODE=CHECKSUM_ON
STATE_REQUIRES_MEASUREMENT=true
OBSERVED_AT_REQUIRED_WHEN_MATERIAL=true
HEAD_OR_SHA_REQUIRED_WHEN_MATERIAL=true
EVIDENCE_REQUIRED=true
RESIDUAL_OR_UNKNOWN_PRESERVED=true
DESTINATION_PRESERVED=true
NEXT_CURSOR_REQUIRED_WHEN_HANDOFF_MATERIAL=true
UNKNOWN_NEVER_PASS=true
ACTION_IS_NOT_PROOF=true
STATE_CHANGE_REQUIRES_RECALIBRATION=true
```

Frases como “acho”, “deve”, “já estava”, “parece” e “provavelmente” podem ser
hipóteses úteis, mas **não governam estado**. Se a realidade pode ser medida, a
Casa mede. Se não puder ser provado no alvo aplicável, o veredito permanece
`NOT_PROVEN`/`UNKNOWN` conforme o contrato do owner competente.

## Selo

![Selo Pombo-Correio com Checksum](ARTEFATOS/selo-pombo-correio-com-checksum.svg)

Uso visual/cultural em relatos, receipts e PRs quando fizer sentido. O selo
**não bloqueia CI por si mesmo**, não substitui `👑 PERMITO-SEGREDO`, não cria
permissão e não transforma checksum em prova semântica.

## Owners e consumidores

```text
LINGUAGEM / CRISTAL:
  docs/CONSCIENCIA/APRENDIZADOS/2026-08-24-pombo-correio-com-checksum.md

HANDOFF CANÔNICO:
  docs/CONSCIENCIA/02-PROTOCOLO-HANDOFF-IA.md

CONTRATO / RECEIPT / CONTINUIDADE:
  docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/

GATE DE CONFORMIDADE:
  scripts/trigger-fabric/verify_repo_contract.py
```

## Invariantes

```text
LINGUAGEM_DA_CASA != NOVA_AUTORIDADE
PIADA_CRISTALIZADA != NOVO_GATE
POMBO != SEGUNDO_CÉREBRO
POMBO != OWNER
POMBO != JUIZ
CHECKSUM != PROVA_SEMÂNTICA
HANDOFF != NOVA_MISSÃO
DESTINATION_LOCK_DEVE_SOBREVIVER_AO_HANDOFF=true
UNKNOWN_DEVE_SOBREVIVER_AO_HANDOFF=true
PROVENIÊNCIA_DEVE_SOBREVIVER_AO_HANDOFF=true
NEXT_CURSOR_DEVE_SOBREVIVER_AO_HANDOFF=true
```

## Critério de nível generalizado fixo

Para este cristal específico, `FIXED_POINT` só pode ser alegado quando:

```text
POMBO_CONTRACT_PRESENT
AND CANONICAL_OWNER_REFERENCED
AND DETERMINISTIC_REPO_GATE_CHECKS_IT
AND NEGATIVE_INVARIANTS_EXIST
AND DESTINATION_SURVIVES_HANDOFF
AND PROVENANCE_SURVIVES_HANDOFF
AND UNKNOWN_SURVIVES_HANDOFF
AND NEXT_CURSOR_SURVIVES_HANDOFF
AND NO_PARALLEL_OWNER_CREATED
AND MATERIAL_UNKNOWN_FOR_THIS_SCOPE = 0
```

O runtime universal de todas as superfícies continua sujeito à regra geral da
Casa: contrato em Git não é prova de ativação física em todo corpo externo.

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
