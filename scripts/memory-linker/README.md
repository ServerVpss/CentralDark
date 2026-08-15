# Memory Linker — pipeline canônico de memória

Este diretório é um **único pipeline**. Não criar `Dream Engine`, `Night Brain` ou segundo sistema para consolidação de memória.

## Fluxos existentes

```text
SCOUT
memory-linker-agent.mjs
→ mede gaps
→ delta-core.mjs normaliza + calcula fingerprint
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
→ confina alvo à raiz física de docs/CONSCIENCIA
→ mutação real = escrita atômica
→ receipt separa arquivo / commit / push
```

Relatórios/decisões legados sem fingerprint são migrados deterministicamente na leitura; a evolução do pipeline não exige apagar estado anterior nem fabricar erro de migração.

## Regra de despertar por informação

Scheduler rodar não significa que um agente caro precisa trabalhar de novo.

`delta-core.mjs` concentra a regra pura para Scout e Analyst não divergirem:

```text
ACHADOS
→ ORDENAR + DEDUPLICAR
→ FINGERPRINT ESTÁVEL
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

A ordem do filesystem, ordem das chaves e repetição do mesmo achado não podem fabricar aprendizado. Os testes de `delta-core` exigem que reordenação produza o mesmo fingerprint e informação material nova produza fingerprint diferente.

## Consolidação ociosa / Dream Review

`dream-review.mjs` adiciona um **modo de revisão isolada** ao mesmo módulo.

```text
experiência/evento
→ normalizar tempo + proveniência
→ calcular classe efetiva da fonte
→ dream-review.mjs
→ proposta derivada
→ CANDIDATE | QUARANTINE
→ MetaLupa/contraprova
→ prova verificada de dono + consumidor
→ confirmação TOOL_MEASURED
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
  "source": "test:reproducao-local",
  "source_class": "TOOL_MEASURED",
  "session_id": "session-001",
  "head_sha": "0123456789abcdef0123456789abcdef01234567",
  "kind": "RULE",
  "target": "docs/CONSCIENCIA/APRENDIZADOS.md",
  "claim": "hipótese ou aprendizado observado",
  "learning_delta": "o que deve mudar de modo reutilizável",
  "evidence": [{"type": "receipt", "value": "referência verificável"}],
  "owner_evidence": [{"type":"owner","ref":"dono-canônico","status":"PASS","verified":true}],
  "consumer_evidence": [{"type":"test","ref":"consumer-path-pass","status":"PASS","verified":true}]
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

`source_class` é uma alegação do evento, não autoridade por si só. A classe efetiva pode ser reduzida pelo formato da origem.

## Fonte externa não se autopromove pelo rótulo

Origem com forma externa (`https://`, `web:`, `email:`, `external:`, `fetched:`, `scrape:` etc.) é classificada efetivamente como `EXTERNAL_UNTRUSTED`, mesmo se o payload tentar declarar `HUMAN_AUTHORITY` ou outra classe superior.

```text
CALLER_LABEL != AUTHORITY
EXTERNAL_SHAPE + CLAIMED_HUMAN_AUTHORITY
→ EFFECTIVE_SOURCE_CLASS=EXTERNAL_UNTRUSTED
→ QUARANTINE
```

O relatório preserva classe alegada, classe efetiva e se houve clamp para auditoria.

## Quarentena de matéria externa

```text
EXTERNAL_UNTRUSTED_ONLY
→ QUARANTINE
→ INDEPENDENT_CONFIRMATION_REQUIRED
→ AUTO_ABSORB_ELIGIBLE=false

EXTERNAL_UNTRUSTED
+ TOOL_MEASURED com prova aplicável
→ CANDIDATE
```

A proveniência externa permanece mesmo depois da confirmação. A dependência operacional da fonte não permanece.

## Evidência declarada ≠ evidência verificada

`owner_evidence` e `consumer_evidence` podem carregar contexto, mas só contam para elegibilidade quando o registro possuir:

```text
TYPE ∈ TEST|RECEIPT|RUNTIME|OWNER|CONSUMER
VERIFIED=true
STATUS=PASS
REF não vazio
```

Objeto solto como `{type:"test", value:"pass"}` não fecha consumidor nem dono.

```text
DECLARED_EVIDENCE != VERIFIED_EVIDENCE
```

## Elegibilidade de absorção automática

O Dream Review pode marcar ouro como **elegível** para absorção sem devolver triagem mecânica ao CHEFE. Elegibilidade não é autoaprovação nem escrita direta.

```text
CANDIDATE
+ TOOL_MEASURED
+ OWNER_REACHABILITY=EVIDENCED
+ CONSUMER_REACHABILITY=EVIDENCED
→ AUTO_ABSORB_ELIGIBLE=true

AUTO_ABSORB_ELIGIBLE
+ DONO CANÔNICO EXISTENTE
+ ESCOPO REVERSÍVEL JÁ AUTORIZADO
+ WRITER CERTO
+ SAME_HEAD / PROVA APLICÁVEL
→ ABSORÇÃO
```

Se faltar confirmação medida, dono, consumidor ou escopo autorizado, permanece candidato. O propositor não ganha caneta só porque encontrou ouro.

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

`target` é obrigatório. Consumidor e dono precisam ser evidenciados quando o claim depender de alcance real.

```text
CODIGO_EXISTE != CAPACIDADE_PROVADA
MECANISMO_EXISTE != CONSUMIDOR_PROVADO
CAPABILITY_CLAIM → CONSUMER_EVIDENCE
AUTO_ABSORB → OWNER_EVIDENCE + CONSUMER_EVIDENCE + TOOL_MEASURED
```

## Escrita sem churn e sem escape físico

`fs-safe.mjs` é o helper compartilhado do módulo para artefatos derivados e para validar arquivos que o Executor pode tocar.

```text
ALVO_DE_CONTEUDO
→ LSTAT
→ SYMLINK? REJEITA
→ ARQUIVO_REGULAR? EXIGE
→ REALPATH DENTRO DA RAIZ? EXIGE
→ SÓ ENTÃO LER/ESCREVER
```

Symlink `.md` dentro de `docs/CONSCIENCIA` apontando para fora não é seguido: vira achado `unsafePaths`, o Analyst classifica como crítico e o Executor não toca.

Para escrita derivada:

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
node --check delta-core + fs-safe + dream-review + Scout + Analyst + Executor
node --test dream-review.test.mjs + fs-safe.test.mjs + delta-core.test.mjs
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
CALLER_LABEL_CANNOT_ELEVATE_EXTERNAL_SOURCE=true
EXTERNAL_UNTRUSTED_ALONE_NEVER_AUTO_PROMOTE=true
DECLARED_EVIDENCE_IS_NOT_VERIFIED_EVIDENCE=true
EVENT_TIME_NE_OBSERVED_AT=true
CONSUMER_EVIDENCE_REQUIRED_FOR_CAPABILITY_CLAIM=true
AUTO_ABSORB_REQUIRES_TOOL_MEASURED_OWNER_CONSUMER_AUTHORIZED_SCOPE=true
PROPOSER_DIRECT_WRITE_FORBIDDEN=true
NO_CHANGE_NE_NOISE=true
NO_NEW_INFORMATION=STOP=true
FINGERPRINT_IS_ORDER_INVARIANT=true
SYMLINK_CONTENT_PATH=FORBIDDEN
PHYSICAL_ROOT_ESCAPE=FORBIDDEN
DRY_RUN_IS_NOT_APPLY=true
COMMIT_IS_NOT_PUSH=true
LEGACY_STATE_MIGRATES_WITHOUT_RESET=true
```

Agendamento não nasce aqui. Se/quanto o runtime local comprovar um scheduler canônico aplicável, reutilize-o. Sem scheduler provado, `SCHEDULE=UNPROVEN`.
