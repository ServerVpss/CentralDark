# COMANDO - cleanup-utilities.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\cleanup-utilities.md
**SHA:** 9f954e38f492408a
**Timestamp:** 2026-08-28T02:02:05.013470
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- blocker: true
- blocker: true
- blocker: true

### Ouro Bruto (primeiros 5000 chars)
```
---
tools:
  - github-cli        # Git operations for archiving files
---

# Cleanup Utilities Task

## Purpose

Safely archive deprecated utilities identified in Story 3.17 audit, reducing technical debt and developer confusion while maintaining the ability to restore utilities if needed.

## Safety Principles

**CRITICAL**: This task archives (not deletes) deprecated utilities using a fail-safe workflow:
1. **Backup first** - Create timestamped backup before any changes
2. **Verify dependencies** - Block removal if active code depends on utility
3. **Archive, don't delete** - Preserve files for historical reference
4. **Validate after** - Ensure framework still works after cleanup
5. **Document rollback** - Clear instructions to undo if needed

## Prerequisites

- Story 3.17 complete (UTILITIES-AUDIT-REPORT.md exists)
- List of DEPRECATED utilities from audit report
- Git repository in clean state

## Classification Review

Before cleanup, verify utilities are truly deprecated:

### ✅ SAFE TO ARCHIVE
- No active code references (grep shows 0 results)
- Classified as DEPRECATED in audit report
- Obsolete concept or non-functional
- Duplicate/refactored version exists

### ⚠️ NEEDS REVIEW
- Has active references in code (grep shows >0 results)
- Classified as FIXABLE but needs deprecation
- Unclear status from audit

### ❌ DO NOT ARCHIVE
- Classified as WORKING in audit report
- Critical framework utility
- Has active agent/task dependencies

## Configuration Dependencies

This task requires the following configuration keys from `core-config.yaml`:

- **`devStoryLocation`**: Location of story files (typically docs/stories) - Required to access Story 3.17 audit results
- **`core-config`**: Direct reference to core configuration file - This task updates the utility count in core-config.yaml
- **`qaLocation`**: QA output directory (typically docs/qa) - Required to write quality reports

**Loading Config:**
```javascript
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../../.aios-core/core-config.yaml');
const config = yaml.load(fs.readFileSync(configPath, 'utf8'));

const devStoryLocation = config.devStoryLocation; // For accessing audit report
const coreConfigPath = configPath; // For updating utility count
const qaLocation = config.qa?.qaLocation || 'docs/qa'; // qaLocation
```

## Execution Steps

### Step 1: Pre-Cleanup Preparation

**1.1 Create Backup**
```bash
# Create timestamped backup of entire utils directory
mkdir -p .backups
cp -r .aios-core/utils ".backups/utils.backup-3.18-$(date +%Y%m%d-%H%M%S)"
```

**1.2 Verify Audit Report**
```bash
# Ensure audit report exists and is readable
test -f UTILITIES-AUDIT-REPORT.md && echo "✅ Audit report found" || echo "❌ Audit report missing"
```

**1.3 Extract Deprecated List**

From UTILITIES-AUDIT-REPORT.md, identify all utilities in:
- Category A: Duplicate/Redundant Versions
- Category B: Incomplete Experiments
- Category C: Obsolete Concepts
- Category D: Misplaced (move, don't archive)

### Step 2: Dependency Verification (CRITICAL)

For each deprecated utility, check for active references:

**2.1 Automated Dependency Check**
```bash
# Check for require() statements
grep -r "require.*utility-name" .aios-core/agents .aios-core/tasks .aios-core/workflows Squads/

# Check for string references (utility mentioned in docs/configs)
grep -r "utility-name" .aios-core/agents/ .aios-core/tasks/ .aios-core/core-config.yaml

# Count total references
count=$(grep -r "utility-name" .aios-core/ Squads/ 2>/dev/null | wc -l)
echo "References found: $count"
```

**2.2 Manual Review**

If references found (count > 0):
- Review each reference context
- Determine if reference is:
  - Active usage (BLOCK removal)
  - Comment/documentation (SAFE to remove)
  - Obsolete reference (UPDATE then remove)

**2.3 Create Exception List**

Document utilities that cannot be archived due to dependencies:
```markdown
## Utilities with Active Dependencies

1. utility-name.js
   - References: 5 locations
   - Reason: Still used by @agent-name
   - Action: Defer until Story X.XX removes dependency
```

### Step 3: Create Archive Structure

**3.1 Create Archive Directory**
```bash
mkdir -p .aios-core/utils-archive
```

**3.2 Create Archive README**

Create `.aios-core/utils-archive/ARCHIVE-README.md`:

```markdown
# Archived Utilities - Story 3.18

**Archive Date**: 2025-10-31
**Story**: Epic 3c - Story 3.18 (Utilities Cleanup & Deprecation)
**Audit Report**: UTILITIES-AUDIT-REPORT.md (Story 3.17)

## Purpose

This directory contains utilities that were deprecated and removed from active use during Epic 3 Phase 2. Files are preserved for historical reference and potential restoration.

## Why Archive Instead of Delete?

1. **Historical Reference** - Document what was tried and why it didn't work
2. **Restoration Capability** - Enable future restoration if utility is needed
3. **Audit Trail** - Maintain complete 
```