---
name: filename-validator
description: "Validates filenames against repository CLAUDE.md standards. Detects violations including uppercase letters, spaces, special characters, missing versioning, and incorrect patterns. Use when you need to check if files follow naming conventions before organizing or committing."
license: Proprietary. See LICENSE in repository root
---

# Filename Validator

## Overview

This skill validates filenames against the comprehensive naming conventions defined in CLAUDE.md. It detects common violations and provides detailed feedback on how to fix non-compliant filenames.

## When to Use This Skill

- Before organizing files from SORT/ directory
- During pre-commit validation
- When auditing repository for naming compliance
- As part of automated OPSEC pipeline
- To validate user-created files before moving to permanent locations

## Validation Rules

### Universal Requirements (All Files)

**Required:**

- ✅ Lowercase letters only
- ✅ Hyphens (`-`) to separate words (no spaces)
- ✅ Maximum 50 characters (excluding extension)
- ✅ Semantic versioning: `v[major]-[minor]-[patch]` (e.g., `v1-0-0`, `v2-1-3`)
- ✅ ISO 8601 dates: `YYYY-MM-DD` or `YYYYMMDD`
- ✅ Proper file extension matching content

**Forbidden:**

- ❌ Uppercase letters (except reserved: README, LICENSE, CONTRIBUTING, CHANGELOG, SECURITY)
- ❌ Spaces (replace with hyphens)
- ❌ Special characters: `* & % $ @ ! # ? ( ) [ ] { } ' " ; : < > | \ / ~`
- ❌ Dots in version numbers (use hyphens: `v1-0-0` not `v1.0.0`)
- ❌ Underscores (use hyphens instead)
- ❌ Consecutive hyphens (`--`)

### Image Files

**Pattern:** `[org]-[product]-[descriptor]-[type]-[resolution]-[version].[format]`

**Components:**

- `[org]`: Organization (`ryno`, `ths`, `terrahash`)
- `[product]`: Product name (`crypto`, `stack`, `mining`)
- `[descriptor]`: Content description (e.g., `smart-dip-buying`, `architecture`, `logo`)
- `[type]`: Image type (`banner`, `logo`, `hero`, `icon`, `infographic`, `diagram`, `thumbnail`, `screenshot`)
- `[resolution]`: Dimensions (`1920x1080`, `800x600`, `512x512`, `original`)
- `[version]`: Semantic version (`v1-0`, `v1-1`, `v2-0`)
- `[format]`: File extension (`png`, `jpg`, `svg`, `webp`, `gif`)

**Valid Examples:**

```
ryno-crypto-dip-buying-banner-1920x1080-v1-0.png
ths-stack-architecture-diagram-2560x1440-v2-1.svg
terrahash-mining-process-infographic-original-v1-0.jpg
ryno-crypto-logo-icon-512x512-v1-0.png
```

**Invalid Examples:**

```
❌ Bear_Market_Strategy.png                    (underscores, uppercase, missing components)
❌ TerraHash-Logo.PNG                          (uppercase)
❌ ryno crypto banner.png                      (spaces)
❌ ryno-crypto-banner-v1.0.png                 (dots in version, missing type/resolution)
❌ image (1).png                               (spaces, parentheses)
```

### Document Files

**Pattern:** `[org]-[product]-[category]-[title]-[version].[format]`

**Components:**

- `[org]`: Organization (`ryno`, `ths`, `terrahash`)
- `[product]`: Product name (`crypto`, `stack`, `mining`)
- `[category]`: Document type (`prd`, `specs`, `api-docs`, `guide`, `whitepaper`, `service`, `architecture`, `security`)
- `[title]`: Descriptive title with hyphens
- `[version]`: Semantic version (`v1-0`, `v1-1`, `v2-0`)
- `[format]`: File extension (`pdf`, `docx`, `txt`)

**Valid Examples:**

```
ryno-crypto-prd-smart-contract-v1-0.pdf
ths-stack-specs-data-pipeline-v2-1.docx
terrahash-mining-guide-getting-started-v1-0.pdf
ryno-crypto-api-docs-authentication-v3-0.md
```

### Markdown Files

**Pattern:** `[category]-[title]-[date-optional].md`

**Components:**

- `[category]`: Document category (`prd`, `specs`, `guide`, `security`, `meeting-notes`, etc.)
- `[title]`: Descriptive title with hyphens
- `[date]`: Optional ISO 8601 date (YYYY-MM-DD) for time-sensitive content

**Valid Examples:**

```
prd-token-economics.md
specs-api-gateway.md
guide-deployment-procedures.md
security-audit-report-20251107.md
meeting-notes-architecture-review-20251107.md
```

### Source Code Files

Follow language-specific conventions:

- **Python**: `snake_case.py` (exception: underscores allowed)
- **JavaScript/TypeScript**: `kebab-case.js`, `kebab-case.ts`
- **Configuration**: Standard names (`.gitignore`, `package.json`, etc.)

## Validation Workflow

### Step 1: Scan Files

Use Glob to find files needing validation:

```bash
# Scan SORT directory
find SORT/ -type f
```

### Step 2: Analyze Each Filename

For each file, check:

1. **Case validation**: Contains uppercase? (except reserved names)
2. **Character validation**: Contains spaces or forbidden characters?
3. **Pattern matching**: Matches expected pattern for file type?
4. **Component validation**: Has all required components?
5. **Version validation**: Has proper semantic versioning?
6. **Extension validation**: Extension matches content type?

### Step 3: Generate Validation Report

Create a structured report:

```markdown
# Filename Validation Report

**Date:** [ISO 8601 timestamp]
**Files Scanned:** [count]
**Files Valid:** [count]
**Files Invalid:** [count]

## Validation Summary

### ✅ Valid Files ([count])

- filename-1.ext
- filename-2.ext

### ❌ Invalid Files ([count])

#### Filename: `Bad File Name (1).png`
**Location:** SORT/Bad File Name (1).png
**File Type:** Image
**Issues:**
- ❌ Contains spaces (replace with hyphens)
- ❌ Contains uppercase letters (convert to lowercase)
- ❌ Contains forbidden characters: `(`, `)`
- ❌ Missing required components: org, product, descriptor, type, resolution, version
- ❌ Missing semantic versioning

**Suggested Rename:**
`[org]-[product]-[descriptor]-[type]-[resolution]-v1-0.png`

**Action Required:** Need user input for: org, product, descriptor, type
```

### Step 4: Return Results

Provide:

- List of valid files (ready to organize)
- List of invalid files with specific issues
- Suggested renames (when determinable)
- Files requiring user input for categorization

## Implementation Examples

### Example 1: Validate Single File

```markdown
**Task:** Validate `TerraHash Mining Overview.pdf`

**Analysis:**
- File type: Document (PDF)
- Expected pattern: `[org]-[product]-[category]-[title]-[version].pdf`

**Issues Found:**
1. ❌ Contains uppercase: T, H, M, O
2. ❌ Contains spaces
3. ❌ Missing version number
4. ❌ Missing category

**Suggested Fix:**
`terrahash-mining-guide-overview-v1-0.pdf`
(Assumes: org=terrahash, product=mining, category=guide, title=overview)
```

### Example 2: Validate Image File

```markdown
**Task:** Validate `Bear_Market_Strategy__When_Competitors_Exit.png`

**Analysis:**
- File type: Image (PNG)
- Expected pattern: `[org]-[product]-[descriptor]-[type]-[resolution]-[version].png`

**Issues Found:**
1. ❌ Contains uppercase: B, M, S, W, C, E
2. ❌ Contains underscores (replace with hyphens)
3. ❌ Missing required components: org, product, type, resolution, version
4. ❌ Descriptor too long (> 50 chars)

**Suggested Fix:**
`[org]-[product]-bear-market-strategy-[type]-[resolution]-v1-0.png`

**User Input Required:**
- org: ryno | ths | terrahash
- product: crypto | stack | mining
- type: banner | infographic | diagram | screenshot
- resolution: Get from image metadata or use 'original'
```

### Example 3: Batch Validation

```bash
# Validate all files in SORT directory
# Use Glob to find all files
find SORT/ -type f -name "*"

# For each file:
# 1. Determine file type (image, document, markdown)
# 2. Apply appropriate validation rules
# 3. Collect results
# 4. Generate comprehensive report
```

## Error Handling

### Reserved Filenames (Skip Validation)

These files are **exempt** from lowercase requirement:

- README.md
- LICENSE
- CONTRIBUTING.md
- CHANGELOG.md
- SECURITY.md
- CLAUDE.md
- Dockerfile
- Makefile

### Edge Cases

**Hidden files:** Files starting with `.` (e.g., `.gitignore`) follow their standard naming
**Config files:** Standard config files keep their conventional names
**Temporary files:** Files ending in `.tmp`, `.bak`, `.swp` should be flagged for deletion

## Integration with Other Skills

This skill is designed to work with:

- **file-renamer**: Takes validation output and performs renaming
- **file-relocator**: Uses validation results to determine destination directories
- **file-organizer**: Main orchestrator that uses this skill first

## Output Format

Return a JSON-like structure for programmatic use:

```json
{
  "validation_date": "2025-11-21T10:30:00Z",
  "files_scanned": 25,
  "files_valid": 10,
  "files_invalid": 15,
  "valid_files": [
    {
      "filename": "ryno-crypto-logo-icon-512x512-v1-0.png",
      "path": "SORT/ryno-crypto-logo-icon-512x512-v1-0.png",
      "type": "image"
    }
  ],
  "invalid_files": [
    {
      "filename": "Bad File.png",
      "path": "SORT/Bad File.png",
      "type": "image",
      "issues": [
        "Contains uppercase",
        "Contains spaces",
        "Missing required components"
      ],
      "suggested_rename": "[org]-[product]-[descriptor]-[type]-[resolution]-v1-0.png",
      "needs_user_input": ["org", "product", "descriptor", "type", "resolution"]
    }
  ]
}
```

## Quality Assurance

Before completing validation:

- ✅ All files in target directory scanned
- ✅ Validation rules applied consistently
- ✅ Clear feedback provided for each violation
- ✅ Actionable suggestions included
- ✅ User input requirements identified
- ✅ Report generated in standardized format

---

**Related Documentation:**

- CLAUDE.md (File naming conventions)
- .claude/skills/file-renamer/skill.md
- .claude/skills/file-organizer/skill.md
- .claude/agents/organization-sanitation-agent.md
