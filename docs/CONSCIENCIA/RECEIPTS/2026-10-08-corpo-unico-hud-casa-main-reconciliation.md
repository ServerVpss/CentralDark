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

## 09/10/2026 — CentralDark Index + HUD CURRENT com proveniencia

**CHEFE:** atualizar o unico `CentralDark Index + HUD` em `main`, Casa Obsidian e VPS; trabalhar em frentes paralelas de leitura/subagente, sem writer concorrente.

**Before e owner:**
```text
OWNER_MAIN=docs/HUD/HUD.html
OWNER_CASA=C:\\Users\\Administrador\\Documents\\Obsidian Vault\\🪬Centraldark -HUD🪬\\HUD.html
CASA_BEFORE_SHA256=742C96AD46795723DBDA6ECE04F0C2907B3150A9A354B3D161D6381375154E47
MAIN_BEFORE_BLOB_SHA=f5295ec62e7b5c1bd3120fd3697831c0f3e2f0dd
CASA_VS_MAIN_DIFF=ONE_LINE_754_LAST_UPDATE_ONLY
CASA_OLD_LAST_UPDATE=2026-10-08_07:30_BRT
MAIN_OLD_LAST_UPDATE=2026-10-08_11:55_BRT
```

**Menor delta no mesmo `docs/HUD/HUD.html`:** inserir um quadro de proveniencia CURRENT no proprio Index/HUD, sem segundo arquivo/servico, expondo data de observacao, base main/VPS, estado Casa, inventario Triton `21 READY / 30 catalogados`, erro Kylin `INIT_FAILED:10`, cadeia de prova e `NEXT_CURSOR`. Indicador de **frescor do snapshot** passa a `STALE` apos 15 minutos; nao confundir a idade da medicao com disponibilidade de componentes. Polling One Heart 5s e logs integrados preexistentes continuam em seus owners. As cartas verdes com provas datadas 08/10 foram reclassificadas no HTML como `HISTORICO` / amarela; health 200 nao vira inferencia.

**Commits e readback:**
```text
HUD_MAIN_COMMIT_1=8252889f3436fa53ea60f4e8acc8699cae3e0ce9
HUD_MAIN_COMMIT_2=7eb0b359de5d3687fb4d8c16fef69ad09ee033af
HUD_MAIN_LAST_BLOB_SHA=2d96ace5fdc867c72408fb12b644de28a57bb637
GITHUB_SOURCE_READBACK_MATCH=PASS
CASA_AFTER_SHA256=B7DADED1EEF56E7441FE6FC6FD3ABB21D115789C83862435F4358EA757D2FA97
CASA_STAGE_SHA256=B7DADED1EEF56E7441FE6FC6FD3ABB21D115789C83862435F4358EA757D2FA97
CASA_AFTER_BYTES=165782
CASA_ORIGINAL_BACKUP_SHA256=742C96AD46795723DBDA6ECE04F0C2907B3150A9A354B3D161D6381375154E47
CASA_SOURCE_HASH_BACKCHECK=PASS
CASA_HTML_JS_SYNTAX=PASS_2_SCRIPT_BLOCKS
NO_BAT_MUTATION=true
NO_NEW_HUD=true
```

Casa foi atualizada **fisicamente** usando substituicao atomica apos conferir hash do original, com copias anteriores preservadas fora do vault no Temp. A prova do owner main foi feita lendo `docs/HUD/HUD.html` de volta em GitHub. Arquivo CSS/abas/notas/scripts do One Heart foram preservados.

**VPS/limite de execucao:** HEAD de checkout `bdf2f09ad` foi observado nesta rodada, enquanto a main avancou. O checkout tem dois artefatos nao rastreados `apps/modulos/HERMES-CORE/missions/` e `apps/modulos/mcp/src/agents/agents-main.zip`; o owner `scripts/vps/auto-sync-main.sh` bloqueia deliberadamente checkout dirty. Nao executar reset/stash/delete/merge ignorando essa trava. Workflow `vps-exec-selfhosted.yml` ja foi disparado automaticamente pela alteracao na main; seu efeito no HUD da VPS precisa de readback, e nao deve ser declarado por commit.

**Frente subagente READ_ONLY:** tentou-se o Claude CLI, bloqueado por limite semanal. Tentou-se o Codex CLI em modo `--sandbox read-only --ephemeral`, bloqueado por limite de uso; nenhum trabalho ou edicao foi atribuido falsamente ao subagente. Leituras de Casa/GitHub/VPS rodaram em paralelo por rotas autorizadas; **one writer por arquivo**.

```text
MAIN_HUD_SOURCE=PASS
CASA_PHYSICAL_HUD=PASS
CASA_VS_MAIN_SAME_STAGE_CONTENT=PASS
VPS_HUD_SYNC=UNKNOWN
VPS_RUNTIME_DEPLOY=UNKNOWN
SUBAGENT_RESULT=BLOCKED_QUOTA
FIXED_POINT_GLOBAL=FALSE
NEXT_CURSOR=MEASURE_VPS_AUTO_SYNC_GATE_AND_OWNER_FIRST_THEN_PRESERVE_UNTRACKED_THEN_SAFE_FAST_FORWARD_AND_HUD_HASH_READBACK
```
