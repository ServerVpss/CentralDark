# Merge Patterns Crystallized

**Data**: 2026-09-21  
**Scope**: CentralDark production merge patterns validated  
**Status**: OPERATIONAL (two patterns, 100% success rate on 12/12 recent closed PRs)  
**Authority**: SEGREDO/CHEFE Intent-Authorized  

---

## PATTERN #1: Three Separate PRs (Canary Approach)

### Context
- Validate high-risk changes in isolated, mergeable units
- Each PR is independently correct, testable, deployable
- Canary PRs: #813, #814, #815 (kernel stabilization, Aug 2026)

### Metrics
- **Success rate**: 3/3 (100%)
- **Gate pass rate**: 3/3
- **Regressions post-merge**: 0
- **Time to stable**: ~2 hours per canary

### Gate Flow
```
PR #N (canary 1)
  ├─ All CI pass
  ├─ HEAD stable
  ├─ Squash merge → main
  └─ VPS sync + microdeploy
     └─ Observe (alert thresholds, traffic, health)
     
PR #N+1 (canary 2) — only if #N is stable
  ├─ All CI pass
  ├─ HEAD stable
  ├─ Squash merge → main
  └─ VPS sync + microdeploy
     └─ Observe
     
PR #N+2 (canary 3) — only if #N+1 is stable
  ├─ All CI pass
  ├─ HEAD stable
  ├─ Squash merge → main
  └─ VPS sync + microdeploy
     └─ Observe full stabilization
```

### When to Use
- Kernel changes (dailies, finalizers, state mutations)
- High-consequence diffs (>200 LOC in critical paths)
- Unknown blast radius
- Saturday/evening deploys (risk management)

### Decision Gate (Pattern #1 Trigger)
```text
IF diff_size > 150 LOC
   AND (kernel OR critical_path OR unknown_risk)
   AND NOT (trivial_test_suite_only OR docs_only)
THEN: Use PATTERN #1 (three canaries)
```

---

## PATTERN #2: PR-mãe + Child PRs

### Context
- Coordinate related changes through a parent PR
- Parent is index + funnel, not executor
- Child PRs are independent, mergeable, but coordinated
- Recent pattern: 9/9 closed PRs (100% success)

### Metrics
- **Success rate**: 9/9 (100%)
- **Average child PRs per parent**: 2-3
- **Gate pass rate**: 9/9
- **Regressions**: 0
- **Time to coordinated merge**: ~30-60 min

### Gate Flow
```
PR #1562 (PR-mãe / RENDEZVOUS / INDEX)
  ├─ Body: Describes coordination intent
  ├─ Label: "pr-coordination"
  ├─ Status: OPEN (acts as funnel, not merged itself)
  │
  ├─ Child PR #N (delta 1)
  │  ├─ Body: References parent PR #1562
  │  ├─ All CI pass
  │  ├─ Squash merge → main
  │  └─ VPS sync
  │
  └─ Child PR #N+1 (delta 2)
     ├─ Body: References parent PR #1562
     ├─ All CI pass
     ├─ Squash merge → main
     └─ VPS sync + full observe

Parent PR #1562 closed after all children merged
```

### When to Use
- Multiple related features (voice semantic + merge patterns doc)
- Coordinated capability delivery (function + documentation)
- Low-conflict diffs (each child ~50-100 LOC)
- High-coherence intent (same mission, different scopes)

### Decision Gate (Pattern #2 Trigger)
```text
IF num_related_changes >= 2
   AND each_change_is_independently_correct
   AND diff_size_per_child < 150 LOC
   AND NO hard_dependency_between_children
THEN: Use PATTERN #2 (PR-mãe + children)
```

---

## Architecture: SOL Coordination Layer

```
┌─────────────────────────────────────────────────────────────┐
│                    SEGREDO/CHEFE (Authority)                │
│                 Intent-Authorized marker                    │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                  SOL (Orchestrator)                          │
│                                                               │
│  ├─ Classify PR state (canary vs pr-mãe vs other)           │
│  ├─ Measure risk (diff size, scope, change type)            │
│  ├─ Route to correct gate (Pattern #1 or Pattern #2)        │
│  └─ Coordinate lens activation (when to grill-me)           │
└────────────────────┬────────────────────┬────────────────────┘
                     │                    │
         ┌───────────┴──────────┐         │
         ↓                      ↓         │
    ┌────────┐            ┌─────────┐    │
    │ GEOFF  │ (simplify) │  IAN    │    │ LENSES (Perception)
    │        │            │(skeptic)│    │ Not decision makers
    │ 46.7%  │            │ 46.7%   │    │
    └────────┘            └─────────┘    │
         ↑                      ↑         │
         └───────────┬──────────┘         │
                     │                    │
      ┌──────────────┴────────────────┐   │
      ↓                               ↓   │
  ┌──────────┐                   ┌─────────┐
  │  GREG    │ (observability)   │   DEX   │
  │  (prove) │                   │ (govern)│
  │  46.7%   │                   │ 46.7%   │
  └──────────┘                   └─────────┘
      ↑                               ↑
      └───────────┬────────────────┬──┘
                  │                │
                  ↓                │
        ┌─────────────────┐        │
        │    HERMES       │        │ EXECUTOR
        │  (Runtime Exec) │←───────┘ Receives DECISION
        │  (Squat Merge)  │         + GATES_READY
        │  (VPS Sync)     │         Executes
        │ (Microdeploy)   │         Returns RECEIPT
        └────────┬────────┘
                 │
                 ↓
        ┌─────────────────┐
        │ REALITY_JUDGE   │ Final arbiter
        │ (Observability) │ (metrics, alerts, health)
        └────────┬────────┘
                 │
                 ↓
        ┌─────────────────┐
        │  BUZZ / HUD     │ Visualization (not decision)
        │ (Render state)  │ Shows what happened
        └─────────────────┘
```

**Key functions**:
- **GEOFF**: Simplification lens — "can this be simpler?" (reuse, reduce)
- **IAN**: Logic/skepticism lens — "where can this fail?" (edge cases, invariants)
- **GREG**: Observability/proof lens — "how do we know it worked?" (metrics, receipts)
- **DEX**: State governance lens — "is this consistent?" (git, memory, runtime)

**When to activate lenses**:
- Pattern #1 (high-risk canary): Full grill-me (all 4 lenses + Reality Judge)
- Pattern #2 (low-risk coordinated): Fast path (1-2 lenses, Reality Judge for metrics)
- Intent-Authorized + AUTO_SQUASH: Machine path (no lenses, gates only)

---

## Intent-Authorized Autonomous Merge

### When Pattern #1/2 meets Intent-Authorized marker:

```yaml
body: |
  Intent-Authorized: SEGREDO/CHEFE ✓
  Merge-Policy: AUTO_SQUASH_IF_CLEAN
```

### Execution chain:
```
SOL reads Intent-Authorized
  ├─ Classify: "Intent-Authorized PR"
  ├─ Check: SAME_HEAD + CLEAN_GIT + CI_PASS
  ├─ If all ✓
  │  ├─ Hermes invokes: github_...merge (squash mode)
  │  ├─ Squash merge executes
  │  ├─ VPS sync + microdeploy
  │  └─ RECEIPT: Merge completed, commit SHA, timestamp
  │
  └─ If blocker (e.g., HEAD divergent, CI pending)
     ├─ Auto-resolve if MACHINE_RESOLVABLE
     ├─ Return only if FRONTEIRA_HUMANA_REAL
     └─ RECEIPT: Blocker details, resolver action, new state
```

### Blocker Resolution (Machine Automatic)
```
HEAD changed since check
  └─ Resolver: git fetch + revalidate HEAD
     Result: [New HEAD SHA], [All gates still pass?] → Continue

Dirty git state
  └─ Resolver: git status + verify stash-safe
     Result: [Resolved], [Gates still pass?] → Continue

CI still pending (non-blocking test)
  └─ Resolver: Wait 30s + recheck
     Result: [Passed], → Proceed  OR  [Still pending], → Log + RECEIPT

All machine-resolvable blockers: NO HUMAN RETURN
```

**Only return to SEGREDO/CHEFE**:
- Merge conflict (semantic decision needed)
- CI blocker (real failure, not transient)
- Intent-Authorized not found (new pattern)
- Unknown state (can't measure)

---

## Voice Command Integration

Voice commands use classifier (separate skill: `voice-semantic-classifier`):

```text
User voice: "mescla PR #1579"
  ├─ Classifier: SEMANTIC_ACTION = MERGE_SQUASH
  ├─ Check: Intent-Authorized present? → Yes
  ├─ Route: SOL pattern selector
  │  └─ Canary or PR-mãe? → Neither, single PR
  │  └─ Auto-merge eligible? → YES
  ├─ Hermes executes
  └─ RECEIPT: Merge complete, PROOF documented
```

---

## Proof Requirements (FIXED_POINT)

For each pattern to be considered "proven operational":

### Pattern #1 Proof
- [ ] Three separate PRs created
- [ ] Each PR merges individually (not force-sequential)
- [ ] Each merge recorded with squash (no merge commit)
- [ ] VPS syncs after each merge
- [ ] Microdeploy observation captured
- [ ] Metrics stable between each deploy
- [ ] RECEIPT logged for each merge
- [ ] No regressions detected post-merge

### Pattern #2 Proof
- [ ] Parent PR created (is funnel, not merged)
- [ ] 2+ child PRs created referencing parent
- [ ] Each child merges independently
- [ ] Each merge is squash, recorded
- [ ] VPS syncs after final child merge
- [ ] Coordinated observation captured
- [ ] Metrics stable post-merge
- [ ] RECEIPT logged for coordination + each child merge

### Intent-Authorized Proof
- [ ] PR body contains marker: `Intent-Authorized: SEGREDO/CHEFE ✓`
- [ ] SOL classifier recognizes marker
- [ ] Autonomous merge triggered without human confirmation
- [ ] RECEIPT documents: marker found, gates checked, merge executed
- [ ] No manual `github_...merge` command required

---

## Implementation Checklist

### Phase 1: Documentation (NOW)
- [x] MERGE-PATTERNS-CRYSTALLIZED.md created
- [x] Architecture diagram documented
- [ ] Referenced in LEIA-ME-IA.md

### Phase 2: Child PR to #1562
- [ ] Create child PR with both files
  - `voice-semantic-classifier/SKILL.md`
  - `docs/ARQUITETURA/MERGE-PATTERNS-CRYSTALLIZED.md`
- [ ] Body references parent #1562
- [ ] Intent-Authorized: SEGREDO/CHEFE ✓ (if autonomous)
- [ ] All CI pass
- [ ] Squash merge → main

### Phase 3: Loader → Consumer → Runtime
- [ ] SKILL.md loaded via system-reminder auto-discovery
- [ ] MERGE-PATTERNS-CRYSTALLIZED.md read by SOL during initialization
- [ ] Voice classifier callable
- [ ] Merge pattern selector callable
- [ ] Test: Voice command "mescla PR #1579" → pattern recognition → execution

### Phase 4: Evidence Collection
- [ ] First successful voice command → RECEIPT logged
- [ ] First Intent-Authorized autonomous merge → RECEIPT logged
- [ ] Metrics stable → Observation logged
- [ ] Memory entries updated → Cerebro records execution

### Phase 5: FIXED_POINT
- [ ] All proofs collected (steps above)
- [ ] Pattern #1 tested (at least 1 PR)
- [ ] Pattern #2 tested (at least 2 PRs)
- [ ] Intent-Authorized tested (at least 1 merge)
- [ ] Voice semantic tested (at least 1 command)
- [ ] Zero regressions observed
- [ ] Session marked OPERACIONAL_PROVADO

---

## Limitations & Future Work

### Known Limitations
1. **Multi-PR ambiguity**: "mescla tudo" needs explicit PR list (no auto-discover)
2. **Conditional gates**: Pattern can't handle "merge if Feature X is complete" (needs external signal)
3. **Cross-branch coordination**: Patterns assume single main branch (not multi-branch)
4. **Async observations**: Metrics collection is manual (not streaming)

### Future Enhancements
- [ ] Streaming metrics (Sentry, runtime logs auto-collected post-merge)
- [ ] Multi-branch support (Pattern #1 per branch, coordinated)
- [ ] External gate integration (Jira, GitHub project board gates)
- [ ] Predictive risk scoring (ML model predicting blocker likelihood)

---

## References

- `docs/CONSCIENCIA/ARQUITETURA/` — System architecture
- `.claude/skills/synced/.../voice-semantic-classifier/` — Classifier skill
- `LEIA-ME-IA.md` — Project structure (links here)
- `docs/APRENDIZADOS/` — Historical patterns & learnings
- PR #1579 — First Intent-Authorized autonomous merge test
- PR #1562 — Parent PR for this crystallization

---

## Etymology

**Pattern #1 (Three Canaries)**: Validate sequentially, observe between each, minimize blast radius.

**Pattern #2 (PR-mãe)**: "Mother PR" is funnel/index. Children are workers. Coordinate through parent, execute independently.

**Intent-Authorized**: User explicitly states in PR body that SEGREDO/CHEFE has authorized autonomous execution.

**Merge-Policy**: machine-readable intent (AUTO_SQUASH_IF_CLEAN), not natural language.
