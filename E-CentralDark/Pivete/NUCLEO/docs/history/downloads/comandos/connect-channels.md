# Connect Channels

## Task Anatomy

```yaml
task_name: Connect Channels
status: active
responsible: "@dev (Dex)"
responsible_executor: "@dev (Dex)"
execution_type: Agent
deadline: "Phase 5b of wf-whitelabel-deploy (Day 2-3)"
estimated_time: "1-2h"
dependencies:
  - "setup-security-layers (SECURITY_HARDENED gate must PASS)"
  - "deploy-n8n-stack (if using N8N webhooks)"
quality_gate: "CHANNELS_CONNECTED (wf-whitelabel-deploy.yaml Phase 5b)"
input:
  - "Running OpenClaw instance with identity + skills + security"
  - "Channel credentials (WhatsApp number, Telegram bot token, Slack app, etc.)"
  - "squads/autoclaw/data/OPENCLAW-WHITELABEL-INSTALL-GUIDE.md (Phase 10)"
output:
  - "At least 1 channel connected and responding"
  - "DM pairing configured (security)"
  - "Group chat @mention configured"
  - "Channel-specific formatting tested"
action_items:
  - "Select primary channel (WhatsApp recommended for lowest friction)"
  - "WHATSAPP (Baileys):"
  - "  Configure Evolution API or direct Baileys connection"
  - "  Scan QR code to pair"
  - "  Set DM pairing to owner's number"
  - "  Test: send message, receive response"
  - "TELEGRAM (optional):"
  - "  Create bot via @BotFather"
  - "  Configure grammY adapter"
  - "  Test: /start command responds"
  - "SLACK (optional):"
  - "  Create Slack app with Bolt adapter"
  - "  Configure OAuth scopes"
  - "  Test: @mention in channel responds"
  - "For ALL channels:"
  - "  Verify DM pairing (strangers can't talk to agent)"
  - "  Verify group chat requires @mention"
  - "  Test message formatting (code blocks, links, images)"
acceptance_criteria:
  - "At least 1 channel fully connected"
  - "Agent responds to messages within 5 seconds"
  - "DM pairing blocks unauthorized users"
  - "Group chat only responds to @mentions"
  - "Message formatting renders correctly per channel"
  - "Channel adapter reconnects after brief disconnect"
```

## Veto Conditions

- **DM pairing not configured** -> STOP. Open agent = security risk. [SOURCE: steipete ST_002]
- **Agent responds to strangers** -> STOP. Must be locked to paired users only.

## Notes

Source: OPENCLAW-WHITELABEL-INSTALL-GUIDE.md Phase 10.
OpenClaw supports 12+ channels. Start with 1, add more later.
WhatsApp has lowest cognitive barrier (steipete: "brain in talking mode, not tool mode").
