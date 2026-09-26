---
name: create-project
description: Create a new project in GTD system. Use this skill when a multi-step outcome needs to be tracked as a project with registration in Metadata > 📁 Projects.
---

# Create Project

This skill defines how to create a project in the GTD system. Projects are multi-step outcomes that require tracking. Each project is created in a Projects list AND registered in `Metadata > 📁 Projects > [Domain] 📁 Projects`.

## When to Create a Project

Create a project when:

- A project tag appears 2+ times in the Mention Log (see `refine-item.md`)
- User explicitly asks to create a new project
- During inbox processing when a multi-step outcome is identified
- Promoting a Someday item to an active project

## Workflow Overview

```
1. Determine domain (Personal/Work)
2. Choose project emoji and name
3. Create project tag (#kebab-case)
4. Create project node in [Domain] > 📁 Projects
5. Register in Metadata > 📁 Projects > [Domain] 📁 Projects
6. Remove from Mention Log if present
```

## Step 1: Determine Domain

Ask the user which domain applies:

| Domain | Project List Path | Registry Path |
|--------|-------------------|---------------|
| **Personal** | `Personal,📁 Projects` | `Metadata,📁 Projects,Personal 📁 Projects` |
| **Work** | `Work,📁 Projects` | `Metadata,📁 Projects,Work 📁 Projects` |

## Step 2: Choose Project Name Format

Projects follow this naming convention:

```
[emoji] Project Name #project-tag
```

**Components:**
- **emoji**: Single emoji representing the project theme
- **Project Name**: Human-readable title (title case)
- **#project-tag**: Kebab-case tag for linking actions to this project

**Examples:**
- `Kitchen Renovation #kitchen-renovation`
- `Quarterly Report #quarterly-report`
- `Birthday party for Alice #birthday-party-alice`

## Step 3: Create Project Node

Create the project in the appropriate Projects list:

### Personal Project

```bash
./bin/run.js create-node --parent-path "Personal,📁 Projects" \
  --name "Kitchen Renovation #kitchen-renovation"
.claude/scripts/record-api-write.sh
```

### Work Project

```bash
./bin/run.js create-node --parent-path "Work,📁 Projects" \
  --name "Quarterly Report #quarterly-report"
.claude/scripts/record-api-write.sh
```

**Capture the created node's ID and short_id** from the command output - you will need these for the registry link.

## Step 4: Register in 📁 Projects

Projects are registered in `Metadata > 📁 Projects` under the appropriate domain folder. Each entry is a **link node** pointing to the actual project, with child metadata.

### Create registry entry (link node)

The entry itself is a link to the project node created in Step 3. Use the short_id from that step:

```bash
# Personal project
./bin/run.js create-node --parent-path "Metadata,📁 Projects,Personal 📁 Projects" \
  --name '<a href="https://workflowy.com/#/SHORT_ID">Kitchen Renovation #kitchen-renovation</a>'

# Work project
./bin/run.js create-node --parent-path "Metadata,📁 Projects,Work 📁 Projects" \
  --name '<a href="https://workflowy.com/#/SHORT_ID">Quarterly Report #quarterly-report</a>'
```

### Add metadata children

After creating the link node, add metadata as children. Use the link text to navigate, and use `--position bottom` to preserve order:

```bash
# Status (required) - values: active, on-hold, completed
./bin/run.js create-node \
  --parent-path "Metadata,📁 Projects,Personal 📁 Projects,Kitchen Renovation #kitchen-renovation" \
  --name "Status: active" --position bottom

.claude/scripts/record-api-write.sh
```

### Optional metadata children

```bash
# Default contexts - context tags for this project's actions
./bin/run.js create-node \
  --parent-path "Metadata,📁 Projects,Personal 📁 Projects,Kitchen Renovation #kitchen-renovation" \
  --name "Default contexts: #home" --position bottom

# Tag - category or type tag
./bin/run.js create-node \
  --parent-path "Metadata,📁 Projects,Personal 📁 Projects,Kitchen Renovation #kitchen-renovation" \
  --name "Tag: renovation" --position bottom

# People - people involved
./bin/run.js create-node \
  --parent-path "Metadata,📁 Projects,Personal 📁 Projects,Kitchen Renovation #kitchen-renovation" \
  --name "People: @Alice, @Bob" --position bottom
```

## Step 5: Remove from Mention Log

If the project was tracked in the Mention Log, remove that entry:

### Find the Mention Log entry

```bash
./bin/run.js read-node --path "Metadata,Mention Log,Projects" --data-source cache --json
```

Look for an entry matching the project name (e.g., `"kitchen renovation" - 2025-01-15, 2025-01-18`).

### Delete the entry

```bash
./bin/run.js delete-node --id <mention-log-entry-id>
.claude/scripts/record-api-write.sh
```

## Complete Example

Creating a new project "Kitchen Renovation" that was mentioned twice in the Mention Log:

```bash
# Step 3: Create project node
./bin/run.js create-node --parent-path "Personal,📁 Projects" \
  --name "Kitchen Renovation #kitchen-renovation"
# Output: Created node with id abc12345-..., short_id 72ea892af993
.claude/scripts/record-api-write.sh

# Step 4: Register in 📁 Projects (link node with metadata)
./bin/run.js create-node --parent-path "Metadata,📁 Projects,Personal 📁 Projects" \
  --name '<a href="https://workflowy.com/#/72ea892af993">Kitchen Renovation #kitchen-renovation</a>'

./bin/run.js create-node \
  --parent-path "Metadata,📁 Projects,Personal 📁 Projects,Kitchen Renovation #kitchen-renovation" \
  --name "Status: active" --position bottom

./bin/run.js create-node \
  --parent-path "Metadata,📁 Projects,Personal 📁 Projects,Kitchen Renovation #kitchen-renovation" \
  --name "Default contexts: #home" --position bottom

.claude/scripts/record-api-write.sh

# Step 5: Remove from Mention Log
./bin/run.js delete-node --id <mention-log-entry-id>
.claude/scripts/record-api-write.sh
```

### Result Structure

**In Projects list:**
```
Personal > 📁 Projects > Kitchen Renovation #kitchen-renovation
```

**In 📁 Projects registry:**
```
Metadata > 📁 Projects > Personal 📁 Projects
  └── Kitchen Renovation #kitchen-renovation (link to project)
      ├── Status: active
      └── Default contexts: #home
```

## Registry Entry Format

Each registry entry is a **link node** (the node itself links to the actual project), with children for metadata:

| Child | Required | Description |
|-------|----------|-------------|
| `Status:` | Yes | `active`, `on-hold`, `completed` |
| `Default contexts:` | No | Common context tags for actions (`#home`, `#computer`) |
| `Tag:` | No | Category or type tag for the project |
| `People:` | No | People involved (`@Alice, @Bob`) |

**Note:** The project name and link are embedded in the entry node itself (e.g., `<a href="...">Kitchen Renovation #kitchen-renovation</a>`), so no separate "Full name" or "Link" children are needed.

## Project Status Values

| Status | When to use |
|--------|-------------|
| `active` | Currently being worked on |
| `on-hold` | Paused, not currently active |
| `completed` | Finished (consider archiving) |

## Integration with Other Skills

### References

- **read-metadata** agent - Discover Projects list and 📁 Projects registry locations
- **tagging.md** - Project tag format and conventions

### Triggered by

- **refine-item.md** - When unknown project has 2+ mentions in Mention Log
- **gtd:inbox** command - During inbox processing
- **gtd:weekly** command - When promoting Someday items to Projects

### Related

- **create-person.md** - Similar pattern for creating people
