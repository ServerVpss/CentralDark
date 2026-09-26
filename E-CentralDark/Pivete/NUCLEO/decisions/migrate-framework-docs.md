# DECISAO - migrate-framework-docs.sh
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\scripts\migrate-framework-docs.sh
**SHA:** b453931ec91e85b7
**Timestamp:** 2026-08-28T02:02:23.021065
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- DRY_RUN=false
- DRY_RUN=true
- echo -e "  ${YELLOW}[DRY RUN]${NC} Would execute: ${cmd}"

### Ouro Bruto (primeiros 5000 chars)
```
#!/bin/bash
#
# AIOS Framework Documentation Migration Script
#
# Purpose: Migrate framework docs from aios-fullstack to aios-core (REPO 1)
# Story: 6.1.2.6 - Framework Configuration System
# Execution Timeline: Q2 2026 (Repository Migration Phase)
#
# Usage:
#   ./migrate-framework-docs.sh [--dry-run] [--target-repo PATH]
#
# Options:
#   --dry-run        Show what would be migrated without making changes
#   --target-repo    Path to aios-core repository (default: ../aios-core)
#   --help           Show this help message
#

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
DRY_RUN=false
TARGET_REPO="../aios-core"
SOURCE_DOCS="docs/framework"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --target-repo)
      TARGET_REPO="$2"
      shift 2
      ;;
    --help)
      head -n 20 "$0" | grep "^#" | sed 's/^# //'
      exit 0
      ;;
    *)
      echo -e "${RED}Error: Unknown option $1${NC}"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# Header
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  AIOS Framework Documentation Migration Script             ║${NC}"
echo -e "${BLUE}║  Story 6.1.2.6: Framework Configuration System             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}⚠️  DRY RUN MODE - No changes will be made${NC}"
  echo ""
fi

# Function: Print section header
print_section() {
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}  $1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
}

# Function: Execute command (respects dry-run)
execute() {
  local cmd="$1"
  local description="$2"

  echo -e "  ${description}"

  if [ "$DRY_RUN" = true ]; then
    echo -e "  ${YELLOW}[DRY RUN]${NC} Would execute: ${cmd}"
  else
    echo -e "  ${GREEN}[EXEC]${NC} ${cmd}"
    eval "$cmd"
  fi
}

# Step 1: Verify Source Directory
print_section "Step 1: Verify Source Directory"

if [ ! -d "$SOURCE_DOCS" ]; then
  echo -e "${RED}✗ Error: Source directory not found: $SOURCE_DOCS${NC}"
  echo "  Please run this script from the aios-fullstack root directory"
  exit 1
fi

echo -e "${GREEN}✓${NC} Source directory found: $SOURCE_DOCS"

# Count files to migrate
FILE_COUNT=$(find "$SOURCE_DOCS" -type f -name "*.md" | wc -l)
echo -e "${GREEN}✓${NC} Found ${FILE_COUNT} files to migrate"

# List files
echo ""
echo "  Files to migrate:"
find "$SOURCE_DOCS" -type f -name "*.md" | while read -r file; do
  echo "    - ${file}"
done

# Step 2: Verify Target Repository
print_section "Step 2: Verify Target Repository"

if [ ! -d "$TARGET_REPO" ]; then
  echo -e "${RED}✗ Error: Target repository not found: $TARGET_REPO${NC}"
  echo "  Please clone aios-core first or specify correct path with --target-repo"
  exit 1
fi

echo -e "${GREEN}✓${NC} Target repository found: $TARGET_REPO"

# Check if target repo is a git repository
if [ ! -d "$TARGET_REPO/.git" ]; then
  echo -e "${YELLOW}⚠  Warning: Target is not a git repository${NC}"
fi

# Step 3: Create Target Directory Structure
print_section "Step 3: Create Target Directory Structure"

TARGET_DOCS="$TARGET_REPO/docs/framework"

execute "mkdir -p \"$TARGET_DOCS\"" "Create target directory: $TARGET_DOCS"

# Step 4: Copy Framework Documentation
print_section "Step 4: Copy Framework Documentation"

find "$SOURCE_DOCS" -type f -name "*.md" | while read -r source_file; do
  # Get relative path from source docs
  rel_path="${source_file#${SOURCE_DOCS}/}"
  target_file="$TARGET_DOCS/$rel_path"

  # Create parent directory if needed
  target_dir=$(dirname "$target_file")
  if [ ! -d "$target_dir" ]; then
    execute "mkdir -p \"$target_dir\"" "Create directory: $target_dir"
  fi

  # Copy file
  execute "cp \"$source_file\" \"$target_file\"" "Copy: $rel_path"
done

# Step 5: Update Internal Links
print_section "Step 5: Update Internal Links"

echo -e "${YELLOW}  Updating internal documentation links...${NC}"

# This is a simplified link update - may need manual review
if [ "$DRY_RUN" = false ]; then
  find "$TARGET_DOCS" -type f -name "*.md" -exec sed -i.bak \
    -e 's|../../docs/architecture/|../architecture/|g' \
    -e 's|docs/framework/|./|g' \
    {} \;

  # Remove backup files
  find "$TARGET_DOCS" -type f -name "*.bak" -delete

  echo -e "${GREEN}✓${NC} Links updated (review recommended)"
else
  echo -e "${YELLOW}[DRY RUN]${NC} Would update links in migrated files"
fi

# Step 6: Create Migration Notice
print_section "Step 6: Create Migration Notice"

MIGRATION_NOTICE="$TARGET_DOCS/MIGRATION_NOTICE.md"

if [ "$DRY_RUN" = false ]; then
  cat > "$MIGRATION_NOTICE" << 'EOF'
# Framework Document
```