---
name: file-relocator
description: "Moves files to correct repository directories based on type, category, and naming conventions. Organizes images into assets/, documents into docs/ or prd/, and maintains proper directory structure according to CLAUDE.md standards."
license: Proprietary. See LICENSE in repository root
---

# File Relocator

## Overview

This skill intelligently relocates files from the SORT/ directory to their appropriate permanent locations within the repository structure. It analyzes file types, categories, and organizational metadata to determine the correct destination directory, creating subdirectories as needed.

## When to Use This Skill

- After files have been renamed to comply with standards
- When organizing files from SORT/ directory
- During repository restructuring
- As part of automated file organization workflow
- When integrating new media or documentation

## Repository Structure Reference

```
ryno-assets/
├── assets/                          # Media and design assets
│   ├── images/
│   │   ├── ryno-crypto/            # Ryno Crypto Services images
│   │   ├── terrahash-stack/        # TerraHash Stack images
│   │   └── shared/                 # Shared/cross-project assets
│   ├── diagrams/
│   │   ├── architecture/           # System architecture diagrams
│   │   ├── flowcharts/            # Process flowcharts
│   │   └── infographics/          # Infographic assets
│   ├── videos/                     # Video assets
│   └── templates/                  # Design templates
├── docs/                           # Documentation
│   ├── architecture/              # Architecture documents
│   ├── api/                       # API documentation
│   ├── guides/                    # User and developer guides
│   ├── security/                  # Security documentation
│   ├── operations/                # Operational procedures
│   └── research/                  # Research papers
├── prd/                           # Product Requirements Documents
│   ├── active/                    # Current PRDs
│   ├── proposed/                  # Proposed features
│   └── completed/                 # Implemented PRDs
├── specs/                         # Technical Specifications
│   ├── api/                       # API specifications
│   ├── database/                  # Database schemas
│   ├── integration/               # Integration specifications
│   └── protocols/                 # Protocol definitions
├── examples/                      # Usage examples
│   ├── api-usage/                # API examples
│   ├── integration/              # Integration examples
│   └── templates/                # Document templates
└── scripts/                       # Utility scripts
    ├── validation/               # Validation scripts
    ├── deployment/               # Deployment scripts
    └── automation/               # Automation scripts
```

## File Routing Rules

### Image Files

**Pattern Analysis:** `[org]-[product]-[descriptor]-[type]-[resolution]-[version].[format]`

**Routing Logic:**

```python
def route_image(filename):
    """Determine destination for image files"""

    parts = filename.replace('.png', '').replace('.jpg', '').split('-')

    org = parts[0]        # ryno, ths, terrahash
    product = parts[1]    # crypto, stack, mining
    image_type = parts[3] if len(parts) > 3 else 'general'

    # Logos and icons -> specific product folder
    if image_type in ['logo', 'icon']:
        if org == 'ryno':
            return f'assets/images/ryno-crypto/'
        elif org in ['ths', 'terrahash']:
            return f'assets/images/terrahash-stack/'
        else:
            return f'assets/images/shared/'

    # Diagrams -> diagrams subfolder
    elif image_type == 'diagram':
        return f'assets/diagrams/architecture/'

    # Infographics -> diagrams/infographics
    elif image_type == 'infographic':
        return f'assets/diagrams/infographics/'

    # Banners, heroes -> product-specific
    elif image_type in ['banner', 'hero', 'thumbnail']:
        if org == 'ryno':
            return f'assets/images/ryno-crypto/'
        elif org in ['ths', 'terrahash']:
            return f'assets/images/terrahash-stack/'
        else:
            return f'assets/images/shared/'

    # Screenshots -> shared
    elif image_type == 'screenshot':
        return f'assets/images/shared/'

    # Default -> product-specific
    else:
        if org == 'ryno':
            return f'assets/images/ryno-crypto/'
        elif org in ['ths', 'terrahash']:
            return f'assets/images/terrahash-stack/'
        else:
            return f'assets/images/shared/'
```

**Examples:**

```
ryno-crypto-logo-icon-512x512-v1-0.png
→ assets/images/ryno-crypto/

ths-stack-architecture-diagram-2560x1440-v2-1.svg
→ assets/diagrams/architecture/

terrahash-mining-process-infographic-original-v1-0.jpg
→ assets/diagrams/infographics/

ryno-crypto-smart-dip-buying-banner-1920x1080-v1-0.png
→ assets/images/ryno-crypto/
```

### Document Files (PDF, DOCX, TXT)

**Pattern Analysis:** `[org]-[product]-[category]-[title]-[version].[format]`

**Routing Logic:**

```python
def route_document(filename):
    """Determine destination for document files"""

    parts = filename.split('-')
    category = parts[2] if len(parts) > 2 else 'general'

    # PRDs -> prd/ directory
    if category == 'prd':
        # Determine status from filename or default to active
        if 'proposed' in filename.lower():
            return 'prd/proposed/'
        elif 'completed' in filename.lower():
            return 'prd/completed/'
        else:
            return 'prd/active/'

    # API docs -> docs/api/
    elif category in ['api-docs', 'api']:
        return 'docs/api/'

    # Guides -> docs/guides/
    elif category == 'guide':
        return 'docs/guides/'

    # Whitepapers -> docs/research/
    elif category == 'whitepaper':
        return 'docs/research/'

    # Security docs -> docs/security/
    elif category == 'security':
        return 'docs/security/'

    # Architecture docs -> docs/architecture/
    elif category == 'architecture':
        return 'docs/architecture/'

    # Specifications -> specs/ with subcategories
    elif category == 'specs':
        # Further analyze title for subcategory
        if 'api' in filename.lower():
            return 'specs/api/'
        elif 'database' in filename.lower() or 'schema' in filename.lower():
            return 'specs/database/'
        elif 'integration' in filename.lower():
            return 'specs/integration/'
        elif 'protocol' in filename.lower():
            return 'specs/protocols/'
        else:
            return 'specs/'

    # Service docs -> docs/operations/
    elif category == 'service':
        return 'docs/operations/'

    # Default -> docs/
    else:
        return 'docs/'
```

**Examples:**

```
ryno-crypto-prd-smart-contract-v1-0.pdf
→ prd/active/

ths-stack-specs-data-pipeline-v2-1.md
→ specs/

terrahash-mining-guide-getting-started-v1-0.pdf
→ docs/guides/

ryno-crypto-api-docs-authentication-v3-0.md
→ docs/api/

ths-stack-whitepaper-consensus-mechanism-v1-0.pdf
→ docs/research/
```

### Markdown Files

**Pattern Analysis:** `[category]-[title]-[date-optional].md`

**Routing Logic:**

```python
def route_markdown(filename):
    """Determine destination for markdown files"""

    category = filename.split('-')[0]

    # PRDs
    if category == 'prd':
        return 'prd/active/'

    # Specifications
    elif category in ['specs', 'spec']:
        return 'specs/'

    # Guides
    elif category == 'guide':
        return 'docs/guides/'

    # Security
    elif category == 'security':
        return 'docs/security/'

    # Architecture
    elif category in ['architecture', 'arch']:
        return 'docs/architecture/'

    # Meeting notes
    elif category in ['meeting-notes', 'meeting']:
        return 'docs/operations/'

    # API documentation
    elif category == 'api':
        return 'docs/api/'

    # Research
    elif category == 'research':
        return 'docs/research/'

    # Default
    else:
        return 'docs/'
```

**Examples:**

```
prd-token-economics.md
→ prd/active/

specs-api-gateway.md
→ specs/

guide-deployment-procedures.md
→ docs/guides/

security-audit-report-20251107.md
→ docs/security/
```

### Special Cases

**Videos:**

```
*.mp4, *.mov, *.avi → assets/videos/
```

**Templates:**

```
*-template-* → assets/templates/ (for design templates)
*-template-* → examples/templates/ (for code/doc templates)
```

**Scripts:**

```
*.py, *.sh, *.js (if utility) → scripts/
```

## Relocation Workflow

### Phase 1: Pre-Relocation Analysis

```bash
#!/bin/bash

# For each file in SORT/
for file in SORT/*; do
    filename=$(basename "$file")

    # Skip directories
    [ -d "$file" ] && continue

    # Get file extension
    extension="${filename##*.}"

    # Determine file type
    case $extension in
        png|jpg|jpeg|gif|svg|webp)
            file_type="image"
            ;;
        pdf|docx|doc|txt)
            file_type="document"
            ;;
        md|markdown)
            file_type="markdown"
            ;;
        mp4|mov|avi)
            file_type="video"
            ;;
        py|sh|js)
            file_type="script"
            ;;
        *)
            file_type="other"
            ;;
    esac

    echo "File: $filename | Type: $file_type"
done
```

### Phase 2: Destination Determination

```python
def determine_destination(filename, file_type):
    """
    Analyze filename and determine destination directory
    Returns: (destination_path, subdirectory_needed)
    """

    if file_type == "image":
        dest = route_image(filename)

    elif file_type == "document":
        dest = route_document(filename)

    elif file_type == "markdown":
        dest = route_markdown(filename)

    elif file_type == "video":
        dest = "assets/videos/"

    elif file_type == "script":
        # Analyze script purpose
        if "validation" in filename.lower():
            dest = "scripts/validation/"
        elif "deploy" in filename.lower():
            dest = "scripts/deployment/"
        else:
            dest = "scripts/automation/"

    else:
        # Unclear - needs user input
        dest = None

    return dest
```

### Phase 3: Directory Creation

```bash
create_destination_dir() {
    local dest_path=$1

    # Check if directory exists
    if [ ! -d "$dest_path" ]; then
        echo "Creating directory: $dest_path"
        mkdir -p "$dest_path"

        # Verify creation
        if [ -d "$dest_path" ]; then
            echo "✅ Directory created successfully"
        else
            echo "❌ Failed to create directory: $dest_path"
            return 1
        fi
    else
        echo "Directory already exists: $dest_path"
    fi

    return 0
}
```

### Phase 4: File Relocation

```bash
relocate_file() {
    local source_file=$1
    local dest_dir=$2
    local filename=$(basename "$source_file")
    local dest_path="${dest_dir}${filename}"

    # Check for conflicts
    if [ -f "$dest_path" ]; then
        echo "⚠️  WARNING: File already exists at destination: $dest_path"
        # Prompt user for action
        read -p "Overwrite? [y/N] " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Skipping: $filename"
            return 1
        fi
    fi

    # Use git mv if in git repo (preserves history)
    if git rev-parse --git-dir > /dev/null 2>&1; then
        git mv "$source_file" "$dest_path"
        exit_code=$?
    else
        mv "$source_file" "$dest_path"
        exit_code=$?
    fi

    # Verify relocation
    if [ $exit_code -eq 0 ] && [ -f "$dest_path" ]; then
        echo "✅ Relocated: $filename → $dest_dir"
        return 0
    else
        echo "❌ Failed to relocate: $filename"
        return 1
    fi
}
```

### Phase 5: Post-Relocation Validation

```bash
validate_relocation() {
    local dest_path=$1
    local filename=$(basename "$dest_path")

    # Verify file exists
    if [ ! -f "$dest_path" ]; then
        echo "❌ File not found at destination: $dest_path"
        return 1
    fi

    # Verify file is readable
    if [ ! -r "$dest_path" ]; then
        echo "❌ File not readable: $dest_path"
        return 1
    fi

    # Verify file size > 0
    if [ ! -s "$dest_path" ]; then
        echo "⚠️  WARNING: File is empty: $dest_path"
    fi

    # Verify file permissions
    permissions=$(stat -f "%OLp" "$dest_path")
    echo "File permissions: $permissions"

    echo "✅ Validation passed: $filename"
    return 0
}
```

## Batch Relocation

### Process Multiple Files

```bash
#!/bin/bash

RELOCATION_LOG="relocation_log_$(date +%Y%m%d_%H%M%S).txt"

echo "File Relocation Log - $(date)" > "$RELOCATION_LOG"
echo "===========================================" >> "$RELOCATION_LOG"

total_files=$(find SORT/ -type f | wc -l)
relocated=0
failed=0
skipped=0

find SORT/ -type f | while read source_file; do
    filename=$(basename "$source_file")

    echo "Processing: $filename" | tee -a "$RELOCATION_LOG"

    # Determine destination
    dest_dir=$(determine_destination "$filename")

    if [ -z "$dest_dir" ]; then
        echo "SKIP: Cannot determine destination for $filename" | tee -a "$RELOCATION_LOG"
        ((skipped++))
        continue
    fi

    # Create destination directory
    create_destination_dir "$dest_dir"

    # Relocate file
    if relocate_file "$source_file" "$dest_dir"; then
        echo "SUCCESS: $filename → $dest_dir" | tee -a "$RELOCATION_LOG"
        ((relocated++))
    else
        echo "FAILED: $filename" | tee -a "$RELOCATION_LOG"
        ((failed++))
    fi
done

echo "===========================================" >> "$RELOCATION_LOG"
echo "Total Files: $total_files" >> "$RELOCATION_LOG"
echo "Relocated: $relocated" >> "$RELOCATION_LOG"
echo "Failed: $failed" >> "$RELOCATION_LOG"
echo "Skipped: $skipped" >> "$RELOCATION_LOG"

echo "Relocation complete. See log: $RELOCATION_LOG"
```

## Reference Updates

### Update Documentation Links

After relocating files, update references in documentation:

```python
import re
import os

def update_references(old_path, new_path, docs_dir='docs/'):
    """
    Update markdown links that reference relocated files
    """

    old_filename = os.path.basename(old_path)
    new_relative_path = os.path.relpath(new_path, docs_dir)

    # Find all markdown files
    md_files = []
    for root, dirs, files in os.walk(docs_dir):
        for file in files:
            if file.endswith('.md'):
                md_files.append(os.path.join(root, file))

    updated_count = 0

    for md_file in md_files:
        with open(md_file, 'r') as f:
            content = f.read()

        # Find and replace references
        # Match: [text](path/to/old_filename) or ![alt](path/to/old_filename)
        pattern = rf'(\[.*?\]\()([^)]*{re.escape(old_filename)})(\))'

        if re.search(pattern, content):
            # Calculate relative path from this markdown file to new location
            md_dir = os.path.dirname(md_file)
            relative_new_path = os.path.relpath(new_path, md_dir)

            # Update references
            new_content = re.sub(
                pattern,
                rf'\1{relative_new_path}\3',
                content
            )

            with open(md_file, 'w') as f:
                f.write(new_content)

            updated_count += 1
            print(f"Updated references in: {md_file}")

    return updated_count
```

### Update README.md

If relocated files are referenced in README.md:

```bash
# Check if README contains references
if grep -q "$old_filename" README.md; then
    echo "⚠️  README.md contains references to: $old_filename"
    echo "Please update README.md manually or run reference updater"
fi
```

## Handling Edge Cases

### Ambiguous Categorization

If destination cannot be determined automatically:

```python
def prompt_user_for_destination(filename):
    """
    Interactively ask user where file should go
    """

    print(f"\n📁 Cannot automatically determine destination for: {filename}")
    print("\nAvailable destinations:")
    print("1. assets/images/ryno-crypto/")
    print("2. assets/images/terrahash-stack/")
    print("3. assets/diagrams/architecture/")
    print("4. assets/diagrams/infographics/")
    print("5. docs/guides/")
    print("6. docs/api/")
    print("7. prd/active/")
    print("8. Custom path (manual entry)")
    print("9. Skip this file")

    while True:
        choice = input("\nSelect destination [1-9]: ")

        if choice == '1':
            return 'assets/images/ryno-crypto/'
        elif choice == '2':
            return 'assets/images/terrahash-stack/'
        # ... etc ...
        elif choice == '8':
            custom = input("Enter custom path: ")
            return custom if custom.endswith('/') else custom + '/'
        elif choice == '9':
            return None
        else:
            print("Invalid choice. Please select 1-9.")
```

### Conflict Resolution

If file already exists at destination:

**Strategy 1: Version Increment**

```bash
# If ryno-crypto-logo-icon-512x512-v1-0.png exists
# Rename incoming to v1-1
new_filename="${filename/-v1-0./-v1-1.}"
```

**Strategy 2: Timestamp Suffix**

```bash
# Add timestamp to avoid collision
timestamp=$(date +%Y%m%d-%H%M%S)
new_filename="${filename%.*}-${timestamp}.${filename##*.}"
```

**Strategy 3: User Prompt**

```bash
echo "File exists at destination: $dest_path"
echo "1. Overwrite existing file"
echo "2. Keep both (rename incoming)"
echo "3. Skip this file"
read -p "Select action [1-3]: " action
```

### Rollback Capability

Maintain rollback information:

```bash
# Create rollback script during relocation
ROLLBACK_SCRIPT="rollback_relocation_$(date +%Y%m%d_%H%M%S).sh"

echo "#!/bin/bash" > "$ROLLBACK_SCRIPT"
echo "# Rollback script for relocation operation" >> "$ROLLBACK_SCRIPT"
echo "" >> "$ROLLBACK_SCRIPT"

# For each relocated file, add rollback command
echo "git mv '$dest_path' '$source_file'" >> "$ROLLBACK_SCRIPT"

chmod +x "$ROLLBACK_SCRIPT"
```

## Integration with Other Skills

### After file-renamer

```bash
# Typical workflow
1. filename-validator → identify issues
2. file-renamer → fix filenames
3. file-relocator → move to correct directories (THIS SKILL)
4. organization-sanitation-agent → final validation
```

### Before OPSEC Agents

```bash
# Relocation must complete before running agents
file-relocator SORT/
data-breach-agent .
organization-sanitation-agent .
```

### Used by file-organizer

Main orchestrator calls this skill as part of full workflow.

## Output and Reporting

### Relocation Summary

```markdown
# File Relocation Report

**Date:** 2025-11-21T10:30:00Z
**Source Directory:** SORT/
**Files Processed:** 25
**Files Relocated:** 20
**Files Skipped:** 3
**Failed:** 2

## Relocations by Destination

### assets/images/ryno-crypto/ (8 files)
- ✅ ryno-crypto-logo-icon-512x512-v1-0.png
- ✅ ryno-crypto-smart-dip-buying-banner-1920x1080-v1-0.png
- ✅ ryno-crypto-architecture-diagram-2560x1440-v1-0.svg

### assets/images/terrahash-stack/ (5 files)
- ✅ ths-stack-logo-icon-512x512-v1-0.png
- ✅ ths-stack-bear-market-strategy-infographic-1920x1080-v1-0.png

### prd/active/ (4 files)
- ✅ ryno-crypto-prd-smart-contract-v1-0.pdf
- ✅ ths-stack-prd-tokenomics-v2-0.pdf

### docs/guides/ (3 files)
- ✅ terrahash-mining-guide-overview-v1-0.pdf

## Skipped Files

- ⏭️  README.md (reserved filename)
- ⏭️  .gitignore (config file)
- ⏭️  ambiguous-file.dat (unable to determine type)

## Failed Relocations

- ❌ locked-file.pdf (file in use)
- ❌ permission-denied.png (insufficient permissions)

## Directories Created

- assets/diagrams/infographics/
- docs/research/

## Next Steps

1. Verify all relocated files in their new locations
2. Run organization-sanitation-agent for final validation
3. Update documentation references if needed
4. Review and delete now-empty SORT/ directory

**Relocation Log:** relocation_log_20251121_103000.txt
**Rollback Script:** rollback_relocation_20251121_103000.sh
```

## Quality Assurance Checklist

Before marking relocation complete:

- ✅ All files analyzed and categorized correctly
- ✅ Destination directories created where needed
- ✅ Files successfully moved (verified at destination)
- ✅ No files lost or corrupted
- ✅ Git history preserved (used git mv when possible)
- ✅ Conflicts resolved appropriately
- ✅ References in documentation updated
- ✅ Relocation log generated
- ✅ Rollback script created
- ✅ Report generated with full details

---

**Related Documentation:**

- CLAUDE.md (Repository structure reference)
- .claude/skills/filename-validator/skill.md
- .claude/skills/file-renamer/skill.md (Use this before relocating)
- .claude/skills/file-organizer/skill.md (Main orchestrator)
- .claude/agents/organization-sanitation-agent.md (Run after relocation)
