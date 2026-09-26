# FIXED-POINT-SHARED Pattern

> Cristalizado 2026-09-05 por SEGREDO/CHEFE durante sessão `!CENTRALDARK SHARED`.

## Comando

```text
!CENTRALDARK SHARED
```

Alias: `centraldark shared`.

Reconhece a intenção de reconciliação compartilhada: múltiplas janelas/agents podem investigar ao mesmo tempo, mas só a primeira que adquirir o Writer pode alterar/commit/push.

## Comportamento obrigatório

### Primeira janela = WRITER_PRIMARY
- Única com permissão de `git add`, `commit`, `push`, `PR/main`, `receipt final`.
- Pode corrigir o owner autorizado.
- Responsável por fechar a missão.

### Demais janelas = READER/SCOUT/REVIEWER
- Podem investigar GitHub, arquivos, histórico, testes, branches, CI, arquitetura, META_LUPA, VERTEX.
- **Não fazem commit concorrente no mesmo escopo.**
- Entregam descobertas para o WRITER_PRIMARY.

### Regras de convergência
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

Quando o branch remoto avança significativamente e o local diverge (ex: 100+ commits de diferença):

1. `git fetch origin --quiet`
2. Verificar se o commit do Writer está no remoto: `git log --oneline origin/branch | grep <meu_commit>`
3. Se SIM: `git reset --hard origin/branch` — reancorar ao remoto preservando o conteúdo do Writer
4. Se NÃO: localizar commit via `git branch -a --contains <sha>` e fazer checkout/cherry-pick
5. **NUNCA** `git add -A` cego para forçar push
6. **NUNCA** perder trabalho — verificar `git status --porcelain` antes de qualquer reset

## Worktrees locked — remoção de resíduos

Quando worktrees ficam em estado `locked initializing` órfão (diretório inexistente no disco):

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
