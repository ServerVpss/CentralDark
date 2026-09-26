# PR Review Methodology Integration — Kanban + `claude-git-pr-skill`

> **Source:** `github.com/aidankinzett/claude-git-pr-skill` (v1.1.1)
> **Integration:** Kanban Board (Hermes Studio) ↔ PR Review Workflow
> **Session:** 2026-08-02 | **Profile:** pivete

---

## Core Principle

**Kanban columns mirror PR review stages.** Every PR maps to a card; column transitions = review events.

---

## State Mapping

| Kanban Column | PR Review Stage | `gh` Action | `claude-git-pr-skill` Rule |
|---|---|---|---|
| **Triage** | New PR opened | `gh pr view` → classify | Auto-classify: feat/fix/docs/refactor |
| **To Do** | Ready for review | Assign reviewer | Reviewer = code owner or designated |
| **Ready** | Reviewer assigned | `gh pr review --pending` | Start pending review |
| **Running** | Review in progress | Batch comments via `--pending` | **Never post immediately** |
| **Review** | Pending review submitted | Wait for author | Author sees batched comments |
| **Blocked** | `REQUEST_CHANGES` | Author must address | Card stays until fixes pushed |
| **Done** | `APPROVE` / merged | `gh pr merge --squash` | Auto-merge when green |
| **Archived** | Closed/merged | Archive for history | Keep for audit trail |

---

## `claude-git-pr-skill` Key Patterns

### 1. Pending Reviews (Mandatory)
```bash
# Always use pending review — batch all comments
gh pr review <PR> --pending --body "## Summary\n...\n\n## Comments\n..."
```

### 2. Code Suggestions Format
````markdown
```suggestion
// Better implementation
const result = await fetchData();
```
````

### 3. Event Type Selection
| Situation | Event Type |
|---|---|
| Minor nits, optional improvements | `COMMENT` |
| All checks pass, ready to merge | `APPROVE` |
| Logic bugs, security issues, breaking changes | `REQUEST_CHANGES` |

### 4. User Approval Gate
```python
# Before posting review
await user_confirm("Post this pending review?")
# Only proceed on explicit "sim"
```

### 5. gh API Syntax (Critical)
```bash
# Correct: single quotes around comments[][] params
gh api repos/{owner}/{repo}/pulls/{number}/reviews \
  -X POST \
  -f event=REQUEST_CHANGES \
  -f 'comments[0][path]=src/auth.py' \
  -f 'comments[0][line]=42' \
  -f 'comments[0][body]=Use constant-time comparison'
```

---

## Kanban Task Template for PR Review

When creating a task via `#94` ("+ New Task"):

| Field | Value |
|---|---|
| **Title** | `PR #123: feat: add JWT auth` |
| **Description** | Link to PR + summary of changes |
| **Assignee** | Code reviewer |
| **Priority** | High (security) / Medium (feature) / Low (docs) |
| **Skills** | `github-pr-review`, `github-pr-workflow` |
| **Create in Triage** | ✅ Checked |
| **Goal Mode** | ✅ Checked |
| **Max Runtime** | `2h` |
| **Max Retries** | `3` |

---

## Verification Checklist (Post-Transition)

| Transition | Verify |
|---|---|
| Triage → To Do | PR classified, reviewer assigned |
| To Do → Ready | Reviewer accepted, pending review started |
| Ready → Running | First batch of comments posted (pending) |
| Running → Review | All comments batched, review submitted |
| Review → Blocked | `REQUEST_CHANGES` posted, author notified |
| Review → Done | `APPROVE` posted, CI green |
| Done → Archived | PR merged, branch deleted |

---

## Anti-Patterns (from `claude-git-pr-skill`)

| Anti-Pattern | Correct |
|---|---|
| Post comments immediately under time pressure | Always use `--pending` |
| Skip pending reviews | Never — batch always |
| Use incorrect `gh api` syntax | Single quotes around `comments[][]` |
| Choose wrong event type | Follow table above |
| Post comments user didn't approve | Explicit yes/no gate |

---

## Session Metadata
- **Created:** 2026-08-02
- **Profile:** pivete
- **Hermes Studio:** v0.6.36
- **Chrome PID:** 10044
- **Window ID:** 985268
- **Mission:** CENTRALDARK-CASA-BACKUP-ORGANIZACAO-SYNC-01 (Turno 10)
- **Related Reference:** `references/kanban-som-map.md`