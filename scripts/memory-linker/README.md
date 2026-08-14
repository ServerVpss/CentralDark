# Memory Linker — pipeline canônico de memória

Este diretório é um **único pipeline**. Não criar `Dream Engine`, `Night Brain` ou segundo sistema para consolidação de memória.

## Fluxos existentes

```text
SCOUT
memory-linker-agent.mjs
→ last-report.json

ANALYST
memory-analyst-agent.mjs
→ analyst-decision.json

EXECUTOR
memory-executor-agent.mjs
→ auto-fixes documentais seguros já classificados
```

## Consolidação ociosa / Dream Review

`dream-review.mjs` adiciona um **modo de revisão isolada** ao mesmo módulo.

```text
experiência/evento
→ dream-review.mjs
→ proposta derivada
→ CANDIDATE
→ MetaLupa/contraprova
→ promoção canônica separada
```

Ele não altera sessão bruta, documento canônico, skill ou memória final. O resultado é candidato e `apply_allowed=false`.

Contrato conceitual: `docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md`.

## Formato mínimo de evento

Cada linha JSONL representa uma observação candidata:

```json
{
  "timestamp": "2026-08-14T12:00:00-03:00",
  "source": "chat:segredo-sol",
  "session_id": "session-001",
  "head_sha": "0123456789abcdef0123456789abcdef01234567",
  "kind": "RULE",
  "target": "docs/CONSCIENCIA/APRENDIZADOS.md",
  "claim": "hipótese ou aprendizado observado",
  "learning_delta": "o que deve mudar de modo reutilizável",
  "evidence": [{"type": "receipt", "value": "referência verificável"}]
}
```

Kinds aceitos: `MEMORY`, `SKILL`, `RULE`, `TEST`, `GUARDRAIL`, `CONTRACT`.

## Execução manual determinística

```text
node scripts/memory-linker/dream-review.mjs \
  --input <eventos.jsonl> \
  --output <proposta.json> \
  --head <HEAD_SHA_40_HEX>
```

O arquivo de saída é uma **proposta derivada**. Promoção para memória/skill/regra canônica continua sendo outra etapa, no mesmo contrato de autoridade e prova da CentralDark.

## Regras

```text
RAW_EXPERIENCE=IMMUTABLE_INPUT
DREAM_PROPOSAL=CANDIDATE_ONLY
DIRECT_CANONICAL_MUTATION=false
META_LUPA_BEFORE_PROMOTION=true
SAME_HEAD_REVALIDATION_REQUIRED=true
```

Agendamento não nasce aqui. Se/quanto o runtime local comprovar um scheduler canônico aplicável, reutilize-o. Sem scheduler provado, `SCHEDULE=UNPROVEN`.
