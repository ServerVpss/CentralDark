# FABLE Judge: merge metadata false-positive (E09)

## Trigger
A CI FABLE Judge reports `E09` / `commit_anuncia_prova_sem_conteudo` for a merge commit even though the developer did not claim proof.

## Proven root cause
Git can append a commit-message trailer:

```text
# Conflicts:
#\tdocs/.../inventory.md
```

The E09 claim regex matches `inventory`; that path is conflict metadata, not an assertion in the commit message. A merge commit also commonly has an empty default `git show` diff, intensifying the false positive.

## Minimal causal repair
1. Reproduce the exact judge interval: `node scripts/lupa/erro-reincidencia.mjs --intervalo <base>..<head>`.
2. Confirm the matching word occurs only in the Git `# Conflicts:` metadata trailer.
3. In `avaliarCommit`, remove only that terminal, comment-prefixed trailer before applying `padrao_alegacao`.
4. Add a unit test with an `inventory` path inside that trailer and an empty diff. The same assertion word in an ordinary commit message must still trigger E09.
5. Run the focused test and the exact interval again; do not weaken the claim regex or turn E09 off.

## Verified outcome
On PR #1445 (2026-09-07), the narrow normalization made the focused suite pass (21/21) and changed the interval verdict to `REINCIDENCIA_OK=1`; real proof-claim detection remained covered by its existing regression test.

## Guardrails
- Git-generated metadata is not human claim evidence.
- Do not classify a green focused gate as full CI green.
- If full lint fails outside the diff, report it as separate inherited scope; do not mass-refactor unrelated paths.
