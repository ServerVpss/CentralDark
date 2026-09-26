# CI self-hosted + receipt pitfalls (class)

## Contract
```text
CODE = guaranteed path
AI = accelerator
HOSTED/BILLING down → self-hosted
AI down → gates/scripts continue
TOTAL fail → BLOCKED + receipt
UNKNOWN|SKIPPED|EMPTY|QUEUED ≠ PASS
```

## Job shape (hosted → self-hosted)
1. `runs-on: [self-hosted, Linux]`
2. Fork guard on PR; outputs `blocked`/`cause`; receipt prefers BLOCKED/FORK_HEAD
3. Checkout pinned `@<sha40>` + `persist-credentials: false`
   - PR jobs: `head.sha`
   - Autonomia judge/promote: `base.sha || github.sha` (trusted base)
4. `timeout-minutes`
5. Receipt `if: always()` last → PASS|FAIL|BLOCKED
6. Do not rewrite gate business logic in infra PRs

## Real failure: gates green, job FAIL
Porta on self-hosted ran validators OK (`validar-porta ok:true`) then receipt died:
```text
syntax error near unexpected token `fi'
```
Cause: duplicate trailing `fi` after complete if/elif/else/fi.  
Rule: receipt shell must be if/fi 1:1. Read failed step names before reopening gate logic.

## Checks not firing on PR
`gh pr checks` showing only CodeRabbit/Supabase ≠ canonical gates ran.  
Use `gh workflow run <wf> --ref <branch>` + `gh run list --branch`.  
Long queue on self-hosted = capacity, not merge license.

## Promotion (Pivete correction)
Do not add cosmetic stop `READY_FOR_FINAL_PROMOTION` when goal already authorized:
```text
GATES PASS → MERGE → BACKUP → CANARY → REAL TEST → PROMOTE → RECEIPT
FAIL → ROLLBACK → BLOCKED WITH EXACT CAUSE
```

## Related
- PR example: https://github.com/ServerVpss/CentralDark/pull/679
- Also see: `references/deterministic-ci-fallback-pr679.md`
