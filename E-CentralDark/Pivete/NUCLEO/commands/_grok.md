# COMANDO - _grok
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\completions\zsh\_grok
**SHA:** d3e2ab05af79931e
**Timestamp:** 2026-08-28T02:52:42.107736
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- '(--prompt-json --prompt-file)-p+[Single-turn prompt. Prints the response to stdout and exits]:PROMPT:_default' \
- '(--prompt-json --prompt-file)--single=[Single-turn prompt. Prints the response to stdout and exits]:PROMPT:_default' \
- '--system-prompt-override=[Override the agent'\''s system prompt (compat alias\: --system-prompt)]:PROMPT:_default' \
- 'start:Start (or update) the workspace→hub exposure' \
- 'restart:Restart the exposure (stop, then start with the given options)' \
- 'start:Start (or update) the workspace→hub exposure' \
- 'restart:Restart the exposure (stop, then start with the given options)' \
- 'start:Start (or update) the workspace→hub exposure' \
- 'restart:Restart the exposure (stop, then start with the given options)' \

### Ouro Bruto (primeiros 5000 chars)
```
#compdef grok

autoload -U is-at-least

_grok() {
    typeset -A opt_args
    typeset -a _arguments_options
    local ret=1

    if is-at-least 5.2; then
        _arguments_options=(-s -S -C)
    else
        _arguments_options=(-s -C)
    fi

    local context curcontext="$curcontext" state line
    _arguments "${_arguments_options[@]}" : \
'--cwd=[Working directory]:CWD:_files' \
'--leader-socket=[Use a custom leader socket path instead of the default \`~/.grok/leader.sock\`]:PATH:_files' \
'--debug-file=[Write debug logs to FILE]:FILE:_files' \
'*--allow=[Permission allow rule (compat alias\: --allowedTools)]:RULE:_default' \
'*--deny=[Permission deny rule (compat alias\: --disallowedTools)]:RULE:_default' \
'(--prompt-json --prompt-file)-p+[Single-turn prompt. Prints the response to stdout and exits]:PROMPT:_default' \
'(--prompt-json --prompt-file)--single=[Single-turn prompt. Prints the response to stdout and exits]:PROMPT:_default' \
'(-p --single --prompt-file)--prompt-json=[Single-turn prompt as JSON content blocks]:JSON:_default' \
'(-p --single --prompt-json)--prompt-file=[Single-turn prompt from a file]:PATH:_files' \
'--output-format=[Output format for headless mode]:OUTPUT_FORMAT:((plain\:""
json\:""
streaming-json\:"NDJSON of the agent native ACP session updates"
streaming-messages-json\:"NDJSON in the Anthropic Messages API wire format"))' \
'--json-schema=[JSON Schema for structured output. When set, the model is constrained to produce JSON matching this schema. Implies --output-format json. Example\: --json-schema '\''{"type"\:"object","properties"\:{"name"\:{"type"\:"string"}}}'\'']:SCHEMA:_default' \
'-m+[Model ID to use]:MODEL:_default' \
'--model=[Model ID to use]:MODEL:_default' \
'--reasoning-effort=[Reasoning effort for reasoning models]:EFFORT:_default' \
'--effort=[Reasoning effort for reasoning models]:EFFORT:_default' \
'--rules=[Extra rules to append to the system prompt]:RULES:_default' \
'--compaction-mode=[Compaction mode \[summary|transcript|segments\]\: \`summary\` (default) adds no pointer; \`transcript\` points at the raw transcript; \`segments\` persists per-segment markdown to grep. Sets \`GROK_COMPACTION_MODE\`]:MODE:_default' \
'--compaction-detail=[Segments verbatim detail \[none|minimal|balanced|verbose\] (default \`verbose\`). Only affects \`--compaction-mode segments\`. Sets \`GROK_COMPACTION_DETAIL\`]:DETAIL:_default' \
'--system-prompt-override=[Override the agent'\''s system prompt (compat alias\: --system-prompt)]:PROMPT:_default' \
'(-c --continue)-r+[Resume a session by ID or title, or the most recent if omitted. Non-ID values match session titles for the current directory (ignoring letter case; a sole renamed match wins among duplicates, otherwise ambiguity errors; UUID-shaped values always mean IDs)]::SESSION_ID_OR_TITLE:_default' \
'(-c --continue)--resume=[Resume a session by ID or title, or the most recent if omitted. Non-ID values match session titles for the current directory (ignoring letter case; a sole renamed match wins among duplicates, otherwise ambiguity errors; UUID-shaped values always mean IDs)]::SESSION_ID_OR_TITLE:_default' \
'(-c --continue)--load=[Resume a previous session by session ID (alias for --resume)]:SESSION_ID:_default' \
'-s+[Use a specific session UUID for a **new** conversation (must be a valid UUID and must not already exist under the target session directory). With \`--resume\`/\`--continue\`, only valid together with \`--fork-session\` (names the forked session). Does not resume existing sessions — use \`--resume\` / \`--continue\` instead]:SESSION_ID:_default' \
'--session-id=[Use a specific session UUID for a **new** conversation (must be a valid UUID and must not already exist under the target session directory). With \`--resume\`/\`--continue\`, only valid together with \`--fork-session\` (names the forked session). Does not resume existing sessions — use \`--resume\` / \`--continue\` instead]:SESSION_ID:_default' \
'-w+[Start the session in a new git worktree, optionally named]::WORKTREE:_default' \
'--worktree=[Start the session in a new git worktree, optionally named]::WORKTREE:_default' \
'--worktree-ref=[Branch, tag, or commit to base the worktree on (with \`--worktree\`). Defaults to the current HEAD of the source checkout when omitted]:WORKTREE_REF:_default' \
'--ref=[Branch, tag, or commit to base the worktree on (with \`--worktree\`). Defaults to the current HEAD of the source checkout when omitted]:WORKTREE_REF:_default' \
'--agent=[Agent name or definition file path]:NAME:_default' \
'--agents=[Inline subagent definitions as JSON]:JSON:_default' \
'--tools=[Built-in tools to allow (comma-separated)]:TOOLS:_default' \
'--disallowed-tools=[Built-in tools to remove (comma-separated)]:TOOLS:_default' \
'--max-turns=[Maximum number of agent turns]:N:_default' \
'--permission-mode=[Permission mode]:MODE:(default acceptEdits auto dontAsk bypassPermissions plan)' \
'(--no-wait-for-background)--background-wait-timeo
```