# Receipt — Oracle anti-dumb-loop recipe promotion

Date: 2026-10-08
Authority: SEGREDO/CHEFE
Owner: `.agents/skills/software-development/centraldark-oracle-surface/SKILL.md`
Test owner: `scripts/lupa/horn-reuse-fixed-point.test.mjs`
Status: CANONICAL_MAIN_READY_FOR_RUNTIME_SYNC

## Intent

Replace endless identical retries with a bounded Hermes loop that crystallizes a deterministic replay recipe, evolves the same CentralDark-owned skill only when the delta is generalizable and proven, and then returns to the same Goal/LOOP_ID.

## Reuse

```text
NO_NEW_RALPH_ENGINE=true
NO_NEW_SCHEDULER=true
NO_NEW_BRAIN=true
NO_PARALLEL_SKILL=true
HERMES_NATIVE_GOAL_REUSED=true
SKILL_SYNCHRONIZATION_OWNER_REUSED=true
```

The existing Ralph-related semantics in `.agents/skills/hermes/raciocinio-deliberado/SKILL.md` are treated as an analogy for persistent goal iteration, not as authority to create another engine.

## Canonical delta

```text
RALPH_STYLE_BOUNDED_RECIPE_LOOP=true
BLIND_RETRY_FORBIDDEN=true
NO_PROGRESS_REQUIRES_RECIPE_OR_EXACT_BLOCKER=true
ONE_IDENTICAL_REPLAY_MAX=1
SAME_FAILURE_FINGERPRINT_REUSES_PROVEN_RECIPE=true
SKILL_EVOLVES_ONLY_ON_GENERALIZABLE_PROVEN_DELTA=true
MAIN_FIRST_SKILL_PROMOTION=true
```

When the progress fingerprint repeats without information gain, Hermes stops the identical retry, reuses or derives a machine-consumable recipe, replays it once, counterproves it, promotes only a generalizable skill delta to the same skill on main, synchronizes through the existing skill-sync owner, and resumes the same Goal at NEXT_CURSOR.

## Counterproof boundary

```text
COMMIT != RUNTIME_SYNC
SYNCED != EXECUTED
RECIPE_PRESENT != RECIPE_REPLAY_PASS
ONE_TEST_FILE_PRESENT != FULL_E2E
UNKNOWN != PASS
```

Independent runtime drift must be preserved. A runtime `--apply/--seal` is not authorized by this receipt when the sync owner reports independent drift; reconcile first.

## Verification target

```text
SOURCE_MARKERS_PRESENT=PASS_EXPECTED
STATIC_CONTRACT_TEST=REQUIRED
MAIN_COMMIT=REQUIRED
RUNTIME_SKILL_HASH_READBACK=UNKNOWN_UNTIL_MEASURED
HERMES_RECIPE_REPLAY_E2E=UNKNOWN_UNTIL_MEASURED
FIXED_POINT=FALSE
```

NEXT_CURSOR=RUN_STATIC_TESTS_THEN_RECONCILE_SKILL_RUNTIME_DRIFT_THEN_REPLAY_RECIPE_ON_SAME_GOAL


## CHEFE sync crystal

```text
SYNC_REQUESTED_BY_CHEFE=true
CANONICAL_SKILL=.agents/skills/software-development/centraldark-oracle-surface/SKILL.md
CANONICAL_SKILL_VERSION=0.5.0
CENTRALDARK_AUTOSYNC=true
AUTOSYNC_POLICY=main-runtime-lock
SYNC_OWNER=.agents/skills/skill-synchronization/SKILL.md + scripts/skill-sync-check.sh
SYNC_SEQUENCE=--check -> reconcile independent runtime drift if any -> --apply -> --seal -> hash readback
BLIND_RUNTIME_OVERWRITE=false
SAME_GOAL_RETURN_REQUIRED=true
```

The canonical main is now explicitly the source for the next Hermes skill synchronization attempt. If the runtime skill has independent drift, the sync owner must preserve and reconcile that drift before apply/seal; this crystal is not permission to overwrite it blindly.

NEXT_CURSOR=HERMES_SKILL_SYNC_CHECK_RECONCILE_APPLY_SEAL_HASH_READBACK_THEN_RETURN_SAME_GOAL
