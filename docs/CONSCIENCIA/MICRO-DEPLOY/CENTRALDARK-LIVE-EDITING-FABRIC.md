# CENTRALDARK LIVE EDITING FABRIC

status: CANONICAL_DEFAULT_WORK_MODE  
authority: SEGREDO/CHEFE  
owner: docs/CONSCIENCIA/MICRO-DEPLOY/  
crystallized_at: 2026-09-25T22:05:00Z

## Intenção

O padrão operacional da CentralDark é trabalhar vivo: editar, botar no runtime, ver o efeito real, refinar, comprimir e repetir até ponto fixo.

Isso não é bypass irresponsável nem fallback de emergência. É o modo normal de criação e refinamento da Casa.

```text
CHEFE_EDITA
→ MAIN_OU_DELTA_RASTREAVEL
→ SINGLE_REUSABLE_WORKTREE
→ OWNER_EXATO
→ TESTE_MINIMO_APLICAVEL
→ MICRODEPLOY_CAUSAL
→ RUNTIME_VIVO
→ PROVA_DO_EFEITO
→ RECEIPT
→ REFINA
→ COMPRIME
→ REPETE
→ PONTO_FIXO
```

## Relação com CI/CD

```text
MVP_FAST_LOOP = PADRAO_DE_TRABALHO
CI_DEEP_LOOP = PRENSA_DE_CONTRAPROVA_QUANDO_CHEFE_MANDAR
DEPLOY_CANONICO = GUARDA_E_ESTEIRA_MAIOR
MICRODEPLOY_CAUSAL = CAMINHO_NORMAL_DE_REFINO_VIVO
```

O CI/CD pesado continua existindo, mas não bloqueia o ciclo criativo rápido por padrão. Quando o CHEFE mandar “torcer a uva”, o sistema entra em loop profundo de CI/gates/refino até sair ponto fixo.

## Secret transit operacional

Segredos temporários fornecidos pelo CHEFE são tratados como valor de passagem, nunca como conteúdo de registro.

```text
SECRET_EPHEMERAL_AS_TRANSIT=true
USE_SECRET_ONLY_FOR_REQUESTED_OWNER=true
NO_SECRET_ECHO=true
NO_SECRET_COMMIT=true
NO_SECRET_RECEIPT_VALUE=true
NO_SECRET_MEMORY=true
NO_SECRET_LOG_VALUE=true
SCRUB_CONTROLLED_LOGS_AFTER_USE=true
ROTATE_OR_DISCARD_AFTER_USE=true
```

Receipts podem registrar nome lógico, owner, destino e resultado, mas nunca o valor secreto.

## Worktree

```text
CANONICAL_SCRATCH_WORKTREE=/root/CentralDark/_worktrees/main-pinned-runtime-fastpath
SINGLE_REUSABLE_WORKTREE=true
WORKTREE_IS_DISPOSABLE=true
LOCK_REQUIRED=true
RESET_BEFORE_USE=true
RESET_AFTER_USE=true
DIRTY_WORKTREE_FORBIDDEN_AT_HANDOFF=true
RUNTIME_IS_NOT_SCRATCH=true
CASA_IS_NOT_SCRATCH=true
```

`git reset --hard` e `git clean -fdx` só podem operar no realpath exato do scratch canônico.

## Loop

```text
LOCK
→ ASSERT_PATH
→ FETCH MAIN
→ RESET/CLEAN SCRATCH
→ APLICAR DELTA
→ TESTE MINIMO
→ MICRODEPLOY OWNER
→ RESTART ISOLADO SE PRECISO
→ HEALTH/EFEITO
→ RECEIPT
→ RESET/CLEAN SCRATCH
→ ASSERT CLEAN
→ UNLOCK
```

## Cadeados

```text
UNKNOWN != PASS
ACTION != PROOF
MERGED != DEPLOYED
DOCUMENTED != EXECUTED
RUNTIME_EFFECT_REQUIRED_FOR_RUNTIME_CLAIM=true
GROSS_DELTA_ALLOWED_IN_FAST_LOOP=true
GROSS_DELTA_MUST_BE_TRACKED_AND_REFINED=true
NO_FULL_RUNTIME_COPY_BY_DEFAULT=true
NO_UNRELATED_RESTART=true
NO_PARALLEL_ARCHITECTURE=true
REPLAY_BEFORE_REDISCOVERY=true
```

## Resultado esperado

O executor não pergunta “se pode trabalhar vivo” quando a intenção do CHEFE for clara. Ele usa a skill, aplica o delta mínimo, mede o runtime, registra receipt e mantém o scratch limpo para o próximo ciclo.
