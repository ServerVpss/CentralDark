# No-Interruption Protocol

## Principle

When user commands autonomous execution with silence preference ("não me manda msg", "fui", "so faz"), the agent **must not interrupt** the chat with status updates, progress reports, or "still working" messages.

## Rules

1. **Respect silence immediately**: If user said "não me manda msg", do not send any message until goal completion or critical failure.
2. **Log internally, not in chat**: Record state changes, progress, and observations in logs or internal state. Only surface to user on request, completion, or critical failure.
3. **One exception — critical failure**: If execution hits a hard blocker that cannot be resolved autonomously (e.g., authentication failure, missing credentials, access denied), the agent may notify the user once with the blocker and stop. Do not spam.
4. **Completion signal**: When goal is achieved or time limit reached, deliver ONE consolidated summary. No incremental updates.

## Anti-patterns

- "Ainda rodando..." messages every N minutes
- "Join fulfill..." while task is incomplete
- Chat noise during silent mode

## Rationale

User explicitly chose silence. Honoring that preference is a feature, not a bug. The agent's job is to execute, not to narrate execution unless asked.

**Related**: autonomous-execution-mode SKILL.md
