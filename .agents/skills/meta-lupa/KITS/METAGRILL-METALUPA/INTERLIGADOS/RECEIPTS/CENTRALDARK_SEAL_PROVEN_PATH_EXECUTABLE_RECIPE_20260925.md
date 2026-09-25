# CENTRALDARK - SEAL PROVEN PATH EXECUTABLE RECIPE

MISSION_ID=SEAL_PROVEN_PATH_EXECUTABLE_RECIPE_20260925
PR_MOTHER=#1562
PR_MOTHER_ROLE=RENDEZVOUS_LEDGER_NOT_WRITER
REPOSITORY=ServerVpss/CentralDark
OWNER_PATH=.agents/skills/meta-lupa/KITS/METAGRILL-METALUPA/INTERLIGADOS/RECEIPTS/
STATUS=EXECUTABLE_RECIPE_SEALED
PROMOTION_STATUS=BLOCKED_UNTIL_SAME_HEAD_GATES_PASS
REALITY_IS_JUDGE=true
UNKNOWN_IS_NOT_PASS=true
DOCUMENTED_IS_NOT_EXECUTED=true
ACTION_IS_NOT_PROOF=true
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
ONE_WRITER_PER_SCOPE=true
LIBRARY_IS_NOT_CANONICAL_FOR_THIS_RECEIPT=true
REPOSITORY_RECEIPT_IS_CANONICAL=true

## Purpose

Crystallize the session into a reusable execution recipe:

1. Use the already proven path.
2. Seal an executable receipt.
3. Store a detached fingerprint.
4. Let the next executor load the receipt.
5. Adapt only environment bindings.
6. Execute the same sequence.
7. Run the same proof.
8. Compare result, format, and effect.
9. If it diverges, record a new delta.
10. If it does not diverge, reuse the crystal.

## Canonical Rule

```text
CURRENT > HISTORY
UNKNOWN != PASS
DOCUMENTED != EXECUTED
ACTION != PROOF
MERGEABLE != GREEN
MERGED != DEPLOYED
HUD != RECEIPT
HUD != PROOF
REUSE_BEFORE_CREATE
ONE_SYSTEM_ONLY
ONE_WRITER_PER_SCOPE
PARALLELIZE_PERCEPTION_SERIALIZE_MUTATION
```

## Inputs Required

```yaml
required_inputs:
  mission_id: string
  owner_scope: string
  repo: ServerVpss/CentralDark
  base_ref: main
  head_sha: exact commit SHA under test
  environment:
    kind: casa | github | vps | mcp | other
    bindings_only: true
  recipe_sha256_file: CENTRALDARK_SEAL_PROVEN_PATH_EXECUTABLE_RECIPE_20260925.sha256
```

## Execution Contract

```yaml
steps:
  - id: load_recipe
    action: read this receipt and its detached sha256 file
    pass_if:
      - receipt_file_exists
      - sha256_matches_current_recipe_bytes
    fail_if:
      - receipt_missing
      - sha256_mismatch

  - id: bind_environment
    action: adapt only environment bindings
    allowed_delta:
      - local paths
      - credentials references without exposing secrets
      - hostnames
      - ports
      - process ids
      - connector ids
    forbidden_delta:
      - new architecture
      - duplicate owner
      - second router
      - second bridge
      - v2/v3/v4 rewrite

  - id: observe_current
    action: measure current state before mutation
    required_evidence:
      - head_sha
      - branch
      - dirty_state_or_remote_state
      - workflow_or_test_status
      - runtime_state_if_applicable

  - id: reuse_owner
    action: locate existing owner before creating anything
    pass_if:
      - owner_found_or_missing_proven
    fail_if:
      - owner_guess_only
      - duplicate_created_without_gap

  - id: execute_same_sequence
    action: run the same commands or tool sequence recorded for the proven path
    pass_if:
      - commands_completed
      - outputs_captured
      - exit_codes_recorded
    fail_if:
      - printed_command_only
      - queued_without_result_claimed_as_pass

  - id: run_same_proof
    action: rerun the same proof suite on the same HEAD or equivalent target
    required_checks:
      - syntax_or_compile_check_when_applicable
      - unit_or_contract_test_when_applicable
      - CI_same_head_when_github_target
      - healthcheck_when_runtime_target
      - counterproof
    pass_if:
      - all_applicable_checks_success
    fail_if:
      - any_applicable_check_failure
      - skipped_material_check
      - unknown_material_check

  - id: compare_effect
    action: compare result, format, and effect against the sealed recipe
    compare_dimensions:
      - output_shape
      - expected_files_or_receipts
      - command_exit_status
      - gate_status
      - runtime_or_ci_effect
      - no_regression

  - id: decide_delta
    action: classify the comparison result
    verdicts:
      no_divergence: REUSE_CRYSTAL
      divergence_with_material_gain: DELTA_NEW
      divergence_without_proof: UNKNOWN
      failed_gate: BLOCKED
```

## Verdict Matrix

| Observed state | Verdict | Action |
| --- | --- | --- |
| Same result, same format, same effect, same HEAD proof | REUSE_CRYSTAL | Reuse recipe and record NO_CHANGE |
| Same result but different harmless binding | REUSE_CRYSTAL_WITH_BINDING_DELTA | Record binding delta only |
| Different result with proven improvement | DELTA_NEW | Patch owner, test, receipt |
| Different result without proof | UNKNOWN | Do not promote |
| Gate failed | BLOCKED | Fix root cause before promotion |
| Check queued/cancelled/skipped | UNKNOWN | Wait or rerun; do not call PASS |

## Minimal Executable Sequence

```bash
# 1. Verify recipe fingerprint.
sha256sum -c CENTRALDARK_SEAL_PROVEN_PATH_EXECUTABLE_RECIPE_20260925.sha256

# 2. Measure current state.
git status --short
git rev-parse HEAD
git branch --show-current

# 3. Locate owner before mutation.
rg -n "SEAL_PROVEN_PATH|RECEIPT_REQUIRED|NEXT_CURSOR|FIXED_POINT|UNKNOWN != PASS|UNKNOWN_IS_NOT_PASS" .

# 4. Run the same proof where available.
node --test scripts/lupa/multi-model-delta-crystallizer.test.mjs

# 5. Compare and decide.
# PASS only if every applicable command and gate is success on the same HEAD.
```

## Required Receipt Output

```yaml
receipt:
  mission_id: SEAL_PROVEN_PATH_EXECUTABLE_RECIPE_20260925
  observed_at: ISO-8601
  executor: string
  environment: string
  head_sha: string
  base_sha: string | UNKNOWN
  recipe_sha256: string
  commands:
    - command: string
      exit_code: number
      summary: string
  evidence:
    - kind: git | test | ci | runtime | file | log
      status: PASS | FAIL | UNKNOWN | BLOCKED
      ref: string
  comparison:
    result: SAME | DIFFERENT | UNKNOWN
    format: SAME | DIFFERENT | UNKNOWN
    effect: SAME | DIFFERENT | UNKNOWN
  verdict: REUSE_CRYSTAL | DELTA_NEW | UNKNOWN | BLOCKED
  next_cursor: string
```

## Promotion Gate

Promotion is forbidden until all material checks for the target pass on the
same HEAD.

```text
MERGEABLE=true is not enough.
LOCAL_CONTRACT_TEST=PASS is not enough.
DOCUMENTED_RECEIPT is not enough.
SAME_HEAD_CI=success is required for GitHub promotion.
RUNTIME_HEALTH=PASS is required for runtime promotion.
COUNTERPROOF=PASS is required before fixed point.
```

## Current Session Crystal

```text
PROVEN:
- Multi-model reconciliation became a contract, not model-vs-model voting.
- The crystallized core is intersection + useful delta + measurement + receipt.
- Receipt and NEXT_CURSOR are mandatory.
- Unknown, skipped, queued, cancelled, or merely documented states do not promote.

NOT PROVEN HERE:
- Same-head CI is fully green.
- Runtime/deploy is live and healthy.
- The GitHub branch protection itself enforces every required gate.
- The seal-recipe package has passed every canonical gate.

NEXT_CURSOR:
Commit this receipt and detached fingerprint in the PR-mother ledger owner,
then let the next executor load the repository copy, adapt only environment
bindings, run the same sequence and proof, and classify divergence as DELTA_NEW
or no divergence as REUSE_CRYSTAL.
```
