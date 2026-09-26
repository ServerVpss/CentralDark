---
name: skill-creator
description: Create new Claude Code skills in this repository. Use when user wants to add a new skill, create a skill, implement a skill, or extend Claude's capabilities with a custom workflow.
---

# Skill Creator

Creates new skills in the **project** `skills/` directory (not `.claude/skills/`).

**Target directory**: `<project-root>/skills/`

## Skill Structure

Each skill lives in its own directory under the **project** `skills/` folder:

```
<project-root>/skills/<skill-name>/
├── SKILL.md          # Required: skill definition with YAML frontmatter
├── scripts/          # Optional: executable scripts
│   ├── setup.sh      # Optional: one-time setup
│   └── main.py       # Main script (or .sh, .js, etc.)
├── refs/             # Optional: reference documentation
├── pyproject.toml    # Optional: Python dependencies (use uv)
└── package.json      # Optional: Node.js dependencies
```

## SKILL.md Format

```yaml
---
name: skill-name
description: Brief description of what this skill does AND when to use it. Include trigger words like file types, actions, or use cases.
allowed-tools: Read, Grep, Glob  # Optional: restrict available tools
---

# Skill Name

Brief overview of the skill.

## Requirements

List external dependencies (e.g., uv, node, specific tools).

## Setup

Instructions to run before first use.

## Usage

How to invoke the skill's functionality.

## Examples

Concrete usage examples.
```

## Naming Rules

- Max 64 characters
- Lowercase letters, numbers, hyphens only
- Cannot contain "anthropic" or "claude"

## Description Best Practices

The description determines when Claude triggers the skill. Include:

1. **What it does**: "Converts web pages to markdown"
2. **When to use it**: "Use when user wants to crawl a webpage, extract content..."
3. **Trigger words**: File types (.pdf, .xlsx), actions (crawl, convert, analyze)

Bad: `description: Helps with documents`
Good: `description: Extract text from PDF files, fill forms, merge documents. Use when working with PDFs or when user mentions forms, document extraction.`

## Script Patterns

### Python with uv (recommended)

```toml
# pyproject.toml
[project]
name = "skill-name"
version = "0.1.0"
requires-python = ">=3.10"
dependencies = ["your-deps"]
```

```bash
# scripts/setup.sh
#!/bin/bash
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$(dirname "$SCRIPT_DIR")"
uv sync
# Additional setup...
```

```bash
# Run scripts with:
cd skills/<skill-name> && uv run python scripts/main.py
```

### Shell scripts

```bash
# scripts/main.sh
#!/bin/bash
set -e
# Your logic here
```

### Node.js

```json
// package.json
{
  "name": "skill-name",
  "type": "module",
  "dependencies": {}
}
```

## Creating a New Skill

1. Ask user for:
   - Skill name (lowercase, hyphens)
   - Purpose and functionality
   - Required dependencies
   - Trigger scenarios

2. Create directory structure in the **project** skills folder:
   ```bash
   mkdir -p <project-root>/skills/<name>/scripts
   ```

   **Important**: Always use the project's `skills/` directory, NOT `.claude/skills/`.

3. Write SKILL.md with proper frontmatter

4. Add scripts if needed

5. Add setup.sh if dependencies require installation

6. Test the skill works

## Progressive Disclosure

Keep SKILL.md focused on quick-start workflow. Move detailed reference docs to separate files:

```
refs/
├── API.md
├── CONFIG.md
└── TROUBLESHOOTING.md
```

Reference them from SKILL.md: `See [API reference](refs/API.md) for details.`
