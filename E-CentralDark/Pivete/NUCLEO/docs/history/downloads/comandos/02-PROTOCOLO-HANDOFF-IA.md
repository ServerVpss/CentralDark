---
title: "02 PROTOCOLO HANDOFF IA"
date: 2026-06-29
updated: 2026-08-24
status: "CANÔNICO"
tags: ["consciencia", "handoff", "continuidade", "prova"]
owner: "HANDOFF_CANÔNICO_CENTRALDARK"
---

# Protocolo de handoff IA

Este é o **owner canônico** do handoff entre superfícies, sessões, modelos e executores da CentralDark.

O handoff transporta continuidade. Ele **não cria autoridade**, **não cria nova missão**, **não cria owner paralelo** e **não transforma checksum em prova semântica**.

## Contrato mínimo obrigatório

Todo handoff material deve preservar, quando aplicável:

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

## Invariantes canônicos

```text
DESTINATION_LOCK_DEVE_SOBREVIVER_AO_HANDOFF=true
UNKNOWN_DEVE_SOBREVIVER_AO_HANDOFF=true
PROVENIÊNCIA_DEVE_SOBREVIVER_AO_HANDOFF=true
NEXT_CURSOR_DEVE_SOBREVIVER_AO_HANDOFF=true

CHECKSUM != PROVA_SEMÂNTICA
HANDOFF != NOVA MISSÃO
HANDOFF != NOVA AUTORIDADE
HANDOFF != NOVO OWNER
MODEL_SWITCH != RESET
SESSION_SWITCH != RESET
```

## Gate

O verificador canônico deve abrir **este arquivo real** e validar os invariantes acima.

```text
CANONICAL_OWNER_REFERENCED != CANONICAL_OWNER_VERIFIED
PATH_LITERAL_PRESENT != OWNER_CONTRACT_PRESENT
OWNER_MISSING_OR_REGRESSED -> REPO_CONTRACT_VERIFY=FAIL
```

A contraprova negativa deve demonstrar:

```text
DELETE_OWNER -> FAIL_CLOSED
REMOVE_REQUIRED_INVARIANT -> FAIL_CLOSED
```

## Formato humano

```text
MENSAGEM PARA A PRÓXIMA IA

CHEFE_INTENT=
DESTINATION_LOCK=
SOURCE_SURFACE=
TARGET_SURFACE=
OBSERVED_AT=
HEAD_SHA / CONTENT_SHA256=
OWNER=
WRITER_SCOPE=
STATE=
EVIDENCE_REFS=
UNKNOWNS=
RESIDUAL=
NEXT_CURSOR=
```

Campos materiais não observados permanecem `UNKNOWN`. `UNKNOWN != PASS`.

## Conexões rápidas

- `docs/CONSCIENCIA/APRENDIZADOS/2026-08-24-pombo-correio-com-checksum.md`
- `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/`
- `scripts/trigger-fabric/verify_repo_contract.py`
- `scripts/trigger-fabric/test_pombo_handoff_counterproof.py`
