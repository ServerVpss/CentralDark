# Deterministic CI fallback — PR #679 (2026-08-06)

## PR
- URL: https://github.com/ServerVpss/CentralDark/pull/679
- Branch: `fix/ci-self-hosted-fallback-deterministico`
- HEAD (open): `ad500eacb7a4f7af8bafded72289f3bb7ba261c4` on `origin/main` `f692e311…`
- Writer trailer: `Writer: hermes-pivete` / `Writer-Session: release-train-pr1-20260806`

## Files only
```text
.github/workflows/codex-validate.yml
.github/workflows/porta-de-entrada.yml
.github/workflows/lupa-conformance.yml
.github/workflows/lupa-drift-guard.yml
.github/workflows/pr-auto-review.yml
.github/workflows/autonomia-promocao.yml
```

## Pattern applied to every former `ubuntu-latest` job
1. `runs-on: [self-hosted, Linux]`
2. Step **Bloquear HEAD de fork no runner persistente** when event is PR
3. `persist-credentials: false` on checkout
4. `timeout-minutes` if missing (default 20 when absent)
5. Final step **Receipt determinístico (sempre)** with `if: always()` emitting:
   - HEAD_SHA, EXECUTOR=self-hosted, ROTA_PRIMARIA, ROTA_FALLBACK=BLOCKED_NO_HOSTED
   - RESULTADO=PASS|FAIL|BLOCKED — never map unknown/cancelled to silent PASS

## Proven self-hosted fact (from #668 docs)
- Runner `vmi3256920-centraldark`, labels `self-hosted` + `Linux`
- Billing blocks many `ubuntu-latest` jobs; does **not** block this runner

## Release train order (do not skip)
```text
#679 CI self-hosted → merge when green
→ rebase #662 → #663 → #664 (claude-code Writer)
→ PR3 Casa combo (grok/casa Writer, no WF)
→ PR4 notify fallback
→ #637 escola (Casa only, no VPS deploy)
→ canary only after READY_FOR_FINAL_PROMOTION
```

## Local proofs that stay green independent of GH
```bash
python profiles/pivete/debug-cirurgico/cli.py combo-case
python -m unittest discover -s profiles/pivete/combo-potencia-menu/tests -q
python -m unittest discover -s profiles/pivete/debug-cirurgico/tests -q
```

## Notify inventory (PR4 later — extend, don't replace)
- `infra/notify/notify.py` + `notify.sh` + `notify.env.example`
- `infra/guardiao/notifier.py` → wraps `scripts/notify-claude/notify-telegram.sh`
- States desired: PRIMARY_SENT | FALLBACK_SENT | QUEUED_FOR_RETRY | NOT_SENT | BLOCKED_NO_ROUTE
