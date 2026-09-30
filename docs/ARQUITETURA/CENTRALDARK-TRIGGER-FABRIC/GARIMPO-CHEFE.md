# GARIMPO-CHEFE — contrato operacional

Papel: reservatório físico de minério do Chefe em `E:\CentralDark\_MAPA_CASA\GARIMPO-CHEFE`.

Não é autoridade, não é segundo cérebro e não cria sistema paralelo.

Fluxo:

GARIMPO-CHEFE
→ detectar entrada nova
→ classificar
→ deduplicar
→ PEGATUDO extrai capacidades
→ CARACOL percorre relações
→ localizar owner existente
→ medir implementação no GitHub
→ medir runtime quando aplicável
→ MetaLupa procura contraprova
→ Reality Judge sentencia
→ capacidade provada cristaliza
→ lacuna provada volta ao owner existente
→ nova rodada
→ fixed point quando nenhuma novidade material aparece.

Leis:
- CURRENT > HISTORY
- UNKNOWN != PASS
- OBSERVAR != PROVAR
- CONFIGURAR != FUNCIONAR
- COMMITAR != CORRIGIR
- PASS_HISTORICO != PASS_ATUAL
- LOCAL != VPS
- SIMILARIDADE != VERDADE
- REUSE_BEFORE_CREATE
- ONE_SYSTEM_ONLY
- ONE_WRITER_PER_SCOPE

Fronteira atual:
- `GARIMPO-CHEFE` como fonte de garimpo: PROVADO por material salvo.
- Wiring automático completo da pasta até cristalização: NOT_PROVEN.
- Runtime global: NOT_PROVEN sem receipt SHA→artefato/deployment→runtime.

## Pós-cristalização — coleta de lixo provada

Depois que o minério foi classificado, deduplicado, absorvido pelo owner e cristalizado com evidência, o GARIMPO pode descartar somente **cópias derivadas comprovadamente reproduzíveis**.

Fluxo obrigatório:

```text
MINÉRIO
→ HASH
→ DEDUPE
→ CLASSIFY
→ OWNER
→ CRYSTALLIZE
→ COUNTERPROOF
→ GC_CANDIDATE
→ DRY_RUN
→ APPLY
→ REMEASURE_FREE_SPACE
→ RECEIPT
```

Executor subordinado a este contrato:

```text
scripts/casa/garimpo-proof-gc.ps1
```

Classes permitidas para GC automático:

```text
EMPTY_DERIVED_DIR
EXACT_DUPLICATE_COPY
REPRODUCIBLE_EXTRACTED_COPY
EPHEMERAL_NPX_CACHE_NOT_IN_USE
```

Classes que **nunca** viram lixo por inferência:

```text
SECRET_OR_CREDENTIAL
UNIQUE_SOURCE
UNPROVED_EXTRACTION
OUT_OF_SCOPE_PERSONAL_FILE
ACTIVE_RUNTIME_PATH
UNKNOWN
```

Invariantes:

```text
DRY_RUN_DEFAULT=true
APPLY_REQUIRES_EXPLICIT_SWITCH=true
HASH_OR_STREAM_IDENTITY_REQUIRED=true
ONE_COPY_MUST_SURVIVE=true
PROTECTED_MATERIAL_FAILS_CLOSED=true
PROCESS_IN_USE_BLOCKS_CACHE_DELETE=true
CRYSTALLIZED != DELETE_UNLESS_REPRODUCIBLE
UNKNOWN != DELETE
GC_RESULT_REQUIRES_RECEIPT=true
```

O objetivo é impedir reacúmulo sem transformar limpeza em perda de memória: **bruto único permanece; cópia derivada provada pode sair**.
