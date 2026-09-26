# DIGTHUB Fixed Point Reconciliation to Main Remote (SEM LOPING)

**Trigger from user**: "PROSSIGA ENTAO SEM LOPING FAZENDO TUDO ISSO RECONCILIANDO ATE AS 7:DA MANHA ! PONTO FIXED ! ATE MAIN! REMOTA! USE SKIL DIGTHUB!"

**Class pattern**: Batch GitHub CLI (gh) "dig" for open PRs/branches related to reanchor/fixed-point/caracol/visual. Merge mergeables directly. For conflicting fixed-point PRs (e.g. #1381), local resolve preferring feature branch (--theirs on fabric cores), push to main remote. Verify once with canonical tools. Reach fixed point. No looping/repeated checks.

## Steps (batch where possible)
1. gh pr list --state open (dig relevant: reanchor, fixed-point, visual, deps).
2. gh pr view <num> --json number,title,state,mergeable,headRefName,baseRefName,body,files (parallel for multiple).
3. For MERGEABLE: `gh pr merge <num> --merge --delete-branch`.
4. For CONFLICTING fixed-point (large fabric PR):
   - `git fetch origin <head-branch>`
   - `git checkout main && git pull origin main`
   - Handle untracked blockers: `mv <blocking-untracked> /tmp/ 2>/dev/null || true`
   - `git merge origin/<head-branch> --no-edit`
   - Resolve add/add + content: `git checkout --theirs <conflicted-core-files>` (models, policy, store, tests, SOUL-SOL.md, verify scripts, MASTER-CYCLE.yml)
   - Handle renames/locations (e.g. BANDA_COMPASSO_GLOBAL.json in old vs 02-BANDA): add to current structure or mv as needed.
   - `git add -u`
   - `git commit -m "reconcile: merge PR# to main - fixed point fabric, probes, tests, SOUL updates, caracol integration. Conflicts resolved preferring feature (theirs). ... Per SOUL: reuse, one system, no new arch."`
   - `git push origin main`
5. Post-reconcile verify (once): `python scripts/trigger-fabric/spiral_traversal.py --self-test --compact` (or other canonical: graph-panel, etc.).
6. Confirm: `git log --oneline -5`, main remote includes all (caracol demo/SVG absorbed as artifact, not new owner; fixed-point-fabric integrated).
7. Report only after: short "PROMOTED TO MAIN REMOTE" + HEAD + PASS status. Use canonical emojis only.

## Pitfalls
- Untracked files from prior work (e.g. AUREOLA-BAHIA-BIBLICA.yml) block merge → mv to /tmp before attempting.
- Large add/add in fixed-point-fabric → always --theirs for core fabric/tests/SOUL to absorb the "PONTO FIXED" delta.
- Dir renames (Banda vs 02-BANDA) → reconcile by ensuring file in active tree structure.
- Looping risk: do not re-view/gh after each; batch upfront, one merge sequence, one verify at end.
- Do not create new owners: absorb caracol demo into graph-panel/spiral_traversal (TRAVERSAL ≠ SEMANTIC_EDGE).
- After push: local may have untracked; clean only if safe, do not force.
- If merge aborts on untracked: mv + retry; never leave in conflicted state.

## Evidence (2026-09-05 session)
- PRs reconciled to main: 1413 (caracol), 1408 (reanchor visual + pegatudo), 1381 (fixed-point-fabric via resolve), 1409 (deps).
- CARACOL verifier PASS post-merge.
- Main HEAD: sequence ending in fixed-point commit.
- Absorbed without new architecture or parallel systems.
- "SEM LOPING" executed: no repeated verifications until final.

See also: references/2026-09-05-caracol-reanchor-promotion-to-main.md (prior), centraldark-operational-method core on CARACOL/SOUL/fixed-point.

**Update rule**: When user signals "SEM LOPING ... FIXED POINT ... MAIN REMOTA ... DIGTHUB", execute this batch pattern. Embed in all CentralDark reconciliation missions.