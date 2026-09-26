# Rebase Conflict Resolution Pattern — CentralDark PR #1381 Case Study

## Context
PR #1381 (`feat/fixed-point-fabric-proof-20260831`) was 89 commits ahead / 58 behind main with merge-base `0247ecf23`. The branch had accumulated many commits and conflicts with main due to parallel development.

## Conflict Resolution Method

### 1. Measure Before Acting
```bash
git fetch origin --prune
git rev-list --left-right --count origin/main...HEAD  # 58 behind, 89 ahead
git merge-base HEAD origin/main  # 0247ecf234fbd0bb8c790618417a38e030684a70
```

### 2. Use Existing Worktree (Single Writer)
```bash
cd /e/CentralDark/Pivete/_worktrees/pr-1381-safety
git status --short  # Clean = good to proceed
git pull origin feat/fixed-point-fabric-proof-20260831 --rebase
```

### 3. Resolve Conflicts by Priority

**Priority 1: Critical runtime files (Executor agent)**
- File: `apps/modulos/HERMES-CORE/agents/Executor/agent.mjs`
- Had nested merge markers (`<<<<<<< HEAD` x2)
- Resolution: Kept the cleaner version from commit `80c309354` (absorved PR #1379)
- Verified: `node --check` passes

**Priority 2: Canonical contracts (MASTER-CYCLE.yml)**
- File: `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml`
- Conflict in `reaction_telemetry.rules` section
- Resolution: Merged both rule sets (HEAD rules + commit `ec0b63df1` rules)
- Verified: `yaml.safe_load()` passes, status=CANONICO

**Priority 3: Verification scripts (verify_repo_contract.py)**
- File: `scripts/trigger-fabric/verify_repo_contract.py`
- Missing closing brackets `])` on multiple `check()` calls
- Resolution: Rewrote entire file from canonical version (commit `291530fa8`) + added new checks
- Verified: `python -m py_compile` + execution passes (33/33 checks PASS)

**Priority 4: Skills (fable-loop/SKILL.md)**
- File: `.agents/skills/fable-loop/SKILL.md` (add/add conflict)
- Resolution: Kept HEAD version (Portuguese, with creation receipt) + appended `CANONICAL_BINDING` from incoming
- Verified: Skill loads correctly

### 4. Verification Gates (Before Push)
```bash
# Syntax checks
node --check apps/modulos/HERMES-CORE/agents/Executor/agent.mjs
node --check apps/modulos/HERMES-CORE/core/orchestrator.mjs
python -m py_compile scripts/trigger-fabric/verify_repo_contract.py
python -m py_compile scripts/trigger-fabric/centraldark_master_cycle.py

# Contract verification
python scripts/trigger-fabric/verify_repo_contract.py .  # Must print REPO_CONTRACT_VERIFY=PASS

# Test suite
node --test scripts/lupa/label-gate.test.mjs
node --test scripts/lupa/agent-core-adapters.test.mjs
node --test apps/modulos/HERMES-CORE/core/continuity-guard.test.mjs
```

### 5. Push with Lease (Respect Other Writers)
```bash
git push origin feat/fixed-point-fabric-proof-20260831 --force-with-lease
```

## Key Principles Applied
- **REUSE_BEFORE_CREATE**: Used existing worktree, didn't create new one
- **SINGLE_WRITER_PER_SCOPE**: Only one agent (this session) mutating the PR branch
- **MEASURE_FIRST**: Checked divergence, merge-base, conflict files before resolving
- **CONTRACT_VERIFICATION**: Every modified file verified against its contract/loader
- **NO_V2_V3**: Fixed files in place, didn't create parallel versions
- **DELTA_CONTINUOUS**: All changes folded into existing PR #1381 (the mother PR)

## Anti-Patterns Avoided
- ❌ `git add -A` blind staging
- ❌ Creating `V2`/`V3` files instead of fixing originals
- ❌ Pushing without `--force-with-lease`
- ❌ Declaring victory without contract verification
- ❌ Ignoring the pre-existing test failure (Windows path separator in `validar-identidade-operacional.test.mjs`)

## Known Pre-existing Issue (Not Fixed Here)
`scripts/lupa/validar-identidade-operacional.test.mjs:610` — expects `src/adapter.ts` but Windows produces `src\\adapter.ts`. This exists on `origin/main` and is tracked separately. Do not mask it.