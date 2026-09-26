---
name: centraldark-fixed-point-shared
description: Shared reconciliation FIRST_WRITER_WINS fixed point.
tags: [shared reconciliation multi-writer fixed-point]
---

# CentralDark Fixed-Point-SHARED Pattern

Reconciliação compartilhada onde múltiplas janelas/agents investigam ao mesmo tempo, mas só a primeira que adquirir o Writer pode alterar/commit/push.

## Comando

```text
!CENTRALDARK SHARED
```

Alias: `centraldark shared`.

## Interpretação de capacidade e paralelismo útil

- `"CRIE" = ENTREGUE_A_CAPACIDADE`, não `OBRIGA_NOVO_OWNER`.
- Quando o CHEFE pedir capacidade paralela/multi-frente, execute pelos owners existentes: adapters, providers, writers, workflows canônicos.
- Use `PARALLELIZE_PERCEPTION=true` para leitura/medição paralela e `SERIALIZE_MUTATION=true` para mutação por escopo.
- False choice a evitar: `REUSE_BEFORE_CREATE` + pedido de paralelismo não significa "fazer nada". Mede primeiro, fan-out depois, sem arquitetura nova.
- Só cria componente novo se provar `GAP_REAL` com todos:
  - `MATERIAL_GAP_PROVEN`
  - `EXISTING_CAPABILITY_FIT_FALSE`
  - `EXISTING_OWNER_FIT_FALSE`
  - `EXTEND_EXISTING_INSUFFICIENT`

## Primeira janela = WRITER_PRIMARY

- Única com permissão de `git add`, `commit`, `push`, `PR/main`, `receipt final`.
- Pode corrigir o owner autorizado.
- Responsável por fechar a missão.

## Demais janelas = READER/SCOUT/REVIEWER

- Podem investigar GitHub, arquivos, histórico, testes, branches, CI, arquitetura, META_LUPA, VERTEX.
- **Não fazem commit concorrente no mesmo escopo.**
- Entregam descobertas para o WRITER_PRIMARY.

## Regras de convergência

- `PARALLELIZE_PERCEPTION=true` — percepção/read-only pode ser paralela.
- `SERIALIZE_MUTATION=true` — mutação serial e sincronizada no escopo correto.
- `FIRST_WRITER_WINS=true` — a primeira janela adquire o Writer.
- `ONE_WRITER_PER_SCOPE=true` — um writer por escopo.
- `WRITER_ABSORBS_READERS=true` — Writer absorve somente `DELTA ÚTIL` remede ponto fixo.
- `FINALIZE_ONLY_BY_PRIMARY_WRITER=true` — só o Writer original fecha.

## Handoff

A troca de Writer só pode acontecer com:
```text
WRITER_HANDOFF_RECEIPT + OLD_WRITER_RELEASE + NEW_WRITER_ACQUIRE
```

Sem RECEIPT + RELEASE, Handoff é **INVÁLIDO** — não inventar.

## Divergência de branch (reset --hard)

Quando o branch remoto avança significativamente e o local diverge:

1. `git fetch origin --quiet`
2. Verificar se o commit do Writer está no remoto: `git log --oneline origin/branch | grep <meu_commit>`
3. Se SIM: `git reset --hard origin/branch` — reancorar ao remoto preservando o conteúdo do Writer
4. Se NÃO: localizar commit via `git branch -a --contains <sha>` e fazer checkout/cherry-pick
5. **NUNCA** `git add -A` cego para forçar push
6. **NUNCA** perder trabalho — verificar `git status --porcelain` antes de qualquer reset

## Worktrees locked — remoção de resíduos

Quando worktrees ficam em estado `locked initializing` órfão:

1. `git worktree list --porcelain` para identificar entradas locked
2. Verificar se o diretório existe: `ls -la <caminho>`
3. Se diretório **não existe**: `rm -rf .git/worktrees/<nome_do_worktree>` para remover o registro do git
4. Verificar: `git worktree list --porcelain | grep "locked"` deve retornar 0
5. **NOTA:** `git worktree prune` sozinho pode não remover registros órfãos em todas as situações

## CI base failure vs delta failure

- **BASE_RED:** workflow falha na base main, não no delta do PR → **NÃO BLOQUEIA** o merge do PR
- **DELTA_RED:** workflow falha no arquivo modificado pelo PR → precisa de correção
- **Classificação:** medir `gh run view <ID> --log-failed` para determinar se é base ou delta
- **Regra:** `CI_RED_NO_DELTA = NOT_BLOCKING` para o writer do PR

## Receipt canônico

```text
MISSION_ID=SHARED_RECONCILIAR_<data>
TIMESTAMP=<ISO>
WRITER=<sha_do_commit>
HEAD=<local>
MAIN=<remoto>
DELTA=<resumo_do_pr>
CI_BASE_FAILURES=<count>
CI_STATUS=BASE_RED_NOT_DELTA_RED
WORKTREES_LOCKED=<count>
RECEIPT_PERSISTED=true
NEXT_CURSOR=<status>
```

## FIXED POINT

O FIXED POINT é atingido quando:
1. CI green no PR do Writer
2. Squash merge concluído
3. Worktrees locked = 0
4. Nenhuma modificação não commitada pendente
5. DELTA-CONTINUO.md atualizado com merge SHA

**PENDENTE** enquanto CI não green ou merge não feito.

## Proteções

- `NO_V2_V3_V4=true` — não criar segundo sistema
- `ONE_SYSTEM_ONLY=true` — um sistema, não paralelos
- `UNKNOWN_IS_NOT_PASS=true` — estado desconhecido não é aprovação
- `ACTION_IS_NOT_PROOF=true` — ação não prova resultado
- `NO_FORCE_PUSH=true` — sempre `--force-with-lease`
- `DIRTY_WORKTREE=BLOCK=true` — bloquear se worktree sujo

## Referências

- `centraldark-master-funnel-autonomo` — funnel canônico que interpola !CENTRALDARK SHARED
- `centraldark-operational-discipline` — discipline rules incluindo Regra FIXED-POINT-SHARED
