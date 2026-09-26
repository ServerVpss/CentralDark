# COMANDO - management-authoring-rpc.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\skills\pi-subagents\references\management-authoring-rpc.md
**SHA:** c9cb69a8e1a03410
**Timestamp:** 2026-08-28T02:24:50.854505
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- systemPrompt: "Your system prompt here.",

### Ouro Bruto (primeiros 5000 chars)
```
# Pi Subagents: Management Authoring Rpc

This file is a detailed reference loaded from `skills/pi-subagents/SKILL.md`.

## Management Mode

The `subagent(...)` tool also supports management actions.

### List available agents and legacy chain records

```typescript
subagent({ action: "list" })
```

### List retained children

```typescript
subagent({ action: "children.list" })
```

Lists up to the last 10 retained workflow children from this parent session with explicit `resumable` or `not resumable` rows. Resume only rows reported `resumable`. Send a simple follow-up or implementation challenge with `subagent({ action: "resume", id: "<run-id>", message: "..." })`. Continue one inside a workflow with `runs.run(key, { resume: "<run-id>", task: "follow-up" })`; the revived child keeps its stored agent, model, and tool contract. If no resumable child is listed, start a same-role fallback challenge and label it as fallback. `steer` with `mode: "follow_up"` only queues text for the next `resume` when the child has already completed.

### Refinement overlays

```typescript
subagent({ action: "refine", agent: "reviewer" })
subagent({ action: "refine.show", agent: "reviewer" })
subagent({ action: "refine.rollback", agent: "reviewer" })
```

`refine` builds a bounded project-local guidance overlay for one agent from recent run evidence, using a fresh read-only proposal child; validated guidance is stored under `.pi/subagents/refinements/<agent>.md` with revision snapshots and is injected into that agent's child system prompt for this project. `refine.show` prints the current overlay and history; `refine.rollback` restores the previous revision. Guidance that tries to override safety, policy, tool, output, acceptance, developer, or system instructions is rejected. `/subagents-refine <agent>` is the slash equivalent.

### Create an agent

```typescript
subagent({
  action: "create",
  config: {
    name: "my-agent",
    package: "code-analysis",
    description: "Project-specific implementation helper",
    systemPrompt: "Your system prompt here.",
    systemPromptMode: "replace",
    model: "openai-codex/gpt-5.4",
    tools: "read,grep,find,ls,bash"
  }
})
```

### Update an agent

```typescript
subagent({
  action: "update",
  agent: "code-analysis.my-agent",
  config: {
    thinking: "high"
  }
})
```

### Delete an agent

```typescript
subagent({ action: "delete", agent: "code-analysis.my-agent" })
```

### Eject, disable, enable, and reset

```typescript
// Copy a bundled builtin/package agent to user scope as an editable custom file.
subagent({ action: "eject", agent: "reviewer" })
subagent({ action: "eject", agent: "reviewer", agentScope: "project" })

// Hide an agent from runtime discovery without deleting it (reversible).
subagent({ action: "disable", agent: "reviewer" })
subagent({ action: "enable", agent: "reviewer", agentScope: "project" })

// Delete the scope's custom agent file and/or settings override, restoring the bundled default.
subagent({ action: "reset", agent: "reviewer" })
```

`eject` copies a builtin or package agent verbatim into the user (default) or project agent dir so it can be customized without hunting package files; the copy shadows the original by runtime name. `disable` writes a reversible `agentOverrides.<name>.disabled: true` entry to the user or project settings file. `enable` removes that `disabled` field while keeping any other override fields. `reset` removes the scope's custom file and settings override to restore the bundled default, and refuses if no bundled default exists (use `delete` for purely custom agents). All four take optional `agentScope: "user" | "project"`; project overrides win over user ones, so target the project scope to undo a project-scope disable.

Use management actions when the system needs to create or edit subagents on
demand without dropping into raw file editing.

Management actions create or update user/project agent files. `config.name` is the local frontmatter name; optional `config.package` registers and looks up the runtime name as `{package}.{name}`. Use the dotted runtime name for `get`, `update`, `delete`, slash commands, and scripted workflow steps. For small builtin changes such as a model swap, prefer `subagents.agentOverrides` in settings. Durable `.chain.md` definitions are legacy records, not a current authoring target; use `workflowScript` or `/prompt-workflow` for repeatable orchestration.

## Creating and Editing Agents by File

A minimal agent file looks like this:

```markdown
---
name: my-agent
package: code-analysis
description: What this agent does
aliases: developer, coder
model: openai-codex/gpt-5.4
thinking: high
tools: read, grep, find, ls, bash
systemPromptMode: replace
inheritProjectContext: true
inheritSkills: false
skills: safe-bash, review-checklist
skillPath: ./skills, ../shared-skills
---

Your system prompt here.
```

That is only a starting point. Omit `package` for the traditional unqualified runtime name. Commo
```