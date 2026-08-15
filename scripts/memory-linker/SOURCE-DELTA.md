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
