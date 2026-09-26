
using namespace System.Management.Automation
using namespace System.Management.Automation.Language

Register-ArgumentCompleter -Native -CommandName 'grok' -ScriptBlock {
    param($wordToComplete, $commandAst, $cursorPosition)

    $commandElements = $commandAst.CommandElements
    $command = @(
        'grok'
        for ($i = 1; $i -lt $commandElements.Count; $i++) {
            $element = $commandElements[$i]
            if ($element -isnot [StringConstantExpressionAst] -or
                $element.StringConstantType -ne [StringConstantType]::BareWord -or
                $element.Value.StartsWith('-') -or
                $element.Value -eq $wordToComplete) {
                break
        }
        $element.Value
    }) -join ';'

    $completions = @(switch ($command) {
        'grok' {
            [CompletionResult]::new('--cwd', '--cwd', [CompletionResultType]::ParameterName, 'Working directory')
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--allow', '--allow', [CompletionResultType]::ParameterName, 'Permission allow rule (compat alias: --allowedTools)')
            [CompletionResult]::new('--deny', '--deny', [CompletionResultType]::ParameterName, 'Permission deny rule (compat alias: --disallowedTools)')
            [CompletionResult]::new('-p', '-p', [CompletionResultType]::ParameterName, 'Single-turn prompt. Prints the response to stdout and exits')
            [CompletionResult]::new('--single', '--single', [CompletionResultType]::ParameterName, 'Single-turn prompt. Prints the response to stdout and exits')
            [CompletionResult]::new('--prompt-json', '--prompt-json', [CompletionResultType]::ParameterName, 'Single-turn prompt as JSON content blocks')
            [CompletionResult]::new('--prompt-file', '--prompt-file', [CompletionResultType]::ParameterName, 'Single-turn prompt from a file')
            [CompletionResult]::new('--output-format', '--output-format', [CompletionResultType]::ParameterName, 'Output format for headless mode')
            [CompletionResult]::new('--json-schema', '--json-schema', [CompletionResultType]::ParameterName, 'JSON Schema for structured output. When set, the model is constrained to produce JSON matching this schema. Implies --output-format json. Example: --json-schema ''{"type":"object","properties":{"name":{"type":"string"}}}''')
            [CompletionResult]::new('-m', '-m', [CompletionResultType]::ParameterName, 'Model ID to use')
            [CompletionResult]::new('--model', '--model', [CompletionResultType]::ParameterName, 'Model ID to use')
            [CompletionResult]::new('--reasoning-effort', '--reasoning-effort', [CompletionResultType]::ParameterName, 'Reasoning effort for reasoning models')
            [CompletionResult]::new('--effort', '--effort', [CompletionResultType]::ParameterName, 'Reasoning effort for reasoning models')
            [CompletionResult]::new('--rules', '--rules', [CompletionResultType]::ParameterName, 'Extra rules to append to the system prompt')
            [CompletionResult]::new('--compaction-mode', '--compaction-mode', [CompletionResultType]::ParameterName, 'Compaction mode [summary|transcript|segments]: `summary` (default) adds no pointer; `transcript` points at the raw transcript; `segments` persists per-segment markdown to grep. Sets `GROK_COMPACTION_MODE`')
            [CompletionResult]::new('--compaction-detail', '--compaction-detail', [CompletionResultType]::ParameterName, 'Segments verbatim detail [none|minimal|balanced|verbose] (default `verbose`). Only affects `--compaction-mode segments`. Sets `GROK_COMPACTION_DETAIL`')
            [CompletionResult]::new('--system-prompt-override', '--system-prompt-override', [CompletionResultType]::ParameterName, 'Override the agent''s system prompt (compat alias: --system-prompt)')
            [CompletionResult]::new('-r', '-r', [CompletionResultType]::ParameterName, 'Resume a session by ID or title, or the most recent if omitted. Non-ID values match session titles for the current directory (ignoring letter case; a sole renamed match wins among duplicates, otherwise ambiguity errors; UUID-shaped values always mean IDs)')
            [CompletionResult]::new('--resume', '--resume', [CompletionResultType]::ParameterName, 'Resume a session by ID or title, or the most recent if omitted. Non-ID values match session titles for the current directory (ignoring letter case; a sole renamed match wins among duplicates, otherwise ambiguity errors; UUID-shaped values always mean IDs)')
            [CompletionResult]::new('--load', '--load', [CompletionResultType]::ParameterName, 'Resume a previous session by session ID (alias for --resume)')
            [CompletionResult]::new('-s', '-s', [CompletionResultType]::ParameterName, 'Use a specific session UUID for a **new** conversation (must be a valid UUID and must not already exist under the target session directory). With `--resume`/`--continue`, only valid together with `--fork-session` (names the forked session). Does not resume existing sessions ÔÇö use `--resume` / `--continue` instead')
            [CompletionResult]::new('--session-id', '--session-id', [CompletionResultType]::ParameterName, 'Use a specific session UUID for a **new** conversation (must be a valid UUID and must not already exist under the target session directory). With `--resume`/`--continue`, only valid together with `--fork-session` (names the forked session). Does not resume existing sessions ÔÇö use `--resume` / `--continue` instead')
            [CompletionResult]::new('-w', '-w', [CompletionResultType]::ParameterName, 'Start the session in a new git worktree, optionally named. With `--resume` of a remote session, pass `--restore-code` to apply the snapshot codebase (conversation is restored either way). Headless (`-p`) does not create a worktree from this flag')
            [CompletionResult]::new('--worktree', '--worktree', [CompletionResultType]::ParameterName, 'Start the session in a new git worktree, optionally named. With `--resume` of a remote session, pass `--restore-code` to apply the snapshot codebase (conversation is restored either way). Headless (`-p`) does not create a worktree from this flag')
            [CompletionResult]::new('--worktree-ref', '--worktree-ref', [CompletionResultType]::ParameterName, 'Branch, tag, or commit to base the worktree on (with `--worktree`). Defaults to the current HEAD of the source checkout when omitted')
            [CompletionResult]::new('--ref', '--ref', [CompletionResultType]::ParameterName, 'Branch, tag, or commit to base the worktree on (with `--worktree`). Defaults to the current HEAD of the source checkout when omitted')
            [CompletionResult]::new('--agent', '--agent', [CompletionResultType]::ParameterName, 'Agent name or definition file path')
            [CompletionResult]::new('--agents', '--agents', [CompletionResultType]::ParameterName, 'Inline subagent definitions as JSON')
            [CompletionResult]::new('--tools', '--tools', [CompletionResultType]::ParameterName, 'Built-in tools to allow (comma-separated)')
            [CompletionResult]::new('--disallowed-tools', '--disallowed-tools', [CompletionResultType]::ParameterName, 'Built-in tools to remove (comma-separated)')
            [CompletionResult]::new('--max-turns', '--max-turns', [CompletionResultType]::ParameterName, 'Maximum number of agent turns')
            [CompletionResult]::new('--permission-mode', '--permission-mode', [CompletionResultType]::ParameterName, 'Permission mode')
            [CompletionResult]::new('--background-wait-timeout', '--background-wait-timeout', [CompletionResultType]::ParameterName, 'Max seconds to wait for background work after the first turn ends (headless only). Applies to bash/monitor `task_completed`, background subagents (`SubagentFinished`), and any still-running non-persistent work. Persistent `monitor(persistent:true)` never completes and always waits the full timeout ÔÇö use `--no-wait-for-background` or a lower timeout for throughput. Conflicts with `--no-wait-for-background`')
            [CompletionResult]::new('--sandbox', '--sandbox', [CompletionResultType]::ParameterName, 'Sandbox profile for filesystem and network access')
            [CompletionResult]::new('--storage-mode', '--storage-mode', [CompletionResultType]::ParameterName, 'Session storage mode: local or writeback')
            [CompletionResult]::new('--client-identifier', '--client-identifier', [CompletionResultType]::ParameterName, 'Override the client identifier sent to the agent')
            [CompletionResult]::new('--hunk-tracker-mode', '--hunk-tracker-mode', [CompletionResultType]::ParameterName, 'Hunk tracker mode: agent_only, all_dirty, or off ("disabled" is an alias for off, which turns the hunk tracker off entirely)')
            [CompletionResult]::new('--installer', '--installer', [CompletionResultType]::ParameterName, 'Set the installer field in config.toml')
            [CompletionResult]::new('-v', '-v', [CompletionResultType]::ParameterName, 'Print version')
            [CompletionResult]::new('--version', '--version', [CompletionResultType]::ParameterName, 'Print version')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('--always-approve', '--always-approve', [CompletionResultType]::ParameterName, 'Auto-approve all tool executions')
            [CompletionResult]::new('--trust', '--trust', [CompletionResultType]::ParameterName, 'Trust this folder and persist the decision to the trust store')
            [CompletionResult]::new('--verbatim', '--verbatim', [CompletionResultType]::ParameterName, 'Send the prompt exactly as given')
            [CompletionResult]::new('--include-partial-messages', '--include-partial-messages', [CompletionResultType]::ParameterName, 'Emit incremental `stream_event` lines (text/thinking deltas) alongside whole messages. Only affects `--output-format streaming-messages-json`')
            [CompletionResult]::new('-c', '-c', [CompletionResultType]::ParameterName, 'Continue the most recent session for the current working directory')
            [CompletionResult]::new('--continue', '--continue', [CompletionResultType]::ParameterName, 'Continue the most recent session for the current working directory')
            [CompletionResult]::new('--fork-session', '--fork-session', [CompletionResultType]::ParameterName, 'When resuming (`--resume` / `--continue`), create a new session ID instead of reusing the original (optionally set via `--session-id`)')
            [CompletionResult]::new('--restore-code', '--restore-code', [CompletionResultType]::ParameterName, 'Restore the original session''s repository snapshot when resuming. Remote sessions require `--worktree` (never checks out into the current directory). Without this flag, resume restores conversation only')
            [CompletionResult]::new('--no-plan', '--no-plan', [CompletionResultType]::ParameterName, 'Disable plan mode')
            [CompletionResult]::new('--no-subagents', '--no-subagents', [CompletionResultType]::ParameterName, 'Disable subagent spawning')
            [CompletionResult]::new('--no-ask-user', '--no-ask-user', [CompletionResultType]::ParameterName, 'Disable structured question prompts from the agent')
            [CompletionResult]::new('--experimental-memory', '--experimental-memory', [CompletionResultType]::ParameterName, 'Legacy compatibility flag for enabling cross-session memory')
            [CompletionResult]::new('--no-memory', '--no-memory', [CompletionResultType]::ParameterName, 'Legacy compatibility flag for disabling cross-session memory')
            [CompletionResult]::new('--disable-web-search', '--disable-web-search', [CompletionResultType]::ParameterName, 'Disable web search and web fetch tools')
            [CompletionResult]::new('--no-wait-for-background', '--no-wait-for-background', [CompletionResultType]::ParameterName, 'Exit as soon as the first agent turn ends, without waiting for pending background bash/monitor tasks or background subagents (headless only). Default for all `grok -p` runs is to wait (up to `--background-wait-timeout`) so eval harnesses see full task completion. Use this for fast scripts that only need the first turn''s text. Does not wait for server-side auto-wake output or persistent monitors (those hit the timeout)')
            [CompletionResult]::new('--terminal', '--terminal', [CompletionResultType]::ParameterName, 'Enable terminal support for the agent')
            [CompletionResult]::new('--fs-read', '--fs-read', [CompletionResultType]::ParameterName, 'Enable client-side file reads')
            [CompletionResult]::new('--fs-write', '--fs-write', [CompletionResultType]::ParameterName, 'Enable client-side file writes')
            [CompletionResult]::new('--no-auto-update', '--no-auto-update', [CompletionResultType]::ParameterName, 'Disable automatic updates for this session')
            [CompletionResult]::new('--todo-gate', '--todo-gate', [CompletionResultType]::ParameterName, 'Enable the runtime turn-end TodoGate for this session')
            [CompletionResult]::new('--no-alt-screen', '--no-alt-screen', [CompletionResultType]::ParameterName, 'Run inline instead of using the terminal alternate screen')
            [CompletionResult]::new('--minimal', '--minimal', [CompletionResultType]::ParameterName, 'Experimental: scrollback-native rendering. Finalized blocks are printed into the terminal''s native scrollback (use the terminal''s own scroll / selection); a small pinned region holds the prompt + running turn. Session-scoped only ÔÇö does not write config. To default plain `grok` to minimal, set `[ui] screen_mode = "minimal"` in ~/.grok/config.toml')
            [CompletionResult]::new('--fullscreen', '--fullscreen', [CompletionResultType]::ParameterName, 'Open in the standard fullscreen TUI for this session, overriding a config `[ui] screen_mode = "minimal"` preference. Session-scoped only ÔÇö does not write config. Fullscreen-vs-inline still follows the alt-screen policy (--no-alt-screen, [terminal] alt_screen, terminal auto-detection)')
            [CompletionResult]::new('--log-sampling', '--log-sampling', [CompletionResultType]::ParameterName, 'Write sampling events to ~/.grok/logs/sampling.jsonl')
            [CompletionResult]::new('--force-login', '--force-login', [CompletionResultType]::ParameterName, 'Show the login screen even when credentials are already available')
            [CompletionResult]::new('--oauth', '--oauth', [CompletionResultType]::ParameterName, 'Use OAuth when the welcome screen starts authentication')
            [CompletionResult]::new('--leader', '--leader', [CompletionResultType]::ParameterName, 'Connect to a shared leader process')
            [CompletionResult]::new('--no-leader', '--no-leader', [CompletionResultType]::ParameterName, 'Run standalone even when leader mode is configured')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help (see more with ''--help'')')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help (see more with ''--help'')')
            [CompletionResult]::new('agent', 'agent', [CompletionResultType]::ParameterValue, 'Run Grok without the interactive UI')
            [CompletionResult]::new('inspect', 'inspect', [CompletionResultType]::ParameterValue, 'Show the configuration Grok discovers for this directory')
            [CompletionResult]::new('doctor', 'doctor', [CompletionResultType]::ParameterValue, 'Check terminal, clipboard, color, and input support without starting Grok')
            [CompletionResult]::new('leader', 'leader', [CompletionResultType]::ParameterValue, 'Manage running leader processes')
            [CompletionResult]::new('logout', 'logout', [CompletionResultType]::ParameterValue, 'Sign out and clear cached credentials')
            [CompletionResult]::new('login', 'login', [CompletionResultType]::ParameterValue, 'Sign in to Grok')
            [CompletionResult]::new('mcp', 'mcp', [CompletionResultType]::ParameterValue, 'Manage MCP server configurations')
            [CompletionResult]::new('plugin', 'plugin', [CompletionResultType]::ParameterValue, 'Manage plugins and marketplace sources')
            [CompletionResult]::new('memory', 'memory', [CompletionResultType]::ParameterValue, 'Manage cross-session memory')
            [CompletionResult]::new('models', 'models', [CompletionResultType]::ParameterValue, 'List available models and exit')
            [CompletionResult]::new('sessions', 'sessions', [CompletionResultType]::ParameterValue, 'List, search, or restore sessions')
            [CompletionResult]::new('setup', 'setup', [CompletionResultType]::ParameterValue, 'Fetch and install managed configuration')
            [CompletionResult]::new('share', 'share', [CompletionResultType]::ParameterValue, 'Share a session and print the share URL')
            [CompletionResult]::new('wrap', 'wrap', [CompletionResultType]::ParameterValue, 'Run any command with local clipboard support (OSC 52 ÔåÆ system clipboard)')
            [CompletionResult]::new('export', 'export', [CompletionResultType]::ParameterValue, 'Export a session transcript as Markdown')
            [CompletionResult]::new('trace', 'trace', [CompletionResultType]::ParameterValue, 'Export or upload session trace data')
            [CompletionResult]::new('update', 'update', [CompletionResultType]::ParameterValue, 'Check for updates or install a specific version')
            [CompletionResult]::new('version', 'version', [CompletionResultType]::ParameterValue, 'Print version information')
            [CompletionResult]::new('v', 'v', [CompletionResultType]::ParameterValue, 'Print version information')
            [CompletionResult]::new('completions', 'completions', [CompletionResultType]::ParameterValue, 'Generate shell completion scripts (bash, zsh, fish, powershell, ...)')
            [CompletionResult]::new('worktree', 'worktree', [CompletionResultType]::ParameterValue, 'Manage git worktrees')
            [CompletionResult]::new('du', 'du', [CompletionResultType]::ParameterValue, 'Show what the grok home (~/.grok) uses on disk')
            [CompletionResult]::new('disk-usage', 'disk-usage', [CompletionResultType]::ParameterValue, 'Show what the grok home (~/.grok) uses on disk')
            [CompletionResult]::new('workspace', 'workspace', [CompletionResultType]::ParameterValue, 'Expose this workspace to the Computer Hub (via the leader)')
            [CompletionResult]::new('dashboard', 'dashboard', [CompletionResultType]::ParameterValue, 'Open the Agent Dashboard view at startup')
            [CompletionResult]::new('help', 'help', [CompletionResultType]::ParameterValue, 'Print this message or the help of the given subcommand(s)')
            break
        }
        'grok;agent' {
            [CompletionResult]::new('-m', '-m', [CompletionResultType]::ParameterName, 'Model ID to use')
            [CompletionResult]::new('--model', '--model', [CompletionResultType]::ParameterName, 'Model ID to use')
            [CompletionResult]::new('--reasoning-effort', '--reasoning-effort', [CompletionResultType]::ParameterName, 'Reasoning effort for reasoning models')
            [CompletionResult]::new('--effort', '--effort', [CompletionResultType]::ParameterName, 'Reasoning effort for reasoning models')
            [CompletionResult]::new('--agent-profile', '--agent-profile', [CompletionResultType]::ParameterName, 'Path to an agent profile file')
            [CompletionResult]::new('--plugin-dir', '--plugin-dir', [CompletionResultType]::ParameterName, 'Load a plugin from this directory for this process only (repeatable). Highest-priority plugin scope; always trusted ÔÇö hooks and MCP servers activate without a prompt. Used by the Agent SDKs to inject per-connection plugins')
            [CompletionResult]::new('--grok-ws-origin', '--grok-ws-origin', [CompletionResultType]::ParameterName, 'grok-ws-origin')
            [CompletionResult]::new('--grok-ws-url', '--grok-ws-url', [CompletionResultType]::ParameterName, 'grok-ws-url')
            [CompletionResult]::new('--cli-chat-proxy-base-url', '--cli-chat-proxy-base-url', [CompletionResultType]::ParameterName, 'Override the CLI chat proxy base URL')
            [CompletionResult]::new('--xai-api-base-url', '--xai-api-base-url', [CompletionResultType]::ParameterName, 'Override the public xAI API base URL')
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--reauth', '--reauth', [CompletionResultType]::ParameterName, 'Run authentication before starting the agent')
            [CompletionResult]::new('----reauthenticate', '----reauthenticate', [CompletionResultType]::ParameterName, 'Run authentication before starting the agent')
            [CompletionResult]::new('--always-approve', '--always-approve', [CompletionResultType]::ParameterName, 'Auto-approve all tool executions')
            [CompletionResult]::new('--leader', '--leader', [CompletionResultType]::ParameterName, 'Connect to a shared leader process instead of starting a new agent. Allows multiple clients to share one backend. Defaults to [cli] use_leader in config.toml')
            [CompletionResult]::new('--no-leader', '--no-leader', [CompletionResultType]::ParameterName, 'Start a new agent even when config enables leader mode')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('stdio', 'stdio', [CompletionResultType]::ParameterValue, 'Run the agent over stdio')
            [CompletionResult]::new('headless', 'headless', [CompletionResultType]::ParameterValue, 'Run the agent headlessly over the Grok WebSocket relay')
            [CompletionResult]::new('serve', 'serve', [CompletionResultType]::ParameterValue, 'Run the agent as a WebSocket server')
            [CompletionResult]::new('leader', 'leader', [CompletionResultType]::ParameterValue, 'Run as the shared leader process for other clients')
            [CompletionResult]::new('help', 'help', [CompletionResultType]::ParameterValue, 'Print this message or the help of the given subcommand(s)')
            break
        }
        'grok;agent;stdio' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;agent;headless' {
            [CompletionResult]::new('--grok-ws-origin', '--grok-ws-origin', [CompletionResultType]::ParameterName, 'grok-ws-origin')
            [CompletionResult]::new('--grok-ws-url', '--grok-ws-url', [CompletionResultType]::ParameterName, 'grok-ws-url')
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;agent;serve' {
            [CompletionResult]::new('--bind', '--bind', [CompletionResultType]::ParameterName, 'Address for the server to listen on')
            [CompletionResult]::new('--secret', '--secret', [CompletionResultType]::ParameterName, 'Secret token for client authentication (auto-generated if not provided)')
            [CompletionResult]::new('--remote', '--remote', [CompletionResultType]::ParameterName, 'Remote agent URL for proxy mode')
            [CompletionResult]::new('--grok-ws-origin', '--grok-ws-origin', [CompletionResultType]::ParameterName, 'grok-ws-origin')
            [CompletionResult]::new('--grok-ws-url', '--grok-ws-url', [CompletionResultType]::ParameterName, 'grok-ws-url')
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;agent;leader' {
            [CompletionResult]::new('--grok-ws-origin', '--grok-ws-origin', [CompletionResultType]::ParameterName, 'grok-ws-origin')
            [CompletionResult]::new('--grok-ws-url', '--grok-ws-url', [CompletionResultType]::ParameterName, 'grok-ws-url')
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--no-exit-on-disconnect', '--no-exit-on-disconnect', [CompletionResultType]::ParameterName, 'Keep the leader running after the last client disconnects')
            [CompletionResult]::new('--relay-on-demand', '--relay-on-demand', [CompletionResultType]::ParameterName, 'Defer the grok.com relay WebSocket until the first headless IPC client registers. Without this flag the leader connects the relay eagerly at startup ÔÇö required for bare leaders (headless remote env / systemd) that receive remote prompts *through* the relay. Passed by leaders auto-spawned from interactive clients (TUI/IDE), which only need the relay if a headless client appears')
            [CompletionResult]::new('--no-auto-update', '--no-auto-update', [CompletionResultType]::ParameterName, 'Disable periodic auto-update checks for the leader')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;agent;help' {
            [CompletionResult]::new('stdio', 'stdio', [CompletionResultType]::ParameterValue, 'Run the agent over stdio')
            [CompletionResult]::new('headless', 'headless', [CompletionResultType]::ParameterValue, 'Run the agent headlessly over the Grok WebSocket relay')
            [CompletionResult]::new('serve', 'serve', [CompletionResultType]::ParameterValue, 'Run the agent as a WebSocket server')
            [CompletionResult]::new('leader', 'leader', [CompletionResultType]::ParameterValue, 'Run as the shared leader process for other clients')
            [CompletionResult]::new('help', 'help', [CompletionResultType]::ParameterValue, 'Print this message or the help of the given subcommand(s)')
            break
        }
        'grok;agent;help;stdio' {
            break
        }
        'grok;agent;help;headless' {
            break
        }
        'grok;agent;help;serve' {
            break
        }
        'grok;agent;help;leader' {
            break
        }
        'grok;agent;help;help' {
            break
        }
        'grok;inspect' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--json', '--json', [CompletionResultType]::ParameterName, 'Emit machine-readable JSON output')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;doctor' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--json', '--json', [CompletionResultType]::ParameterName, 'Print the diagnostic report as JSON')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('fix', 'fix', [CompletionResultType]::ParameterValue, 'Apply an automatic fix')
            [CompletionResult]::new('help', 'help', [CompletionResultType]::ParameterValue, 'Print this message or the help of the given subcommand(s)')
            break
        }
        'grok;doctor;fix' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--yes', '--yes', [CompletionResultType]::ParameterName, 'Apply the displayed changes without confirmation')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;doctor;help' {
            [CompletionResult]::new('fix', 'fix', [CompletionResultType]::ParameterValue, 'Apply an automatic fix')
            [CompletionResult]::new('help', 'help', [CompletionResultType]::ParameterValue, 'Print this message or the help of the given subcommand(s)')
            break
        }
        'grok;doctor;help;fix' {
            break
        }
        'grok;doctor;help;help' {
            break
        }
        'grok;leader' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('list', 'list', [CompletionResultType]::ParameterValue, 'List running leader processes')
            [CompletionResult]::new('info', 'info', [CompletionResultType]::ParameterValue, 'Show details for a leader process')
            [CompletionResult]::new('kill', 'kill', [CompletionResultType]::ParameterValue, 'Stop all running leader processes')
            [CompletionResult]::new('help', 'help', [CompletionResultType]::ParameterValue, 'Print this message or the help of the given subcommand(s)')
            break
        }
        'grok;leader;list' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--json', '--json', [CompletionResultType]::ParameterName, 'Emit machine-readable JSON output')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;leader;info' {
            [CompletionResult]::new('--pid', '--pid', [CompletionResultType]::ParameterName, 'Leader process ID from `grok leader list`')
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--json', '--json', [CompletionResultType]::ParameterName, 'Emit machine-readable JSON output')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;leader;kill' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;leader;help' {
            [CompletionResult]::new('list', 'list', [CompletionResultType]::ParameterValue, 'List running leader processes')
            [CompletionResult]::new('info', 'info', [CompletionResultType]::ParameterValue, 'Show details for a leader process')
            [CompletionResult]::new('kill', 'kill', [CompletionResultType]::ParameterValue, 'Stop all running leader processes')
            [CompletionResult]::new('help', 'help', [CompletionResultType]::ParameterValue, 'Print this message or the help of the given subcommand(s)')
            break
        }
        'grok;leader;help;list' {
            break
        }
        'grok;leader;help;info' {
            break
        }
        'grok;leader;help;kill' {
            break
        }
        'grok;leader;help;help' {
            break
        }
        'grok;logout' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;login' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--legacy', '--legacy', [CompletionResultType]::ParameterName, 'Ignored (kept for backwards compatibility). OAuth2 is now the only auth method')
            [CompletionResult]::new('--oauth', '--oauth', [CompletionResultType]::ParameterName, 'Use Grok OAuth via auth.x.ai')
            [CompletionResult]::new('--device-auth', '--device-auth', [CompletionResultType]::ParameterName, 'Use device-code authentication for headless/remote environments')
            [CompletionResult]::new('--device-code', '--device-code', [CompletionResultType]::ParameterName, 'Use device-code authentication for headless/remote environments')
            [CompletionResult]::new('--devbox', '--devbox', [CompletionResultType]::ParameterName, 'Authenticate for remote development environments (hidden)')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;mcp' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('list', 'list', [CompletionResultType]::ParameterValue, 'List configured MCP servers')
            [CompletionResult]::new('add', 'add', [CompletionResultType]::ParameterValue, 'Add or update an MCP server')
            [CompletionResult]::new('remove', 'remove', [CompletionResultType]::ParameterValue, 'Remove an MCP server')
            [CompletionResult]::new('enable', 'enable', [CompletionResultType]::ParameterValue, 'Enable an MCP server')
            [CompletionResult]::new('disable', 'disable', [CompletionResultType]::ParameterValue, 'Disable an MCP server')
            [CompletionResult]::new('doctor', 'doctor', [CompletionResultType]::ParameterValue, 'Diagnose MCP server configuration and connectivity')
            [CompletionResult]::new('help', 'help', [CompletionResultType]::ParameterValue, 'Print this message or the help of the given subcommand(s)')
            break
        }
        'grok;mcp;list' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--json', '--json', [CompletionResultType]::ParameterName, 'Emit machine-readable JSON output')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;mcp;add' {
            [CompletionResult]::new('-t', '-t', [CompletionResultType]::ParameterName, 'Transport type. Defaults to stdio')
            [CompletionResult]::new('--transport', '--transport', [CompletionResultType]::ParameterName, 'Transport type. Defaults to stdio')
            [CompletionResult]::new('-s', '-s', [CompletionResultType]::ParameterName, 'Config to write to: user (~/.grok/config.toml) or project (./.grok/config.toml)')
            [CompletionResult]::new('--scope', '--scope', [CompletionResultType]::ParameterName, 'Config to write to: user (~/.grok/config.toml) or project (./.grok/config.toml)')
            [CompletionResult]::new('-e', '-e', [CompletionResultType]::ParameterName, 'Environment variable for the server process (repeatable)')
            [CompletionResult]::new('--env', '--env', [CompletionResultType]::ParameterName, 'Environment variable for the server process (repeatable)')
            [CompletionResult]::new('-H', '-H ', [CompletionResultType]::ParameterName, 'HTTP header for remote servers (repeatable)')
            [CompletionResult]::new('--header', '--header', [CompletionResultType]::ParameterName, 'HTTP header for remote servers (repeatable)')
            [CompletionResult]::new('--command', '--command', [CompletionResultType]::ParameterName, 'Legacy alias for the positional command argument')
            [CompletionResult]::new('--args', '--args', [CompletionResultType]::ParameterName, 'Legacy companion to --command')
            [CompletionResult]::new('--url', '--url', [CompletionResultType]::ParameterName, 'Legacy alias for adding a remote server by URL')
            [CompletionResult]::new('--type', '--type', [CompletionResultType]::ParameterName, 'Legacy transport type for --url servers')
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help (see more with ''--help'')')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help (see more with ''--help'')')
            break
        }
        'grok;mcp;remove' {
            [CompletionResult]::new('-s', '-s', [CompletionResultType]::ParameterName, 'Config to remove from. When omitted, all scopes are searched')
            [CompletionResult]::new('--scope', '--scope', [CompletionResultType]::ParameterName, 'Config to remove from. When omitted, all scopes are searched')
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help (see more with ''--help'')')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help (see more with ''--help'')')
            break
        }
        'grok;mcp;enable' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;mcp;disable' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;mcp;doctor' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--json', '--json', [CompletionResultType]::ParameterName, 'Emit machine-readable JSON output')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;mcp;help' {
            [CompletionResult]::new('list', 'list', [CompletionResultType]::ParameterValue, 'List configured MCP servers')
            [CompletionResult]::new('add', 'add', [CompletionResultType]::ParameterValue, 'Add or update an MCP server')
            [CompletionResult]::new('remove', 'remove', [CompletionResultType]::ParameterValue, 'Remove an MCP server')
            [CompletionResult]::new('enable', 'enable', [CompletionResultType]::ParameterValue, 'Enable an MCP server')
            [CompletionResult]::new('disable', 'disable', [CompletionResultType]::ParameterValue, 'Disable an MCP server')
            [CompletionResult]::new('doctor', 'doctor', [CompletionResultType]::ParameterValue, 'Diagnose MCP server configuration and connectivity')
            [CompletionResult]::new('help', 'help', [CompletionResultType]::ParameterValue, 'Print this message or the help of the given subcommand(s)')
            break
        }
        'grok;mcp;help;list' {
            break
        }
        'grok;mcp;help;add' {
            break
        }
        'grok;mcp;help;remove' {
            break
        }
        'grok;mcp;help;enable' {
            break
        }
        'grok;mcp;help;disable' {
            break
        }
        'grok;mcp;help;doctor' {
            break
        }
        'grok;mcp;help;help' {
            break
        }
        'grok;plugin' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('list', 'list', [CompletionResultType]::ParameterValue, 'List installed plugins')
            [CompletionResult]::new('install', 'install', [CompletionResultType]::ParameterValue, 'Install a plugin from a git URL or local path')
            [CompletionResult]::new('uninstall', 'uninstall', [CompletionResultType]::ParameterValue, 'Uninstall an installed plugin by name')
            [CompletionResult]::new('rm', 'rm', [CompletionResultType]::ParameterValue, 'Uninstall an installed plugin by name')
            [CompletionResult]::new('remove', 'remove', [CompletionResultType]::ParameterValue, 'Uninstall an installed plugin by name')
            [CompletionResult]::new('update', 'update', [CompletionResultType]::ParameterValue, 'Update installed plugin(s)')
            [CompletionResult]::new('enable', 'enable', [CompletionResultType]::ParameterValue, 'Enable a disabled plugin')
            [CompletionResult]::new('disable', 'disable', [CompletionResultType]::ParameterValue, 'Disable a plugin without uninstalling it')
            [CompletionResult]::new('details', 'details', [CompletionResultType]::ParameterValue, 'Show a plugin''s component inventory')
            [CompletionResult]::new('validate', 'validate', [CompletionResultType]::ParameterValue, 'Validate a plugin manifest')
            [CompletionResult]::new('tag', 'tag', [CompletionResultType]::ParameterValue, 'Create a release git tag from the plugin''s manifest version')
            [CompletionResult]::new('marketplace', 'marketplace', [CompletionResultType]::ParameterValue, 'Manage marketplace sources')
            [CompletionResult]::new('help', 'help', [CompletionResultType]::ParameterValue, 'Print this message or the help of the given subcommand(s)')
            break
        }
        'grok;plugin;list' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--json', '--json', [CompletionResultType]::ParameterName, 'Emit machine-readable JSON output')
            [CompletionResult]::new('--available', '--available', [CompletionResultType]::ParameterName, 'Include available plugins from marketplace sources. Requires --json')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;plugin;install' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--trust', '--trust', [CompletionResultType]::ParameterName, 'Trust the plugin immediately (skip confirmation prompt)')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;plugin;uninstall' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--confirm', '--confirm', [CompletionResultType]::ParameterName, 'Skip confirmation for multi-plugin repos')
            [CompletionResult]::new('--keep-data', '--keep-data', [CompletionResultType]::ParameterName, 'Preserve the plugin''s persistent data directory')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;plugin;rm' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--confirm', '--confirm', [CompletionResultType]::ParameterName, 'Skip confirmation for multi-plugin repos')
            [CompletionResult]::new('--keep-data', '--keep-data', [CompletionResultType]::ParameterName, 'Preserve the plugin''s persistent data directory')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;plugin;remove' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--confirm', '--confirm', [CompletionResultType]::ParameterName, 'Skip confirmation for multi-plugin repos')
            [CompletionResult]::new('--keep-data', '--keep-data', [CompletionResultType]::ParameterName, 'Preserve the plugin''s persistent data directory')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;plugin;update' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;plugin;enable' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;plugin;disable' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;plugin;details' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;plugin;validate' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;plugin;tag' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--push', '--push', [CompletionResultType]::ParameterName, 'Push the tag to the remote after creating it')
            [CompletionResult]::new('-f', '-f', [CompletionResultType]::ParameterName, 'Create the tag even if the working tree is dirty or tag exists')
            [CompletionResult]::new('--force', '--force', [CompletionResultType]::ParameterName, 'Create the tag even if the working tree is dirty or tag exists')
            [CompletionResult]::new('--dry-run', '--dry-run', [CompletionResultType]::ParameterName, 'Print what would be tagged without creating the tag')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;plugin;marketplace' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('list', 'list', [CompletionResultType]::ParameterValue, 'List configured marketplace sources and their plugins')
            [CompletionResult]::new('add', 'add', [CompletionResultType]::ParameterValue, 'Add a marketplace source (git URL, GitHub shorthand, or local path)')
            [CompletionResult]::new('remove', 'remove', [CompletionResultType]::ParameterValue, 'Remove a marketplace source and uninstall its plugins')
            [CompletionResult]::new('update', 'update', [CompletionResultType]::ParameterValue, 'Refresh marketplace source(s) and sync git caches')
            [CompletionResult]::new('help', 'help', [CompletionResultType]::ParameterValue, 'Print this message or the help of the given subcommand(s)')
            break
        }
        'grok;plugin;marketplace;list' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--json', '--json', [CompletionResultType]::ParameterName, 'Emit machine-readable JSON output')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;plugin;marketplace;add' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--force', '--force', [CompletionResultType]::ParameterName, 'Skip the reachability probe (e.g. for hosts only reachable on VPN)')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;plugin;marketplace;remove' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;plugin;marketplace;update' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;plugin;marketplace;help' {
            [CompletionResult]::new('list', 'list', [CompletionResultType]::ParameterValue, 'List configured marketplace sources and their plugins')
            [CompletionResult]::new('add', 'add', [CompletionResultType]::ParameterValue, 'Add a marketplace source (git URL, GitHub shorthand, or local path)')
            [CompletionResult]::new('remove', 'remove', [CompletionResultType]::ParameterValue, 'Remove a marketplace source and uninstall its plugins')
            [CompletionResult]::new('update', 'update', [CompletionResultType]::ParameterValue, 'Refresh marketplace source(s) and sync git caches')
            [CompletionResult]::new('help', 'help', [CompletionResultType]::ParameterValue, 'Print this message or the help of the given subcommand(s)')
            break
        }
        'grok;plugin;marketplace;help;list' {
            break
        }
        'grok;plugin;marketplace;help;add' {
            break
        }
        'grok;plugin;marketplace;help;remove' {
            break
        }
        'grok;plugin;marketplace;help;update' {
            break
        }
        'grok;plugin;marketplace;help;help' {
            break
        }
        'grok;plugin;help' {
            [CompletionResult]::new('list', 'list', [CompletionResultType]::ParameterValue, 'List installed plugins')
            [CompletionResult]::new('install', 'install', [CompletionResultType]::ParameterValue, 'Install a plugin from a git URL or local path')
            [CompletionResult]::new('uninstall', 'uninstall', [CompletionResultType]::ParameterValue, 'Uninstall an installed plugin by name')
            [CompletionResult]::new('update', 'update', [CompletionResultType]::ParameterValue, 'Update installed plugin(s)')
            [CompletionResult]::new('enable', 'enable', [CompletionResultType]::ParameterValue, 'Enable a disabled plugin')
            [CompletionResult]::new('disable', 'disable', [CompletionResultType]::ParameterValue, 'Disable a plugin without uninstalling it')
            [CompletionResult]::new('details', 'details', [CompletionResultType]::ParameterValue, 'Show a plugin''s component inventory')
            [CompletionResult]::new('validate', 'validate', [CompletionResultType]::ParameterValue, 'Validate a plugin manifest')
            [CompletionResult]::new('tag', 'tag', [CompletionResultType]::ParameterValue, 'Create a release git tag from the plugin''s manifest version')
            [CompletionResult]::new('marketplace', 'marketplace', [CompletionResultType]::ParameterValue, 'Manage marketplace sources')
            [CompletionResult]::new('help', 'help', [CompletionResultType]::ParameterValue, 'Print this message or the help of the given subcommand(s)')
            break
        }
        'grok;plugin;help;list' {
            break
        }
        'grok;plugin;help;install' {
            break
        }
        'grok;plugin;help;uninstall' {
            break
        }
        'grok;plugin;help;update' {
            break
        }
        'grok;plugin;help;enable' {
            break
        }
        'grok;plugin;help;disable' {
            break
        }
        'grok;plugin;help;details' {
            break
        }
        'grok;plugin;help;validate' {
            break
        }
        'grok;plugin;help;tag' {
            break
        }
        'grok;plugin;help;marketplace' {
            [CompletionResult]::new('list', 'list', [CompletionResultType]::ParameterValue, 'List configured marketplace sources and their plugins')
            [CompletionResult]::new('add', 'add', [CompletionResultType]::ParameterValue, 'Add a marketplace source (git URL, GitHub shorthand, or local path)')
            [CompletionResult]::new('remove', 'remove', [CompletionResultType]::ParameterValue, 'Remove a marketplace source and uninstall its plugins')
            [CompletionResult]::new('update', 'update', [CompletionResultType]::ParameterValue, 'Refresh marketplace source(s) and sync git caches')
            break
        }
        'grok;plugin;help;marketplace;list' {
            break
        }
        'grok;plugin;help;marketplace;add' {
            break
        }
        'grok;plugin;help;marketplace;remove' {
            break
        }
        'grok;plugin;help;marketplace;update' {
            break
        }
        'grok;plugin;help;help' {
            break
        }
        'grok;memory' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('clear', 'clear', [CompletionResultType]::ParameterValue, 'Clear memory files (workspace by default)')
            [CompletionResult]::new('help', 'help', [CompletionResultType]::ParameterValue, 'Print this message or the help of the given subcommand(s)')
            break
        }
        'grok;memory;clear' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--workspace', '--workspace', [CompletionResultType]::ParameterName, 'Clear workspace-scoped memory (MEMORY.md, sessions/, index.sqlite)')
            [CompletionResult]::new('--global', '--global', [CompletionResultType]::ParameterName, 'Clear global MEMORY.md')
            [CompletionResult]::new('--all', '--all', [CompletionResultType]::ParameterName, 'Clear both workspace and global memory')
            [CompletionResult]::new('-y', '-y', [CompletionResultType]::ParameterName, 'Skip confirmation prompt')
            [CompletionResult]::new('--yes', '--yes', [CompletionResultType]::ParameterName, 'Skip confirmation prompt')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;memory;help' {
            [CompletionResult]::new('clear', 'clear', [CompletionResultType]::ParameterValue, 'Clear memory files (workspace by default)')
            [CompletionResult]::new('help', 'help', [CompletionResultType]::ParameterValue, 'Print this message or the help of the given subcommand(s)')
            break
        }
        'grok;memory;help;clear' {
            break
        }
        'grok;memory;help;help' {
            break
        }
        'grok;models' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;sessions' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('list', 'list', [CompletionResultType]::ParameterValue, 'List recent sessions (same as search with no query)')
            [CompletionResult]::new('search', 'search', [CompletionResultType]::ParameterValue, 'Search sessions by keyword')
            [CompletionResult]::new('delete', 'delete', [CompletionResultType]::ParameterValue, 'Permanently delete a session from history')
            [CompletionResult]::new('help', 'help', [CompletionResultType]::ParameterValue, 'Print this message or the help of the given subcommand(s)')
            break
        }
        'grok;sessions;list' {
            [CompletionResult]::new('-n', '-n', [CompletionResultType]::ParameterName, 'Maximum number of sessions to show')
            [CompletionResult]::new('--limit', '--limit', [CompletionResultType]::ParameterName, 'Maximum number of sessions to show')
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;sessions;search' {
            [CompletionResult]::new('-n', '-n', [CompletionResultType]::ParameterName, 'Maximum number of sessions to show')
            [CompletionResult]::new('--limit', '--limit', [CompletionResultType]::ParameterName, 'Maximum number of sessions to show')
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;sessions;delete' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;sessions;help' {
            [CompletionResult]::new('list', 'list', [CompletionResultType]::ParameterValue, 'List recent sessions (same as search with no query)')
            [CompletionResult]::new('search', 'search', [CompletionResultType]::ParameterValue, 'Search sessions by keyword')
            [CompletionResult]::new('delete', 'delete', [CompletionResultType]::ParameterValue, 'Permanently delete a session from history')
            [CompletionResult]::new('help', 'help', [CompletionResultType]::ParameterValue, 'Print this message or the help of the given subcommand(s)')
            break
        }
        'grok;sessions;help;list' {
            break
        }
        'grok;sessions;help;search' {
            break
        }
        'grok;sessions;help;delete' {
            break
        }
        'grok;sessions;help;help' {
            break
        }
        'grok;setup' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--json', '--json', [CompletionResultType]::ParameterName, 'Print the fetched configuration as JSON instead of installing it; writes nothing to ~/.grok')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;share' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;wrap' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help (see more with ''--help'')')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help (see more with ''--help'')')
            break
        }
        'grok;export' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('-c', '-c', [CompletionResultType]::ParameterName, 'Copy to clipboard instead of writing to stdout')
            [CompletionResult]::new('--clipboard', '--clipboard', [CompletionResultType]::ParameterName, 'Copy to clipboard instead of writing to stdout')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;trace' {
            [CompletionResult]::new('-o', '-o', [CompletionResultType]::ParameterName, 'Output path (default: $GROK_HOME/trace-exports/<session-id>.tar.gz)')
            [CompletionResult]::new('--output', '--output', [CompletionResultType]::ParameterName, 'Output path (default: $GROK_HOME/trace-exports/<session-id>.tar.gz)')
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--local', '--local', [CompletionResultType]::ParameterName, 'Save locally only, skip remote upload')
            [CompletionResult]::new('--json', '--json', [CompletionResultType]::ParameterName, 'Emit machine-readable JSON output')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;update' {
            [CompletionResult]::new('--version', '--version', [CompletionResultType]::ParameterName, 'Install a specific version (e.g. 0.1.150 or 0.1.151-alpha.2)')
            [CompletionResult]::new('--trigger', '--trigger', [CompletionResultType]::ParameterName, 'Internal: what spawned this `grok update` (`user_command`, `auto_background`, `leader_converge`). Hidden')
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--check', '--check', [CompletionResultType]::ParameterName, 'Check for updates without installing')
            [CompletionResult]::new('--json', '--json', [CompletionResultType]::ParameterName, 'Emit machine-readable JSON output (for --check)')
            [CompletionResult]::new('--force-reinstall', '--force-reinstall', [CompletionResultType]::ParameterName, 'Force re-download and install even if already up to date')
            [CompletionResult]::new('--alpha', '--alpha', [CompletionResultType]::ParameterName, 'Switch to the alpha release channel (faster updates, may have bugs)')
            [CompletionResult]::new('--stable', '--stable', [CompletionResultType]::ParameterName, 'Switch to the stable release channel (default, weekly releases)')
            [CompletionResult]::new('--enterprise', '--enterprise', [CompletionResultType]::ParameterName, 'Switch to the enterprise release channel')
            [CompletionResult]::new('--auto', '--auto', [CompletionResultType]::ParameterName, 'Internal compat alias for `--trigger=auto_background` (older parents still spawn children with it)')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;version' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--json', '--json', [CompletionResultType]::ParameterName, 'Emit machine-readable JSON output')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;v' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--json', '--json', [CompletionResultType]::ParameterName, 'Emit machine-readable JSON output')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;completions' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;worktree' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('list', 'list', [CompletionResultType]::ParameterValue, 'List tracked worktrees')
            [CompletionResult]::new('ls', 'ls', [CompletionResultType]::ParameterValue, 'List tracked worktrees')
            [CompletionResult]::new('show', 'show', [CompletionResultType]::ParameterValue, 'Show details for a specific worktree')
            [CompletionResult]::new('rm', 'rm', [CompletionResultType]::ParameterValue, 'Remove worktrees')
            [CompletionResult]::new('gc', 'gc', [CompletionResultType]::ParameterValue, 'Remove expired worktrees, keeping any whose work would not survive')
            [CompletionResult]::new('db', 'db', [CompletionResultType]::ParameterValue, 'Database maintenance')
            [CompletionResult]::new('help', 'help', [CompletionResultType]::ParameterValue, 'Print this message or the help of the given subcommand(s)')
            break
        }
        'grok;worktree;list' {
            [CompletionResult]::new('--repo', '--repo', [CompletionResultType]::ParameterName, 'repo')
            [CompletionResult]::new('--type', '--type', [CompletionResultType]::ParameterName, 'type')
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--json', '--json', [CompletionResultType]::ParameterName, 'json')
            [CompletionResult]::new('--all', '--all', [CompletionResultType]::ParameterName, 'all')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;worktree;ls' {
            [CompletionResult]::new('--repo', '--repo', [CompletionResultType]::ParameterName, 'repo')
            [CompletionResult]::new('--type', '--type', [CompletionResultType]::ParameterName, 'type')
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--json', '--json', [CompletionResultType]::ParameterName, 'json')
            [CompletionResult]::new('--all', '--all', [CompletionResultType]::ParameterName, 'all')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;worktree;show' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;worktree;rm' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('-f', '-f', [CompletionResultType]::ParameterName, 'f')
            [CompletionResult]::new('--force', '--force', [CompletionResultType]::ParameterName, 'force')
            [CompletionResult]::new('--dry-run', '--dry-run', [CompletionResultType]::ParameterName, 'dry-run')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;worktree;gc' {
            [CompletionResult]::new('--max-age', '--max-age', [CompletionResultType]::ParameterName, 'Expire worktrees idle longer than this, e.g. `7d`. Without it, nothing expires')
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--dry-run', '--dry-run', [CompletionResultType]::ParameterName, 'Report what would be removed without removing it')
            [CompletionResult]::new('-f', '-f', [CompletionResultType]::ParameterName, 'Skip the live-process and protected-path guards. This does not override the safety check; use `grok worktree rm` for that')
            [CompletionResult]::new('--force', '--force', [CompletionResultType]::ParameterName, 'Skip the live-process and protected-path guards. This does not override the safety check; use `grok worktree rm` for that')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;worktree;db' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('rebuild', 'rebuild', [CompletionResultType]::ParameterValue, 'Rebuild DB from filesystem scan')
            [CompletionResult]::new('stats', 'stats', [CompletionResultType]::ParameterValue, 'Show DB statistics')
            [CompletionResult]::new('path', 'path', [CompletionResultType]::ParameterValue, 'Print DB file path')
            [CompletionResult]::new('help', 'help', [CompletionResultType]::ParameterValue, 'Print this message or the help of the given subcommand(s)')
            break
        }
        'grok;worktree;db;rebuild' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;worktree;db;stats' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;worktree;db;path' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;worktree;db;help' {
            [CompletionResult]::new('rebuild', 'rebuild', [CompletionResultType]::ParameterValue, 'Rebuild DB from filesystem scan')
            [CompletionResult]::new('stats', 'stats', [CompletionResultType]::ParameterValue, 'Show DB statistics')
            [CompletionResult]::new('path', 'path', [CompletionResultType]::ParameterValue, 'Print DB file path')
            [CompletionResult]::new('help', 'help', [CompletionResultType]::ParameterValue, 'Print this message or the help of the given subcommand(s)')
            break
        }
        'grok;worktree;db;help;rebuild' {
            break
        }
        'grok;worktree;db;help;stats' {
            break
        }
        'grok;worktree;db;help;path' {
            break
        }
        'grok;worktree;db;help;help' {
            break
        }
        'grok;worktree;help' {
            [CompletionResult]::new('list', 'list', [CompletionResultType]::ParameterValue, 'List tracked worktrees')
            [CompletionResult]::new('show', 'show', [CompletionResultType]::ParameterValue, 'Show details for a specific worktree')
            [CompletionResult]::new('rm', 'rm', [CompletionResultType]::ParameterValue, 'Remove worktrees')
            [CompletionResult]::new('gc', 'gc', [CompletionResultType]::ParameterValue, 'Remove expired worktrees, keeping any whose work would not survive')
            [CompletionResult]::new('db', 'db', [CompletionResultType]::ParameterValue, 'Database maintenance')
            [CompletionResult]::new('help', 'help', [CompletionResultType]::ParameterValue, 'Print this message or the help of the given subcommand(s)')
            break
        }
        'grok;worktree;help;list' {
            break
        }
        'grok;worktree;help;show' {
            break
        }
        'grok;worktree;help;rm' {
            break
        }
        'grok;worktree;help;gc' {
            break
        }
        'grok;worktree;help;db' {
            [CompletionResult]::new('rebuild', 'rebuild', [CompletionResultType]::ParameterValue, 'Rebuild DB from filesystem scan')
            [CompletionResult]::new('stats', 'stats', [CompletionResultType]::ParameterValue, 'Show DB statistics')
            [CompletionResult]::new('path', 'path', [CompletionResultType]::ParameterValue, 'Print DB file path')
            break
        }
        'grok;worktree;help;db;rebuild' {
            break
        }
        'grok;worktree;help;db;stats' {
            break
        }
        'grok;worktree;help;db;path' {
            break
        }
        'grok;worktree;help;help' {
            break
        }
        'grok;du' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--json', '--json', [CompletionResultType]::ParameterName, 'Emit machine-readable JSON output')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;disk-usage' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--json', '--json', [CompletionResultType]::ParameterName, 'Emit machine-readable JSON output')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;workspace' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help (see more with ''--help'')')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help (see more with ''--help'')')
            [CompletionResult]::new('start', 'start', [CompletionResultType]::ParameterValue, 'Start (or update) the workspaceÔåÆhub exposure')
            [CompletionResult]::new('pause', 'pause', [CompletionResultType]::ParameterValue, 'Drain and disconnect from the hub, keeping the exposure warm')
            [CompletionResult]::new('resume', 'resume', [CompletionResultType]::ParameterValue, 'Reconnect a paused exposure to the hub')
            [CompletionResult]::new('stop', 'stop', [CompletionResultType]::ParameterValue, 'Stop exposing the workspace (the leader keeps running)')
            [CompletionResult]::new('restart', 'restart', [CompletionResultType]::ParameterValue, 'Restart the exposure (stop, then start with the given options)')
            [CompletionResult]::new('status', 'status', [CompletionResultType]::ParameterValue, 'Show the current workspace-exposure status')
            [CompletionResult]::new('list', 'list', [CompletionResultType]::ParameterValue, 'Show the current workspace-exposure status')
            [CompletionResult]::new('help', 'help', [CompletionResultType]::ParameterValue, 'Print this message or the help of the given subcommand(s)')
            break
        }
        'grok;workspace;start' {
            [CompletionResult]::new('--hub-url', '--hub-url', [CompletionResultType]::ParameterName, 'Computer Hub WebSocket URL (default: `[hub].url`, then the prod hub)')
            [CompletionResult]::new('--cwd', '--cwd', [CompletionResultType]::ParameterName, 'Workspace root directory to expose. Defaults to the current directory')
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--leader', '--leader', [CompletionResultType]::ParameterName, 'Force leader mode for this command, overriding config')
            [CompletionResult]::new('--no-leader', '--no-leader', [CompletionResultType]::ParameterName, 'Refuse to start even when config enables leader mode')
            [CompletionResult]::new('--json', '--json', [CompletionResultType]::ParameterName, 'Emit machine-readable JSON output')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;workspace;pause' {
            [CompletionResult]::new('--pid', '--pid', [CompletionResultType]::ParameterName, 'Leader process ID from `grok leader list`')
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--json', '--json', [CompletionResultType]::ParameterName, 'Emit machine-readable JSON output')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;workspace;resume' {
            [CompletionResult]::new('--pid', '--pid', [CompletionResultType]::ParameterName, 'Leader process ID from `grok leader list`')
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--json', '--json', [CompletionResultType]::ParameterName, 'Emit machine-readable JSON output')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;workspace;stop' {
            [CompletionResult]::new('--pid', '--pid', [CompletionResultType]::ParameterName, 'Leader process ID from `grok leader list`')
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--json', '--json', [CompletionResultType]::ParameterName, 'Emit machine-readable JSON output')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;workspace;restart' {
            [CompletionResult]::new('--hub-url', '--hub-url', [CompletionResultType]::ParameterName, 'Computer Hub WebSocket URL (default: `[hub].url`, then the prod hub)')
            [CompletionResult]::new('--cwd', '--cwd', [CompletionResultType]::ParameterName, 'Workspace root directory to expose. Defaults to the current directory')
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--leader', '--leader', [CompletionResultType]::ParameterName, 'Force leader mode for this command, overriding config')
            [CompletionResult]::new('--no-leader', '--no-leader', [CompletionResultType]::ParameterName, 'Refuse to start even when config enables leader mode')
            [CompletionResult]::new('--json', '--json', [CompletionResultType]::ParameterName, 'Emit machine-readable JSON output')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;workspace;status' {
            [CompletionResult]::new('--pid', '--pid', [CompletionResultType]::ParameterName, 'Leader process ID from `grok leader list`')
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--json', '--json', [CompletionResultType]::ParameterName, 'Emit machine-readable JSON output')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;workspace;list' {
            [CompletionResult]::new('--pid', '--pid', [CompletionResultType]::ParameterName, 'Leader process ID from `grok leader list`')
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--json', '--json', [CompletionResultType]::ParameterName, 'Emit machine-readable JSON output')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help')
            break
        }
        'grok;workspace;help' {
            [CompletionResult]::new('start', 'start', [CompletionResultType]::ParameterValue, 'Start (or update) the workspaceÔåÆhub exposure')
            [CompletionResult]::new('pause', 'pause', [CompletionResultType]::ParameterValue, 'Drain and disconnect from the hub, keeping the exposure warm')
            [CompletionResult]::new('resume', 'resume', [CompletionResultType]::ParameterValue, 'Reconnect a paused exposure to the hub')
            [CompletionResult]::new('stop', 'stop', [CompletionResultType]::ParameterValue, 'Stop exposing the workspace (the leader keeps running)')
            [CompletionResult]::new('restart', 'restart', [CompletionResultType]::ParameterValue, 'Restart the exposure (stop, then start with the given options)')
            [CompletionResult]::new('status', 'status', [CompletionResultType]::ParameterValue, 'Show the current workspace-exposure status')
            [CompletionResult]::new('help', 'help', [CompletionResultType]::ParameterValue, 'Print this message or the help of the given subcommand(s)')
            break
        }
        'grok;workspace;help;start' {
            break
        }
        'grok;workspace;help;pause' {
            break
        }
        'grok;workspace;help;resume' {
            break
        }
        'grok;workspace;help;stop' {
            break
        }
        'grok;workspace;help;restart' {
            break
        }
        'grok;workspace;help;status' {
            break
        }
        'grok;workspace;help;help' {
            break
        }
        'grok;dashboard' {
            [CompletionResult]::new('--leader-socket', '--leader-socket', [CompletionResultType]::ParameterName, 'Use a custom leader socket path instead of the default `~/.grok/leader.sock`')
            [CompletionResult]::new('--debug-file', '--debug-file', [CompletionResultType]::ParameterName, 'Write debug logs to FILE')
            [CompletionResult]::new('--debug', '--debug', [CompletionResultType]::ParameterName, 'Enable debug logging')
            [CompletionResult]::new('-h', '-h', [CompletionResultType]::ParameterName, 'Print help (see more with ''--help'')')
            [CompletionResult]::new('--help', '--help', [CompletionResultType]::ParameterName, 'Print help (see more with ''--help'')')
            break
        }
        'grok;help' {
            [CompletionResult]::new('agent', 'agent', [CompletionResultType]::ParameterValue, 'Run Grok without the interactive UI')
            [CompletionResult]::new('inspect', 'inspect', [CompletionResultType]::ParameterValue, 'Show the configuration Grok discovers for this directory')
            [CompletionResult]::new('doctor', 'doctor', [CompletionResultType]::ParameterValue, 'Check terminal, clipboard, color, and input support without starting Grok')
            [CompletionResult]::new('leader', 'leader', [CompletionResultType]::ParameterValue, 'Manage running leader processes')
            [CompletionResult]::new('logout', 'logout', [CompletionResultType]::ParameterValue, 'Sign out and clear cached credentials')
            [CompletionResult]::new('login', 'login', [CompletionResultType]::ParameterValue, 'Sign in to Grok')
            [CompletionResult]::new('mcp', 'mcp', [CompletionResultType]::ParameterValue, 'Manage MCP server configurations')
            [CompletionResult]::new('plugin', 'plugin', [CompletionResultType]::ParameterValue, 'Manage plugins and marketplace sources')
            [CompletionResult]::new('memory', 'memory', [CompletionResultType]::ParameterValue, 'Manage cross-session memory')
            [CompletionResult]::new('models', 'models', [CompletionResultType]::ParameterValue, 'List available models and exit')
            [CompletionResult]::new('sessions', 'sessions', [CompletionResultType]::ParameterValue, 'List, search, or restore sessions')
            [CompletionResult]::new('setup', 'setup', [CompletionResultType]::ParameterValue, 'Fetch and install managed configuration')
            [CompletionResult]::new('share', 'share', [CompletionResultType]::ParameterValue, 'Share a session and print the share URL')
            [CompletionResult]::new('wrap', 'wrap', [CompletionResultType]::ParameterValue, 'Run any command with local clipboard support (OSC 52 ÔåÆ system clipboard)')
            [CompletionResult]::new('export', 'export', [CompletionResultType]::ParameterValue, 'Export a session transcript as Markdown')
            [CompletionResult]::new('trace', 'trace', [CompletionResultType]::ParameterValue, 'Export or upload session trace data')
            [CompletionResult]::new('update', 'update', [CompletionResultType]::ParameterValue, 'Check for updates or install a specific version')
            [CompletionResult]::new('version', 'version', [CompletionResultType]::ParameterValue, 'Print version information')
            [CompletionResult]::new('completions', 'completions', [CompletionResultType]::ParameterValue, 'Generate shell completion scripts (bash, zsh, fish, powershell, ...)')
            [CompletionResult]::new('worktree', 'worktree', [CompletionResultType]::ParameterValue, 'Manage git worktrees')
            [CompletionResult]::new('du', 'du', [CompletionResultType]::ParameterValue, 'Show what the grok home (~/.grok) uses on disk')
            [CompletionResult]::new('workspace', 'workspace', [CompletionResultType]::ParameterValue, 'Expose this workspace to the Computer Hub (via the leader)')
            [CompletionResult]::new('dashboard', 'dashboard', [CompletionResultType]::ParameterValue, 'Open the Agent Dashboard view at startup')
            [CompletionResult]::new('help', 'help', [CompletionResultType]::ParameterValue, 'Print this message or the help of the given subcommand(s)')
            break
        }
        'grok;help;agent' {
            [CompletionResult]::new('stdio', 'stdio', [CompletionResultType]::ParameterValue, 'Run the agent over stdio')
            [CompletionResult]::new('headless', 'headless', [CompletionResultType]::ParameterValue, 'Run the agent headlessly over the Grok WebSocket relay')
            [CompletionResult]::new('serve', 'serve', [CompletionResultType]::ParameterValue, 'Run the agent as a WebSocket server')
            [CompletionResult]::new('leader', 'leader', [CompletionResultType]::ParameterValue, 'Run as the shared leader process for other clients')
            break
        }
        'grok;help;agent;stdio' {
            break
        }
        'grok;help;agent;headless' {
            break
        }
        'grok;help;agent;serve' {
            break
        }
        'grok;help;agent;leader' {
            break
        }
        'grok;help;inspect' {
            break
        }
        'grok;help;doctor' {
            [CompletionResult]::new('fix', 'fix', [CompletionResultType]::ParameterValue, 'Apply an automatic fix')
            break
        }
        'grok;help;doctor;fix' {
            break
        }
        'grok;help;leader' {
            [CompletionResult]::new('list', 'list', [CompletionResultType]::ParameterValue, 'List running leader processes')
            [CompletionResult]::new('info', 'info', [CompletionResultType]::ParameterValue, 'Show details for a leader process')
            [CompletionResult]::new('kill', 'kill', [CompletionResultType]::ParameterValue, 'Stop all running leader processes')
            break
        }
        'grok;help;leader;list' {
            break
        }
        'grok;help;leader;info' {
            break
        }
        'grok;help;leader;kill' {
            break
        }
        'grok;help;logout' {
            break
        }
        'grok;help;login' {
            break
        }
        'grok;help;mcp' {
            [CompletionResult]::new('list', 'list', [CompletionResultType]::ParameterValue, 'List configured MCP servers')
            [CompletionResult]::new('add', 'add', [CompletionResultType]::ParameterValue, 'Add or update an MCP server')
            [CompletionResult]::new('remove', 'remove', [CompletionResultType]::ParameterValue, 'Remove an MCP server')
            [CompletionResult]::new('enable', 'enable', [CompletionResultType]::ParameterValue, 'Enable an MCP server')
            [CompletionResult]::new('disable', 'disable', [CompletionResultType]::ParameterValue, 'Disable an MCP server')
            [CompletionResult]::new('doctor', 'doctor', [CompletionResultType]::ParameterValue, 'Diagnose MCP server configuration and connectivity')
            break
        }
        'grok;help;mcp;list' {
            break
        }
        'grok;help;mcp;add' {
            break
        }
        'grok;help;mcp;remove' {
            break
        }
        'grok;help;mcp;enable' {
            break
        }
        'grok;help;mcp;disable' {
            break
        }
        'grok;help;mcp;doctor' {
            break
        }
        'grok;help;plugin' {
            [CompletionResult]::new('list', 'list', [CompletionResultType]::ParameterValue, 'List installed plugins')
            [CompletionResult]::new('install', 'install', [CompletionResultType]::ParameterValue, 'Install a plugin from a git URL or local path')
            [CompletionResult]::new('uninstall', 'uninstall', [CompletionResultType]::ParameterValue, 'Uninstall an installed plugin by name')
            [CompletionResult]::new('update', 'update', [CompletionResultType]::ParameterValue, 'Update installed plugin(s)')
            [CompletionResult]::new('enable', 'enable', [CompletionResultType]::ParameterValue, 'Enable a disabled plugin')
            [CompletionResult]::new('disable', 'disable', [CompletionResultType]::ParameterValue, 'Disable a plugin without uninstalling it')
            [CompletionResult]::new('details', 'details', [CompletionResultType]::ParameterValue, 'Show a plugin''s component inventory')
            [CompletionResult]::new('validate', 'validate', [CompletionResultType]::ParameterValue, 'Validate a plugin manifest')
            [CompletionResult]::new('tag', 'tag', [CompletionResultType]::ParameterValue, 'Create a release git tag from the plugin''s manifest version')
            [CompletionResult]::new('marketplace', 'marketplace', [CompletionResultType]::ParameterValue, 'Manage marketplace sources')
            break
        }
        'grok;help;plugin;list' {
            break
        }
        'grok;help;plugin;install' {
            break
        }
        'grok;help;plugin;uninstall' {
            break
        }
        'grok;help;plugin;update' {
            break
        }
        'grok;help;plugin;enable' {
            break
        }
        'grok;help;plugin;disable' {
            break
        }
        'grok;help;plugin;details' {
            break
        }
        'grok;help;plugin;validate' {
            break
        }
        'grok;help;plugin;tag' {
            break
        }
        'grok;help;plugin;marketplace' {
            [CompletionResult]::new('list', 'list', [CompletionResultType]::ParameterValue, 'List configured marketplace sources and their plugins')
            [CompletionResult]::new('add', 'add', [CompletionResultType]::ParameterValue, 'Add a marketplace source (git URL, GitHub shorthand, or local path)')
            [CompletionResult]::new('remove', 'remove', [CompletionResultType]::ParameterValue, 'Remove a marketplace source and uninstall its plugins')
            [CompletionResult]::new('update', 'update', [CompletionResultType]::ParameterValue, 'Refresh marketplace source(s) and sync git caches')
            break
        }
        'grok;help;plugin;marketplace;list' {
            break
        }
        'grok;help;plugin;marketplace;add' {
            break
        }
        'grok;help;plugin;marketplace;remove' {
            break
        }
        'grok;help;plugin;marketplace;update' {
            break
        }
        'grok;help;memory' {
            [CompletionResult]::new('clear', 'clear', [CompletionResultType]::ParameterValue, 'Clear memory files (workspace by default)')
            break
        }
        'grok;help;memory;clear' {
            break
        }
        'grok;help;models' {
            break
        }
        'grok;help;sessions' {
            [CompletionResult]::new('list', 'list', [CompletionResultType]::ParameterValue, 'List recent sessions (same as search with no query)')
            [CompletionResult]::new('search', 'search', [CompletionResultType]::ParameterValue, 'Search sessions by keyword')
            [CompletionResult]::new('delete', 'delete', [CompletionResultType]::ParameterValue, 'Permanently delete a session from history')
            break
        }
        'grok;help;sessions;list' {
            break
        }
        'grok;help;sessions;search' {
            break
        }
        'grok;help;sessions;delete' {
            break
        }
        'grok;help;setup' {
            break
        }
        'grok;help;share' {
            break
        }
        'grok;help;wrap' {
            break
        }
        'grok;help;export' {
            break
        }
        'grok;help;trace' {
            break
        }
        'grok;help;update' {
            break
        }
        'grok;help;version' {
            break
        }
        'grok;help;completions' {
            break
        }
        'grok;help;worktree' {
            [CompletionResult]::new('list', 'list', [CompletionResultType]::ParameterValue, 'List tracked worktrees')
            [CompletionResult]::new('show', 'show', [CompletionResultType]::ParameterValue, 'Show details for a specific worktree')
            [CompletionResult]::new('rm', 'rm', [CompletionResultType]::ParameterValue, 'Remove worktrees')
            [CompletionResult]::new('gc', 'gc', [CompletionResultType]::ParameterValue, 'Remove expired worktrees, keeping any whose work would not survive')
            [CompletionResult]::new('db', 'db', [CompletionResultType]::ParameterValue, 'Database maintenance')
            break
        }
        'grok;help;worktree;list' {
            break
        }
        'grok;help;worktree;show' {
            break
        }
        'grok;help;worktree;rm' {
            break
        }
        'grok;help;worktree;gc' {
            break
        }
        'grok;help;worktree;db' {
            [CompletionResult]::new('rebuild', 'rebuild', [CompletionResultType]::ParameterValue, 'Rebuild DB from filesystem scan')
            [CompletionResult]::new('stats', 'stats', [CompletionResultType]::ParameterValue, 'Show DB statistics')
            [CompletionResult]::new('path', 'path', [CompletionResultType]::ParameterValue, 'Print DB file path')
            break
        }
        'grok;help;worktree;db;rebuild' {
            break
        }
        'grok;help;worktree;db;stats' {
            break
        }
        'grok;help;worktree;db;path' {
            break
        }
        'grok;help;du' {
            break
        }
        'grok;help;workspace' {
            [CompletionResult]::new('start', 'start', [CompletionResultType]::ParameterValue, 'Start (or update) the workspaceÔåÆhub exposure')
            [CompletionResult]::new('pause', 'pause', [CompletionResultType]::ParameterValue, 'Drain and disconnect from the hub, keeping the exposure warm')
            [CompletionResult]::new('resume', 'resume', [CompletionResultType]::ParameterValue, 'Reconnect a paused exposure to the hub')
            [CompletionResult]::new('stop', 'stop', [CompletionResultType]::ParameterValue, 'Stop exposing the workspace (the leader keeps running)')
            [CompletionResult]::new('restart', 'restart', [CompletionResultType]::ParameterValue, 'Restart the exposure (stop, then start with the given options)')
            [CompletionResult]::new('status', 'status', [CompletionResultType]::ParameterValue, 'Show the current workspace-exposure status')
            break
        }
        'grok;help;workspace;start' {
            break
        }
        'grok;help;workspace;pause' {
            break
        }
        'grok;help;workspace;resume' {
            break
        }
        'grok;help;workspace;stop' {
            break
        }
        'grok;help;workspace;restart' {
            break
        }
        'grok;help;workspace;status' {
            break
        }
        'grok;help;dashboard' {
            break
        }
        'grok;help;help' {
            break
        }
    })

    $completions.Where{ $_.CompletionText -like "$wordToComplete*" } |
        Sort-Object -Property ListItemText
}
