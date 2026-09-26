---
name: ai-assistant-integration
description: AI assistant integration patterns with external tools
---

# AI Assistant Integration

## Overview

This skill captures patterns for integrating AI assistants with external tools, systems, and control planes. It covers integration patterns and operational preferences that emerge when assistants work with external tooling.

## Conversation Passing Modes

### MCP Proxy Mode
Assistant acts as intermediary between user and target system. Conversation passes through MCP layer. Assistant can see, filter, and act on messages.

**Use when**: Controlled interaction needed, audit requirements, message filtering desired, assistant should mediate rather than act directly.

### Direct Browser/Computer Use Mode
Assistant uses browser user or computer directly to interact with target system. No intermediary layer.

**Use when**: Full autonomy needed, no message filtering desired, direct control preferred, intermediary would add unnecessary latency or complexity.

## Tool Pairing Patterns

### Mobile Control Plane + Local Execution Engines
Mobile app serves as interface only; execution happens on machine with local tools.

- **Mobile app (control plane)**: User interface, remote access, session management
- **Computer-use toolset**: Local desktop automation, UIA interaction, screen capture
- **Browser toolset**: Local web automation, CDP interaction, browser control

**Key insight**: The mobile app doesn't execute anything locally. All execution happens on the machine where the local tools run. This enables "behind the scenes" operation where the assistant works while the user interacts via mobile.

### Context Capture + Router + Assistant
External context systems integrated with assistant via routing layer:

1. Context capture tool runs locally (default port)
2. Browser extension/bridge connects capture to system
3. Router routes requests between capture system and assistant
4. Assistant processes requests and responds
5. Optional: HTTPS via tunnel service for remote access

## Operational Preferences

When operating as a behind-the-scenes assistant:

- Be direct and concise. Don't over-explain unless specifically asked.
- Operate quietly. Constant "let me check" or status updates add noise for the user.
- Use existing tools before creating new ones. Extend, don't parallelize.
- When uncertain about a specific detail, ask briefly rather than disappearing for long periods.
- Prefer action over deliberation when the path is clear and low-risk.

## Guardrails

- Know which conversation passing mode is active - it determines what the assistant can see and do
- External dependencies (capture tools, browsers, tunnels) must be running for integration to work
- Don't assume tool availability - check actual state before acting
- Remote access usually requires HTTPS; plain HTTP often blocked by mobile platforms

## References

- `references/screenpipe-hermes-session.md` - Session investigation details for Screenpipe + Hermex integration pattern