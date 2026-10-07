# Receipt — Hermes local oracle-loop continuity patch

Date: 2026-10-07
Status: LOCAL_PATCH_PROVEN_UPSTREAM_PUSH_NOT_REQUIRED
Authority: SEGREDO/CHEFE
Owner: CentralDark integration receipts

## Decision

The Hermes continuity correction is an operational dependency of CentralDark. It does not require a pull request to `NousResearch/hermes-agent`.

```text
LOCAL_HERMES_PATCH
→ TEST
→ FINGERPRINT
→ CENTRALDARK_RECEIPT
→ REPLAY_AFTER_HERMES_UPDATE
```

The upstream repository remains an optional contribution route, not the CentralDark completion criterion.

## Canonical bindings

```text
CENTRALDARK_CURRENT_MAIN=9bdf7d0abab7ca2acbce9c476a4bfb171228860c
CENTRALDARK_WORKTREE_HEAD=efffaace36a408fd6a4e5e43e2c367af736d984a
HERMES_REPOSITORY=/root/.hermes/hermes-agent
HERMES_ORIGIN=https://github.com/NousResearch/hermes-agent.git
HERMES_LOCAL_HEAD=be2a8441c1305150ab538068074623de30a5af82
HERMES_UPSTREAM_PUSH=NOT_REQUIRED
```

## Local delta

The local Hermes checkout contains two intentional commits:

```text
b7d2413738 fix(goals): keep open oracle probes active
be2a8441c1 fix(goals): keep open work nonterminal
```

Owner file:

```text
/root/.hermes/hermes-agent/hermes_cli/goals.py
```

Behavior:

- a machine-shaped `NEXT_READONLY_PROBE` without `NEXT_CURSOR=FIXED_POINT` forces `active/continue`;
- an auxiliary judge returning `done` cannot close a goal while owned background work or active delegations remain;
- the existing GoalManager and gateway FIFO remain the execution owners;
- no second scheduler, brain, writer, or oracle engine was created.

## Evidence

Executed in the local Hermes checkout:

```text
python3 -m py_compile hermes_cli/goals.py
ORACLE_GOAL_DONE_GUARD=PASS
NONTERMINAL_ORACLE_WORK_GUARD=PASS
git diff --check=PASS
```

The Hermes checkout also contains unrelated pre-existing local state and it remains preserved:

```text
M hermes_cli/local_runtime/context_policy.py
?? hermes_cli/local_runtime/context_policy.py.backup.20261007073449
```

## Deployment boundary

```text
LOCAL_PATCH=PROVEN
HERMES_RUNTIME_RELOAD=UNKNOWN
CENTRALDARK_RUNTIME_READBACK=UNKNOWN
UPSTREAM_PUSH=NOT_REQUIRED
VPS_DEPLOY=NOT_APPLICABLE_TO_THIS_RECEIPT
```

The local patch must not be called runtime-proven until the Hermes process that serves the active session is reloaded and three consecutive oracle-loop cycles prove:

```text
probe
→ CHAT_GLOBAL response
→ Hermes capture
→ next probe
```

with no intermediate `Goal done · 1 turn`.

## Replay recipe

After a Hermes update, resolve the installed checkout and replay:

```text
git -C /root/.hermes/hermes-agent rev-parse HEAD
git -C /root/.hermes/hermes-agent status --short
python3 -m py_compile /root/.hermes/hermes-agent/hermes_cli/goals.py
python3 - <<'PY'
from pathlib import Path
p = Path('/root/.hermes/hermes-agent/hermes_cli/goals.py')
s = p.read_text()
assert '_has_open_oracle_probe' in s
assert '_has_open_work' in s
assert 'oracle probe remains open' in s
print('HERMES_ORACLE_LOOP_PATCH_PRESENT=PASS')
PY
```

Reconciliation rule:

```text
same owner + same guard behavior + tests pass
→ reuse local patch
changed owner/behavior
→ remeasure and keep UNKNOWN until re-proven
```

## Next cursor

`RELOAD_ACTIVE_HERMES_RUNTIME_AND_PROVE_THREE_ORACLE_CYCLES`
