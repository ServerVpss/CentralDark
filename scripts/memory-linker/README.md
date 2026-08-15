# Memory Linker — pipeline canônico de memória

Este diretório é um **único pipeline**. Não criar `Dream Engine`, `Night Brain` ou segundo sistema para consolidação de memória.

## Fluxos existentes

```text
SCOUT
memory-linker-agent.mjs
→ mede gaps
→ fingerprint estável dos achados
→ mesmo fingerprint: NO_NEW_INFORMATION / STOP
→ delta: last-report.json

ANALYST
memory-analyst-agent.mjs
→ consome findingFingerprint
→ mesmo fingerprint já classificado: STOP
→ delta: analyst-decision.json

EXECUTOR
memory-executor-agent.mjs
→ auto-fixes documentais seguros já classificados
→ --dry-run = preview sem escrita/commit/push
→ mutação real = escrita atômica
→ receipt separa arquivo / commit / push
```

Relatórios/decisões legados sem fingerprint são migrados deterministicamente na leitura; a evolução do pipeline não exige apagar estado anterior nem fabricar erro de migração.

## Regra de despertar por informação

Scheduler rodar não significa que um agente caro precisa trabalhar de novo.

```text
SCAN
→ FINGERPRINT_DOS_ACHADOS
→ IGUAL_AO_ANTERIOR
   → NO_NEW_INFORMATION
   → NÃO REGRAVAR RELATÓRIO
   → NÃO NOTIFICAR
   → NÃO ACORDAR PRÓXIMA ETAPA POR REPETIÇÃO
→ DIFERENTE
   → DELTA
   → MATERIALIZAR
   → CONSUMIDOR SEGUINTE
```

A ordem do filesystem é normalizada antes do fingerprint; reordenação sem mudança semântica não fabrica aprendizado.

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
→ elegibilidade de absorção
→ Writer autorizado
```

O propositor não altera sessão bruta, documento canônico, skill ou memória final. `apply_allowed=false` e `direct_canonical_mutation=false` continuam sendo invariantes do Dream Review.

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
→ AUTO_ABSORB_ELIGIBLE=false

EXTERNAL_UNTRUSTED
+ TOOL_MEASURED|HUMAN_AUTHORITY|INTERNAL com prova aplicável
→ CANDIDATE
```

A proveniência externa permanece mesmo depois da confirmação. A dependência operacional da fonte não permanece.

## Elegibilidade de absorção automática

O Dream Review pode marcar ouro como **elegível** para absorção sem devolver triagem mecânica ao CHEFE. Elegibilidade não é autoaprovação nem escrita direta.

```text
CANDIDATE
+ FONTE_CONFIRMADA/INDEPENDENTE
+ CONSUMER_REACHABILITY=EVIDENCED
→ AUTO_ABSORB_ELIGIBLE=true

AUTO_ABSORB_ELIGIBLE
+ DONO_CANÔNICO EXISTENTE
+ ESCOPO REVERSÍVEL JÁ AUTORIZADO
+ WRITER CERTO
+ SAME_HEAD / PROVA APLICÁVEL
→ ABSORÇÃO
```

Se faltar consumidor, confirmação independente, dono existente ou escopo autorizado, permanece candidato. O propositor não ganha caneta só porque encontrou ouro.

```text
ELIGIBLE != APPLIED
PROPOSER != WRITER_AUTOMATICAMENTE
WRITER != JUDGE
```

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

Ausência de `consumer_evidence` não apaga o candidato; deixa `consumer_reachability=UNPROVEN` e impede usar a existência do código como prova de comportamento ou marcar autoabsorção como elegível.

## Escrita sem churn

`fs-safe.mjs` é o helper compartilhado do módulo para artefatos derivados:

```text
VALID_PAYLOAD
→ BYTE_COMPARE
→ IGUAL: UNCHANGED / sem mtime novo
→ DIFERENTE: temp sibling → fsync → atomic rename → UPDATED
```

Isso separa **execução** de **mutação real** e reduz churn que pareceria aprendizado novo sem existir delta.

## Dry-run verdadeiro

`memory-executor-agent.mjs --dry-run` calcula o que mudaria, mas não escreve arquivo, não faz `git add`, não cria commit e não faz push.

```text
DRY_RUN
→ WOULD_CHANGE + SKIPPED + DECISION_FINGERPRINT
→ ZERO_WRITE
→ ZERO_COMMIT
→ ZERO_PUSH
```

Preview nunca pode ser contado como mudança aplicada.

## Receipt factual de commit/push

O Executor não transforma tentativa em sucesso:

```text
ARQUIVO = UPDATED|UNCHANGED|FAILED
COMMIT  = COMMITTED|NO_DIFF|FAILED|NOT_NEEDED
PUSH    = PUSHED|FAILED|NOT_NEEDED|NOT_ATTEMPTED
```

`PUSH=FAILED` produz execução `PARTIAL`; a notificação não diz “enviado” quando apenas o arquivo local ou commit existe.

## Execução manual determinística

```text
node scripts/memory-linker/dream-review.mjs \
  --input <eventos.jsonl> \
  --output <proposta.json> \
  --head <HEAD_SHA_40_HEX>
```

A saída declara `AUTO_ABSORB_ELIGIBLE=<n>` e `WRITE=UPDATED|UNCHANGED`. `UNCHANGED` significa que a execução encontrou exatamente o mesmo resultado e não regravou o arquivo.

O arquivo de saída é uma **proposta derivada**. A absorção canônica continua pertencendo ao Writer autorizado no dono certo, sob o mesmo contrato de prova da CentralDark.

## Prova no gate existente

Não há workflow novo para este módulo. `.github/workflows/lupa-conformance.yml` é o consumidor canônico da regressão e deve executar:

```text
node --check fs-safe + dream-review + Scout + Analyst + Executor
node --test dream-review.test.mjs
```

Uma mudança no memory-linker que quebra essa fronteira deve ficar vermelha antes de ser chamada de evolução.

## Regras

```text
RAW_EXPERIENCE=IMMUTABLE_INPUT
DREAM_PROPOSAL=CANDIDATE_ONLY
DIRECT_CANONICAL_MUTATION=false
META_LUPA_BEFORE_PROMOTION=true
SAME_HEAD_REVALIDATION_REQUIRED=true
SOURCE_IDENTITY_IS_NOT_AUTHORITY=true
EXTERNAL_UNTRUSTED_ALONE_NEVER_AUTO_PROMOTE=true
EVENT_TIME_NE_OBSERVED_AT=true
CONSUMER_EVIDENCE_REQUIRED_FOR_CAPABILITY_CLAIM=true
AUTO_ABSORB_REQUIRES_PROVEN_OWNER_CONSUMER_AUTHORIZED_SCOPE=true
PROPOSER_DIRECT_WRITE_FORBIDDEN=true
NO_CHANGE_NE_NOISE=true
NO_NEW_INFORMATION=STOP=true
DRY_RUN_IS_NOT_APPLY=true
COMMIT_IS_NOT_PUSH=true
LEGACY_STATE_MIGRATES_WITHOUT_RESET=true
```

Agendamento não nasce aqui. Se/quanto o runtime local comprovar um scheduler canônico aplicável, reutilize-o. Sem scheduler provado, `SCHEDULE=UNPROVEN`.
