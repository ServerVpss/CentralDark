---
name: capture-provenance
description: GTD capture provenance standards. Use this skill when capturing items to ensure proper source attribution, URLs, and metadata.
---

[//]: # (TODO: The folders .claude/skills/gtd and .claude/commands/gtd have a lot of files inside and would benefit from some subdirectories and organization.)

# Capture Provenance

This skill defines how to format captured GTD items with proper source attribution and metadata. All captured items should include provenance information to maintain context about where and when the item was captured.

## Important: Notes vs Children

**The `--note` field is ONLY for verbatim quotes of original source material.** All metadata (source attribution, URLs, dates) must be stored as **nested child nodes** under the main item.

## Required Fields

When capturing any GTD item, collect these fields:

| Field              | Required | Description                                                                                   |
|--------------------|----------|-----------------------------------------------------------------------------------------------|
| **source**         | Yes      | Where the item came from (e.g., "Weekly Review - Chrome tabs", "User input", "iMessage scan") |
| **date**           | Yes      | Capture date using Workflowy's native `<time>` format (see calendar-dates.md skill)           |
| **sourceUrl**      | No       | Link to the original source (URL, message link, etc.)                                         |
| **projectTag**     | No       | If related to a project, include `#project-tag`                                               |
| **peopleMentions** | No       | If related to people, include `@Name` references                                              |

## Node Format

The node name contains the task description with inline tags. Tags are embedded naturally in the text, following the tagging skill conventions. Source attribution goes in **nested child nodes**, not in the notes field.

```markdown
- Talk to @Person about implementing feature F in #project-tag before the next release.
  - Source: Weekly Review - Chrome tabs
  - Added: <time startYear="2025" startMonth="12" startDay="26">Thu, Dec 26, 2025</time>
  - https://example.com/relevant-url
```

**Note:** The `--note` field should be empty unless there is a verbatim quote from the source material.

## Workflowy Native Dates

Always use Workflowy's native `<time>` format for dates in child nodes:

```html
<time startYear="YYYY" startMonth="M" startDay="D">Day, Mon DD, YYYY</time>
```

Example: `<time startYear="2025" startMonth="12" startDay="26">Thu, Dec 26, 2025</time>`

**Important:** Month and day are NOT zero-padded. Use `1` not `01`.

See the `calendar-dates.md` skill for full details on generating these dates.

## Examples

### User Input Capture

When capturing from direct user input via `/gtd:capture`:

**Node structure:**
```markdown
- Call dentist to schedule cleaning
  - Source: User input
  - Added: <time startYear="2025" startMonth="12" startDay="26">Thu, Dec 26, 2025</time>
```

### Chrome Tab Capture

When capturing from an open browser tab:

**Node structure:**
```markdown
- Review FactorioPrints blueprints for main bus #factorio
  - Source: Weekly Review - Chrome tabs
  - Added: <time startYear="2025" startMonth="12" startDay="26">Thu, Dec 26, 2025</time>
  - https://factorioprints.com/
```

### iMessage Capture

When capturing from an iMessage conversation:

**Node structure:**
```markdown
- Reply to @Alice about dinner plans
  - Source: Weekly Review - iMessage scan
  - Added: <time startYear="2025" startMonth="12" startDay="26">Thu, Dec 26, 2025</time>
  - Message from Alice Brown on 2025-12-24
```

### Git Repository Capture

When capturing from uncommitted or unpushed work:

**Node structure:**
```markdown
- Push aggregator-creator changes #aggregator
  - Source: Weekly Review - Git repos
  - Added: <time startYear="2025" startMonth="12" startDay="26">Thu, Dec 26, 2025</time>
  - Repository: ~/projects/aggregator-creator
  - Branch: feature/new-api (3 commits ahead)
```

### Email Capture

When capturing from an email:

**Node structure:**
```markdown
- Reply to @BobSmith about quarterly report #quarterly-review #email
  - Source: Weekly Review - Email scan
  - Added: <time startYear="2025" startMonth="12" startDay="26">Thu, Dec 26, 2025</time>
  - From: bob.smith@company.com
  - Subject: Q4 Review Discussion
  - Original date: 2025-12-23
```

## CLI Usage

When creating nodes with provenance, create the parent node first, then add children for metadata:

```bash
# Step 1: Create the main task node (no --note flag for metadata!)
./bin/run.js create-node \
  --parent-path "Personal,📥 Inbox" \
  --name "Review FactorioPrints blueprints #factorio"
.claude/scripts/record-api-write.sh

# Step 2: Add source child (use --position bottom to preserve order)
./bin/run.js create-node \
  --parent-path "Personal,📥 Inbox,Review FactorioPrints blueprints #factorio" \
  --name "Source: Weekly Review - Chrome tabs" \
  --position bottom
.claude/scripts/record-api-write.sh

# Step 3: Add date child (using Workflowy native date format)
./bin/run.js create-node \
  --parent-path "Personal,📥 Inbox,Review FactorioPrints blueprints #factorio" \
  --name 'Added: <time startYear="2025" startMonth="12" startDay="26">Thu, Dec 26, 2025</time>' \
  --position bottom
.claude/scripts/record-api-write.sh

# Step 4: Add URL child (if applicable)
./bin/run.js create-node \
  --parent-path "Personal,📥 Inbox,Review FactorioPrints blueprints #factorio" \
  --name "https://factorioprints.com/" \
  --position bottom
.claude/scripts/record-api-write.sh
```

**Shell quoting:** Use single quotes around node names containing `<time>` elements to preserve the HTML.

## Source Types

Standard source prefixes for consistency:

| Source | Description |
|--------|-------------|
| `User input` | Direct capture via `/gtd:capture` command |
| `Weekly Review - Chrome tabs` | Captured from open browser tabs during weekly review |
| `Weekly Review - iMessage scan` | Captured from iMessage conversations |
| `Weekly Review - Git repos` | Captured from unpushed git work |
| `Weekly Review - Email scan` | Captured from email inbox |
| `Daily Review` | Captured during daily review |
| `Bulk capture - Chrome tabs` | Captured via `/gtd:bulk-capture` command |
| `Bulk capture - Git repos` | Captured via `/gtd:bulk-capture` command |
| `Bulk capture - iMessage` | Captured via `/gtd:bulk-capture` command |

## Integration with Other Skills

### Used by commands

- **gtd:capture** - Quick capture with minimal provenance (source: User input)
- **gtd:bulk-capture** - Batch capture with full provenance
- **gtd:weekly** - Weekly review capture (delegates to bulk-capture)
- **gtd:daily** - Optional daily capture

### References

- **tagging.md** - Tag format conventions (`@Person`, `#project-tag`)
- **read-metadata** agent - Discover inbox locations
- **session-memory-writer** agent - Track capture activity in Session Memory

## Deduplication

To avoid re-capturing the same item:

- Track declined/skipped items in Session Memory under `bulk-capture` entries
- For Chrome tabs, ask user to close tab after capturing
- Time-bound external scans to past 7 days
- Check Session Memory for already-processed items before offering to capture
