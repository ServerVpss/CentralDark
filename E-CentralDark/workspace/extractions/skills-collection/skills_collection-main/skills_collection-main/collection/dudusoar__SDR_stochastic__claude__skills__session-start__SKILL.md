---
name: session-start
description: Start a work session by summarizing project status, migration progress, recent activity, and suggesting next actions. Use when beginning a new work session, returning to the project after time away, or when the user asks for project status or what to work on next.
---

# Session Start

Quickly resume work by reviewing project status, understanding progress, and identifying next priorities.

## Workflow

### Step 1: Read Project Context

1. **Read CLAUDE.md**
   - Extract current phase and last updated date
   - Parse status sections (see [claude_md_structure.md](references/claude_md_structure.md))

2. **Check for Migration Log** (if exists)
   - Read `.claude/MIGRATION_LOG.md`
   - Note last migration and any flagged issues

### Step 2: Analyze Progress

1. **Calculate migration progress**
   - Total files to migrate: 9 (from CLAUDE.md migration table)
   - Count completed migrations from status section
   - Identify current file being worked on

2. **Summarize task status**
   - Count completed tasks
   - List in-progress tasks (current focus)
   - Note any blockers

3. **Review recent activity**
   - Run: `git log --oneline -5`
   - Show last 3-5 commits to understand recent work

### Step 3: Present Status Summary

Format the summary as:

```markdown
## 📊 Project Status
**Phase:** [Phase name]
**Last Updated:** [Date]

## ✅ Progress Overview
- Migration: X/9 files completed (XX%)
- Completed: X tasks
- In Progress: X tasks
- Blockers: [None/count]

## 🚧 Current Focus
- [In-progress task 1]
- [In-progress task 2]

## 📋 Next Priority Tasks
1. [Next step 1]
2. [Next step 2]
3. [Next step 3]

## 🔍 Recent Activity
[Last 3-5 git commits]

## 💡 Suggested Action
[Based on current status, suggest specific next task to work on]
```

### Step 4: Suggest Next Action

Based on the analysis, recommend a specific next task:

**Decision logic:**
- If blockers exist → Suggest addressing blockers first
- If tasks in progress → Suggest completing them before starting new ones
- If no in-progress tasks → Suggest highest priority from "Next Steps"
- If migration partially complete → Suggest continuing with next file from migration table

**Be specific:** Instead of "work on migration", say "Migrate instance.py to vrp_toolkit/problems/pdptw.py"

## Integration with Other Skills

After presenting the session summary, offer to:
- Use `migrate-module` if next action is file migration
- Use `update-progress` after completing tasks (when that skill exists)

## Special Cases

### First Session of the Day
If CLAUDE.md shows last update was yesterday or earlier:
- Emphasize recent git commits to rebuild context
- Check if any in-progress tasks from yesterday can be closed

### After Long Break
If last update is >3 days ago:
- Suggest reviewing completed work first
- Check if environment/dependencies need updating
- Run tests to verify current state

### Clean Slate (No In-Progress Tasks)
If no tasks are in progress:
- Clearly recommend starting the highest priority task
- Offer to create a todo list for the task if it's complex

## Reference

For CLAUDE.md structure and parsing details, see [claude_md_structure.md](references/claude_md_structure.md).
