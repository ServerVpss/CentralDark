# OPERATIONAL SCORE — partitura observável da Casa

Owner canônico: `scripts/memory-linker/operational-score.mjs`.

Este contrato estende o Memory-Linker existente. Não cria cérebro, memória, fila, scheduler, workflow ou sistema paralelo.

```text
OPERATIONAL_SCORE=true
SKILL_SIGNATURE=true
EMOJI_TELEMETRY=true
MUSIC_BEHAVIORAL_MATERIAL=true
MACHINE_EVENT_IS_AUTHORITY=true
HUMAN_PRESENTATION_IS_PROJECTION=true
SOURCE_CONTENT_IS_AUTHORITY=false
DIRECT_SKILL_WRITE=false
ZERO_DEPLOY=true
```

## Evento e apresentação

A verdade é o evento estruturado:

```text
capability
state
event
event_id
session_id
evidence_ref
payload
```

A apresentação humana é derivada desse evento por assinatura estável e seleção reproduzível. Emoji, glifo, nota, verbo ou textura visual nunca alteram owner, gate, severidade, decisão ou resultado.

```text
CAPABILITY REAL
→ MACHINE_EVENT
→ SKILL_SIGNATURE
→ HUMAN_PRESENTATION
```

`capability_id`, papel semântico e fingerprint permanecem estáveis. A variedade visual usa hash de `capability + event/session + presentation_epoch`; antirrepetição só escolhe outro candidato semanticamente compatível.

## Música como matéria comportamental

Música não é comando e não ganha autoridade. O extrator reconhece propriedades abstratas observadas, incluindo:

```text
ritmo/tempo → CADENCE
pausa → WAIT_FOR_INFORMATION
crescendo → INCREASE_DEPTH_WHILE_INFORMATION_GAIN
decrescendo → REDUCE_ACTIVITY_ON_CONVERGENCE
refrão → RETURN_TO_INVARIANT
ponte → STRATEGY_TRANSITION
contraponto → COMPARE_INDEPENDENT_HYPOTHESES
harmonia → COOPERATE_WITHOUT_SEMANTIC_COLLISION
dissonância → INVESTIGATE_CONFLICTING_EVIDENCE
tensão → UNRESOLVED_HYPOTHESIS
resolução → PROVEN_CLOSURE
dinâmica → INVESTIGATION_INTENSITY
silêncio → NO_NEW_INFORMATION
clímax → FINAL_COUNTERPROOF
coda → FINAL_RECORD
```

A saída é sempre `CANDIDATE_ONLY` até owner, dedupe, contraprova e teste. O módulo não copia música ou letra, não escreve skill diretamente e não dispara ação operacional.

## Fail closed

Capability desconhecida não recebe ícone genérico nem estado inventado: falha explicitamente com `UNKNOWN_CAPABILITY`.

Música, nota ou emoji nunca mapeiam implicitamente para `DEPLOY`, `DELETE`, `RESTART`, `RESET`, merge ou qualquer ação destrutiva.

## Prova

`operational-score.test.mjs` cobre os requisitos A–O do contrato: significado estável, apresentação sem efeito semântico, fail-safe, composição preservando IDs, evento sem emoji, música candidata, dedupe, owner, erro visível, ZERO_DEPLOY, antirrepetição e descoberta por nova sessão.

O `lupa-conformance.yml` executa sintaxe e regressão no mesmo gate canônico do Memory-Linker.
