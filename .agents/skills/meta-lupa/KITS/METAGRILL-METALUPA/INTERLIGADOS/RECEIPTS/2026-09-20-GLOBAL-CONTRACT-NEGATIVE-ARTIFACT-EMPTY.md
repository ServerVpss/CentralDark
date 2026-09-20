---
title: "Global Contract negative counterproof — wrapper swallowed target output"
status: "WRAPPER_CONFIRMED_TARGET_SIGNATURE_UNKNOWN"
owner: "meta-lupa"
---

# 👑🪬 Contraprova global — artefato vazio

PR_MOTHER=#1562
CHILD_PR=#1597
TESTED_HEAD=86ca2a5ff204afc15ccab9d4a9ad1d03b4bcffb3

## Worktree

HEAD exato confirmado.

Status local:
- CONTRACT.yml modificado apenas para a contraprova;
- backup local presente;
- artefatos temporários presentes.

## Artefatos

.tmp-negative.txt = vazio
.tmp-negative.err = vazio

O PowerShell gerou NativeCommandError no host, mas não preservou a saída do processo nos arquivos esperados.

## Veredito

NEGATIVE_TARGET_SIGNATURE=UNKNOWN.
POWERSHELL_INTERCEPTED_NATIVE_FAILURE=true.
TARGET_NOT_CLASSIFIED_FROM_EMPTY_ARTIFACT=true.

## NEXT_CURSOR

Usar Python subprocess argv[] no mesmo worktree e no mesmo CONTRACT.yml localmente alterado:
- capturar returncode/stdout/stderr diretamente;
- exigir returncode != 0;
- exigir GLOBAL_CONTRACT_ENTRY_POLICY_MISSING;
- restaurar backup;
- reexecutar self-test positivo;
- remover worktree.
