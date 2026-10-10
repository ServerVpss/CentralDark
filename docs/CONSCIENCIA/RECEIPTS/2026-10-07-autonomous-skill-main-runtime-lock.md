# 2026-10-07 — Autonomous Skill Main ↔ Runtime Lock

INTENT=CHEFE requested that CentralDark autonomous skills stop drifting between canonical main and the live Hermes runtime.

OWNER=.agents/skills/skill-synchronization/SKILL.md
EXECUTOR=scripts/skill-sync-check.sh
ORACLE=.agents/skills/software-development/centraldark-oracle-surface/SKILL.md
WAKE_OWNER=CentralDark Eternal Self-Heal

## Delta

- Promotes the proven live `centraldark-oracle-surface` evolution back into the canonical repository before mirroring.
- Adds Domain / Turn Skill Evolution semantics to the same Oracle skill.
- Adds CHEFE intent calibration for autonomous memory promotion.
- Adds `centraldark_autosync` metadata to the CentralDark-owned autonomous/core skill family.
- Reuses one synchronization owner; no second scheduler or sync engine.
- Main remains canonical; runtime is a guarded mirror/evidence consumer.
- Independent runtime drift is preserved and routed through the Oracle instead of being overwritten.
- Every successful mirror is sealed by main SHA + canonical hash + runtime hash.
- The existing Eternal Self-Heal wake is the place where continuous reconciliation runs.

## Invariants

```text
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
ONE_WRITER_PER_SCOPE=true
NO_BLIND_OVERWRITE=true
ORACLE_OUTPUT_IS_CANDIDATE=true
CURRENT_MAIN_IS_CANONICAL=true
RUNTIME_IS_EVIDENCE_AND_CONSUMER=true
SYNCED != EXECUTED
UNKNOWN != PASS
```

## Scope

Only skills explicitly marked:

```yaml
centraldark_autosync: true
centraldark_autosync_policy: main-runtime-lock
oracle_review_on_change: true
```

are automatically mirrored. Unrelated third-party/security skills are not bulk-enabled.

## Runtime-drift contract

```text
RUNTIME == CANONICAL
→ SEALED

RUNTIME == PREVIOUS_SEALED_CANONICAL
+ MAIN_CHANGED
→ SAFE_FAST_FORWARD_RUNTIME_FROM_MAIN

RUNTIME_CHANGED_INDEPENDENTLY
→ PRESERVE_RUNTIME_DELTA
→ ORACLE_REQUIRED_RUNTIME_DRIFT
→ reconcile CHEFE intent + CURRENT main/docs + owner + live runtime
→ promote only surviving minimum delta canonically
→ rerun sync
→ hash seal
```

## Verification target

```text
MAIN_SHA=<origin/main>
AUTOSYNC_SKILLS=<count>
ORACLE_REQUIRED=0
CANONICAL_SKILL_HASH == RUNTIME_SKILL_HASH
MAIN_RUNTIME_LOCK=PASS
```

NEXT_CURSOR=TEST_COMMIT_SYNC_RUNTIME_AND_BIND_EXISTING_ETERNAL_SELF_HEAL
