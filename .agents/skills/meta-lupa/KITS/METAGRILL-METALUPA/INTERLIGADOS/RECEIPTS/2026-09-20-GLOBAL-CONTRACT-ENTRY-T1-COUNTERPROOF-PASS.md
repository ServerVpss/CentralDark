---
title: "Global Contract Entry — exact-head T1 + negative counterproof PASS"
status: "LOCAL_T1_PASS_AWAITING_SAME_HEAD_CI"
owner: "meta-lupa"
---

# 👑🪬 Global Contract Entry — T1 fechado

PR_MOTHER=#1562
CHILD_PR=#1597
TESTED_HEAD=86ca2a5ff204afc15ccab9d4a9ad1d03b4bcffb3

## Positive proof

universal-method-contract.mjs --self-test:

RETURN_CODE=0
UNIVERSAL_ENGINE_METHOD_SELF_TEST=PASS

Result exposes:
- global_contract_entry_policy=true
- outside_contract_mutation_fail_closed=true
- uncovered_case_minimal_contract_delta=true

## Negative counterproof

Only in ephemeral worktree:

outside_contract_mutation: FAIL_CLOSED
→ outside_contract_mutation: ALLOW_FOR_COUNTERPROOF_ONLY

Execution through subprocess argv[]:

NEGATIVE_RETURN_CODE=1
NEGATIVE_HAS_EXPECTED_SCOPE=true
NEGATIVE_HAS_PASS_MARKER=false
NEGATIVE_COUNTERPROOF=PASS

Expected failure scope:
GLOBAL_CONTRACT_ENTRY_POLICY_MISSING

## Restore proof

Original CONTRACT.yml restored.

RESTORED_RETURN_CODE=0
RESTORED_HAS_PASS=true
RESTORED_SELF_TEST=PASS

DIFF_CHECK=PASS
WORKTREE_REMOVED=true

## Verdict

GLOBAL_CONTRACT_ENTRY_POLICY_SOURCE=PASS
EXECUTABLE_CONSUMER_BINDING=PASS
NEGATIVE_FAIL_CLOSED_COUNTERPROOF=PASS
RESTORE_PASS=PASS

Meaning:
Any consumer running universal-method-contract.mjs cannot silently drop the global-entry law and remain green.

This does not yet prove every external model/runtime has loaded the contract in production.
SAME_HEAD_CI=UNKNOWN_UNTIL_MEASURED
GLOBAL_RUNTIME_INHERITANCE=UNKNOWN_UNTIL_RUNTIME_PROBE
GLOBAL_FIXED_POINT=false

## NEXT_CURSOR

Remeasure #1597 CURRENT HEAD and SAME-HEAD CI. If unchanged and causal gates green, promote according to existing governance; otherwise fix only current red causal wounds.
