# AutoClaw Squad

> OpenClaw Whitelabel Deployment & Configuration Squad

## Overview

Squad de **agente unico**: Peter Steinberger (@steipete), criador do OpenClaw (194k stars).
Steipete e o expert que sabe POR QUE cada decisao arquitetural foi tomada.
Quando precisa de execucao, delega para agentes AIOS existentes.

## Architecture: Single Expert + AIOS Handoffs

```
steipete (OpenClaw Expert - Tier 0)
  |
  +-- handoff --> @devops (Gage)      VPS, Tailscale, Docker, N8N, security
  +-- handoff --> @aios-master (Orion) Whitelabel identity creation
  +-- handoff --> @architect (Aria)    Tier/skills architecture design
  +-- handoff --> @dev (Dex)           config.js, skills, bridge.js, hooks
  +-- handoff --> @qa (Quinn)          End-to-end validation, security audit
```

## Deployment Workflow (6 Phases - Pedro Valerio)

```
Phase 1-2: steipete --> @devops     VPS + Tailscale + Docker + OpenClaw + systemd
Phase 3:   steipete --> @aios-master Whitelabel identity creation
Phase 4:   steipete --> @architect   Tier/skills architecture review
Phase 5a:  steipete --> @dev         Implement customizations (config.js, skills, bridge)
Phase 5b:  steipete --> @devops      Security hardening (3 layers) + N8N deploy
Phase 6:   steipete --> @qa          End-to-end validation
```

## Commands

| Command | Description |
|---------|-------------|
| `*deploy` | Full whitelabel deployment (6 phases) |
| `*configure` | Configure existing instance |
| `*secure` | Security audit and hardening |
| `*validate` | End-to-end validation |
| `*status` | Check instance health |
| `*troubleshoot` | Diagnose common issues |
| `*upgrade` | Upgrade OpenClaw version |
| `*architecture` | Explain WHY a design decision was made |

## Knowledge Base

- **Primary:** OPENCLAW-WHITELABEL-INSTALL-GUIDE.md (980 lines, 10 phases)
- **Architecture:** OpenClaw 3-layer (Gateway + Channels + Runtime)
- **Security:** Fail-closed auth, Docker sandbox, audit logging
- **Creator DNA:** Peter Steinberger's engineering philosophy
- **Research:** docs/research/2026-02-14-openclaw-ai-agent-gateway/

## Quick Start

```
@steipete
*deploy
```
