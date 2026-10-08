# Receipt — Corpo Único HUD Casa ↔ main reconciliation

Date: 2026-10-08
Authority: SEGREDO/CHEFE
Mode: DIRECT_MAIN_MINIMUM_DELTA

## Current measured

```text
MAIN_BEFORE=4e31346ce4046d0dfab90d341bfe37b8f6a5bf02
VPS_GIT_STATUS={   "cwd": "<caminho-vps>",   "exitCode": 0,   "stdout": "?? apps/modulos/HERMES-CORE/missions/\n--- branch ---\nmain\n--- last commit ---\n743b7e9cc fix(oracle): preserve loop continuity envelope\n",   "stderr": "" }
VPS_SCRIPTS_CASA={   "status": "OK",   "root": "project",   "path": "scripts/casa",   "maxDepth": 2,   "count": 4,   "truncated": false,   "tree": [     "📄 discover-operational-channels.ps1",     "📄 garimpo-proof-gc.ps1",     "📄 promover-aprendizado-hermes.ps1",     "📄 sync-hermes-obsidian.ps1"   ] }
```

The current `main` and VPS `scripts/casa` did not contain `CENTRALDARK-CORPO-UNICO-HUD-LOGS.bat`. The architecture already names that BAT as the Casa HUD surface, so the missing source is filled under the existing `scripts/casa` owner rather than by creating a second HUD system.

## Promoted source

```text
PATH=scripts/casa/CENTRALDARK-CORPO-UNICO-HUD-LOGS.bat
SOURCE_UPLOAD=CENTRALDARK-CORPO-UNICO-HUD-LOGS(4).bat
SHA256=a51cca37358f90ab6e644d3a7eb22002c4f93ef3ece5a0e01a28b545bb6479be
MODE=READ_ONLY_MONITOR
SINGLE_INSTANCE_MUTEX=true
SCREENPIPE_AUTOSTART=false
SSH_BATCHMODE=true
STRICT_HOST_KEY_CHECKING=true
UNKNOWN_IS_NOT_PASS=true
```

## Bridge comparison

```text
SOURCE_UPLOAD=CENTRALDARK-CORPO-UNICO-HUD-BRIDGE(2).ps1
SHA256=a554a7907a268980bf699aa62e5e0c7d4d8f31323dfe6611ab7a3ee2ac3631b7
PROMOTION=NOT_PROMOTED_AS_RUNTIME_OWNER
REASON=contains Start-ScreenpipeHidden and npx screenpipe record; potential second Screenpipe writer
USEFUL_DELTA=keep as candidate evidence for future owner-local absorption
```

No Casa file was overwritten by this commit. No VPS runtime mutation was executed. The commit only establishes the canonical Git source and documents the promotion boundary.

## Counterproof

```text
COMMIT != CASA_RUNTIME
COMMIT != VPS_RUNTIME
SOURCE_PRESENT != WINDOWS_E2E_PASS
BRIDGE_NOT_PROMOTED != BRIDGE_DELETED
UNKNOWN != PASS
```

NEXT_CURSOR=SYNC_CANONICAL_BAT_TO_CASA_ONLY_AFTER_ACTIVE_FILE_HASH_READBACK_AND_SINGLE_WRITER_CHECK
FIXED_POINT=FALSE


## Readback after promotion

```text
MAIN_SOURCE_READBACK_EQUALS_UPLOAD=true
MAIN_SOURCE_BLOB_SHA=431fcd24f33335ca6538ee4e7c76634d57e7976c
UPLOAD_SHA256=a51cca37358f90ab6e644d3a7eb22002c4f93ef3ece5a0e01a28b545bb6479be
BRIDGE_UPLOAD_SHA256=a554a7907a268980bf699aa62e5e0c7d4d8f31323dfe6611ab7a3ee2ac3631b7
VPS_RUNTIME_SYNC=NOT_EXECUTED
```
