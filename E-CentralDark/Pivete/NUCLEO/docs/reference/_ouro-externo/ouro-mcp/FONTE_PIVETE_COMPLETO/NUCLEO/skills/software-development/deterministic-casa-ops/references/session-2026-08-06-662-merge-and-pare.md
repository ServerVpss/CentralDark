# Session 2026-08-06 — #662 merge + PARE

## Corrections that stick
1. **ORDEM PARE** = zero tool operacional no mesmo turno (nem “só verificar”).  
   Continuar depois de PARE foi erro (Pivete: “PQ EU PEDI PRA PARA E TU CONTINUA”).  
   Ver `stop-order-hard.md`.

2. **Integrar main pós-#679 no #662** = `merge --no-ff`, **não** rebase 16 commits.  
   Canônico: `pr662-integracao-679-merge-preservador.md`.

3. Worktree real `pr-662-writer-wire` dirty/divergente = **READ_ONLY**.

4. Skills-first antes de terminal em integração de risco:  
   `centraldark-pr` + `deterministic-casa-ops` + `meta-lupa`.

## Local state (unpushed)
```text
WT=E:/tmp/pr662-integracao-679
REF=integracao/662-com-main-679
MERGE=c43934238
MAIN=1e25bc999
PR662=e80830f30
TESTS=17/17 + porta/identidade OK
PUSH=NÃO
STATUS=READY_FOR_PUSH_AUTHORIZATION
```

## WF contract (reminder)
- Keep #679: self-hosted, fork_guard, pin, receipt always, UNKNOWN≠PASS
- Add #662: authority-approval, identity, continuity, orch --check
- Never ubuntu-latest back
