---
name: update-progress
description: Update project progress after completing tasks by modifying CLAUDE.md status sections and logging details to MIGRATION_LOG.md. Use when finishing a migration, completing a task, resolving a blocker, or when the user asks to update progress or log work completion.
---

# Update Progress

Systematically update project documentation after completing work to maintain accurate status tracking and detailed history.

## When to Use

Trigger this skill after:
- Completing a file migration
- Finishing any task listed in CLAUDE.md
- Resolving a blocker
- Discovering new tasks during work
- User explicitly asks to "update progress" or "log this work"

## Workflow

### Step 1: Gather Completion Information

Ask the user (or determine from context):

1. **What was completed?**
   - Task name/description
   - File(s) migrated (if applicable)
   - Time spent (optional)

2. **Refactoring details** (for migrations):
   - What hardcoded values were extracted?
   - What was decoupled or generalized?
   - Were docstrings added?
   - Were tests created?

3. **Issues encountered?**
   - Any problems during the work?
   - How were they resolved?
   - Should they be added to common issues?

4. **New work discovered?**
   - Any follow-up tasks identified?
   - Should they be added to "Next Steps"?

### Step 2: Update CLAUDE.md

Follow these updates in order:

1. **Update "Last Updated" date**
   - Change to current date (YYYY-MM-DD)

2. **Move completed task**
   - Find task in "In Progress 🚧" section
   - Move to "Completed ✅" section
   - Keep checkbox format: `- [x] Task description`

3. **Update "In Progress" (if applicable)**
   - Remove completed task
   - Add next task if starting it immediately
   - If no tasks in progress, leave section empty

4. **Update "Next Steps" (if applicable)**
   - Add newly discovered tasks
   - Reorder by priority if needed
   - Remove task if just started (moved to In Progress)

5. **Update or clear "Blockers"**
   - If blocker was resolved, remove it
   - If new blocker found, add it
   - Change to "None currently" if empty

6. **Update Phase** (if milestone reached)
   - Check if phase transition occurred
   - Update status line if needed
   - Phase 1 → Phase 2: All minimal migrations done
   - Phase 2 → Phase 3: Refactoring complete

See [update_templates.md](references/update_templates.md) for detailed examples.

### Step 3: Update MIGRATION_LOG.md

**Only if the completed work was a file migration.**

1. **Update progress summary**
   - Increment "Completed" count
   - Decrement "Remaining" count
   - Recalculate "Completion Rate" percentage
   - Formula: `(Completed / Total Files) * 100`

2. **Add migration entry**
   - Insert at top of "Migration History" (newest first)
   - Use current timestamp: `YYYY-MM-DD HH:MM`
   - Set status: ✅ Completed (or 🚧/⚠️/❌ if other)
   - Fill in source and destination paths
   - Complete refactoring checklist
   - Document issues and resolutions
   - Add notes and observations

3. **Update files remaining checklist**
   - Find the migrated file in the list
   - Change `[ ]` to `[x]`

4. **Add to common issues** (if applicable)
   - If new issue type encountered, add it
   - Include solution for future reference

5. **Update "Last Updated" date**
   - Change to current date at bottom of file

See [update_templates.md](references/update_templates.md) for entry template.

### Step 4: Verify and Commit

1. **Read back the changes**
   - Verify CLAUDE.md updates are correct
   - Verify MIGRATION_LOG.md entry is complete
   - Check for any formatting issues

2. **Suggest git commit** (optional)
   - Recommend committing the progress update
   - Suggest commit message like:
     - `"Update progress: completed migration of instance.py"`
     - `"Update progress: finished quickstart tutorial"`

## Quick Reference

### For Non-Migration Tasks

Update **only CLAUDE.md**:
1. Update "Last Updated" date
2. Move task from "In Progress" to "Completed"
3. Update other sections as needed

### For Migration Tasks

Update **both CLAUDE.md and MIGRATION_LOG.md**:
1. Update CLAUDE.md (all steps in Step 2)
2. Update MIGRATION_LOG.md (all steps in Step 3)

## Status Symbols Guide

Use these consistently in logs:
- ✅ **Completed** - Successfully finished
- 🚧 **In Progress** - Currently working
- ⚠️ **Issues** - Done but has known issues
- ❌ **Failed** - Could not complete
- 📋 **Planned** - Scheduled for future

## Integration with Other Skills

**After using this skill:**
- Suggest running `session-start` to see updated status
- If more work to do, suggest next priority task
- If migration complete (9/9), celebrate and suggest Phase 2 planning

**Before using this skill:**
- Should have used `migrate-module` or completed other work
- Have clear understanding of what was accomplished

## Example Scenarios

### Scenario 1: Completed File Migration

**User:** "I just finished migrating instance.py"

**Actions:**
1. Ask about refactoring details and any issues
2. Update CLAUDE.md:
   - Last Updated: Today's date
   - Move "Migrate instance.py" to Completed
3. Update MIGRATION_LOG.md:
   - Progress: 1/9 (11%)
   - Add detailed entry with all information
   - Mark instance.py as [x] in checklist
4. Suggest: "Progress updated! 1/9 files migrated. Next priority: Migrate solution.py?"

### Scenario 2: Non-Migration Task

**User:** "I created the quickstart tutorial"

**Actions:**
1. Update CLAUDE.md only:
   - Last Updated: Today's date
   - Move "Create quickstart tutorial" to Completed
   - Add to Next Steps: "Test quickstart tutorial with fresh install"
2. Suggest: "Progress updated! Want to start on the next task?"

### Scenario 3: Blocker Resolved

**User:** "I fixed the circular import issue"

**Actions:**
1. Update CLAUDE.md:
   - Last Updated: Today's date
   - Remove blocker from Blockers section
   - Change to "None currently"
2. Update MIGRATION_LOG.md (if was migration-related):
   - Add resolution to the issue section
   - Add to Common Issues if helpful
3. Suggest: "Blocker cleared! Ready to continue with the migration?"

## Tips for Effective Logging

- **Be specific:** "Extracted battery_capacity parameter" not "made it generic"
- **Include context:** Why decisions were made, not just what was done
- **Note surprises:** Things that were easier/harder than expected
- **Think future:** What would help you 3 months from now?

## Reference

For detailed update patterns and templates, see [update_templates.md](references/update_templates.md).
