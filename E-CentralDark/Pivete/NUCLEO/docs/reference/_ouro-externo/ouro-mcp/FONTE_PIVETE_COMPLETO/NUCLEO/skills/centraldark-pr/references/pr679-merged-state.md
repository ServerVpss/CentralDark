# PR #679 merged state (2026-08-06)

```text
URL=https://github.com/ServerVpss/CentralDark/pull/679
STATE=MERGED
MERGE_SHA≈1e25bc999 (verify: git rev-parse origin/main)
SCOPE=6 workflows only (no Casa combo, no notify redesign)
```

## What landed
- ubuntu-latest → [self-hosted, Linux] on remaining hosted jobs in:
  codex-validate, porta-de-entrada, lupa-conformance, lupa-drift-guard,
  pr-auto-review, autonomia-promocao
- fork-guard + persist-credentials false + timeout + receipt always
- checkout pins (v4/v5/v6 → sha40)
- receipt fi orphan fixed before final HEAD

## Live proof note
Earlier self-hosted porta run: validators PASS, job FAIL only on receipt syntax.  
Do not treat “job failure” as “gates wrong” without reading failed step name.

## Next train
Integrate #662 on this main (authority/identity) without undoing self-hosted.  
See `deterministic-casa-ops/references/pr662-integrate-on-679.md`.
