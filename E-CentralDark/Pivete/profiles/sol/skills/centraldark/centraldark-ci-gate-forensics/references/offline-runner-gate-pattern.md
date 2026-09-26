# Offline Runner Gate Pattern — PR #1381 Case Study (2026-09-03)

## Symptom
All CI gates on PR #1381 showed `pending` or `skipping`:
```
Gates determinísticos em runner self-hosted    skipping
Provar gerador no HEAD do PR                   skipping
Comentar e rotear usando somente código confiável da base    pending
IA consultiva via API CentralDark + darkai     pending
Porta, identidade e governança canônica estão íntegras?    pending
```

## Root Cause
**Runner offline:**
```bash
gh api repos/ServerVpss/CentralDark/actions/runners --jq '.runners[] | "\(.name) \(.status) busy=\(.busy)"'
# Output: vmi3256920-centraldark offline busy=false
```

All workflows use `runs-on: [self-hosted, Linux]`. When the runner is offline:
- Jobs queue indefinitely
- `gh pr checks` shows `pending` (never `failure`)
- No logs are generated (`gh run view <id> --log-failed` → "run is still in progress")

## Diagnostic Pattern
**When ALL gates on a PR are pending/skipping:**
1. Check runner status FIRST: `gh api repos/ServerVpss/CentralDark/actions/runners`
2. If runner offline → CI is NOT red due to code, it's infrastructure
3. Do NOT start rebasing/fixing code — the PR may already be correct
4. Wait for runner to come online OR run local contraproofs

## Local Contraproof Pattern (Bypass Offline Runner)
For each gate, reproduce the workflow step locally from the PR worktree:

```bash
cd /e/CentralDark/Pivete/_worktrees/pr-1381-safety

# porta-de-entrada gate (critical steps)
python3 scripts/trigger-fabric/verify_repo_contract.py .  # REPO_CONTRACT_VERIFY=PASS
node scripts/lupa/validar-continuidade-global.mjs         # CONTINUIDADE_GLOBAL=PASS
node --test scripts/lupa/label-gate.test.mjs              # PASS
node scripts/lupa/label-gate-run.mjs                      # needs GITHUB_EVENT_PATH
node --test scripts/lupa/validar-identidade-operacional.test.mjs  # 39/40 pass (1 pre-existing Windows path fail)
node --test scripts/lupa/agent-core-adapters.test.mjs     # 10/10 PASS
node --test apps/modulos/HERMES-CORE/core/continuity-guard.test.mjs  # 34/34 PASS
```

## Key Insight
**`pending` ≠ `failure`** when runner is offline.
- `pending` = job queued, waiting for runner
- `skipping` = job cancelled (likely by `cancel-in-progress: true` on new push)
- Only `failure` with logs indicates actual code/state problem

## Remediation Priority
1. **Runner recovery** (VPS ops) — outside PR scope
2. **Local verification** — prove PR is correct without runner
3. **Push with lease** — when runner recovers, CI will pass mechanically
4. **Do NOT rebase** just because CI shows pending — measure divergence first

## Related to `pull_request_target` Note
Even when runner is online, `pull_request_target` workflows run on BASE branch (main), not PR branch. Fixes in PR branch don't affect them. This is documented in the main skill under "Known root causes".

## Commands Reference
```bash
# Runner health
gh api repos/ServerVpss/CentralDark/actions/runners --jq '.runners[] | "\(.name) \(.status) busy=\(.busy)"'

# PR checks with run IDs
gh pr checks 1381

# Local contraproof (from PR worktree)
python3 scripts/trigger-fabric/verify_repo_contract.py .
node scripts/lupa/validar-continuidade-global.mjs
node --test scripts/lupa/label-gate.test.mjs
node --test scripts/lupa/agent-core-adapters.test.mjs
node --test apps/modulos/HERMES-CORE/core/continuity-guard.test.mjs
```