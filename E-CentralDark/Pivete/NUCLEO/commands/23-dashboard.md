# COMANDO - 23-dashboard.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\docs\user-guide\23-dashboard.md
**SHA:** 46d8940f21aba815
**Timestamp:** 2026-08-28T02:52:41.807023
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - **Input focused**: type a new-session prompt. Empty prompt: `↑`/`↓`

### Ouro Bruto (primeiros 5000 chars)
```
# Agent Dashboard

The Agent Dashboard lists every top-level session in this pager process —
local sessions and forks — grouped by state. From one screen you can peek,
reply, attach, pin, rename, stop, or dispatch a new agent. Subagents are not
listed; they run under their parent, which already shows when work is in
flight.

Not the agents modal (`/config-agents` / `/agents` — definitions and
personas), the session picker (`/resume` / `Ctrl+S` — past conversations on
disk), or the workflows run UI (`/workflows`).

---

## Opening the dashboard

- **`grok dashboard`** — launch the TUI into the dashboard.
- **`/dashboard`** (aliases **`/agents-dashboard`**, **`/sessions`**) — open
  from inside a session.
- **`Ctrl+\`** — same view as the slash command.

Hidden in minimal mode. Set `GROK_AGENT_DASHBOARD=0` or
`[dashboard].enabled = false` to disable.

---

## What you see

```
 Grok Build · Dashboard — 4 agents · 2 awaiting
▌● reviewer · audit token flow    Awaiting your input            2m
 ● implementer · fix login bug    Running: cargo test           12m
 ⋅ refactor · feat/login          Responding…                   24m
 ○ housekeeping                   idle                           1h
 ● implementer · add login tests  8 tools · 1.2k tok            14m
╭─────────────────────────────────────────────────────────────────╮
│ ❯ Dispatch a new agent                                          │
╰─ dispatch ──────────────────────────────────────────────────────╯
 ↑/↓ select (peek) · Enter open · Ctrl+R rename · Ctrl+T pin · Ctrl+X stop · ? help · Esc new
```

Each row is a top-level agent. Sort by state (Needs input → Working → Idle →
Inactive → Completed → Failed) so same-state rows sit together, or by working
directory (`Ctrl+G` toggles). **Inactive** is roster-only sessions owned by
other pager processes that this process has not loaded — background noise, so
the section **starts collapsed** (expand with `→` / click).

To keep **Idle** scannable, only the most recent idle agents stay visible —
the 8 freshest, plus any active within the last hour. The rest fold into a
**"N more"** row at the bottom of the group; select it and press `Enter` /
`→` (or click) to expand, `←` to re-fold. The Idle header always shows the
true total. Folding is suspended while a filter or search is active.

State icons match other session lists in Grok Build:

- `⋅`/`:`/`⸬`/`⁙` — animated spinner for **Working**
- `●` — filled circle for **Needs input**, **Completed**, **Failed**,
  **Blocked** (color: yellow / green / red / amber)
- `○` — hollow circle for **Idle** and **Inactive**

A row stays **Working** while it has live background work even if its turn
has finished — a background task, a `monitor`, or an active scheduled
`/loop`. The activity line says what is still running (for example
`1 monitor · 2 loops still running`).

There are no inline group headers; sort order keeps same-state rows adjacent,
and the per-row dot + color shows the group.

The dispatch input uses the same prompt chrome as the agent view. Press
`Ctrl+/` to flip it into **search mode**: the `❯` prefix becomes a yellow
`Search:` and typing live-filters the list instead of dispatching.

---

## Keybindings

| Key | Action |
| --- | --- |
| `↑` / `↓`, `j` / `k` | Navigate rows and section titles (selecting a row opens peek) |
| `→` / `←` (on a section title) | Expand / collapse the section (`l` / `h` in vim mode) |
| `Enter` (on a section title) | Toggle the section collapsed / expanded |
| `Enter` (empty reply) | Open the selected agent full-screen (details view) |
| `Ctrl+S` | Send the peek reply and open the agent (or dispatch and attach a new session) |
| `Shift+Enter` / `Alt+Enter` | Newline in the reply / dispatch input |
| `1`–`9` | Answer a pending permission / ask question when peek shows options |
| `Enter` (typed reply) | Send / queue the reply to the selected agent |
| `/` | Literal `/` into the prompt |
| `Ctrl+/` | Toggle search mode (live-filter rows) |
| `Ctrl+R` | Rename selected row |
| `Ctrl+T` | Pin / unpin |
| `Ctrl+G` | Toggle grouping (state ↔ directory) |
| `Ctrl+X` | Cancel a running turn, or press twice within 2s to permanently delete |
| Hover + click `[✗]` | Permanently delete an idle/done row (click again to confirm) |
| `Shift+↑` / `Shift+↓` | Reorder pinned rows |
| `Esc` | Step back: cancel search → close peek → clear filter → unfocus dispatch → unselect row → exit. Never clears a typed dispatch draft (`Ctrl+U` / `Ctrl+C` for that) |
| `Ctrl+\` | Return from details view, or exit dashboard |
| `Ctrl+.` (alt: `?`) | Keyboard shortcuts cheatsheet. Footer shows `?` when `Ctrl+.` cannot be delivered. Bare `?` opens help when list-focused or the draft is empty |

When grouping by state, each group has a **section title** (for example
`Working`, `Idle`) with a `▸`/`▾` marker. Select a title and press `→` /
`←` to expand or collapse (`l` / `h` in vim mode). Click toggles; hover
brightens. Collapse state is remembered while the dashboard 
```