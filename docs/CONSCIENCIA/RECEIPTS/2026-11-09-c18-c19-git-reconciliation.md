---
title: "C18/C19 Git Reconciliation — CentralDark main"
status: "VERIFIED_AND_PUBLISHED_ELIGIBLE_SCOPE"
date: 2026-11-09
updated: 2026-11-09T15:20:00Z
category: "RECEIPT"
sensitivity: INTERNAL
owner: "ServerVpss/CentralDark@main"
writer: "HERMES"
source_rule: "COMMITTED != PUSHED != DEPLOYED; UNKNOWN != PASS"
---

# C18/C19 Git Reconciliation

## Repository

```text
REPO=/data/cache/scratch/CentralDark
BRANCH=main
REMOTE=origin
REMOTE_URL=https://github.com/ServerVpss/CentralDark.git
```

## Reconciliation

Initial state had local commits ahead of `origin/main` and one remote commit
behind. The fetched remote commit was merged with the local verified commits
using the normal `ort` strategy.

```text
REMOTE_BEFORE=c388c1d4a3467b3e317056248995b24c9970610e
MERGE_COMMIT=a8952a696dfecbb5eb0b0ab3c7be5c118ba4d7e6
MERGE_CONFLICTS=0
RESET=false
CLEAN=false
FORCE_PUSH=false
DISCARD_DIRTY_WORKTREE=false
```

## Eligible verified commits

```text
cc8067c3c2b017c9df4ee54de49c8d2d98cb79ea  fix: align CentralDark self skill naming
32dffb97a4576ca1b19354e8713d32fd35f2efd8  docs: crystallize CentralDark golden terminal receipt
de009c3064e66ea42fd2986f6098425401f799fb  docs: update golden banner receipt
54dace6eb04e81efd9d5dc459e5c76b7070cc549  docs: receipt Hermes PT-BR i18n audit
c388c1d4a3467b3e317056248995b24c9970610e  remote: Hermes TUI transport and Kaizen documentation
a8952a696dfecbb5eb0b0ab3c7be5c118ba4d7e6  merge: local verified work with origin/main
```

All eligible commits passed `git diff --check`, naming/catalog tests, skin
readback, i18n structural coverage, overlay readback and secret-format scans.

## Publication proof

```text
PUSH=PASS
FETCH_AFTER_PUSH=PASS
LOCAL_HEAD=a8952a696dfecbb5eb0b0ab3c7be5c118ba4d7e6
REMOTE_MAIN=a8952a696dfecbb5eb0b0ab3c7be5c118ba4d7e6
REMOTE_SHA_READBACK=PASS
DIVERGENCE=0/0
```

This proves publication of the eligible committed scope. It does not prove
runtime deployment of every service or application represented by the repository.

## Dirty work preserved

The following work remains uncommitted and was not absorbed:

```text
16 tracked files:
apps/instinto-superior/package-lock.json
apps/instinto-superior/package.json
apps/modulos/Bolt/source/docs/poetry.lock
apps/modulos/Bolt/source/package.json
apps/modulos/Bolt/source/pnpm-lock.yaml
apps/modulos/Bolt/source/pnpm-workspace.yaml
apps/modulos/centraldark-halo-main/src-tauri/Cargo.lock
apps/modulos/elite-gateway/requirements.txt
apps/modulos/mcp-admin-ui/package-lock.json
apps/modulos/mcp-admin-ui/package.json
apps/modulos/obsidian-plugin-grafo-vivo/package-lock.json
docs/CONSCIENCIA/RECEIPTS/2026-11-09-cd-bridge-meta40-mcp-pairing.md
package-lock.json
package.json
scripts/remote-bridge/ui/package-lock.json
scripts/remote-bridge/ui/package.json

1 untracked directory:
apps/modulos/mcp/<caminho-vps>/
```

Classification:

```text
OWNER=EXTERNAL_OR_UNVERIFIED
STATUS=PENDING_OWNER_RECONCILIATION
COMMIT=FORBIDDEN_UNTIL_OWNER_AND_TESTS
```

These deltas were preserved. No `git add -A`, reset, clean, stash destructive,
force push, branch deletion or automatic squash was used.

The untracked MCP audit files had no detected GitHub PAT, OpenAI key, AWS key or
private-key marker. This scan is not a complete semantic secret audit.

## Gates

```text
VERIFIED_WORK_INVENTORIED=PASS
ELIGIBLE_DELTAS_COMMITTED=PASS
GIT_DIFF_CHECK=PASS
SECRET_FORMAT_SCAN=PASS
META_RSI_CATALOG=PASS
SKIN_AND_I18N_TESTS=PASS
REMOTE_SHA_READBACK=PASS
NO_DATA_LOSS=PASS_FOR_OBSERVED_OPERATIONS
NO_UNACCOUNTED_DIRTY_WORK=BLOCKED_PENDING_OWNER_CLASSIFICATION
RECEIPT_PERSISTED=PASS
```

## C19 distinction

```text
COMMITTED=bbd8397d772946bdfe8521dbc3f84504b08bbbfb
PUSHED=bbd8397d772946bdfe8521dbc3f84504b08bbbfb
DEPLOYED=UNKNOWN
RUNTIME_READBACK=PARTIAL
```

## NEXT_CURSOR

```text
CLASSIFY_16_TRACKED_AND_1_UNTRACKED_BY_OWNER
READ_PACKAGE_DIFFS_AND_LOCKFILE_PROVENANCE
RUN_OWNER_TESTS_BEFORE_ANY_COMMIT
COMMIT_ONLY_VALIDATED_OWNER_SCOPE
FETCH_READBACK_MAIN
THEN_CLOSE_C18_C19
```
