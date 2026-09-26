# Fixed-Point-Shared Pattern — CENTRALDARK SHARED

> Comando canônico: !CENTRALDARK SHARED (alias: centraldark shared)
> Regra: FIRST_WRITER_WINS, ONE_WRITER_PER_SCOPE
> Cristalizada: 2026-09-05

## COMANDO UNIVERSAL
Cole em qualquer janela/agente: !CENTRALDARK RECONCILIAR_SHARED com MISSION_ID=AUTO, REPO=ServerVpss/CentralDark, CANONICAL_BRANCH=main, FIRST_WRITER_WINS=true, ONE_WRITER_PER_SCOPE=true.

## ROLES
- 1ª janela = WRITER_PRIMARY (única com commit/push/PR)
- Demais = READER/SCOUT/REVIEWER (investigar, NÃO commitar no mesmo escopo)

## WORKTREES LOCKED — RESIDUAL CLEANUP
Worktrees `locked initializing` são órfãos quando o diretório não existe mais. Padrão: `git worktree prune` ou `rm -rf .git/worktrees/*` + `git worktree prune`. Verificar: `git worktree list --porcelain | grep "locked" | wc -l` → deve ser 0.

## BRANCH DIVERGENCE RECOVERY
Se branch local divergiu 100+ commits: `git fetch --prune`, `git reset --hard origin/<branch>`. Se conflito com ambas versões idênticas: `git checkout --theirs`.

## CI BASE_RED vs DELTA_RED
- BASE_RED: workflow falha na base main (headSha ≠ HEAD do PR) → NÃO BLOQUEIA. Provar com `gh run view <ID> --log-failed`.
- DELTA_RED: headSha = HEAD do PR → bloqueia PR.

## RECEIPT PATTERN
Markdown com MISSÃO, IDENTIDADE (SHA, branch, HEAD, main), STATE VIVO, PROVAS, FIXED POINT status.

## FIXED POINT CRITERIA
MISSION_OBJECTIVE_PROVEN, ALL_MATERIAL_FINDINGS_SCOPED, NO_MATERIAL_UNKNOWN, OWNER_MAP_PROVEN, RECEIPT_PERSISTED, NEXT_CURSOR_PERSISTED, CI_GREEN_ON_LATEST_HEAD=true, TESTED_HEAD==COMMITTED_HEAD==PUSHED_PR_HEAD.

## HANDOFF PROTOCOL
Válido apenas com WRITER_HANDOFF_RECEIPT + OLD_WRITER_RELEASE + NEW_WRITER_ACQUIRE. Sem isso: HANDOFF é INVÁLIDO.

## GOAL-PAUSE RECOVERY
goal_judge ausente → corrigir config.yaml (auxiliary.goal_judge). Setup state, não falha de capacidade.

## ANTI-PATTERNS
- NÃO criar DELTAUNIFICADOCENTRALDARK.md
- NÃO git add -A cego em conflito
- NÃO push sem --force-with-lease
- NÃO tratar todo CI FAIL como bloqueio sem medir base vs delta
- NÃO ignorar worktrees locked
- NÃO recomendar git pull em branch com divergência massiva sem reset --hard
