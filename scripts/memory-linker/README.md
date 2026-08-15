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

## Descoberta determinística de padrão e autonomia

`pattern-discovery.mjs` **não cria outro cérebro nem outro minerador**. Ele recebe somente candidatos já sanitizados pelo Dream Review e procura recorrência entre **fingerprints diferentes** no mesmo `kind` + mesmo `target`.

A arquitetura padrão passa a ser:

```text
MATÉRIA BRUTA
→ DREAM REVIEW
→ NORMALIZAR + SANITIZAR + PROVENIÊNCIA + HEAD
→ DEDUPE EXATO POR FINGERPRINT
→ CANDIDATOS
→ PATTERN DISCOVERY
→ COMPLETE-LINK + JACCARD DETERMINÍSTICO
→ PADRÃO CANDIDATO
→ CONTRAPROVA / OWNER / CONSUMER / TOOL_MEASURED
→ AUTONOMY_QUEUE
→ HANDOFF_TO_AUTHORIZED_WRITER
→ SAME_HEAD + META_LUPA + PROOF OWNERSHIP QUANDO APLICÁVEL
→ MENOR COSTURA
→ TESTE
→ OURO CANÔNICO
```

### Por que `complete-link`

Um padrão só cresce quando **cada membro novo** é compatível com todos os membros já agrupados. Isso evita corrente frouxa do tipo `A parece B`, `B parece C`, logo `A=C` sem prova.

A similaridade textual é apenas um **sensor de recorrência**:

```text
SIMILARIDADE != PROVA CAUSAL
PADRÃO != VERDADE
RECORRÊNCIA != INDEPENDÊNCIA DE EVIDÊNCIA
```

Por isso o detector é conservador por padrão:

- exige mesmo `kind`;
- exige mesmo `target`/dono esperado;
- exige fingerprints distintos;
- usa tokens normalizados sem depender de acento;
- exige pelo menos 3 tokens materiais compartilhados;
- exige Jaccard mínimo de `0.60` em todos os pares do cluster;
- não atravessa targets apenas porque a frase parece semelhante;
- fonte externa em quarentena continua sem handoff automático.

### Fila de autonomia sem roubar a caneta

Quando todos os membros de um padrão já são `auto_absorb_eligible`, existe diversidade mínima de sessão + origem e o padrão sobrevive ao detector, a saída pode conter:

```text
AUTONOMY_QUEUE
→ action=HANDOFF_TO_AUTHORIZED_WRITER
→ apply_directly=false
→ SAME_HEAD_REVALIDATION
→ WRITER_SCOPE_MATCH
→ AUTHORIZED_REVERSIBLE_SCOPE
→ META_LUPA
→ PROOF_OWNERSHIP_WHEN_APPLICABLE
```

Isso automatiza **descoberta + roteamento** sem misturar papéis:

```text
MINERADOR DESCOBRE
→ FILA ROTEIA
→ WRITER COSTURA
→ TESTE/JUDGE PROVA
```

O minerador nunca usa recorrência para se promover a Writer e nunca grava o canônico diretamente.

### Façade única para rodar a arquitetura

`dream-review-run.mjs` compõe o Dream Review existente com o detector de padrões sem duplicar a lógica de normalização/promoção.

```text
node scripts/memory-linker/dream-review-run.mjs \
  --input <eventos.jsonl> \
  --output <proposta.json> \
  --head <HEAD_SHA_40_HEX>
```

A saída acrescenta `pattern_discovery.patterns` e `pattern_discovery.autonomy_queue`. `DIRECT_APPLY=0` permanece obrigatório.

O agendamento físico continua pertencendo ao scheduler/cron canônico quando comprovado no runtime; este módulo não inventa segundo scheduler. Sem scheduler medido, `SCHEDULE=UNPROVEN`.

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

Fluxo base, preservado para compatibilidade:

```text
node scripts/memory-linker/dream-review.mjs \
  --input <eventos.jsonl> \
  --output <proposta.json> \
  --head <HEAD_SHA_40_HEX>
```

Fluxo padrão com descoberta de padrão/autonomia:

```text
node scripts/memory-linker/dream-review-run.mjs \
  --input <eventos.jsonl> \
  --output <proposta.json> \
  --head <HEAD_SHA_40_HEX>
```

A saída base declara `AUTO_ABSORB_ELIGIBLE=<n>`. A façade acrescenta `PATTERNS=<n>` e `AUTO_HANDOFF=<n>`. `UNCHANGED` significa que a execução encontrou exatamente o mesmo resultado e não regravou o arquivo.

O arquivo de saída é uma **proposta derivada**. A absorção canônica continua pertencendo ao Writer autorizado no dono certo, sob o mesmo contrato de prova da CentralDark.

## Prova no gate existente

Não há workflow novo para este módulo. `.github/workflows/lupa-conformance.yml` é o consumidor canônico da regressão e deve executar:

```text
node --check delta-core + fs-safe + dream-review + pattern-discovery + dream-review-run + Scout + Analyst + Executor
node --test dream-review + pattern-discovery + dream-review-run + fs-safe + delta-core
```

Uma mudança no memory-linker que quebra essa fronteira deve ficar vermelha antes de ser chamada de evolução.

## Regras

```text
RAW_EXPERIENCE=IMMUTABLE_INPUT
DREAM_PROPOSAL=CANDIDATE_ONLY
DIRECT_CANONICAL_MUTATION=false
PATTERN_DISCOVERY=DETERMINISTIC
PATTERN_IS_PROOF=false
PATTERN_SAME_KIND_REQUIRED=true
PATTERN_SAME_TARGET_REQUIRED=true
PATTERN_COMPLETE_LINK_REQUIRED=true
AUTONOMY_HANDOFF_ONLY_AFTER_MEMBER_ELIGIBILITY=true
AUTONOMY_QUEUE_DIRECT_APPLY=false
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
