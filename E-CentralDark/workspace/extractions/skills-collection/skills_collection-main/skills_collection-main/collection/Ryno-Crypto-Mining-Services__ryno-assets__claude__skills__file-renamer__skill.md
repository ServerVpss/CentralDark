---
name: file-renamer
description: "Renames files to comply with repository CLAUDE.md naming conventions. Handles images, documents, and markdown files with proper pattern enforcement. Converts uppercase to lowercase, replaces spaces with hyphens, adds versioning, and structures filenames according to file type standards."
license: Proprietary. See LICENSE in repository root
---

# File Renamer

## Overview

This skill performs intelligent file renaming to comply with CLAUDE.md standards. It transforms non-compliant filenames into properly structured names based on file type, content analysis, and user-provided categorization.

## When to Use This Skill

- After filename validation identifies non-compliant files
- When organizing files from SORT/ directory
- As part of pre-commit hooks
- During repository cleanup operations
- When standardizing legacy file collections

## Renaming Patterns by File Type

### Image Files

**Target Pattern:** `[org]-[product]-[descriptor]-[type]-[resolution]-[version].[format]`

**Transformation Steps:**

1. Convert to lowercase
2. Replace spaces/underscores with hyphens
3. Remove special characters
4. Extract or prompt for: org, product, descriptor, type
5. Get resolution from image metadata or use `original`
6. Add version (default: `v1-0`)
7. Preserve/normalize file extension

**Example Transformations:**

```
Before: Bear_Market_Strategy__When_Competitors_Exit.png
After:  ths-stack-bear-market-strategy-infographic-1920x1080-v1-0.png

Before: TerraHash Logo Final (1).PNG
After:  terrahash-stack-logo-icon-512x512-v1-0.png

Before: Smart DIP Buying Banner.jpg
After:  ryno-crypto-smart-dip-buying-banner-1920x1080-v1-0.jpg

Before: Mining Process Diagram v2.svg
After:  terrahash-mining-mining-process-diagram-original-v2-0.svg
```

### Document Files

**Target Pattern:** `[org]-[product]-[category]-[title]-[version].[format]`

**Transformation Steps:**

1. Convert to lowercase
2. Replace spaces/underscores with hyphens
3. Remove special characters
4. Extract or prompt for: org, product, category
5. Clean and truncate title (max 50 chars)
6. Add/normalize version
7. Preserve/normalize file extension

**Example Transformations:**

```
Before: TerraHash Mining Overview.pdf
After:  terrahash-mining-guide-overview-v1-0.pdf

Before: PRD - Smart Contract Implementation (Draft).docx
After:  ryno-crypto-prd-smart-contract-implementation-v1-0.docx

Before: API Documentation v3.txt
After:  ths-stack-api-docs-api-documentation-v3-0.txt

Before: Security Audit Report 2024-11-07.pdf
After:  ryno-crypto-security-audit-report-v1-0.pdf
```

### Markdown Files

**Target Pattern:** `[category]-[title]-[date-optional].md`

**Transformation Steps:**

1. Convert to lowercase
2. Replace spaces/underscores with hyphens
3. Extract or prompt for category
4. Clean title
5. Add date if time-sensitive (YYYY-MM-DD format)
6. Ensure `.md` extension

**Example Transformations:**

```
Before: PRD Token Economics.md
After:  prd-token-economics.md

Before: Meeting Notes - Nov 7 2024.md
After:  meeting-notes-nov-7-2024-20241107.md

Before: Architecture Specs.MD
After:  specs-architecture.md

Before: Deployment Guide.markdown
After:  guide-deployment.md
```

## Renaming Workflow

### Phase 1: Pre-Rename Analysis

For each file to be renamed:

1. **Determine File Type**

   ```bash
   # Get file extension
   extension="${filename##*.}"

   # Categorize
   case $extension in
     png|jpg|jpeg|gif|svg|webp) type="image" ;;
     pdf|docx|txt|doc) type="document" ;;
     md|markdown) type="markdown" ;;
     *) type="other" ;;
   esac
   ```

2. **Extract Image Metadata** (for images)

   ```bash
   # Get image dimensions
   identify -format "%wx%h" image.png
   # Returns: 1920x1080
   ```

3. **Analyze Content** (for documents)

   ```bash
   # Extract text for categorization hints
   pdftotext document.pdf - | head -20
   # or for DOCX
   pandoc document.docx -t plain
   ```

4. **Identify Existing Version**
   - Look for patterns: `v1`, `v2`, `version 1`, `final`, `draft`
   - Extract semantic version if present
   - Default to `v1-0` if not found

### Phase 2: Component Gathering

#### Interactive Prompts (when needed)

For missing required components, use AskUserQuestion:

**For Images:**

```markdown
**Renaming:** Original_Filename.png

Please provide the following information:

1. **Organization** (org):
   - ryno: Ryno Crypto Services
   - ths: TerraHash Stack
   - terrahash: TerraHash Mining

2. **Product** (product):
   - crypto: Crypto services
   - stack: TerraHash Stack platform
   - mining: Mining operations

3. **Descriptor** (descriptor):
   - Brief description (e.g., "logo", "banner", "architecture")

4. **Image Type** (type):
   - banner: Wide marketing banner
   - logo: Logo/branding
   - icon: Icon/small graphic
   - infographic: Informational graphic
   - diagram: Technical diagram
   - screenshot: Screenshot
   - hero: Hero image

**AI-Suggested Values** (based on content analysis):
- org: ths (detected "TerraHash Stack" in filename)
- product: stack
- descriptor: bear-market-strategy
- type: infographic
```

**For Documents:**

```markdown
**Renaming:** Document_Name.pdf

Please provide:

1. **Organization** (org): ryno | ths | terrahash

2. **Product** (product): crypto | stack | mining

3. **Category** (category):
   - prd: Product Requirements Document
   - specs: Technical Specifications
   - guide: User/Developer Guide
   - api-docs: API Documentation
   - whitepaper: Whitepaper
   - security: Security Documentation

**AI-Suggested Values**:
- org: ryno
- product: crypto
- category: guide
```

#### Automated Component Extraction

Use filename analysis and AI to suggest values:

```python
def extract_components(filename, file_type):
    """Extract components from filename using heuristics"""

    lower_name = filename.lower()
    components = {}

    # Organization detection
    if 'terrahash' in lower_name or 'ths' in lower_name:
        components['org'] = 'ths'
        components['product'] = 'stack'
    elif 'ryno' in lower_name:
        components['org'] = 'ryno'
        components['product'] = 'crypto'

    # Type detection (images)
    if 'logo' in lower_name:
        components['type'] = 'logo'
    elif 'banner' in lower_name:
        components['type'] = 'banner'
    elif 'diagram' in lower_name or 'architecture' in lower_name:
        components['type'] = 'diagram'
    elif 'infographic' in lower_name or 'chart' in lower_name:
        components['type'] = 'infographic'

    # Category detection (documents)
    if 'prd' in lower_name or 'requirements' in lower_name:
        components['category'] = 'prd'
    elif 'spec' in lower_name:
        components['category'] = 'specs'
    elif 'guide' in lower_name or 'tutorial' in lower_name:
        components['category'] = 'guide'
    elif 'api' in lower_name:
        components['category'] = 'api-docs'
    elif 'whitepaper' in lower_name:
        components['category'] = 'whitepaper'

    # Version detection
    version_match = re.search(r'v(\d+)[-_.]?(\d+)?[-_.]?(\d+)?', lower_name)
    if version_match:
        major = version_match.group(1)
        minor = version_match.group(2) or '0'
        patch = version_match.group(3) or '0'
        components['version'] = f'v{major}-{minor}-{patch}'
    else:
        components['version'] = 'v1-0'

    return components
```

### Phase 3: Name Construction

#### Build New Filename

```python
def construct_filename(file_type, components, original_filename):
    """Construct compliant filename from components"""

    # Sanitize descriptor/title
    def sanitize(text):
        # Convert to lowercase
        text = text.lower()
        # Replace spaces and underscores with hyphens
        text = re.sub(r'[\s_]+', '-', text)
        # Remove special characters
        text = re.sub(r'[^a-z0-9-]', '', text)
        # Remove consecutive hyphens
        text = re.sub(r'-+', '-', text)
        # Trim hyphens from edges
        text = text.strip('-')
        # Limit length
        if len(text) > 50:
            text = text[:50].rstrip('-')
        return text

    extension = original_filename.split('.')[-1].lower()

    if file_type == 'image':
        # [org]-[product]-[descriptor]-[type]-[resolution]-[version].[format]
        new_name = f"{components['org']}-{components['product']}-"
        new_name += f"{sanitize(components['descriptor'])}-{components['type']}-"
        new_name += f"{components['resolution']}-{components['version']}.{extension}"

    elif file_type == 'document':
        # [org]-[product]-[category]-[title]-[version].[format]
        new_name = f"{components['org']}-{components['product']}-"
        new_name += f"{components['category']}-{sanitize(components['title'])}-"
        new_name += f"{components['version']}.{extension}"

    elif file_type == 'markdown':
        # [category]-[title]-[date-optional].md
        new_name = f"{components['category']}-{sanitize(components['title'])}"
        if 'date' in components:
            new_name += f"-{components['date']}"
        new_name += ".md"

    return new_name
```

#### Validate New Filename

Before renaming, validate the constructed filename:

```python
def validate_new_filename(new_filename):
    """Ensure new filename meets all requirements"""

    checks = {
        'lowercase': new_filename == new_filename.lower(),
        'no_spaces': ' ' not in new_filename,
        'no_special_chars': not re.search(r'[^a-z0-9.-]', new_filename),
        'length_ok': len(new_filename) <= 100,
        'has_extension': '.' in new_filename,
        'has_version': re.search(r'v\d+-\d+', new_filename) is not None
    }

    all_valid = all(checks.values())

    return all_valid, checks
```

### Phase 4: Execute Rename

#### Safety Checks

Before renaming:

1. **Check for conflicts**

   ```bash
   if [ -f "new_filename.ext" ]; then
       echo "ERROR: File already exists: new_filename.ext"
       # Prompt user for action: overwrite, rename, skip
   fi
   ```

2. **Create backup list**

   ```bash
   echo "old_filename.ext -> new_filename.ext" >> SORT/rename_log.txt
   ```

3. **Dry run option**
   - Show all proposed renames
   - Ask for confirmation before executing

#### Perform Rename

```bash
# Use git mv if in git repository (preserves history)
if git rev-parse --git-dir > /dev/null 2>&1; then
    git mv "old_filename.ext" "new_filename.ext"
else
    mv "old_filename.ext" "new_filename.ext"
fi
```

#### Post-Rename Validation

```bash
# Verify file exists at new location
if [ -f "new_filename.ext" ]; then
    echo "✅ Successfully renamed: old_filename.ext -> new_filename.ext"
else
    echo "❌ Rename failed: old_filename.ext"
fi
```

## Batch Renaming

### Process Multiple Files

```bash
#!/bin/bash

RENAME_LOG="SORT/batch_rename_$(date +%Y%m%d_%H%M%S).log"

echo "Batch Rename Log - $(date)" > "$RENAME_LOG"
echo "===========================================" >> "$RENAME_LOG"

# For each file in SORT/
find SORT/ -type f | while read file; do
    filename=$(basename "$file")

    # Skip if already compliant
    if [[ $filename =~ ^[a-z0-9-]+\.[a-z]+$ ]]; then
        echo "SKIP: $filename (already compliant)" >> "$RENAME_LOG"
        continue
    fi

    # Analyze and rename
    echo "PROCESSING: $filename" >> "$RENAME_LOG"

    # ... renaming logic ...

    echo "RENAMED: $filename -> $new_filename" >> "$RENAME_LOG"
done

echo "===========================================" >> "$RENAME_LOG"
echo "Batch rename complete. See log: $RENAME_LOG"
```

### Progress Tracking

```bash
total_files=$(find SORT/ -type f | wc -l)
current=0

find SORT/ -type f | while read file; do
    ((current++))
    progress=$((current * 100 / total_files))
    echo "[$progress%] Processing: $(basename "$file")"
    # ... renaming logic ...
done
```

## Integration with Other Skills

### Works With filename-validator

```bash
# 1. Run validator first
filename-validator SORT/

# 2. Get list of invalid files from validation report
# 3. For each invalid file, run renamer
# 4. Validate renamed files
```

### Works With file-relocator

```bash
# 1. Rename files in place
file-renamer SORT/

# 2. Then relocate to correct directories
file-relocator SORT/
```

### Used By file-organizer

```bash
# Main orchestrator uses renamer as part of workflow
file-organizer SORT/
  -> validate files
  -> rename files (this skill)
  -> relocate files
  -> run OPSEC agents
```

## Special Cases

### Handling Duplicates

If renamed file conflicts with existing file:

**Option 1: Increment version**

```
existing: ths-stack-logo-icon-512x512-v1-0.png
new:      ths-stack-logo-icon-512x512-v1-1.png
```

**Option 2: Add suffix**

```
existing: ryno-crypto-guide-overview-v1-0.pdf
new:      ryno-crypto-guide-overview-alt-v1-0.pdf
```

**Option 3: User prompt**

```
Conflict detected:
  Existing: ths-stack-logo-icon-512x512-v1-0.png
  New:      ths-stack-logo-icon-512x512-v1-0.png

Actions:
1. Overwrite existing file
2. Rename new file (add version/suffix)
3. Keep both (manual review)
4. Skip this file

Choose action [1-4]:
```

### Preserving Dates

For time-sensitive files:

```bash
# Extract date from original filename
original="Security_Audit_Nov_7_2024.pdf"
# Parse date
date="20241107"
# Include in new filename
new="ryno-crypto-security-audit-report-${date}-v1-0.pdf"
```

### Multi-Version Files

When multiple versions exist:

```
File_v1.pdf -> ryno-crypto-guide-overview-v1-0.pdf
File_v2.pdf -> ryno-crypto-guide-overview-v2-0.pdf
File_Final.pdf -> ryno-crypto-guide-overview-v3-0.pdf (assumed latest)
```

## Output and Reporting

### Rename Summary Report

```markdown
# File Rename Report

**Date:** 2025-11-21T10:30:00Z
**Files Processed:** 25
**Files Renamed:** 18
**Files Skipped:** 5 (already compliant)
**Errors:** 2

## Successfully Renamed Files

1. ✅ `Bear_Market_Strategy.png` → `ths-stack-bear-market-strategy-infographic-1920x1080-v1-0.png`
2. ✅ `TerraHash Logo.PNG` → `terrahash-stack-logo-icon-512x512-v1-0.png`
3. ✅ `PRD Smart Contract.pdf` → `ryno-crypto-prd-smart-contract-v1-0.pdf`

## Skipped Files (Already Compliant)

1. ⏭️  `ryno-crypto-logo-icon-512x512-v1-0.png`
2. ⏭️  `ths-stack-prd-tokenomics-v1-0.pdf`

## Errors

1. ❌ `locked_file.pdf` - File is locked or in use
2. ❌ `corrupted_image.png` - Cannot read image metadata

## Rename Log

Full details saved to: `SORT/rename_log_20251121_103000.txt`
```

### Detailed Log File

```
2025-11-21 10:30:15 | START | Batch rename operation started
2025-11-21 10:30:16 | ANALYZE | Bear_Market_Strategy.png
2025-11-21 10:30:16 | EXTRACT | Detected: org=ths, product=stack, type=infographic
2025-11-21 10:30:16 | METADATA | Resolution: 1920x1080
2025-11-21 10:30:17 | RENAME | Bear_Market_Strategy.png -> ths-stack-bear-market-strategy-infographic-1920x1080-v1-0.png
2025-11-21 10:30:17 | VERIFY | ✅ File renamed successfully
2025-11-21 10:30:18 | COMPLETE | Batch rename operation completed
```

## Error Handling

### Common Issues and Solutions

**File locked or in use:**

```bash
if lsof "$filename" > /dev/null 2>&1; then
    echo "WARNING: File is in use: $filename"
    echo "Close the file and try again"
fi
```

**Permission denied:**

```bash
if [ ! -w "$filename" ]; then
    echo "ERROR: No write permission for: $filename"
    chmod u+w "$filename"  # or prompt for sudo
fi
```

**Invalid characters in path:**

```bash
# Sanitize the entire path
safe_path=$(echo "$path" | tr ' ' '-' | tr '[:upper:]' '[:lower:]')
```

## Quality Assurance Checklist

Before marking rename operation complete:

- ✅ All files validated before renaming
- ✅ User prompted for missing components (interactive mode)
- ✅ No filename conflicts created
- ✅ All renames logged
- ✅ Renamed files validated against CLAUDE.md standards
- ✅ Backup/rollback information saved
- ✅ Report generated with full details
- ✅ No files lost or corrupted

---

**Related Documentation:**

- CLAUDE.md (File naming conventions - source of truth)
- .claude/skills/filename-validator/skill.md (Use this first)
- .claude/skills/file-relocator/skill.md (Use this after renaming)
- .claude/skills/file-organizer/skill.md (Main orchestrator)
- .claude/agents/organization-sanitation-agent.md (Final validation)
