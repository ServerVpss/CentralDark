---
title: "Global Contract Entry T1 — negative counterproof wrapper failure"
status: "WRAPPER_FAILURE_TARGET_PENDING_CLASSIFICATION"
owner: "meta-lupa"
---

# 👑🪬 Global Contract Entry — T1 parcial

PR_MOTHER=#1562
CHILD_PR=#1597
TESTED_HEAD=86ca2a5ff204afc15ccab9d4a9ad1d03b4bcffb3

## Prova positiva

universal-method-contract.mjs --self-test:

UNIVERSAL_ENGINE_METHOD_SELF_TEST=PASS
POSITIVE_EXIT=0

Resultado expôs:
- global_contract_entry_policy=true
- outside_contract_mutation_fail_closed=true
- uncovered_case_minimal_contract_delta=true

## Contraprova negativa

O worktree alterou somente localmente:

outside_contract_mutation: FAIL_CLOSED
→ outside_contract_mutation: ALLOW_FOR_COUNTERPROOF_ONLY

Ao executar o self-test esperado para falhar, o Node escreveu em stderr.

PowerShell estava com:
ErrorActionPreference=Stop

O host converteu stderr do processo nativo em:
NativeCommandError

e encerrou o harness antes de:
- classificar a mensagem do target;
- restaurar/retestar;
- remover o worktree.

## Classificação

POSITIVE_TARGET=PASS.
NEGATIVE_TARGET_EXPECTED_TO_FAIL_BUT_NOT_YET_CLASSIFIED=true.
POWERSHELL_NATIVE_STDERR_WRAPPER_ABORT=true.
WRAPPER_FAILURE != TARGET_FAILURE.
WORKTREE_CLEANUP_PENDING=true.

## NEXT_CURSOR

Ler os arquivos .tmp-negative.* já produzidos no exact-head worktree; confirmar se o target falhou com GLOBAL_CONTRACT_ENTRY_POLICY_MISSING. Depois restaurar o contrato local, reexecutar PASS e remover worktree.
