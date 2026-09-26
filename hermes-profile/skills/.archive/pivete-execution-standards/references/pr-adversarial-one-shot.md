# PR adversarial one-shot (READ_ONLY)

Class-level recipe (PR #646 MetaLupa, 2026-08-04). One round of falsification: no write, no second round, no trust of PR body alone.

## Freeze identity first

```text
REPO= owner/name
PR=
BASE_SHA=   # baseRefOid live
HEAD_SHA=   # headRefOid live — re-read twice mid-round
SKILL_BASE_BLOB=
SKILL_HEAD_BLOB=
```

If head moves → `BLOCKED_HEAD_MOVED` and stop.  
PR description SHAs are **not** current if `gh` disagrees (classic: body on `de2927…`, live head newer).

## Prefer remote truth via gh

```bash
gh pr view N --repo Owner/Repo --json baseRefOid,headRefOid,files,body,statusCheckRollup
gh api repos/Owner/Repo/compare/BASE...HEAD
gh api repos/Owner/Repo/contents/PATH?ref=SHA
gh run view ID --repo Owner/Repo --log-failed
```

Private PR web scrape can 404 while `gh` works — use CLI.

## Diff truth

- Git file list vs PR “Arquivos alterados”.
- Flag: temp workflows, V2 paths, test deletion, expect-loosening, FAIL→SKIPPED.
- Example: claimed 3 files, live diff has 4th `*-bundle-promoter.yml`.

## ZERO_REGRESSION is measured, never echoed

**False green (real in lupa-conformance):**

```yaml
echo "BASELINE_EXISTING_SUITE=PASS"
echo "HEAD_EXISTING_SUITE=PASS"
echo "ZERO_REGRESSION=PASS"
```

That is **not** proof. Need inventory when executable:

```text
T_base_pass ⊆ T_head_pass
T_new_required = PASS
Δ_outside_scope = ∅
no FAIL→SKIPPED / removed / weakened oracles
```

If suite cannot re-run here → `UNVERIFIABLE` / `UNPROVEN`, never PASS.

## Transport / bundle

On promoter/bundle jobs for exact head_sha: failed log; any `partNN` checksum fail → `TRANSPORT_INTEGRITY=FAIL`.  
Prior fixed failure ≠ proof of current HEAD.  
`TEMP_PROMOTER_PRESENT=SIM` in final diff = critical unless removed by design and proven.

## Claims table

| CLAIM | PROVA ESPERADA | OBSERVADO | PROVADA|REFUTADA|INCONCLUSIVA |

No reproduction on **live** HEAD → not PROVADA.

## Verdicts (fail-closed)

`VERIFIED` forbidden if: critical finding open, identity drift, required test unrun, SKIPPED-as-pass, out-of-scope diff, false green, transport fail, temp workflow in “final”, head ≠ tested sha.

One round when ordered: LER → DESCONFIAR → FIXAR ID → COMPARAR → FALSIFICAR → VEREDITO → **PARE**.

Do not fork MetaLupa V2 from Casa skills — audit repo `.agents/skills/meta-lupa/` blobs via git/gh.
