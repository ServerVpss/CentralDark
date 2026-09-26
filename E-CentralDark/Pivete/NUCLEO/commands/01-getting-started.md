# COMANDO - 01-getting-started.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\docs\user-guide\01-getting-started.md
**SHA:** 02a7db91b6672db4
**Timestamp:** 2026-08-28T02:52:41.838627
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- Type `/` in the prompt to access commands. These provide quick actions without writing a full prompt:

### Ouro Bruto (primeiros 5000 chars)
```
# Getting Started

Grok Build is a terminal-based AI coding assistant from SpaceXAI. It runs as a TUI (Terminal User Interface) that understands your codebase, executes shell commands, edits files, searches the web, and manages tasks.

You can use it interactively as a full-screen TUI, run it headlessly for scripting and CI/CD, or integrate it into editors via the Agent Client Protocol (ACP).

---

## Installation

Install the latest stable release (macOS, Linux, or Windows via Git Bash):

```bash
curl -fsSL https://x.ai/cli/install.sh | bash
```

Install a specific version:

```bash
curl -fsSL https://x.ai/cli/install.sh | bash -s 0.1.42
```

On **Windows (PowerShell)**, use the native PowerShell installer:

```powershell
irm https://x.ai/cli/install.ps1 | iex
```

Install a specific version:

```powershell
$env:GROK_VERSION="0.1.42"; irm https://x.ai/cli/install.ps1 | iex
```

The PowerShell installer automatically adds `%USERPROFILE%\.grok\bin` to your User PATH. Alternatively, install via [Git for Windows](https://gitforwindows.org/) (Git Bash) or MSYS2 using the bash script above. WSL users get the Linux binary automatically.

Verify the installation:

```bash
grok --version
```

Update to the latest version at any time:

```bash
grok update
```

---

## First Launch

Start Grok by running:

```bash
grok
```

On first launch, Grok opens your browser to authenticate with grok.com. After you sign in, Grok stores your credentials in `~/.grok/auth.json`, where they persist across sessions. Grok refreshes your credentials automatically and prompts you to sign in again when they can no longer be renewed.

If you prefer API key authentication (e.g., for CI/CD or environments without a browser), set the `XAI_API_KEY` environment variable instead:

```bash
export XAI_API_KEY="xai-..."
grok
```

See [Authentication](02-authentication.md) for the full set of auth options including OIDC, external auth providers, and device code flow.

---

## Basic Interaction

Once authenticated, Grok presents a full-screen TUI with two main areas:

- **Scrollback** -- the conversation history showing your prompts, Grok's responses, tool calls, file edits, and more.
- **Prompt** -- the input area at the bottom where you type messages.

Type a message and press `Enter` to send it. Grok reads files, runs commands, and edits code as needed. Each tool run streams into the scrollback in real time.

Press `Tab` to move focus between the prompt and the scrollback. While a turn is running, `Esc` cancels it (the exception is fullscreen vim scrollback mode, where mid-turn `Esc` is a no-op; minimal mode cancels even with vim on); `Ctrl+C` cancels once the composer is empty — with a draft, the first press only clears it. Idle, press `Esc` twice within 800ms to clear a non-empty prompt, or (with an empty prompt and conversation messages) to open rewind — see [Keyboard Shortcuts](03-keyboard-shortcuts.md#escape). With the scrollback focused, use the arrow keys to select entries and to collapse or expand them. To navigate with `j`/`k` and fold with `h`/`l` instead, enable Vim mode.

### File References

Use `@` in your prompt to attach files:

```
@src/main.rs              # Attach a file
@src/main.rs:10-50        # Attach lines 10-50
@src/                     # Browse a directory
```

The `@` operator opens a fuzzy file picker. By default it respects `.gitignore` and hides dotfiles. Prefix with `!` to search hidden files:

```
@!.github                 # Search hidden files
@!.env                    # Attach a .env file
```

### Permissions

By default, Grok asks for permission before executing shell commands or editing files. You can approve individually or toggle always-approve mode:

- Press `Ctrl+O` to toggle always-approve mode
- Use the `--yolo` flag at launch: `grok --yolo`
- Type `/always-approve` in the prompt to toggle the mode

---

## Key Concepts

### Sessions

Every conversation is a **session**. Sessions are automatically saved to `~/.grok/sessions/` and can be resumed later. Each session tracks the full conversation history, tool calls, file edits, and task state.

- Start a new session: `Ctrl+N` or `/new`
- Resume a previous session: `/resume` in the TUI, or `--resume <ID>` from the CLI
- Continue the most recent session: `grok -c`

### Scrollback

The scrollback is the main display area. It shows:

- **User prompts** -- your messages, rendered as sticky headers
- **Agent messages** -- Grok's responses with full markdown rendering and syntax highlighting
- **Thinking blocks** -- Grok's reasoning process (collapsible)
- **Tool calls** -- file edits (with inline diffs), command executions, search results, and more
- **Task lists** -- TODO items tracking progress

Collapse or expand the selected entry with the `Left`/`Right` arrow keys (or `h`/`l` and `e` in Vim mode). In Vim mode, press `y` to copy its content and `Y` to copy its metadata (for example, the command that ran). Press `Enter` to open it in the fullscreen viewer (in 
```