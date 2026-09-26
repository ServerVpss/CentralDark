---
name: refine-item
description: Refine GTD inbox items before moving to Next Actions. Use this skill when processing inbox items to detect people, projects, and add context tags.
---

# Refine Inbox Item

This skill defines how to refine an inbox item before moving it to a GTD list. Refinement adds context, links to people/projects, and ensures actionability.

## Refinement Steps

When processing an inbox item, follow these steps in order:

### Step 1: Detect Existing Tags

Scan the item text for existing tags:

**Project tags** (`#project-name`):
- Look for hashtags like `#kitchen-renovation`, `#quarterly-report`
- Match against 📁 Projects: `./bin/run.js read-node --path "Metadata,📁 Projects" --follow-links --data-source cache`
- If tag matches a registered project, link is already established

**People mentions** (`@Name`):
- Look for at-mentions like `@Alice`, `@BobSmith`
- Match against People list: `./bin/run.js read-node --path "Metadata,People" --depth 2 --data-source cache`
- Check all groups: Work, Family, Friends

### Step 2: Check Mention Log for Unknowns

If a project tag or person mention is NOT found in the registries:

```bash
./bin/run.js read-node --path "Metadata,Mention Log" --depth 2 --data-source cache
```

The Mention Log tracks unregistered mentions:
```
Mention Log/
  People/
    "Alice" - 2025-01-15, 2025-01-18
    "Bob Smith" - 2025-01-20
  Projects/
    "kitchen timeline" - 2025-01-15, 2025-01-17, 2025-01-20
```

**Decision logic:**
- If mention has 2+ entries in Mention Log: suggest creating the person/project
- If mention is new: add to Mention Log with today's date
- See `create-person.md` and `create-project.md` skills for creation workflows

### Step 3: Add Context Tags

Every actionable item should have at least one context tag to enable filtering.

**Location tags** (where can this be done?):
| Tag | When to use |
|-----|-------------|
| `#home` | Must be at home |
| `#work` | Must be at workplace |
| `#errands` | While out running errands |
| `#anywhere` | No location constraint |

**Mode tags** (how is it done?):
| Tag | When to use |
|-----|-------------|
| `#call` | Make a phone call |
| `#email` | Send an email |
| `#computer` | Requires computer/device |
| `#read` | Reading or review material |
| `#buy` | Purchase something |

**Combined examples:**
- "Call dentist" -> `#call dentist to schedule cleaning #home`
- "Email report to team" -> `#email quarterly report to team #work #computer`
- "Get new drill" -> `#buy new drill for project #errands`

### Step 4: Apply the Two-Minute Rule

Before moving to Next Actions, assess:

> "Can this be done in less than 2 minutes?"

**If yes:** Suggest doing it now rather than tracking it.
- "This looks like a quick task. Would you like to do it now rather than add it to your list?"

**If no:** Proceed with moving to the appropriate list.

### Step 5: Determine Destination

Based on the refined item, route to the appropriate list:

| Item Type | Destination | Example |
|-----------|-------------|---------|
| Next physical action | `☑️ Next Actions` | "#call dentist #home" |
| Waiting for someone | `📤 Waiting For` | "Waiting for @Bob to send report" |
| Scheduled for date | `📅 Calendar` | Meeting, appointment, deadline |
| Someday/maybe | `🌱 Someday` | "Learn Spanish" |
| Reference material | `📚 Reference` | Article to file |
| Multi-step outcome | Create project | See `create-project.md` |

## Refinement Examples

### Example 1: Simple Task with Unknown Person

**Input:** `Ask Alice about dinner`

**Refinement process:**
1. Detect `Alice` (no @-prefix, but appears to be a person)
2. Check People list - not found
3. Check Mention Log > People - found "Alice" mentioned once on 2025-01-15
4. Add today's date to Mention Log entry: "Alice - 2025-01-15, 2025-01-20"
5. Ask user for context: "Is @Alice a colleague, family member, or friend?"
6. Add context tags: `#call @Alice about dinner plans #home`
7. Suggest: "This looks quick - do it now or add to Next Actions?"

### Example 2: Project-Related Task

**Input:** `Order supplies for kitchen #kitchen-renovation`

**Refinement process:**
1. Detect `#kitchen-renovation` project tag
2. Check 📁 Projects registry - found, active project
3. Add context tags: `#buy supplies for kitchen #kitchen-renovation #errands`
4. Destination: Next Actions (Personal)

### Example 3: Unknown Project with Multiple Mentions

**Input:** `Review proposal for Acme deal`

**Refinement process:**
1. No explicit tags detected, but "Acme deal" sounds like a project
2. Check 📁 Projects registry - not found
3. Check Mention Log > Projects - found "Acme deal" with 3 entries
4. Suggest: "I see 'Acme deal' has been mentioned 3 times. Would you like to create a project for it?"
5. If yes, use `create-project.md` workflow
6. Add context tags: `Review proposal for #acme-deal #work #computer`

### Example 4: Quick Email Task

**Input:** `Email @BobSmith the meeting notes`

**Refinement process:**
1. Detect `@BobSmith` - check People list - found in Work
2. Already has email mode implied
3. Add context tags: `#email @BobSmith the meeting notes #work`
4. Assess: Email takes ~1 minute
5. Suggest: "This looks like a 2-minute task. Would you like to send this email now?"

## CLI Commands for Refinement

### Check if person exists
```bash
./bin/run.js search --query "@AliceBrown" --data-source cache
```

### Check if project exists
```bash
./bin/run.js read-node --path "Metadata,📁 Projects" --follow-links --data-source cache | grep "#project-tag"
```

### Read Mention Log
```bash
./bin/run.js read-node --path "Metadata,Mention Log" --depth 2 --data-source cache
```

### Add to Mention Log
```bash
# For a person (use --position bottom to preserve chronological order)
./bin/run.js create-node --parent-path "Metadata,Mention Log,People" --name "\"Alice\" - 2025-01-20" --position bottom

# For a project
./bin/run.js create-node --parent-path "Metadata,Mention Log,Projects" --name "\"kitchen timeline\" - 2025-01-20" --position bottom
```

### Update existing Mention Log entry
```bash
./bin/run.js update-node --id <entry-id> --name "\"Alice\" - 2025-01-15, 2025-01-18, 2025-01-20"
```

### Update item with tags
```bash
./bin/run.js update-node --id <item-id> --name "#call @Alice about dinner plans #home"
```

### Move to destination
```bash
./bin/run.js move-node --node-id <item-id> --target-path "Personal,☑️ Next (Personal)"
```

## Integration with Other Skills

### References
- **capture-provenance.md** - Source attribution format (preserved during refinement)
- **tagging.md** - Tag format conventions (@Name, #project-tag, colors)
- **read-metadata** agent - Discover People list, 📁 Projects, Mention Log

### May trigger
- **create-person.md** - When unknown person has 2+ mentions
- **create-project.md** - When unknown project has 2+ mentions

### Used by
- **gtd:inbox** command - Main consumer of this skill during inbox processing
