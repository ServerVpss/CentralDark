# AGENTE - 15-agent-mode.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\docs\user-guide\15-agent-mode.md
**SHA:** 43d8dc7461362aaa
**Timestamp:** 2026-08-28T02:52:41.705624
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- prompt: [{ type: "text", text }],

### Ouro Bruto (primeiros 5000 chars)
```
# Agent mode (ACP) and IDE integration

Agent mode runs Grok as a long-lived server that clients talk to over [ACP](https://agentclientprotocol.com) (JSON-RPC). Use it from IDEs, SDKs, eval harnesses, and custom apps. For a one-shot prompt that prints and exits, use `grok -p` instead ([headless mode](14-headless-mode.md)).

---

## Automation and SDKs

For scripts, CI, evals, and agent servers, start with always-approve so tools run without interactive permission prompts. Deny rules and hooks still apply.

```bash
# stdio (local process / many SDKs)
grok agent --always-approve stdio

# WebSocket server
grok agent --always-approve serve --bind 127.0.0.1:2419 --secret <token>
```

You can also set always-approve per session on `session/new`:

```json
{
  "cwd": "/path/to/project",
  "mcpServers": [],
  "_meta": { "yoloMode": true }
}
```

Interactive TUI users typically leave the default ask mode (or use auto). See [Permissions and safety](22-permissions-and-safety.md).

---

## What is ACP?

The [Agent Client Protocol (ACP)](https://agentclientprotocol.com) defines how clients talk to coding agents over JSON-RPC. With Grok it covers:

- Sessions (create, load, resume)
- Prompts and streamed replies
- Tool call updates
- Reasoning / thought streams
- Permission prompts when the session is not always-approve

---

## stdio transport

stdio is the common local integration path. The agent speaks JSON-RPC on stdin and stdout:

```bash
grok agent --always-approve stdio
```

Typical clients: IDE extensions (Zed, Neovim, Emacs), custom tools, and ACP SDKs.

### Options

Agent options apply to every transport (`stdio`, `serve`, `headless`, `leader`). They go after `agent` and before the mode name. Mode-specific flags go after the mode (for example `serve --bind`).

```bash
grok agent --always-approve --model grok-build stdio
grok agent --always-approve serve --bind 127.0.0.1:2419 --secret <token>
```

| Flag | Description |
| ---- | ----------- |
| `-m, --model <MODEL>` | Model ID (for example `grok-build`). |
| `--always-approve` | Run without interactive tool-permission prompts. Alias: `--yolo`. |
| `--reauth` | Authenticate before the agent starts. |
| `--agent-profile <PATH>` | Load an agent profile from a file. |
| `--leader` / `--no-leader` | Connect to a shared leader process, or force a local agent. When a non-`off` sandbox profile is requested, leader mode is refused so tools stay in-process (see [Sandbox Mode](18-sandbox.md)). |

---

## Server mode

```bash
grok agent --always-approve serve --bind 127.0.0.1:2419 --secret <token>
```

Clients connect over WebSocket and authenticate with the secret token. If you omit `--secret`, the agent prints a generated token at startup, or set `GROK_AGENT_SECRET`. The process keeps state across client reconnects. Permissions match other entry points; see [Permissions and safety](22-permissions-and-safety.md).

This is a server you run yourself — Grok's hosted cloud sandboxes do not run `grok agent serve`.

---

## WebSocket relay

To reach the agent over the internet, connect the agent to a relay and point browsers at the same relay:

```bash
grok agent --always-approve headless --grok-ws-url wss://your-relay.example.com/ws
```

---

## ACP protocol basics

Communication follows the JSON-RPC 2.0 format. A typical session lifecycle:

1. **Initialize** -- client sends `initialize` with capabilities
2. **Create session** -- client sends `session/new` with working directory
3. **Send prompts** -- client sends `session/prompt` with user messages
4. **Receive updates** -- agent sends `session/update` notifications with streamed content
5. **Handle permissions** -- agent may request tool execution approval (or allow or deny based on permission mode)

### Architecture

```
+------------------------------------------+
|           ACP Client                     |
|  (IDE, Editor, Custom Application)       |
+-------------------+----------------------+
                    | JSON-RPC over stdio
+-------------------v----------------------+
|           grok agent stdio               |
|                                          |
|  +---------+  +---------+  +---------+   |
|  | Session |  |  Tools  |  |   MCP   |   |
|  | Manager |  | Registry|  | Servers |   |
|  +---------+  +---------+  +---------+   |
+------------------------------------------+
```

---

## Streaming updates

ACP streams structured events. Each `session/update` notification carries a `sessionUpdate` field that identifies the update type:

| `sessionUpdate` value | Description                                            |
| --------------------- | ----------------------------------------------------- |
| `agent_message_chunk` | A chunk of the agent's response text.                 |
| `agent_thought_chunk` | A chunk of the agent's internal reasoning.            |
| `tool_call`           | A new tool invocation (title, kind, status, input).   |
| `tool_call_update`    | A status or result update for an in-flight to
```