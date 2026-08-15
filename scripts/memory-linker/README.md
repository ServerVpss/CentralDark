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
→ normalizar tempo + proveniência
→ classificar confiança da fonte
→ dream-review.mjs
→ proposta derivada
→ CANDIDATE | QUARANTINE
→ MetaLupa/contraprova
→ prova de consumidor
→ promoção canônica separada
```

Ele não altera sessão bruta, documento canônico, skill ou memória final. O resultado continua `apply_allowed=false`.

Contrato conceitual: `docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md`.

## Formato mínimo de evento

Cada linha JSONL representa uma observação candidata:

```json
{
  "event_time": "2026-08-14T12:00:00-03:00",
  "observed_at": "2026-08-14T12:03:00-03:00",
  "source": "chat:segredo-sol",
  "source_class": "HUMAN_AUTHORITY",
  "session_id": "session-001",
  "head_sha": "0123456789abcdef0123456789abcdef01234567",
  "kind": "RULE",
  "target": "docs/CONSCIENCIA/APRENDIZADOS.md",
  "claim": "hipótese ou aprendizado observado",
  "learning_delta": "o que deve mudar de modo reutilizável",
  "evidence": [{"type": "receipt", "value": "referência verificável"}],
  "consumer_evidence": [{"type": "test", "value": "consumidor-real-pass"}]
}
```

Compatibilidade: `timestamp` continua aceito como fallback de `event_time` e `observed_at`.

Kinds aceitos: `MEMORY`, `SKILL`, `RULE`, `TEST`, `GUARDRAIL`, `CONTRACT`.

Classes de fonte:

```text
HUMAN_AUTHORITY
TOOL_MEASURED
INTERNAL
EXTERNAL_UNTRUSTED
UNDECLARED
```

`source_class` registra a fronteira epistemológica; **nome da fonte não concede autoridade**.

## Quarentena de matéria externa

Material vindo somente de `EXTERNAL_UNTRUSTED` pode ser minerado, mas não vira candidato promocional normal por repetição ou aparência convincente:

```text
EXTERNAL_UNTRUSTED_ONLY
→ QUARANTINE
→ INDEPENDENT_CONFIRMATION_REQUIRED

EXTERNAL_UNTRUSTED
+ TOOL_MEASURED|HUMAN_AUTHORITY|INTERNAL com prova aplicável
→ CANDIDATE
```

A proveniência externa permanece mesmo depois da confirmação. A dependência operacional da fonte não permanece.

## Tempo do fato ≠ tempo da observação

```text
EVENT_TIME  = quando o fato/experiência ocorreu
OBSERVED_AT = quando a Casa observou/ingeriu
```

Backfill, sincronização atrasada e importação nunca devem fabricar causalidade usando apenas `mtime`/hora de ingestão.

## Consumidor real

`target` é obrigatório. `consumer_evidence` registra prova de que a capacidade chega a um consumidor observável.

```text
CODIGO_EXISTE != CAPACIDADE_PROVADA
MECANISMO_EXISTE != CONSUMIDOR_PROVADO
CAPABILITY_CLAIM → CONSUMER_EVIDENCE
```

Ausência de `consumer_evidence` não apaga o candidato; deixa `consumer_reachability=UNPROVEN` e impede usar a existência do código como prova de comportamento.

## Escrita sem churn

`fs-safe.mjs` é o helper compartilhado do módulo para artefatos derivados:

```text
VALID_PAYLOAD
→ BYTE_COMPARE
→ IGUAL: UNCHANGED / sem mtime novo
→ DIFERENTE: temp sibling → fsync → atomic rename → UPDATED
```

Isso separa **execução** de **mutação real** e reduz churn que pareceria aprendizado novo sem existir delta.

## Execução manual determinística

```text
node scripts/memory-linker/dream-review.mjs \
  --input <eventos.jsonl> \
  --output <proposta.json> \
  --head <HEAD_SHA_40_HEX>
```

A saída declara `WRITE=UPDATED|UNCHANGED`. `UNCHANGED` significa que a execução encontrou exatamente o mesmo resultado e não regravou o arquivo.

O arquivo de saída é uma **proposta derivada**. Promoção para memória/skill/regra canônica continua sendo outra etapa, no mesmo contrato de autoridade e prova da CentralDark.

## Regras

```text
RAW_EXPERIENCE=IMMUTABLE_INPUT
DREAM_PROPOSAL=CANDIDATE_ONLY
DIRECT_CANONICAL_MUTATION=false
META_LUPA_BEFORE_PROMOTION=true
SAME_HEAD_REVALIDATION_REQUIRED=true
SOURCE_IDENTITY_IS_NOT_AUTHORITY=true
EXTERNAL_UNTRUSTED_NEVER_AUTO_PROMOTE=true
EVENT_TIME_NE_OBSERVED_AT=true
CONSUMER_EVIDENCE_REQUIRED_FOR_CAPABILITY_CLAIM=true
NO_CHANGE_NE_NOISE=true
```

Agendamento não nasce aqui. Se/quanto o runtime local comprovar um scheduler canônico aplicável, reutilize-o. Sem scheduler provado, `SCHEDULE=UNPROVEN`.
