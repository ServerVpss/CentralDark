---
name: writing-skills
description: Creates well-structured Agent Skills for Claude Code following validation rules and best practices. Use when creating, writing, authoring, or designing Skills, or when working with SKILL.md files, frontmatter, skill structure, or skill discovery issues.
---

# Writing Skills

## Workflow

Copy this checklist and track progress:

```
Skill Creation Progress:
- [ ] Step 1: Define scope (one capability)
- [ ] Step 2: Choose location (personal/project)
- [ ] Step 3: Write frontmatter (name + description)
- [ ] Step 4: Write content (instructions + examples)
- [ ] Step 5: Add supporting files (if needed)
- [ ] Step 6: Validate and test
```

## Step 1: Define scope

Ask:
- What specific capability should this Skill provide?
- When should it activate? (trigger phrases)
- What tools/resources does it need?

**One Skill = one capability.** Split broad Skills.

## Step 2: Choose location

| Location | Use for |
|----------|---------|
| `~/.claude/skills/` | Personal/experimental |
| `.claude/skills/` | Team/project (git) |

## Step 3: Write frontmatter

```yaml
---
name: pdf-processing
description: Extracts text and tables from PDF files, fills forms, merges documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.
---
```

**Name rules:**
- Gerund form preferred: `processing-pdfs`, `writing-tests`
- Lowercase, hyphens only, max 64 chars
- No reserved words: "anthropic", "claude"

**Description formula:** `[What it does] + [When to use it] + [Key triggers]`

- Include file extensions (.pdf, .xlsx)
- Include trigger phrases ("extract", "analyze")
- Max 1024 characters

**Optional:** `allowed-tools: Read, Grep, Glob` (for read-only Skills)

## Step 4: Write content

Keep SKILL.md under 500 lines. Structure:

```markdown
# Skill Name

## Quick start
[Minimal working example]

## Instructions
1. First step
2. Second step
3. Handle edge cases

## Examples
[Concrete input/output pairs]
```

**Degrees of freedom:**
- High: Text instructions when multiple approaches valid
- Medium: Pseudocode when preferred pattern exists
- Low: Exact scripts when operations are fragile

## Step 5: Add supporting files

For complex Skills, use progressive disclosure:

```
skill-name/
├── SKILL.md (overview, <500 lines)
├── reference.md (loaded when needed)
├── examples.md (loaded when needed)
└── scripts/helper.py (executed, not loaded)
```

Reference from SKILL.md:
```markdown
**Advanced features**: See [reference.md](reference.md)
```

**Rules:**
- Keep references one level deep
- Use forward slashes only
- Add table of contents to files >100 lines

## Step 6: Validate and test

**Validation loop:**

1. Run `/skills` to verify Skill appears
2. Ask a query that should trigger it
3. If not triggered → improve description with more trigger words
4. If triggered but wrong behavior → refine instructions
5. Repeat until working

**Checklist:**
- [ ] Name matches directory name
- [ ] Name is lowercase-hyphen, max 64 chars
- [ ] Description < 1024 chars, includes "what" and "when"
- [ ] YAML valid (no tabs, `---` on line 1)
- [ ] Forward slashes in all paths
- [ ] Instructions actionable for Claude
- [ ] Examples concrete (real code, not pseudocode)
- [ ] Dependencies listed

## Patterns

### Read-only Skill

```yaml
---
name: reviewing-code
description: Reviews code for bugs and improvements without making changes. Use for code review, understanding codebases, or audits.
allowed-tools: Read, Grep, Glob
---
```

### Script-based Skill

```yaml
---
name: processing-data
description: Processes CSV and JSON files with validation. Use when transforming datasets or analyzing data files.
---

# Processing Data

Run:
```bash
python scripts/process.py input.csv --output results.json
python scripts/validate.py results.json  # Always validate
```

If validation fails → fix and re-run.
```

### Multi-domain Skill

```
bigquery-skill/
├── SKILL.md
└── reference/
    ├── finance.md (revenue metrics)
    ├── sales.md (pipeline data)
    └── product.md (usage analytics)
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Skill doesn't activate | Add trigger words to description; include file types |
| Multiple Skills conflict | Make descriptions more distinct; narrow scope |
| YAML errors | Check for tabs (use spaces); verify `---` delimiters |
| Scripts fail | Check forward slashes; verify dependencies installed |
