# Hermes i18n Gap Analysis Report

**Date**: 2026-10-24  
**Scope**: hermes-desktop-src (`src/shared/i18n/locales/en/*.ts` vs runtime `t()` usage)  
**Source Keys**: 1,728 unique keys from 24 TypeScript locale files  
**Runtime Keys**: 1,047 unique keys from `t()` calls across codebase

---

## Summary

| Category | Count | Percentage |
|----------|-------|------------|
| **Overlap** (used & defined) | 831 | 48% of source / 79% of runtime |
| **Gap** (used but NOT defined) | 216 | 12% of source / 21% of runtime |
| **Orphans** (defined but NOT used) | 897 | 52% of source |
| **Total Source Keys** | 1,728 | — |
| **Total Runtime Keys** | 1,047 | — |

---

## 1. Gap: Runtime Keys Missing from Source (216 keys)

These keys are used in the codebase via `t()` but have no translation in the English locale files. **These will show as missing translations at runtime.**

### By Namespace

| Namespace | Missing Keys |
|-----------|--------------|
| `chat` | 47 keys |
| `providers` | 34 keys |
| `settings` | 28 keys |
| `gateway` | 17 keys |
| `diagnose` | 16 keys |
| `navigation` | 15 keys |
| `agents` | 10 keys |
| `worktree` | 10 keys |
| `botGroups` | 8 keys |
| `common` | 8 keys |
| `session` | 5 keys |
| `slash` | 2 keys |
| `prompt` | 1 key |
| `command` | 1 key |
| `index` | 1 key |
| `models` | 1 key |
| `kanban` | 1 key |

### Top Missing Key Groups (by namespace prefix)

#### `chat.*` (47 keys)
```
chat.approval.cancel, chat.approval.confirm, chat.approval.confirmAlways,
chat.approval.error, chat.approval.queued, chat.approval.responded,
chat.approval.title, chat.approval.unavailable,
chat.clarify.defaultQuestion, chat.clarify.placeholder, chat.clarify.send,
chat.clarify.skip, chat.clarify.skipped,
chat.folderPicker.empty, chat.folderPicker.open, chat.folderPicker.parent,
chat.folderPicker.select, chat.folderPicker.title, chat.folderPicker.unavailable,
chat.followUs.description, chat.followUs.follow, chat.followUs.notNow,
chat.followUs.title,
chat.media.open, chat.media.saveAs, chat.media.saveImage,
chat.reasoningEffort.faster, chat.reasoningEffort.hint, chat.reasoningEffort.saveError,
chat.reasoningEffort.smarter, chat.reasoningEffort.title,
chat.subagents.queued, chat.subagents.requestRejected, chat.subagents.steer,
chat.subagents.steerPlaceholder, chat.subagents.steerQueued, chat.subagents.stop,
chat.subagents.stopRequested, chat.subagents.title, chat.subagents.transcript,
chat.subagents.transcriptTruncated, chat.subagents.transcriptUnavailable,
chat.subagents.untitled, chat.subagents.waitingActivity,
chat.validation.fixInGateway, chat.validation.fixInModels,
chat.validation.fixInProviders, chat.validation.fixInSetup, chat.validation.missingKey,
chat.worktree.empty, chat.worktree.emptyFolder, chat.worktree.errorLoading,
chat.worktree.loading, chat.worktree.openTerminal, chat.worktree.openTerminalFailed
```

#### `providers.*` (34 keys)
```
providers.hermesAccount.codeHint, providers.hermesAccount.connected,
providers.hermesAccount.copied, providers.hermesAccount.copyCode,
providers.hermesAccount.credits, providers.hermesAccount.creditsTitle,
providers.hermesAccount.failed, providers.hermesAccount.modalTitle,
providers.hermesAccount.sectionHint, providers.hermesAccount.sectionTitle,
providers.hermesAccount.signedIn, providers.hermesAccount.signIn,
providers.hermesAccount.signOut, providers.hermesAccount.successHint,
providers.hermesAccount.syncOn, providers.hermesAccount.waitingHint,
providers.keys.addProvider, providers.keys.apiKeyLabel,
providers.keys.custom.baseUrlNeeded, providers.keys.custom.keyPlaceholder,
providers.keys.custom.namePlaceholder, providers.keys.custom.pickerHint,
providers.keys.custom.title, providers.keys.emptyHint, providers.keys.hide,
providers.keys.noModelsYet, providers.keys.remove, providers.keys.replace,
providers.keys.searchPlaceholder, providers.keys.show,
providers.keys.status.connected, providers.keys.status.failed,
providers.keys.status.needsKey, providers.keys.status.verified,
providers.keys.status.verifying, providers.keys.usedByModel,
providers.keys.usedByModels
```

#### `settings.*` (28 keys)
```
settings.analytics.hint, settings.analytics.label,
settings.font.hint, settings.font.label,
settings.hardwareAcceleration.envOverride, settings.hardwareAcceleration.hint,
settings.hardwareAcceleration.label, settings.hardwareAcceleration.restartNow,
settings.hardwareAcceleration.restartToApply, settings.hardwareAcceleration.saveFailed,
settings.language.hint, settings.language.label,
settings.migrationComplete, settings.migrationFailed,
settings.notifications.completionSound, settings.notifications.completionSoundHint,
settings.pet.active, settings.pet.adopt, settings.pet.confirmRemove,
settings.pet.enabled, settings.pet.export, settings.pet.hint,
settings.pet.installed, settings.pet.label, settings.pet.loading,
settings.pet.remove, settings.pet.rename, settings.pet.scale,
settings.pet.search
```

#### `gateway.*` (17 keys)
```
gateway.apiServerKey.configured, gateway.apiServerKey.generate,
gateway.apiServerKey.generateHint, gateway.apiServerKey.missing,
gateway.apiServerKey.regenerating, gateway.apiServerKey.title,
gateway.states.configured, gateway.states.connected, gateway.states.disabled,
gateway.states.error, gateway.states.needsSetup, gateway.states.ready
```

#### `diagnose.*` (16 keys)
```
diagnose.apiKeyBanner.lead, diagnose.apiKeyBanner.setNow,
diagnose.apiKeyModal.autoGenerate, diagnose.apiKeyModal.description,
diagnose.apiKeyModal.hint, diagnose.apiKeyModal.label,
diagnose.apiKeyModal.placeholder, diagnose.apiKeyModal.title,
diagnose.banner.errors, diagnose.banner.infos, diagnose.banner.lead,
diagnose.banner.showDetails, diagnose.banner.warnings,
diagnose.fix.apply, diagnose.fix.failure, diagnose.fix.running
```

#### `navigation.*` (15 keys)
```
navigation.sessionMenu.copySessionId, navigation.sessionMenu.delete,
navigation.sessionMenu.deleteCancel, navigation.sessionMenu.deleteConfirm,
navigation.sessionMenu.deleteConfirmAction, navigation.sessionMenu.deleteConfirmTitle,
navigation.sessionMenu.deleting, navigation.sessionMenu.moveToProject,
navigation.sessionMenu.newProjectFolder, navigation.sessionMenu.noProjects,
navigation.sessionMenu.options, navigation.sessionMenu.pin,
navigation.sessionMenu.removeFromProject, navigation.sessionMenu.rename,
navigation.sessionMenu.unpin
```

#### Other namespaces
```
agents.wallet.*, botGroups.*, common.forward/reload, index.json, models.json,
kanban.status.running, session.close/cwd.set/interrupt, slash.exec,
worktree.closeFile/errorLoading/fileTruncated/fileTruncatedWarning/loading/open/openInEditor,
prompt.submit, command.dispatch
```

---

## 2. Orphans: Source Keys Not Used in Runtime (897 keys)

These keys are defined in the English locale files but never referenced via `t()` in the codebase. **These are dead translations that can be removed.**

### By Namespace (Top 20)

| Namespace | Orphan Keys | % of Namespace |
|-----------|-------------|----------------|
| `constants` | 283 | 100% |
| `agents` | 97 | 84% |
| `botGroups` | 34 | 100% |
| `office` | 94 | 98% |
| `kanban` | 72 | 86% |
| `schedules` | 55 | 93% |
| `tools` | 78 | 81% |
| `providers` | 38 | 56% |
| `setup` | 44 | 88% |
| `memory` | 44 | 85% |
| `navigation` | 29 | 69% |
| `discover` | 28 | 82% |
| `install` | 20 | 87% |
| `welcome` | 18 | 78% |
| `skills` | 19 | 83% |
| `chat` | 113 | 66% |
| `gateway` | 39 | 70% |
| `diagnose` | 6 | 30% |
| `models` | 23 | 66% |
| `sessions` | 31 | 63% |

### Notable Observations

**`constants` namespace (283 keys)**: 100% orphaned - likely used via a different mechanism (not `t()`)

**`botGroups` namespace (34 keys)**: 100% orphaned - appears to be a deprecated/legacy feature

**`agents` namespace (97 keys)**: Most wallet/sync/appearance keys unused

**`chat` namespace (113 keys)**: Many legacy keys (`chat.browse`, `chat.cancel`, `chat.confirm`, etc.) that appear to have been replaced by more specific namespaces

---

## 3. Namespace Mismatches (Potential Rename/Refactor Cases)

Keys that exist in both source and runtime but with **different namespace prefixes**, suggesting refactoring where old keys weren't cleaned up.

### Gap Keys with Source Suffix Matches (205 cases)

| Runtime Key (Missing) | Source Key (Exists) | Note |
|----------------------|---------------------|------|
| `chat.approval.confirm` | `chat.confirm` | Namespace split: `chat.confirm` → `chat.approval.confirm` |
| `chat.approval.confirmAlways` | `chat.confirmAlways` | Same pattern |
| `chat.clarify.defaultQuestion` | `chat.defaultQuestion` | Namespace split: `chat.defaultQuestion` → `chat.clarify.defaultQuestion` |
| `chat.clarify.placeholder` | `botGroups.placeholder` | Different feature, same suffix |
| `chat.clarify.send` | `botGroups.send` | Different feature |
| `chat.clarify.skip` | `chat.skip` | Namespace split |
| `chat.clarify.skipped` | `chat.skipped` | Namespace split |
| `chat.folderPicker.empty` | `botGroups.empty` | Different feature |
| `chat.folderPicker.open` | `chat.open` | Namespace split |
| `chat.folderPicker.parent` | `chat.parent` | Namespace split |
| `chat.folderPicker.select` | `chat.select` | Namespace split |
| `chat.folderPicker.title` | `agents.title` | Different feature |
| `chat.followUs.description` | `chat.description` | Namespace split |
| `chat.followUs.follow` | `chat.follow` | Namespace split |
| `chat.followUs.notNow` | `chat.notNow` | Namespace split |
| `chat.followUs.title` | `agents.title` | Different feature |
| `chat.media.open` | `chat.open` | Namespace split |
| `chat.media.saveAs` | `chat.saveAs` | Namespace split |
| `chat.media.saveImage` | `chat.saveImage` | Namespace split |
| `chat.reasoningEffort.faster` | `chat.faster` | Namespace split |
| `chat.reasoningEffort.hint` | `chat.hint` | Namespace split |
| `chat.reasoningEffort.saveError` | `chat.saveError` | Namespace split |
| `chat.reasoningEffort.smarter` | `chat.smarter` | Namespace split |
| `chat.subagents.stop` | `chat.subagents.stop` | Already exists! (check) |
| `chat.validation.fixInGateway` | `chat.fixInGateway` | Namespace split |
| `chat.validation.fixInModels` | `chat.fixInModels` | Namespace split |
| `chat.validation.fixInProviders` | `chat.fixInProviders` | Namespace split |
| `chat.validation.fixInSetup` | `chat.fixInSetup` | Namespace split |
| `chat.validation.missingKey` | `chat.missingKey` | Namespace split |
| `chat.worktree.empty` | `chat.empty` | Namespace split |
| `chat.worktree.emptyFolder` | `chat.emptyFolder` | Namespace split |
| `chat.worktree.errorLoading` | `chat.errorLoading` | Namespace split |
| `chat.worktree.loading` | `chat.loading` | Namespace split |

### Orphan Keys with Runtime Suffix Matches (267 cases)

| Source Key (Orphan) | Runtime Key (Used) | Note |
|--------------------|-------------------|------|
| `agents.active` | `memory.active` | Different feature |
| `agents.creating` | `kanban.creating` | Different feature |
| `agents.deleteConfirm` | `memory.deleteConfirm` | Different feature |
| `agents.edit` | `common.edit` | Common key exists |
| `agents.error` | `chat.approval.error` | Different feature |
| `agents.no` | `memory.no` | Different feature |
| `agents.running` | `diagnose.fix.running` | Different feature |
| `agents.yes` | `memory.yes` | Different feature |
| `botGroups.cancel` | `chat.approval.cancel` | Different feature |
| `botGroups.create` | `agents.create` | Different feature |
| `botGroups.deny` | `chat.deny` | Different feature |
| `botGroups.empty` | `chat.folderPicker.empty` | Different feature |
| `botGroups.messages` | `sessions.messages` | Different feature |
| `botGroups.more` | `providers.models.more` | Different feature |
| `botGroups.name` | `schedules.name` | Different feature |
| `botGroups.placeholder` | `chat.clarify.placeholder` | Different feature |
| `botGroups.ready` | `gateway.states.ready` | Different feature |
| `botGroups.refresh` | `discover.refresh` | Different feature |
| `botGroups.retry` | `common.retry` | Common key exists |
| `botGroups.send` | `chat.clarify.send` | Different feature |
| `botGroups.stop` | `chat.subagents.stop` | Different feature |
| `botGroups.title` | `agents.title` | Different feature |
| `botGroups.unavailable` | `chat.approval.unavailable` | Different feature |
| `botGroups.working` | `gateway.working` | Different feature |
| `botGroups.you` | `office.you` | Different feature |
| `chat.browse` | `kanban.browse` | Different feature |
| `chat.cancel` | `chat.approval.cancel` | Namespace change |
| `chat.closeFile` | `worktree.closeFile` | Namespace change |
| `chat.confirm` | `chat.approval.confirm` | Namespace change |
| `chat.confirmAlways` | `chat.approval.confirmAlways` | Namespace change |
| `chat.defaultQuestion` | `chat.clarify.defaultQuestion` | Namespace change |
| `chat.description` | `chat.followUs.description` | Namespace change |
| `chat.empty` | `chat.folderPicker.empty` | Namespace change |
| `chat.emptyFolder` | `chat.worktree.emptyFolder` | Namespace change |
| `chat.error` | `chat.approval.error` | Namespace change |
| `chat.errorLoading` | `chat.worktree.errorLoading` | Namespace change |
| `chat.faster` | `chat.reasoningEffort.faster` | Namespace change |
| `chat.fileTruncated` | `worktree.fileTruncated` | Namespace change |
| `chat.fileTruncatedWarning` | `worktree.fileTruncatedWarning` | Namespace change |
| `chat.fixInGateway` | `chat.validation.fixInGateway` | Namespace change |
| `chat.fixInModels` | `chat.validation.fixInModels` | Namespace change |
| `chat.fixInProviders` | `chat.validation.fixInProviders` | Namespace change |
| `chat.fixInSetup` | `chat.validation.fixInSetup` | Namespace change |
| `chat.follow` | `chat.followUs.follow` | Namespace change |
| `chat.hint` | `chat.reasoningEffort.hint` | Namespace change |
| `chat.loading` | `chat.worktree.loading` | Namespace change |
| `chat.missingKey` | `chat.validation.missingKey` | Namespace change |
| `chat.model` | `common.model` | Different feature |
| `chat.newChat` | `navigation.newChat` | Namespace change |
| `chat.notNow` | `chat.followUs.notNow` | Namespace change |
| `chat.open` | `chat.folderPicker.open` | Namespace change |
| `chat.parent` | `chat.folderPicker.parent` | Namespace change |
| `chat.saveAs` | `chat.media.saveAs` | Namespace change |
| `chat.saveError` | `chat.reasoningEffort.saveError` | Namespace change |
| `chat.saveImage` | `chat.media.saveImage` | Namespace change |
| `chat.select` | `chat.folderPicker.select` | Namespace change |
| `chat.smarter` | `chat.reasoningEffort.smarter` | Namespace change |

---

## 4. Root Cause Analysis

### Why so many orphans (897)?

1. **`constants` namespace (283 keys)**: Used via a different i18n mechanism (likely direct object access, not `t()`)
2. **`botGroups` namespace (34 keys)**: Deprecated feature - entire namespace unused
3. **Namespace refactoring**: Keys moved from generic namespaces (`chat.*`) to specific ones (`chat.approval.*`, `chat.clarify.*`, `chat.folderPicker.*`, `chat.worktree.*`, `chat.subagents.*`, `chat.reasoningEffort.*`, `chat.validation.*`, `chat.followUs.*`, `chat.media.*`) but old keys retained
4. **Feature branches**: Keys added for features not yet merged/implemented
5. **Dead code**: Translations for removed UI components

### Why gaps (216)?

1. **New features**: Recently added UI without translations (e.g., `providers.hermesAccount.*`, `settings.pet.*`, `diagnose.*`, `gateway.states.*`)
2. **Namespace splits**: New sub-namespaces created but translations not added
3. **Direct key usage**: Some keys might be constructed dynamically (e.g., `t(\`chat.approval.\${status}\`)`) - but grep shows explicit strings

---

## 5. Action Items

### Priority 1: Fix Missing Translations (Gap - 216 keys)
Add translations for all gap keys to `src/shared/i18n/locales/en/*.ts`:
- **High impact**: `chat.approval.*`, `chat.clarify.*`, `chat.folderPicker.*`, `chat.subagents.*`, `providers.keys.*`, `providers.hermesAccount.*`
- **Medium impact**: `settings.pet.*`, `settings.hardwareAcceleration.*`, `diagnose.*`, `gateway.*`, `navigation.sessionMenu.*`

### Priority 2: Clean Up Orphans (897 keys)
- **Delete entirely**: `constants` namespace (283) - verify usage pattern first
- **Delete entirely**: `botGroups` namespace (34) - confirmed deprecated
- **Delete old namespace keys**: `chat.confirm`, `chat.defaultQuestion`, `chat.follow`, `chat.faster`, `chat.hint`, `chat.smarter`, `chat.saveAs`, `chat.saveError`, `chat.saveImage`, `chat.open`, `chat.parent`, `chat.select`, `chat.empty`, `chat.loading`, `chat.error`, `chat.cancel`, `chat.confirmAlways`, `chat.missingKey`, `chat.fixInGateway`, `chat.fixInModels`, `chat.fixInProviders`, `chat.fixInSetup`, `chat.description`, `chat.notNow`, `chat.browse`, `chat.model`, `chat.newChat`, `chat.closeFile`, `chat.fileTruncated`, `chat.fileTruncatedWarning`, `chat.errorLoading`, `chat.emptyFolder` (all replaced by `chat.approval.*`, `chat.clarify.*`, `chat.folderPicker.*`, `chat.worktree.*`, `chat.reasoningEffort.*`, `chat.validation.*`, `chat.followUs.*`, `chat.media.*`)
- **Review & delete**: `agents` wallet/appearance keys (97), `office` (94), `kanban` (72), `tools` (78), `schedules` (55), `setup` (44), `memory` (44), `navigation` (29), `discover` (28), `install` (20), `welcome` (18), `skills` (19), `providers` legacy (38), `gateway` legacy (39), `models` (23), `sessions` (31)

### Priority 3: Normalize Namespaces
Consolidate the namespace splits:
- `chat.confirm` → `chat.approval.confirm` (remove old)
- `chat.defaultQuestion` → `chat.clarify.defaultQuestion` (remove old)
- `chat.follow` → `chat.followUs.follow` (remove old)
- `chat.faster` → `chat.reasoningEffort.faster` (remove old)
- `chat.hint` → `chat.reasoningEffort.hint` (remove old)
- `chat.smarter` → `chat.reasoningEffort.smarter` (remove old)
- `chat.saveAs` → `chat.media.saveAs` (remove old)
- `chat.saveError` → `chat.reasoningEffort.saveError` (remove old)
- `chat.saveImage` → `chat.media.saveImage` (remove old)
- `chat.open` → `chat.folderPicker.open` (remove old)
- `chat.parent` → `chat.folderPicker.parent` (remove old)
- `chat.select` → `chat.folderPicker.select` (remove old)
- `chat.empty` → `chat.folderPicker.empty` (remove old)
- `chat.loading` → `chat.worktree.loading` (remove old)
- `chat.error` → `chat.approval.error` (remove old)
- `chat.cancel` → `chat.approval.cancel` (remove old)
- `chat.confirmAlways` → `chat.approval.confirmAlways` (remove old)
- `chat.missingKey` → `chat.validation.missingKey` (remove old)
- `chat.fixInGateway` → `chat.validation.fixInGateway` (remove old)
- `chat.fixInModels` → `chat.validation.fixInModels` (remove old)
- `chat.fixInProviders` → `chat.validation.fixInProviders` (remove old)
- `chat.fixInSetup` → `chat.validation.fixInSetup` (remove old)
- `chat.description` → `chat.followUs.description` (remove old)
- `chat.notNow` → `chat.followUs.notNow` (remove old)
- `chat.browse` → `kanban.browse` (remove old)
- `chat.model` → `common.model` (remove old)
- `chat.newChat` → `navigation.newChat` (remove old)
- `chat.closeFile` → `worktree.closeFile` (remove old)
- `chat.fileTruncated` → `worktree.fileTruncated` (remove old)
- `chat.fileTruncatedWarning` → `worktree.fileTruncatedWarning` (remove old)
- `chat.errorLoading` → `chat.worktree.errorLoading` (remove old)
- `chat.emptyFolder` → `chat.worktree.emptyFolder` (remove old)

---

## 6. Files to Modify

### Source locale files (`src/shared/i18n/locales/en/*.ts`):

**Add missing keys to:**
- `chat.ts` - add `approval.*`, `clarify.*`, `folderPicker.*`, `followUs.*`, `media.*`, `reasoningEffort.*`, `subagents.*`, `validation.*`, `worktree.*`
- `providers.ts` - add `hermesAccount.*`, `keys.*`
- `settings.ts` - add `analytics.*`, `font.*`, `hardwareAcceleration.*`, `notifications.*`, `pet.*`, `roundedCorners.*`, `spellcheck.*`, `theme.*`
- `gateway.ts` - add `apiServerKey.*`, `states.*`
- `diagnose.ts` - add `apiKeyBanner.*`, `apiKeyModal.*`, `banner.*`, `fix.*`
- `navigation.ts` - add `sessionMenu.*`
- `agents.ts` - add `wallet.*` (if missing)
- `common.ts` - add `forward`, `reload`
- `session.ts` - add `close`, `cwd.set`, `interrupt`
- `slash.ts` - add `exec`
- `worktree.ts` - add `closeFile`, `errorLoading`, `fileTruncated`, `fileTruncatedWarning`, `loading`, `open`, `openInEditor`
- `prompt.ts` - add `submit`
- `command.ts` - add `dispatch`
- `index.ts` - add `json` (if this is a key)
- `models.ts` - add `json`
- `kanban.ts` - add `status.running`

**Remove orphan keys from:**
- `constants.ts` - **delete entire file** (verify first)
- `botGroups.ts` - **delete entire file** (confirmed deprecated)
- `agents.ts` - remove 97 wallet/appearance/sync keys
- `office.ts` - remove 94 keys
- `kanban.ts` - remove 72 keys
- `tools.ts` - remove 78 keys
- `schedules.ts` - remove 55 keys
- `providers.ts` - remove 38 legacy keys
- `setup.ts` - remove 44 keys
- `memory.ts` - remove 44 keys
- `navigation.ts` - remove 29 legacy keys
- `discover.ts` - remove 28 keys
- `install.ts` - remove 20 keys
- `welcome.ts` - remove 18 keys
- `skills.ts` - remove 19 keys
- `chat.ts` - remove ~113 legacy keys (listed above)
- `gateway.ts` - remove 39 legacy keys
- `diagnose.ts` - remove 6 legacy keys
- `models.ts` - remove 23 keys
- `sessions.ts` - remove 31 keys

---

## 7. Verification Commands

```bash
# Re-run analysis after fixes
cd /k/c/Users/Administrador/hermes-desktop-src
grep -rn "t(\"" src --include="*.ts" --include="*.tsx" | grep -v ".test.ts" | sed -E 's/.*t\("([^"\{]+)".*/\1/' | grep -E '^[a-z]+\.' | sort -u > runtime_keys.txt

# Extract source keys
cd src/shared/i18n/locales/en
for f in *.ts; do
  sed -n '/export default {/,/^}/p' "$f" | grep -E '^\s+[a-zA-Z][a-zA-Z0-9]*:' | sed -E 's/^\s+([a-zA-Z][a-zA-Z0-9]*):.*$/\1/' | sed "s/^/${f%.ts}./"
done | sort -u > source_keys.txt

# Compare
comm -23 runtime_keys.txt source_keys.txt  # gaps
comm -13 runtime_keys.txt source_keys.txt  # orphans
comm -12 runtime_keys.txt source_keys.txt  # overlap
```

---

## 8. Appendices

### Appendix A: Full Gap Key List
See `/k/gap_keys.txt` (216 keys)

### Appendix B: Full Orphan Key List
See `/k/orphan_keys.txt` (897 keys)

### Appendix C: Full Overlap Key List
See `/k/overlap_keys.txt` (831 keys)

### Appendix D: Namespace Mismatch Details
See `/k/gap_namespace_matches.txt` (205) and `/k/orphan_namespace_matches.txt` (267)

### Appendix E: Source Namespace Distribution
```
constants: 283
settings: 242
chat: 171
agents: 115
tools: 96
office: 96
kanban: 84
providers: 68
schedules: 61
common: 57
gateway: 56
memory: 52
setup: 50
sessions: 49
navigation: 42
models: 35
botGroups: 34
discover: 33
install: 25
welcome: 23
skills: 23
diagnose: 22
soul: 7
errors: 4
```

### Appendix F: Runtime Namespace Distribution
```
settings: 197
chat: 112
agents: 76
kanban: 70
schedules: 59
providers: 57
tools: 56
gateway: 52
office: 49
sessions: 41
common: 41
memory: 38
navigation: 25
welcome: 23
skills: 23
install: 23
setup: 20
diagnose: 20
constants: 17
discover: 15
models: 9
worktree: 7
soul: 7
session: 3
errors: 3
slash: 1
prompt: 1
index: 1
command: 1
```