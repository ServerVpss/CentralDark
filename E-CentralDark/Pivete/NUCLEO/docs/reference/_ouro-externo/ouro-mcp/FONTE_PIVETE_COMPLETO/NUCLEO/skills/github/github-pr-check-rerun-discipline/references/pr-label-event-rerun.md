# PR label event rerun pattern

Use this as a concrete reminder of the failure mode, not as a PR-specific procedure.

## Pattern

A PR changed one file in a protected/consolidated area. The PR later received an approval label such as:

```text
permito-pivete
```

The current PR state showed the label, but the original failing GitHub Actions runs still evaluated:

```text
PIVETE_APPROVED=false
```

because their event payload came from the original PR opening before the label existed.

## False first fix

Re-running the old failed workflow attempt kept failing with:

```text
PIVETE_APPROVED: false
"ok": false
"errors": ["área consolidada alterada sem label permito-pivete: .agents/"]
```

This did not prove the label was ignored by the repository. It proved the rerun was still using the stale event payload.

## Working fix

Find the workflow run created by the later PR label event. It may have been `cancelled` by concurrency. Re-run that post-label run instead.

Expected proof after the correct rerun:

```text
PIVETE_APPROVED: true
"ok": true
"errors": []
```

Then check the PR checks view again and make sure no `fail` rows remain.

## Final caution

CI green only resolves the CI gate. It does not automatically resolve content review, fixtures, human approval, or merge authorization.
