# C-gate receipt

Use this compact structure after a PR-gated delivery:

```text
VEREDITO=C_PASS|C_FAIL|C_BLOCKED|C_UNKNOWN
PR=<URL or number>
HEAD_SHA=<pushed SHA>
ESCOPO=<causal scope>
ARTEFATOS=<paths>
COMMIT_READBACK=PASS|FAIL
PUSH_READBACK=PASS|FAIL
GATES=<individual results>
REALITY_JUDGE=PASS|FAIL|BLOCKED|UNKNOWN

BLOCKER_ID=<exact identifier or NONE>
CLAIM_TARGET=<claim affected>
OWNER=<workflow/script/team owner>
OBSERVED_ERROR=<measured output>
MISSING_DEPENDENCY=<exact missing item>
RESUME_CONDITION=<what must become true>
EVIDENCE_REF=<run, log, or command>
```

Rules:

- `COMMIT_READBACK=PASS` proves only that the commit exists locally or remotely; it does not prove C.
- `PUSH_READBACK=PASS` proves the PR branch contains the SHA; it does not prove the checks evaluated that SHA.
- `C_PASS` requires the final Reality Judge to pass with no material blocked or unknown claim.
- If a broad pre-existing gate fails outside the requested scope, preserve the failure and identify its owner and exact dependency instead of expanding the patch silently.
