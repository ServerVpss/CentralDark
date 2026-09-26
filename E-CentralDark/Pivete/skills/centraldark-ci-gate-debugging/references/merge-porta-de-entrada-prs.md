# Merging PR #1378 and #1379 for porta-de-entrada CI fix

## Overview
These PRs fix CI gate failures in `porta-de-entrada`:
- #1378: Sanitize external source references (aiox->ai-ox, SynkraAI->Synkra-AI)
- #1379: Restore aplicarGatePercepcao in decisor.mjs

## Procedure
1. Update main:
   git checkout main
   git pull origin main

2. Create a temporary branch for each PR to avoid local conflicts:
   git checkout -b merge/1378 main
   git merge --no-ff origin/pr1378   # or pr1378 if fetched

3. Resolve conflicts:
   - For files in docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ and docs/CONSCIENCIA/APRENDIZADOS/AIOS-GOLD-ASSAY-20260828/:
     Keep the version from the PR branch (they contain the token sanitization fixes).
   - For apps/modulos/HERMES-CORE/core/decisor.mjs:
     Keep the version from the PR branch (it contains the restored function from commit db8dd290f).
   - Use `git checkout --theirs <path>` for PR version, or manually edit.

4. After resolving, commit:
   git add .
   git commit -m "Merge PR #1378: fix: sanitize external source references (aiox->ai-ox, SynkraAI->Synkra-AI)"

5. Repeat for PR #1379:
   git checkout -b merge/1379 main
   git merge --no-ff origin/pr1379
   Resolve conflicts similarly (keep PR version for decisor.mjs and any other conflicting files).
   git commit -m "Merge PR #1379: fix: restaurar aplicarGatePercepcao do decisor.mjs"

6. Push and create merge PRs or push directly to main if authorized:
   git push origin merge/1378
   git push origin merge/1379
   Then open PRs from these branches to main, or if you have push rights:
   git push origin main   # after merging locally

7. Verify CI passes for porta-de-entrada workflow.

## Notes
- The conflicts are expected because main may have updated the same files after the PRs were created.
- The PR changes are limited to specific files; keeping the PR version ensures the fixes are applied.
- Always verify that the gate passes locally if possible before pushing.