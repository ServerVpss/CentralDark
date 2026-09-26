---
name: centraldark-pendencias
description: Manage the CentralDark pendências file
category: centraldark
trigger: "docs/PENDENCIAS.md"
---

## CENTRALDARK PENDÊNCIAS MANAGEMENT

**Purpose** – Provide declarative, repeatable steps for adding, updating, or
closing items in the `docs/PENDENCIAS.md` file while preserving audit
trail, respecting the repository’s commit format, and ensuring that the
change is correctly committed and pushed.

### TRIGGER
When the user edits `docs/PENDENCIAS.md`, this skill is invoked to
commit the modification with a message like:
`docs: update pendências <number>`.

### USAGE
1. Edit `docs/PENDENCIAS.md` locally.
2. Run the sub‑command `centraldark-pendencias patch` (or a more specific
   sub‑command such as `add`, `close`, or `reopen`).
3. The skill performs a `git add docs/PENDENCIAS.md`, creates a commit with
   the template message, and pushes to the `main` branch.

### PREFERENCES
- The skill respects the user’s *execute‑first, explain‑later* style.  It
  performs the action without verbalising the plan.
- It excludes verbose diffs or summaries unless a user explicitly asks for
  them.
- The commit message format is kept simple and consistent for traceability.

### FUTURE EXTENSIONS
- Add optional sub‑commands for templating new pendências.
- Incorporate automated status updates in the bullet list.
