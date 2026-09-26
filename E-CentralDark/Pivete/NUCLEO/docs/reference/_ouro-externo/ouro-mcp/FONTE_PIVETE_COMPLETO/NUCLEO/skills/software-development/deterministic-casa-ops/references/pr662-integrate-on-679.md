# #662 on top of #679 (session 2026-08-06)

## Facts
- #679 MERGED → main includes self-hosted fallback + fork-guard + receipt.
- #662 OPEN: SEGREDO/SOL/PIVETE authority + continuity-guard + identity validators.
- Overlap files: `.github/workflows/porta-de-entrada.yml`, `codex-validate.yml`.

## Do not
- Rebase 16 commits one-by-one hoping WF conflicts vanish.
- Bring back `ubuntu-latest` from old #662 tips.
- Push half-integrated branch without Chefe order (PARE stopped push).

## Preferred integrate
```text
origin/main (post-679)
+ non-WF from pr-662-head:
    authority-approval(.test).mjs
    validar-identidade-operacional(.test).mjs
    continuity-guard(.test).mjs
    orchestrator.mjs delta
    JEITO-CORRETO-DO-PIVETE.md
+ WF: keep 679 skeleton; inject 662 final steps:
    prove checkout HEAD
    authority-approval (not body/label PIVETE_APPROVED alone)
    identity validators
    continuity-guard tests
    orchestrator --check
```

## Local WIP (unpushed when stopped)
```text
worktree: E:/tmp/pr662-rebase
branch:   fix/662-rebase-on-679
base:     origin/main 1e25bc999…
tests:    authority 3 + identity 9 + continuity 5 = 17/17 pass
orch:     node --check OK
dirty:    porta-de-entrada.yml + codex-validate.yml + scripts/core above
```

Resume only with explicit order: finish admin-job prove on codex if missing, commit with Writer trailer, push to update #662 or open follow-up PR, run self-hosted gates, then merge train.
