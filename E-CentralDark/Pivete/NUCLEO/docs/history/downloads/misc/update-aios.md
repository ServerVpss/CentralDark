# Task: Update AIOS Framework

> **Version:** 4.0.0
> **Created:** 2026-01-29
> **Updated:** 2026-01-31
> **Type:** SYNC (git-native framework synchronization)
> **Agent:** @devops (Gage) or @aios (Orion)
> **Execution:** Simple bash script (~15 lines)

## Purpose

Git-native sync of AIOS framework from upstream repository. Uses sparse clone + file comparison for safe review before applying changes. All local customizations preserved automatically by backup/restore.

---

## Quick Usage

```bash
# Run the update script
bash .aios-core/scripts/update-aios.sh

# Review changes shown by the script, then:
git add .aios-core && git commit -m "chore: sync AIOS framework"   # Apply changes
# OR
git checkout -- .aios-core/                                         # Cancel changes
```

---

## How It Works

The script uses sparse clone + file comparison:

1. **Clone upstream** - Sparse shallow clone of SynkraAI/aios-core (only `.aios-core/`)
2. **Compare files** - Uses `comm` for O(n) file list comparison
3. **Backup local-only** - Files that exist only locally are backed up
4. **Sync** - Copy upstream files, restore local-only files
5. **Report** - Shows created/updated/deleted/preserved counts
6. **User decides** - Commit to apply or checkout to cancel

**Why this approach:**
- Sparse clone is fast (~5 seconds)
- O(n) comparison vs O(n²) nested loops
- Local-only files always preserved
- Clear report before committing

---

## Protected Files (NEVER overwritten)

These paths are automatically preserved (local-only files are backed up and restored):

| Path | Reason |
|------|--------|
| `.aios-core/expansion-packs/` | Custom copywriters, data, ralph |
| `.aios-core/marketing/` | Marketing-specific agents/tasks |
| `source/` | Business context YAML |
| `Knowledge/` | Knowledge bases |
| `.aios-core/context/` | Compiled contexts |
| `CLAUDE.md` | Project rules |
| `.claude/commands/` | Custom commands |
| `.claude/rules/` | Custom rules |
| `.antigravity/` | Antigravity config |
| `.gemini/` | Gemini config |
| `MCPs/` | MCP integrations |
| `Contexto/` | Business context |
| `Output/` | Deliverables |
| `docs/` | Project documentation |
| `scripts/` | Python scripts |
| `.env` | Secrets |

---

## Task Definition

```yaml
task: updateAIOSFramework
agent: devops
mode: simple
timeout: 60  # 1 minute max

execution:
  script: .aios-core/scripts/update-aios.sh

workflow:
  1. If dirty working tree: git add -A && git commit -m "chore: pre-update commit"
  2. bash .aios-core/scripts/update-aios.sh
  3. Review changes displayed
  4. git add .aios-core && git commit -m "chore: sync AIOS framework"  # to apply
  5. git checkout -- .aios-core/                                        # to cancel

pre-conditions:
  - git status clean (if dirty, auto-commit with "chore: pre-update commit")

post-conditions:
  - local-only files preserved (backup/restore)
  - changes ready for review (unstaged)

acceptance:
  - script completes without error
  - user can review changes before committing
  - local customizations preserved
```

---

## Verification

After running the script:

```bash
# Check that local-only files are preserved
ls -la .aios-core/expansion-packs/  # if exists
ls -la source/                       # if exists

# See what changed (unstaged)
git diff --stat
```

---

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| "Commit changes first" | Uncommitted changes | Agent auto-commits before running script |
| "Failed to fetch upstream" | Network issue | Check internet connection |
| Merge conflicts | File changed both locally and upstream | Script auto-resolves by preserving local |

---

## Rollback

```bash
# If you already committed and want to undo:
git reset --hard HEAD~1

# If you haven't committed yet:
git checkout -- .aios-core/
```

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 4.0.0 | 2026-01-31 | **SIMPLIFIED:** Git-native approach, 15-line bash script replaces 847-line JS |
| 3.1.0 | 2026-01-30 | Dynamic protection for expansion pack commands |
| 3.0.0 | 2026-01-29 | YOLO mode with rsync |
| 1.0.0 | 2026-01-29 | Initial version (verbose, interactive) |


---

# OUTRO - update-aios.sh
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\scripts\update-aios.sh
**SHA:** 01c2f2d2bfb568a7
**Timestamp:** 2026-08-28T02:02:23.083317
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- echo "Run: git add .aios-core && git commit -m 'your message'"

### Ouro Bruto (primeiros 5000 chars)
```
#!/bin/bash
# AIOS Framework Update - v5.2 (Optimized)
#
# LOGIC:
#   - LOCAL only (not in upstream)     → KEEP
#   - LOCAL + UPSTREAM                 → OVERWRITE (upstream wins)
#   - UPSTREAM only (not in local)     → CREATE
#   - WAS in both, UPSTREAM removed    → DELETE
#
# Usage: bash .aios-core/scripts/update-aios.sh

set -e

echo "⚡ AIOS Update v5.2"
echo ""

# Preflight: check rsync
if ! command -v rsync >/dev/null 2>&1; then
  echo "❌ rsync is required but not found in PATH."
  exit 1
fi

# Validate: clean working tree for .aios-core
if [ -n "$(git status --porcelain .aios-core/)" ]; then
  echo "❌ Commit .aios-core changes first:"
  git status --short .aios-core/
  echo ""
  echo "Run: git add .aios-core && git commit -m 'your message'"
  exit 1
fi

# Temp directory
TEMP_DIR=$(mktemp -d)
trap 'rm -rf "$TEMP_DIR"' EXIT

# Report files
REPORT_CREATED="$TEMP_DIR/report-created.txt"
REPORT_UPDATED="$TEMP_DIR/report-updated.txt"
REPORT_DELETED="$TEMP_DIR/report-deleted.txt"
REPORT_PRESERVED="$TEMP_DIR/report-preserved.txt"
touch "$REPORT_CREATED" "$REPORT_UPDATED" "$REPORT_DELETED" "$REPORT_PRESERVED"

# Clone upstream (shallow)
echo "📥 Cloning upstream..."
git clone --depth 1 --filter=blob:none --sparse \
  https://github.com/SynkraAI/aios-core.git \
  "$TEMP_DIR/upstream" 2>/dev/null || {
  echo "❌ Failed to clone. Check network."
  exit 1
}

cd "$TEMP_DIR/upstream"
git sparse-checkout set .aios-core
cd - > /dev/null

echo "✅ Fetched upstream"
echo ""

# Build file lists (relative paths without .aios-core/ prefix)
echo "📋 Scanning files..."
find .aios-core -type f | sed 's|^\.aios-core/||' | sort > "$TEMP_DIR/local-files.txt"
find "$TEMP_DIR/upstream/.aios-core" -type f | sed "s|^$TEMP_DIR/upstream/\.aios-core/||" | sort > "$TEMP_DIR/upstream-files.txt"

# Get git-tracked files (for DELETE detection) - ONE call instead of N calls
git ls-files .aios-core | sed 's|^\.aios-core/||' | sort > "$TEMP_DIR/tracked-files.txt"

# Use comm to find differences - O(n) instead of O(n²)
echo "🔍 Analyzing differences..."

# LOCAL-ONLY: in local but not in upstream
comm -23 "$TEMP_DIR/local-files.txt" "$TEMP_DIR/upstream-files.txt" > "$REPORT_PRESERVED"

# UPSTREAM-ONLY (CREATE): in upstream but not in local
comm -13 "$TEMP_DIR/local-files.txt" "$TEMP_DIR/upstream-files.txt" > "$REPORT_CREATED"

# IN-BOTH: files that exist in both
comm -12 "$TEMP_DIR/local-files.txt" "$TEMP_DIR/upstream-files.txt" > "$TEMP_DIR/in-both.txt"

# DELETE: was tracked by git, not in upstream, not local-only
comm -23 "$TEMP_DIR/tracked-files.txt" "$TEMP_DIR/upstream-files.txt" | \
  comm -23 - "$REPORT_PRESERVED" > "$REPORT_DELETED"

# UPDATED: in both but content differs
echo "📝 Checking for updates..."
while IFS= read -r rel_path; do
  if ! cmp -s ".aios-core/$rel_path" "$TEMP_DIR/upstream/.aios-core/$rel_path"; then
    echo "$rel_path" >> "$REPORT_UPDATED"
  fi
done < "$TEMP_DIR/in-both.txt"

# Backup local-only files
echo "🔐 Backing up local-only files..."
mkdir -p "$TEMP_DIR/local-only"
while IFS= read -r rel_path; do
  mkdir -p "$TEMP_DIR/local-only/$(dirname "$rel_path")"
  cp -a ".aios-core/$rel_path" "$TEMP_DIR/local-only/$rel_path"
done < "$REPORT_PRESERVED"

# Execute sync
echo ""
echo "🔀 Syncing..."

# Delete files removed from upstream
if [ -s "$REPORT_DELETED" ]; then
  while IFS= read -r rel_path; do
    rm -f ".aios-core/$rel_path"
  done < "$REPORT_DELETED"
fi

# Copy all upstream files (creates new + overwrites existing)
rsync -a "$TEMP_DIR/upstream/.aios-core/" ".aios-core/"

# Restore local-only files
if [ -d "$TEMP_DIR/local-only" ] && [ "$(ls -A "$TEMP_DIR/local-only" 2>/dev/null)" ]; then
  rsync -a "$TEMP_DIR/local-only/" ".aios-core/"
fi

# Clean empty directories
find .aios-core -type d -empty -delete 2>/dev/null || true

# Generate report
echo ""
echo "════════════════════════════════════════════════════════════"
echo "  SYNC REPORT"
echo "════════════════════════════════════════════════════════════"

CREATED_COUNT=$(wc -l < "$REPORT_CREATED" | tr -d ' ')
UPDATED_COUNT=$(wc -l < "$REPORT_UPDATED" | tr -d ' ')
DELETED_COUNT=$(wc -l < "$REPORT_DELETED" | tr -d ' ')
PRESERVED_COUNT=$(wc -l < "$REPORT_PRESERVED" | tr -d ' ')

echo ""
echo "  ➕ CREATED:   $CREATED_COUNT files"
if [ "$CREATED_COUNT" -gt 0 ] && [ "$CREATED_COUNT" -le 20 ]; then
  sed 's/^/       /' "$REPORT_CREATED"
elif [ "$CREATED_COUNT" -gt 20 ]; then
  head -10 "$REPORT_CREATED" | sed 's/^/       /'
  echo "       ... and $((CREATED_COUNT - 10)) more"
fi

echo ""
echo "  📝 UPDATED:   $UPDATED_COUNT files"
if [ "$UPDATED_COUNT" -gt 0 ] && [ "$UPDATED_COUNT" -le 20 ]; then
  sed 's/^/       /' "$REPORT_UPDATED"
elif [ "$UPDATED_COUNT" -gt 20 ]; then
  head -10 "$REPORT_UPDATED" | sed 's/^/       /'
  echo "       ... and $((UPDATED_COUNT - 10)) more"
fi

echo ""
echo "  🗑️  DELETED:   $DELETED_COUNT files"
if [ "$DELETED_COUNT" -gt 0 ] && [ "$DELETED_COUNT" -le 20 ]; then
  sed 's/^/       /' "$REPORT_DELETED"
elif [ "$DELETED_COUNT" -gt 20 ]; then
  
```