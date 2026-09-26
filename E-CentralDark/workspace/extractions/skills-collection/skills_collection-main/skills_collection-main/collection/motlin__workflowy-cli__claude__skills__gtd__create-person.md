---
name: create-person
description: Create a new person entry in GTD People list. Use this skill when an unknown person needs to be tracked for agenda items and relationship context.
---

# Create Person

This skill defines how to create a person entry in the GTD People list. People entries enable tracking agenda items (things to discuss with this person) and relationship context.

## When to Create a Person

Create a person entry when:

- A name appears 2+ times in the Mention Log (see `refine-item.md`)
- User explicitly asks to track a new person
- During inbox processing when a person mention needs to be formalized

## Workflow Overview

```
1. Determine category (Work/Family/Friends)
2. Determine name format (first name vs CamelCase)
3. Create node in Metadata > People > [Category]
4. Optionally add context as child nodes
5. Remove from Mention Log if present
```

## Step 1: Determine Category

Ask the user which category applies:

| Category | Emoji | Path | When to use |
|----------|-------|------|-------------|
| **Work** | 👔 | `Metadata,People,👔 Work` | Colleagues, clients, vendors |
| **Family** | 👨‍👩‍👧‍👦 | `Metadata,People,👨‍👩‍👧‍👦 Family` | Family members, relatives |
| **Friends** | 🤝 | `Metadata,People,🤝 Friends` | Friends, acquaintances |

## Step 2: Determine Name Format

The name format depends on the category:

| Category | Format | Background Color | Example |
|----------|--------|------------------|---------|
| **Family** | First name only | `bc-green` | `@Victoria` |
| **Work** | CamelCase full name | `bc-blue` | `@AliceBrown` |
| **Friends** | CamelCase full name | `bc-purple` | `@CharlieDavis` |

**For duplicate first names:** Use CamelCase to disambiguate even in Family (e.g., `@DeepakAmin`, `@DeepakManohar`)

## Step 3: Create Person Node

Create the person node with colored formatting:

### Work (blue background, CamelCase)

```bash
./bin/run.js create-node --parent-path "Metadata,People,👔 Work" \
  --name '<span class="colored bc-blue">@AliceBrown</span>'
```

### Family (green background, first name)

```bash
./bin/run.js create-node --parent-path "Metadata,People,👨‍👩‍👧‍👦 Family" \
  --name '<span class="colored bc-green">@Bob</span>'
```

### Friends (purple background, CamelCase)

```bash
./bin/run.js create-node --parent-path "Metadata,People,🤝 Friends" \
  --name '<span class="colored bc-purple">@CharlieDavis</span>'
```

After creating the node, record the API write:

```bash
.claude/scripts/record-api-write.sh
```

## Step 4: Add Context (Optional)

Add child nodes with additional context about the person (use `--position bottom` to preserve order):

```bash
./bin/run.js create-node --parent-path "Metadata,People,👔 Work,@AliceBrown" \
  --name "Full name: Alice Brown" --position bottom
./bin/run.js create-node --parent-path "Metadata,People,👔 Work,@AliceBrown" \
  --name "Role: Product Manager" --position bottom
./bin/run.js create-node --parent-path "Metadata,People,👔 Work,@AliceBrown" \
  --name "Company: Acme Corp" --position bottom
```

Common context fields:

| Field | Example |
|-------|---------|
| `Full name:` | Full name: Alice Brown |
| `Role:` | Role: Product Manager |
| `Company:` | Company: Acme Corp |
| `Relation:` | Relation: cousin |
| `Met:` | Met: 2024-06 at conference |
| `Notes:` | Notes: Prefers morning calls |

## Step 5: Remove from Mention Log

If the person was tracked in the Mention Log, remove that entry:

### Find the Mention Log entry

```bash
./bin/run.js read-node --path "Metadata,Mention Log,People" --data-source cache --json
```

Look for an entry matching the person's name (e.g., `"Alice" - 2025-01-15, 2025-01-18`).

### Delete the entry

```bash
./bin/run.js delete-node --id <mention-log-entry-id>
.claude/scripts/record-api-write.sh
```

## Complete Example

Creating a new work colleague "Alice Brown" who was mentioned twice in the Mention Log:

```bash
# Step 3: Create person node
./bin/run.js create-node --parent-path "Metadata,People,👔 Work" \
  --name '<span class="colored bc-blue">@AliceBrown</span>'
.claude/scripts/record-api-write.sh

# Step 4: Add context (optional, use --position bottom to preserve order)
./bin/run.js create-node --parent-path "Metadata,People,👔 Work,@AliceBrown" \
  --name "Full name: Alice Brown" --position bottom
./bin/run.js create-node --parent-path "Metadata,People,👔 Work,@AliceBrown" \
  --name "Role: Product Manager" --position bottom
.claude/scripts/record-api-write.sh

# Step 5: Remove from Mention Log
# First find the entry ID from read-node output, then:
./bin/run.js delete-node --id <mention-log-entry-id>
.claude/scripts/record-api-write.sh
```

### Result Structure

```
Metadata > People > 👔 Work > @AliceBrown (blue background)
  - Full name: Alice Brown
  - Role: Product Manager
```

## Integration with Other Skills

### References

- **read-metadata** agent - Discover People list location and structure
- **tagging.md** - Name format and color conventions

### Triggered by

- **refine-item.md** - When unknown person has 2+ mentions in Mention Log
- **gtd:inbox** command - During inbox processing

### Related

- **create-project.md** - Similar pattern for creating projects
