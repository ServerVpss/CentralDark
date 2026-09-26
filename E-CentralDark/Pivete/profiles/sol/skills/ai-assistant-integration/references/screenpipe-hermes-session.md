# Screenpipe-Hermex Session Investigation

## Context

Session investigated integrating Screenpipe with Hermes and understanding how Hermex pairs with local execution tools for behind-the-scenes operation.

## What Was Learned

### Conversation Passing Modes
Two modes identified for how conversation can pass through external systems:

1. **MCP proxy mode**: Conversation passes through MCP layer, assistant acts as intermediary between user and target system. Assistant sees messages, can filter or act on them.
2. **Direct browser/computer use mode**: Assistant uses browser user or computer directly to interact with target. No intermediary layer.

The choice depends on whether you want the assistant to mediate (MCP mode) or act directly (direct mode).

### Hermex as Control Plane
- Hermex is a native iOS app (App Store) that serves as mobile control plane
- Connects to hermes-webui server for chat and session management
- Does NOT execute anything locally - purely interface/control
- Local execution happens via computer-use and browser toolsets on the machine

### Screenpipe Status (at session time)
- screenpipe-app running locally on port 3030
- Browser Bridge extension connected and authenticated
- Omni Router routing on port 8099
- Connection verified working via health checks

### Integration Architecture
Full path: Mobile app → HTTPS (via tunnel) → hermes-webui server → Hermes Agent → local tools (computer-use for desktop, browser for web, Screenpipe for context capture)

### Blockers Found
Tailscale Serve was not enabled on tailnet at session time. This blocks HTTPS access from mobile. Enable via Tailscale admin or run `tailscale serve` with proper configuration.