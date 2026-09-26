# OUTRO - squad-creator-migrate.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\squad-creator-migrate.md
**SHA:** c0f669b2d490c698
**Timestamp:** 2026-08-28T02:02:09.252365
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - dry_run: If true, preview changes without modifying files (--dry-run)

### Ouro Bruto (primeiros 5000 chars)
```
---
task: Migrate Squad
responsável: @squad-creator
responsável_type: agent
atomic_layer: task
Entrada: |
  - squad_path: Path to the squad directory to migrate (required)
  - dry_run: If true, preview changes without modifying files (--dry-run)
  - verbose: If true, show detailed output (--verbose)
Saída: |
  - migration_result: Object with { success, actions, validation, backupPath }
  - report: Formatted migration report
  - exit_code: 0 if successful, 1 if failed
Checklist:
  - "[ ] Analyze squad for migration needs"
  - "[ ] Create backup in .backup/"
  - "[ ] Execute migration actions"
  - "[ ] Validate migrated squad"
  - "[ ] Generate migration report"
---

# *migrate-squad

Migrates legacy squad formats to AIOS 2.1 standard.

## Usage

```
@squad-creator

# Preview changes without modifying files
*migrate-squad ./squads/my-squad --dry-run

# Migrate with automatic backup
*migrate-squad ./squads/my-squad

# Migrate with detailed output
*migrate-squad ./squads/my-squad --verbose

# Migrate expansion pack
*migrate-squad ./expansion-packs/my-pack --verbose
```

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `squad_path` | string | - | Full path to squad directory (required) |
| `--dry-run` | flag | false | Preview changes without modifying files |
| `--verbose` | flag | false | Show detailed migration output |

## Migration Detection

The migrator detects the following legacy patterns:

| Pattern | Detection | Migration Action |
|---------|-----------|------------------|
| `config.yaml` | Legacy manifest name | Rename to `squad.yaml` |
| Flat structure | No `tasks/`, `agents/` dirs | Create directory structure |
| Missing `aios.type` | Field not present | Add `aios.type: squad` |
| Missing `aios.minVersion` | Field not present | Add `aios.minVersion: 2.1.0` |
| Missing `name` | Field not present | Infer from directory name |
| Missing `version` | Field not present | Add `version: 1.0.0` |

## Flow

```
1. Analyze Squad
   ├── Check for config.yaml vs squad.yaml
   ├── Check directory structure
   ├── Validate manifest schema
   └── Generate action list

2. Confirm Migration (if not --dry-run)
   ├── Display issues found
   ├── Display planned actions
   └── Request user confirmation

3. Create Backup
   └── Copy all files to .backup/pre-migration-{timestamp}/

4. Execute Actions
   ├── RENAME_MANIFEST: config.yaml → squad.yaml
   ├── CREATE_DIRECTORIES: tasks/, agents/, config/
   ├── ADD_FIELD: Add missing required fields
   └── MOVE_FILE: Reorganize files if needed

5. Validate Result
   ├── Run squad-validator on migrated squad
   └── Report any remaining issues

6. Generate Report
   ├── Summary of changes made
   ├── Backup location
   └── Validation result
```

## Output Example

### Analysis Phase

```
═══════════════════════════════════════════════════════════
              SQUAD MIGRATION REPORT
═══════════════════════════════════════════════════════════

Squad Path: ./squads/my-legacy-squad/
Needs Migration: Yes

───────────────────────────────────────────────────────────
ISSUES FOUND:
───────────────────────────────────────────────────────────
  ⚠️ [WARNING] Uses deprecated config.yaml manifest
  ⚠️ [WARNING] Missing task-first directories: tasks, agents
  ❌ [ERROR] Missing required field: aios.type
  ❌ [ERROR] Missing required field: aios.minVersion

───────────────────────────────────────────────────────────
PLANNED ACTIONS:
───────────────────────────────────────────────────────────
  1. Rename config.yaml → squad.yaml
  2. Create directories: tasks, agents
  3. Add field: aios.type = "squad"
  4. Add field: aios.minVersion = "2.1.0"

═══════════════════════════════════════════════════════════
```

### Migration Result

```
───────────────────────────────────────────────────────────
MIGRATION RESULT:
───────────────────────────────────────────────────────────
  Status: ✅ SUCCESS
  Message: Migration completed successfully
  Backup: ./squads/my-legacy-squad/.backup/pre-migration-1703318400000/

  Executed Actions:
    ✅ Rename config.yaml → squad.yaml [success]
    ✅ Create directories: tasks, agents [success]
    ✅ Add field: aios.type = "squad" [success]
    ✅ Add field: aios.minVersion = "2.1.0" [success]

  Post-Migration Validation:
    Valid: Yes

═══════════════════════════════════════════════════════════
```

### Dry-Run Mode

```
───────────────────────────────────────────────────────────
MIGRATION RESULT:
───────────────────────────────────────────────────────────
  Status: ✅ SUCCESS
  Message: Dry-run completed successfully

  Executed Actions:
    🔍 Rename config.yaml → squad.yaml [dry-run]
    🔍 Create directories: tasks, agents [dry-run]
    🔍 Add field: aios.type = "squad" [dry-run]
    🔍 Add field: aios.minVersion = "2.1.0" [dry-run]

═══════════════════════════════════════════════════════════
```

## Rollback Procedure

If migration fails or produces unexpected results, restore from backup:

```bash
# List availab
```