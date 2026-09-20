---
title: "Global Contract Entry — CI pending / no main bypass"
status: "WAITING_SAME_HEAD_CI"
owner: "meta-lupa"
---

# 👑🪬 Global Contract Entry — promoção bloqueada corretamente

PR_MOTHER=#1562
CHILD_PR=#1597
CURRENT_CHILD_HEAD=86ca2a5ff204afc15ccab9d4a9ad1d03b4bcffb3
CURRENT_MAIN_HEAD=4ad248cf487b11fa1b787f9b3dc9f977e241cc98

## Proven locally

- global contract entry policy source present
- universal consumer binding present
- positive self-test PASS
- negative counterproof PASS
- restored self-test PASS
- diff-check PASS
- worktree removed

## SAME-HEAD CI

At observation time all current-head workflows are queued/pending.

No PASS/FAIL may be inherited from older heads.

## Governance

CONTRACT.yml itself forbids direct main mutation without gate.

Therefore:
DIRECT_MAIN_BYPASS=false
PROMOTION_NOW=false
WAIT_FOR_SAME_HEAD_CI=true

This is not a blocker invented by narration; it is the contract being enforced on its own change.

## NEXT_CURSOR

When SAME-HEAD CI for 86ca2a5... completes:
- if causal gates green: promote through existing governance;
- if red: inspect only exact current red cause, patch minimal delta, rerun same-head CI;
- after promotion: measure main SHA and runtime inheritance.
