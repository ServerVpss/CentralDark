# Pre-Deployment Checklist

> Run BEFORE starting wf-whitelabel-deploy. Blocks Phase 1 if incomplete.

## Prerequisites

- [ ] Hetzner account created and funded
- [ ] Tailscale account created
- [ ] Tailscale auth key generated (reusable, tagged)
- [ ] Desktop has Tailscale installed and running
- [ ] OpenRouter API key OR direct provider keys (Anthropic, OpenAI)
- [ ] Agent name decided (or willing to accept agent's suggestion)
- [ ] Domain available (optional - Tailscale Funnel works without)

## VPS Requirements

- [ ] Minimum spec: CX22 (2 vCPU, 4GB RAM, 40GB SSD)
- [ ] Ubuntu 22.04 LTS selected
- [ ] SSH key configured (no password auth)
- [ ] Region selected (closest to primary user)

## Security Preparation

- [ ] SSH key pair generated (ed25519 preferred)
- [ ] No root password auth (key-only)
- [ ] WhatsApp number ready for DM pairing (if using WhatsApp channel)

## Knowledge Verification

- [ ] Read: squads/autoclaw/data/OPENCLAW-WHITELABEL-INSTALL-GUIDE.md (overview)
- [ ] Understand: 3-layer security model (blocklist + sandbox + audit)
- [ ] Understand: LLM tier routing (budget/standard/premium)

## Veto Conditions

- **No Hetzner account** -> STOP. Cannot provision VPS.
- **No Tailscale account** -> STOP. No secure networking.
- **No API keys for any LLM provider** -> STOP. Agent has no brain.
- **VPS spec below CX22** -> STOP. Insufficient resources for OpenClaw + Docker.
