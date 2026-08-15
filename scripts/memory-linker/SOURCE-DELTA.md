# SOURCE_DELTA — entrada seletiva da mina existente

Este arquivo pertence ao pipeline canônico `scripts/memory-linker/`. Ele **não cria minerador, memória, fila, scheduler ou cérebro paralelo**. `SOURCE_DELTA` é a camada de entrada que decide se uma fonte externa trouxe informação material antes de acordar a refinaria já existente.

```text
SOURCE_DELTA_OWNER=MEMORY_LINKER_EXISTING_REFINERY
ONE_SOURCE_DELTA_ENGINE=true
SOURCE_ADAPTERS_NOT_SEPARATE_MINERS=true
SOURCE_IS_PROVENANCE_NOT_AUTHORITY=true
MINING_WITHIN_ACTIVE_INTENT=AUTOMATIC
ZERO_DEPLOY_BY_DEFAULT=true
```

## Contrato

Para cada fonte cadastrada preservar o último checkpoint observável:

```text
SOURCE_ID
LAST_SHA
LAST_RELEASE
ETAG
LAST_MODIFIED
CONTENT_HASH
CAPABILITY_FINGERPRINT
LAST_ABSORBED
OBSERVED_AT
```

O adapter só traduz a fonte para esse contrato. A decisão continua única:

```text
FONTE/API
→ CHECKPOINT ANTERIOR
→ WEBHOOK quando disponível
  OU conditional GET (ETag / Last-Modified)
  OU poll leve de fallback
→ 304 | fingerprint material igual
   → NO_CHANGE
   → HEAVY_WORK=0
→ DELTA_FOUND
   → extrair somente o delta
   → comparar com owner + consumidor
   → duplicado = DROP_DUPLICATE
   → gap real = CONTRAPROVA
   → passou = ABSORB
   → não passou = REJECT | PENDING_REFINERY
→ receipt
```

`ETag` sozinho é sensor de transporte; a decisão material usa SHA/release/content hash/capability fingerprint. Troca de ETag com conteúdo material idêntico não fabrica melhoria.

## Chat ativo e HUB

```text
CHAT_COM_INTENCAO_ATIVA
→ agente usa SOURCE_DELTA durante a própria missão
→ não pergunta qual melhoria/fatia quando a intenção já cobre leitura, comparação e correção reversível

SEM_CHAT
→ HUB/Admin
→ botão "Buscar / Aplicar Melhorias"
→ mesmo SOURCE_DELTA
→ adapters cadastrados
→ só delta material acorda a refinaria
```

O botão não transforma fonte em Writer. Absorção automática só existe quando o delta possui owner, consumidor, prova aplicável, segurança/licença aceitável e escopo autorizado. O restante fica `PENDING_REFINERY|REJECTED`, nunca falso verde.

## Adapters físicos atuais

O owner runtime existente `supabase/functions/catalog-sync/index.ts` foi convertido no ponto único de SOURCE_DELTA do HUB, sem criar nova Edge Function:

- `mcp-tools:centraldark`: usa o catálogo MCP existente e absorve deterministicamente metadata/schema de tools no catálogo quando há delta real;
- `github-release:<owner/repo>`: adapters cadastrados por `SOURCE_GITHUB_REPOS`; detectam release nova por API condicional e encaminham o delta para a refinaria sem autoabsorver código externo.

Adicionar GitHub, Hugging Face, papers ou outra origem significa **adicionar adapter neste contrato**, não criar outro minerador.

## ARTIFACT → CAPABILITY — qualquer matéria entra pela mesma refinaria

`scripts/memory-linker/artifact-capability.mjs` é um adapter do mesmo motor. Ele não cria `Skill Engine`, memória, fila ou promotor paralelo.

```text
PDF | TXT | MD | API | OPENAPI | SCHEMA | LOG | CODE | IMAGE | AUDIO | VIDEO | EXE | BIN
→ CLASSIFICAR ARTEFATO
→ EXTRAIR SOMENTE SINAIS OPERACIONAIS EVIDENCIADOS
→ CAPABILITY_FINGERPRINT
→ OWNER EXISTE?
→ DREAM REVIEW EXISTENTE
→ DEDUPE / CONTRAPROVA / METALUPA
→ SKILL CANDIDATA
→ PROVA DE OWNER + CONSUMIDOR + MEDIÇÃO
→ WRITER AUTORIZADO
→ CANÔNICO
```

A saída é pequena de propósito: classe do artefato, SHA/fingerprint, sinais de capacidade, owner alvo, necessidades ainda não provadas e referência `source-on-demand`. O arquivo inteiro não entra no boot nem vira skill por volume.

```text
ARTIFACT_IS_ORE=true
CAPABILITY_IS_GOLD=true
ARTIFACT_IS_AUTHORITY=false
DIRECT_SKILL_WRITE=false
DIRECT_CANONICAL_MUTATION=false
SOURCE_ON_DEMAND=true
```

### Binário e executável

O adapter **nunca executa um binário para descobrir o que ele faz**. `.exe/.dll/.bin/.so` sem interface documentada, `--help` capturado legitimamente ou invocação previamente observada produz:

```text
STATUS=INSUFFICIENT_EVIDENCE
NEEDS=INTERFACE_OR_HELP_OR_OBSERVED_INVOCATION
EXECUTE_ARTIFACT=false
```

Quando existe interface documentada, ele pode gerar apenas um candidato `EXECUTABLE_WRAPPER`: inputs, flags, outputs, erros e limites observáveis. Isso ainda não é prova de segurança nem autorização de execução.

### Documento, manual, PDF, mídia e imagem

Texto fornecido ou extraído por ferramenta confiável pode produzir sinais como `SAFETY_CONSTRAINTS`, `PROCEDURE`, `ERROR_CONTRACT`, `MAINTENANCE`, `PRIVILEGE_OR_PERMISSION`, `APPLICATION_CONTROL` e `OBSERVABILITY_OR_RESPONSE`.

PDF/binário não sofre OCR implícito nem interpretação mágica: sem texto extraído/evidência observável, fica insuficiente. Áudio/vídeo exigem transcrição ou observação verificada; imagem exige descrição/observação verificada. A imagem, a transcrição ou o manual continuam sendo **fonte**, nunca PASS.

### API, schema, log e código

- OpenAPI/Swagger → `API_CONTRACT` candidato;
- schema estruturado → `DATA_SCHEMA` candidato;
- log → `DIAGNOSTIC_SIGNAL` candidato, sem transformar erro em verdade causal;
- código-fonte → `CODE_INTERFACE` candidato, apontando para owner/testes em vez de duplicar código na skill.

### Owner não é inventado

Se o adapter encontra capacidade mas o owner não foi localizado:

```text
STATUS=OWNER_UNRESOLVED
DIRECT_WRITE=0
```

Só depois de localizar owner e consumidor reais o evento entra como `kind=SKILL` no `Dream Review`. Fonte HTTP externa é rebaixada pelo próprio Dream Review para `EXTERNAL_UNTRUSTED`, portanto fica em `QUARANTINE` até confirmação independente.

O CLI canônico `dream-review-run.mjs` aceita `--artifact` e injeta o candidato no **mesmo** Dream Review. `--artifact-metadata` pode fornecer texto extraído/help/transcrição já observados; nenhum desses campos concede autoridade.

## Erro com endereço — nunca silêncio

```text
NO_SILENT_ERROR=true
EMPTY_CATCH=FORBIDDEN
SWALLOWED_PROMISE_REJECTION=FORBIDDEN
FALSE_OK_AFTER_FAILURE=FORBIDDEN
```

Todo erro material deve recuperar explicitamente ou produzir:

```text
ERROR_ID
COMPONENT
OWNER
OPERATION
EXACT_STAGE
CAUSE_CLASS
EVIDENCE_REF
SAFE_ERROR
RETRYABLE
AUTO_RECOVERY_ATTEMPTED
NEXT_MACHINE_ACTION
```

Se houver bloqueio humano real, acrescentar somente:

```text
FERIDA
ONDE
ACAO_HUMANA_MINIMA
```

Segredo nunca entra no receipt. O scanner `scripts/lupa/no-silent-error-scan.mjs` bloqueia padrões sintáticos inequívocos de erro engolido no código rastreado; classes semânticas mais amplas continuam sendo expandidas por regressão quando forem observadas.

### Dívida histórica não vira falso verde

A primeira varredura do gate encontrou dívida anterior à introdução desta regra. Corrigir centenas de ocorrências em owners diferentes dentro de uma única missão violaria `ONE_WRITER_PER_SCOPE` e misturaria código runtime, testes, builds gerados e supressões deliberadas sem arqueologia causal.

Por isso o gate funciona como **catraca progressiva**, sem esconder a dívida:

```text
NO_SILENT_ERROR_RATCHET=true
NEW_SILENT_ERROR_IN_CHANGED_CODE=BLOCK
LEGACY_SILENT_ERROR=VISIBLE_DEBT
LEGACY_DEBT != PASS
GLOBAL_NO_SILENT_ERROR=UNPROVEN_WHILE_LEGACY_DEBT_EXISTS
TEST_FIXTURE_OR_GENERATED_COPY != RUNTIME_OWNER
```

Em PR, o scanner mede todo código acionável e separa:

```text
ARQUIVO TOCADO + PADRAO SILENCIOSO
→ NEW_SILENT_ERROR
→ FAIL

ARQUIVO NAO TOCADO + PADRAO SILENCIOSO
→ LEGACY_DEBT + caminho + linha
→ não fabrica PASS global
→ owner deve remediar quando aquela ferida entrar em escopo
```

Quando um owner com dívida for tocado, a própria catraca deixa de tratá-la como legado e exige correção antes da promoção. Assim a Casa só pode manter ou reduzir o conjunto observável de silêncio; nunca aumentá-lo. Testes que deliberadamente exercitam exceção, fixtures, documentação, backups e cópias `dist`/minificadas ficam fora do denominador runtime para não contar a mesma ferida duas vezes nem transformar contraprova em bug.

```text
SILENT_ERROR_DEBT_AFTER <= SILENT_ERROR_DEBT_BEFORE
NEW_SILENT_ERROR_ALLOWED=ZERO
LEGACY_DEBT_MUST_REMAIN_ADDRESSED=true
```

## Menos é Mais

```text
FULL_STATE_DUMP=NO
MATERIAL_DELTA=YES
POPULARITY_IS_NOT_PROOF=true
STARS_ARE_DISCOVERY_SIGNAL_ONLY=true
NO_NEW_INFORMATION=STOP
FIXED_POINT=NO_MATERIAL_DELTA_AFTER_REMEASURE
```

A Casa não pergunta “o que está bombando?”. Ela pergunta: **o que mudou e melhora uma capacidade real minha sob prova?**
