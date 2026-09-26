# PADRAO - action-item-patterns.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\atlassian-rovo\skills\capture-tasks-from-meeting-notes\references\action-item-patterns.md
**SHA:** b630fd46b06d3488
**Timestamp:** 2026-08-26T18:30:47.607515
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- **@Mention pattern:**

### Gaps
- **Format:** `TODO: [task] (Name)` or `TODO: [task] - Name`
- TODO: Update documentation (John)
- TODO: Create report - Sarah
- - TODO:
- ✅ TODO: Deploy (Lisa)
- TODO:\s*(.+)\s*\((\w+)\)

### Ouro Bruto (primeiros 5000 chars)
```
# Action Item Patterns Reference

Common patterns found in meeting notes and how to parse them.

---

## Pattern Categories

### Category 1: @Mentions (Highest Confidence)

**Format:** `@Name [action verb] [task]`

**Examples:**
```
@john to update documentation
@sarah will create the report  
@mike should review PR #123
@lisa needs to test the feature
```

**Parsing:**
- Assignee: Text immediately after @
- Task: Everything after action verb (to/will/should/needs to)
- Confidence: Very High (explicit assignment)

---

### Category 2: Name + Action Verb (High Confidence)

**Format:** `Name [action verb] [task]`

**Examples:**
```
John to update documentation
Sarah will create the report
Mike should review PR #123
Lisa needs to test the feature
```

**Parsing:**
- Assignee: First word(s) before action verb
- Task: Everything after action verb
- Confidence: High (clear structure)

**Action verbs to detect:**
- to, will, should, needs to, must, has to, is to, going to

---

### Category 3: Structured Action Format (High Confidence)

**Format:** `Action: Name - [task]` or `AI: Name - [task]`

**Examples:**
```
Action: John - update documentation
Action Item: Sarah - create the report
AI: Mike - review PR #123
Task: Lisa - test the feature
```

**Parsing:**
- Assignee: Between "Action:" and "-"
- Task: After "-"
- Confidence: High (structured format)

**Variants:**
- Action:
- Action Item:
- AI:
- Task:
- Assigned:

---

### Category 4: TODO Format (Medium Confidence)

**Format:** `TODO: [task] (Name)` or `TODO: [task] - Name`

**Examples:**
```
TODO: Update documentation (John)
TODO: Create report - Sarah
[ ] Review PR #123 (Mike)
- [ ] Test feature - Lisa
```

**Parsing:**
- Assignee: In parentheses or after "-"
- Task: Between TODO and assignee
- Confidence: Medium (format varies)

**Markers to detect:**
- TODO:
- [ ]
- - [ ]
- To-do:
- Action item:

---

### Category 5: Colon or Dash Format (Medium Confidence)

**Format:** `Name: [task]` or `Name - [task]`

**Examples:**
```
John: update documentation
Sarah - create the report
Mike: review PR #123
Lisa - test the feature
```

**Parsing:**
- Assignee: Before ":" or "-"
- Task: After ":" or "-"
- Confidence: Medium (could be other uses of colons/dashes)

**Detection:**
- Look for name-like word before ":" or "-"
- Followed by action verb or imperative
- Usually in bulleted lists

---

## Complex Patterns

### Multiple Assignees

**Format:** `Name1 and Name2 to [task]`

**Examples:**
```
John and Sarah to update documentation
Mike, Lisa to review PR
```

**Handling:**
- Create separate tasks for each person
- OR create one task, ask user who should be assigned
- Include both names in description

---

### Conditional Actions

**Format:** `Name to [task] if [condition]`

**Examples:**
```
John to update docs if approved
Sarah will create report pending review
```

**Handling:**
- Include condition in task description
- Note that it's conditional
- User can adjust later

---

### Time-Bound Actions

**Format:** `Name to [task] by [date]`

**Examples:**
```
John to update docs by EOD
Sarah will finish report by Friday
Mike to review before next meeting
```

**Handling:**
- Extract deadline and add to task description
- Could use due date field if available
- Include urgency in task

---

## Anti-Patterns (Not Action Items)

### Discussion Notes

**Not an action item:**
```
John mentioned the documentation needs updating
Sarah suggested we create a report
Mike talked about reviewing the code
```

**Why:** These are discussions, not assignments

---

### General Statements

**Not an action item:**
```
Documentation needs to be updated
Someone should create a report
The code requires review
```

**Why:** No specific assignee

---

### Past Actions

**Not an action item:**
```
John updated the documentation
Sarah created the report
Mike reviewed the code
```

**Why:** Already completed (past tense)

---

## Context Extraction

### Meeting Metadata

**Look for:**
```
# [Meeting Title] - [Date]
Meeting: [Title]
Date: [Date]
Subject: [Title]
```

**Extract:**
- Meeting title
- Date
- Attendees (if listed)

---

### Related Information

**Look for:**
```
Related to: [project/epic/initiative]
Context: [background info]
Decision: [relevant decision]
```

**Include in task:**
- Links to related work
- Background context
- Relevant decisions

---

## Name Extraction Tips

### Full Names

**Preferred:**
```
@Sarah Johnson to create report
Sarah Johnson will create report
```

**Extract:** "Sarah Johnson"

---

### First Name Only

**Common:**
```
@Sarah to create report
Sarah will create report
```

**Extract:** "Sarah" (will need to lookup)

---

### Nicknames or Short Forms

**Handle carefully:**
```
@SJ to create report
Sara (no h) will create report
```

**Strategy:** Ask user or try multiple lookups

---

## Priority Indicators

### Urgent/High Priority

**Detect:**
```
URGENT: John to update docs
HIGH PRIORITY: Sarah to create report
ASAP: Mike to review code
```

**Hand
```