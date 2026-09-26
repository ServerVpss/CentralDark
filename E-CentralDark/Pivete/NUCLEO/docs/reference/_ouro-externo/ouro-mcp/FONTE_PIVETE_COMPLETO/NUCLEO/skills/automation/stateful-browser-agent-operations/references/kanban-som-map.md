# Kanban Board SOM Map — Hermes Studio v0.6.36

> **Session:** 2026-08-02 | **Profile:** pivete | **URL:** `http://localhost:8648/#/hermes/kanban`
> **Tool:** `computer_use` SOM mode | **Chrome PID:** 10044 | **Window:** 985268

---

## Sidebar Navigation
| Element | SOM Index | Label |
|---|---|---|
| Kanban Link | `#43` | "Kanban" |

---

## Board Header
| Element | SOM Index | Label |
|---|---|---|
| Board Title | `#86` | "Kanban Board: Default · Tasks: N" |
| "+ New Task" Button | `#94` | "New Task" |
| "Adicionar" Button | `#87` | "Adicionar" |
| "Dispatch" Button | `#89` | "Dispatch" |
| Filter: All Statuses | `#91` | "All Statuses" |
| Filter: All Assignees | `#93` | "All Assignees" |

---

## Counters Row
| Element | SOM Index | Label |
|---|---|---|
| Total | `#95` | "N Total" |
| Triage | `#96` | "N Triage" |
| To Do | `#97` | "N To Do" |
| Scheduled | `#98` | "N Scheduled" |
| Ready | `#99` | "N Ready" |
| Running | `#100` | "N Running" |
| Blocked | `#101` | "N Blocked" |
| Review | `#102` | "N Review" |
| Done | `#103` | "N Done" |
| Archived | `#104` | "N Archived" |

---

## Columns (Header → Counter → Drop Zone)
| Column | Header | Counter | Drop Zone |
|---|---|---|---|
| Triage | `#108` | `#109` | `#110` |
| To Do | `#112` | `#113` | `#114` |
| Scheduled | `#116` | `#117` | `#118` |
| Ready | `#120` | `#121` | `#122` |
| Running | `#124` | `#125` | `#126` |
| Blocked | `#128` | `#129` | `#130` |
| Review | `#132` | `#133` | `#134` |
| Done | `#136` | `#137` | `#138` |
| Archived | `#140` | `#141` | `#142` |

---

## Task Creation Flow (Modal)
After clicking `#94` ("+ New Task") or `#87` ("Adicionar"):

| Field | SOM Index | Label |
|---|---|---|
| Title Input | `#154` | "Task title" |
| Description Input | `#158` | "Task description (optional)" |
| Assignee Dropdown | `#162` | "Select assignee..." |
| Priority Dropdown | `#165` | "Select priority..." |
| Tenant Input | `#168` | "Tenant (optional)" |
| Workspace Dropdown | `#172` | "Scratch workspace" |
| Skills Dropdown | `#175` | "Select skills..." |
| Create in Triage Checkbox | `#176` | "Create in triage" |
| Goal Mode Checkbox | `#177` | "Goal mode" |
| Max Runtime Input | `#180` | "e.g. 30m, 2h" |
| Max Retries Input | `#183` | "Number of retries" |
| Cancel Button | `#188` | "Cancelar" |
| Create Button | `#189` | "Criar" |

---

## Quick Reference Commands

### Open Kanban
```python
computer_use(action='click', element=43)  # Sidebar "Kanban" link
```

### Create Task
```python
computer_use(action='click', element=94)  # "+ New Task"
computer_use(action='click', element=154, delivery_mode='foreground')  # Title input
computer_use(action='type', text='Título da task', delivery_mode='foreground')
computer_use(action='click', element=158, delivery_mode='foreground')  # Description
computer_use(action='type', text='Descrição...', delivery_mode='foreground')
computer_use(action='click', element=165, delivery_mode='foreground')  # Priority dropdown
computer_use(action='click', element=XXX, delivery_mode='foreground')  # Select priority
computer_use(action='click', element=189, delivery_mode='foreground')  # "Criar"
```

### Move Card (Drag & Drop)
- Not directly via SOM — use `coordinate` drag or `cua_browser_*` if binding exact

### Filter
```python
computer_use(action='click', element=91)  # "All Statuses"
computer_use(action='click', element=93)  # "All Assignees"
```

---

## Integration with `claude-git-pr-skill` Methodology

| Kanban State | PR Review Equivalent | Action |
|---|---|---|
| **Triage** | New PR / needs triage | `gh pr view` → classify |
| **To Do** | Ready for review | Assign reviewer |
| **Ready** | Reviewer assigned | Start pending review |
| **Running** | Review in progress | Batch comments via `gh pr review --pending` |
| **Review** | Pending review submitted | Wait for author response |
| **Blocked** | `REQUEST_CHANGES` | Author must address |
| **Done** | `APPROVE` / merged | Close task |
| **Archived** | Closed/merged | Archive for history |

---

## Verification Checklist (Post-Action)
- [ ] New capture → confirm counter incremented (`#95`–`#104`)
- [ ] Card visible in correct column drop zone (`#110`, `#114`, etc.)
- [ ] Card title matches input
- [ ] Assignee/priority reflected in card

---

## Session Metadata
- **Created:** 2026-08-02
- **Profile:** pivete
- **Hermes Studio:** v0.6.36
- **Chrome PID:** 10044
- **Window ID:** 985268
- **Mission:** CENTRALDARK-CASA-BACKUP-ORGANIZACAO-SYNC-01 (Turno 10)