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

A verdade operacional é o evento estruturado (`capability`, `state`, `event`, `event_id`, `session_id`, `evidence_ref`, `payload`). A apresentação humana é projeção derivada: emoji, glifo, nota e verbo nunca alteram owner, gate, severidade, decisão ou resultado.

```text
CAPABILITY REAL
→ MACHINE_EVENT
→ SKILL_SIGNATURE
→ HUMAN_PRESENTATION
```

A música entra somente como matéria comportamental abstrata. Ritmo/tempo, pausa, crescendo, decrescendo, refrão, ponte, contraponto, harmonia, dissonância, tensão, resolução, dinâmica, silêncio, clímax e coda podem gerar hipóteses reutilizáveis; nunca ações diretas.

A saída musical permanece `CANDIDATE_ONLY` até dedupe, contraprova, owner e teste. O módulo não copia música/letra, não escreve skill diretamente e não dispara ação operacional.

Capability desconhecida falha explicitamente com `UNKNOWN_CAPABILITY`. Música, nota ou emoji nunca mapeiam implicitamente para `DEPLOY`, `DELETE`, `RESTART`, `RESET`, merge ou qualquer ação destrutiva.

`operational-score.test.mjs` cobre A–O do contrato. O `lupa-conformance.yml` executa sintaxe e regressão no mesmo gate canônico do Memory-Linker.
