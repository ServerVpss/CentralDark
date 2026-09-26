---
name: cli-executor
description: Execute CLI commands and skills from Desktop including outlook-extractor, git operations, and filesystem automation
---

# CLI Executor

Bridge Desktop to CLI capabilities using the claude-cli-executor MCP server powered by Claude Agent SDK.

## What This Skill Does

Enables Claude Desktop to access **all Claude CLI capabilities**:
- ✅ **Outlook operations** (emails, calendar, contacts, send, meetings)
- ✅ **Git operations** (commit, push, pull, branch management)
- ✅ **Filesystem operations** (direct file manipulation, faster than MCP)
- ✅ **Bash commands** (grep, find, sed, complex scripts)
- ✅ **CLI skills** (outlook-extractor, extract-epiroc-bev-report, etc.)

## When to Use

Trigger this skill when user asks to:
- Extract or send Outlook emails
- Create or delete calendar meetings
- Run git operations
- Execute bash/terminal commands
- Run any CLI skill by name

**Example triggers:**
- "Extract my emails from the past week"
- "Send an email to Sipho about the BEV project"
- "Create a meeting for tomorrow at 2pm"
- "Commit these changes to git"
- "Use outlook-extractor to find emails about fire safety"

## How It Works

Uses the `claude-cli-executor` MCP tool: `run_cli_session`

**Flow:**
```
Desktop → MCP Tool → Claude Agent SDK → CLI Session → Windows/Outlook → Result
```

**Authentication:** Uses your Claude subscription via `claude login` (no API credits)

## Common Operations

### Outlook: Extract Emails

**User says:** "Extract emails from the past week"

**Action:**
```
run_cli_session({
  "prompt": "Run the outlook extractor: python .claude/skills/outlook-extractor/scripts/outlook_extractor.py emails --days 7 --limit 50"
})
```

### Outlook: Extract from Specific Folder

**User says:** "Show me emails from my Production folder"

**Action:**
```
run_cli_session({
  "prompt": "Run outlook extractor with folder search: python .claude/skills/outlook-extractor/scripts/outlook_extractor.py emails --folder-search 'Production' --days 14"
})
```

### Outlook: Send Email

**User says:** "Send an email to Sipho about the N3 production meeting"

**Important:** Always draft first, get approval, then send!

**Action:**
```
run_cli_session({
  "prompt": "Run outlook extractor to send email: python .claude/skills/outlook-extractor/scripts/outlook_extractor.py send-email --to sipho.dubazane@assmang.co.za --subject 'N3 Production Meeting' --body '[draft message]'"
})
```

### Outlook: Create Meeting

**User says:** "Create a meeting tomorrow at 2pm with Xavier about BEV fire safety"

**Action:**
```
run_cli_session({
  "prompt": "Run outlook extractor to create meeting: python .claude/skills/outlook-extractor/scripts/outlook_extractor.py create-meeting --subject 'BEV Fire Safety Review' --start '2025-12-01 14:00' --attendees 'xavier.petersen@assmang.co.za' --location 'Conference Room'"
})
```

**Remember:** Times are in SAST (UTC+2)

### Outlook: List Calendar

**User says:** "What meetings do I have this week?"

**Action:**
```
run_cli_session({
  "prompt": "Run outlook extractor calendar: python .claude/skills/outlook-extractor/scripts/outlook_extractor.py calendar --days 7"
})
```

### Git: Commit Changes

**User says:** "Commit my vault changes with message 'Updated BEV notes'"

**Action:**
```
run_cli_session({
  "prompt": "Commit all changes with message: git add . && git commit -m 'Updated BEV notes'"
})
```

### File Operations

**User says:** "List all markdown files in the tasks directory"

**Action:**
```
run_cli_session({
  "prompt": "List markdown files in tasks/"
})
```

## Outlook-Extractor Script Location

**Script path:** `.claude/skills/outlook-extractor/scripts/outlook_extractor.py`

**Available commands:**
- `emails --days N --limit N` - Extract recent emails
- `emails --folder-search "Name"` - Search in specific folder
- `calendar --days N` - List calendar events
- `contacts` - List contacts
- `search-contact "Name"` - Find specific contact
- `send-email --to EMAIL --subject TEXT --body TEXT` - Send email
- `create-meeting --subject TEXT --start DATETIME --attendees EMAIL` - Create meeting
- `delete-meeting --subject TEXT --start DATETIME` - Delete meeting

**Full documentation:** `.claude/skills/outlook-extractor/SKILL.md`

## Email Style Guide

When composing emails, follow Greg's style:

- **Greeting:** "Hi [Name]" (colleagues) or "Good morning" (formal)
- **Structure:** Short paragraphs (1-3 sentences), blank lines between
- **Tone:** Direct, professional, action-oriented
- **Closing:** Always "Regards" + "Greg"
- **@ Mentions:** Use for specific actions: "@Xavier please review"

**Always draft emails for user approval before sending!**

## Common Contacts

Quick reference for email addresses:

| Name | Email | Role |
|------|-------|------|
| Rudi Opperman | Rudi.Opperman@assmang.co.za | Operations Manager |
| Jacques Breet | Jacques.Breet@assmang.co.za | Engineering Manager |
| Sipho Dubazane | Sipho.Dubazane@assmang.co.za | Engineer - Gloria |
| Sikelela Nzuza | Sikelela.Nzuza@assmang.co.za | Engineer - N2 |
| Sello Sease | Sello.Sease@assmang.co.za | Engineer - N3 |
| Xavier Petersen | Xavier.Petersen@assmang.co.za | Engineer - S&W |

## Technical Notes

### MCP Server: claude-cli-executor

**Location:** `C:\Users\10064957\.claude\mcp-servers\claude-cli-executor\server.py`

**Tool:** `run_cli_session(prompt, context_files?)`

**Technology:** Claude Agent SDK (uses your Claude subscription via `claude login`)

**Working Directory:** `C:\Users\10064957\My Drive\GDVault\MarthaVault`

**Logs:** `~/.claude/mcp-servers/claude-cli-executor/server.log`

### Authentication

No API key needed! Uses Claude Code authentication:
```bash
claude login  # One-time setup
```

This uses your Claude subscription (Pro/Max/Team/Enterprise).

## Approval Workflow

**Operations requiring approval:**
- ✅ Sending emails (ALWAYS draft first)
- ✅ Creating meetings (confirm details)
- ✅ Deleting content (verify before execution)
- ✅ Git push operations (review changes)
- ✅ Python script execution (security)

**Auto-approved operations:**
- ✅ Reading emails/calendar
- ✅ Searching contacts
- ✅ Listing files
- ✅ Extracting data

The CLI will ask for approval when needed. You'll see exactly what it wants to do before execution.

## Error Handling

**If MCP tool fails:**
1. Check if Claude CLI is installed: `claude --version`
2. Check if logged in: `claude login`
3. Check server logs: `~/.claude/mcp-servers/claude-cli-executor/server.log`
4. Verify Outlook is running (for outlook-extractor)

**If Outlook operations fail:**
- Ensure Outlook is open and running
- Verify pywin32 installed: `pip install pywin32 --upgrade`
- Check timezone (use SAST times: UTC+2)
- Verify script path: `.claude/skills/outlook-extractor/scripts/outlook_extractor.py`

## Response Format

The MCP returns conversation transcripts showing:
- What CLI did step-by-step
- Any approvals needed
- Files modified
- Commands executed
- Final results

Extract the key information from the response and present it clearly to the user.

## Examples in Action

### Example 1: Email Extraction

**User:** "Extract my emails from this week"

**Claude calls:**
```javascript
run_cli_session({
  prompt: "Run outlook extractor: python .claude/skills/outlook-extractor/scripts/outlook_extractor.py emails --days 7 --limit 50"
})
```

**CLI response includes:**
- List of emails with subjects, senders, dates
- Any approval requests (for Python execution)
- Status of execution

**Claude presents:** Clean summary of important emails to user

### Example 2: Meeting Creation

**User:** "Schedule BEV review Monday 2pm with the team"

**Claude:**
1. Identifies attendees from context
2. Calls MCP with create-meeting command
3. Shows user the meeting details for approval
4. After approval, confirms creation

### Example 3: Git Commit

**User:** "Commit my changes with message 'Updated fire safety docs'"

**Claude calls:**
```javascript
run_cli_session({
  prompt: "git add . && git commit -m 'Updated fire safety docs'"
})
```

**CLI may require approval** for git operations, then executes and confirms.

## Status

✅ **Production Ready**
- MCP server: Tested and working
- Outlook extraction: Functional (requires approval)
- Git operations: Functional (requires approval)
- File operations: Functional

## Important Reminders

1. **Always use the full script path:** `.claude/skills/outlook-extractor/scripts/outlook_extractor.py`
2. **CLI skills are NOT auto-detected** - must run Python scripts directly
3. **Approval is required** for Python execution and sensitive operations
4. **Extract meaningful information** from CLI responses - don't just show raw output
5. **Draft emails first** - never send without user approval
6. **Times in SAST** - UTC+2 for South Africa

---

**This bridge gives you the full power of Claude CLI from Desktop!**
