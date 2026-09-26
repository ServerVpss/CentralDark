# Post-Deployment Validation Checklist

> Run after ALL 6 phases complete. Final gate before declaring deployment READY.

## Infrastructure (Phase 1-2)

- [ ] `curl http://localhost:18789/health` returns OK
- [ ] `tailscale ping {vps-hostname}` succeeds from desktop
- [ ] `systemctl status openclaw` shows active (running)
- [ ] Node.js version >= 22 (`node -v`)
- [ ] Docker running (`docker ps`)
- [ ] VPS memory usage < 70% at idle

## Identity (Phase 3)

- [ ] `apps/{agent-name}/` directory exists
- [ ] AGENTS.md present and valid
- [ ] SOUL.md present and valid
- [ ] `openclaw agent --list` shows new agent

## LLM Router (Phase 4)

- [ ] Budget tier responds to simple query
- [ ] Standard tier responds to normal query
- [ ] Premium tier responds to complex query
- [ ] Fallback works: disable premium -> standard picks up
- [ ] `.env` has all required API keys
- [ ] `llm-router-config.yaml` valid YAML

## Skills (Phase 5a)

- [ ] Each installed skill passes `openclaw skill --test {name}`
- [ ] Progressive disclosure verified (not all skills in context)
- [ ] Skills mapped to correct LLM tiers
- [ ] No orphan skill references

## Security (Phase 5b) - ZERO TOLERANCE

- [ ] All items in security-audit-checklist.md PASS
- [ ] Blocked commands rejected
- [ ] Docker sandbox isolated
- [ ] Logs active and redacted
- [ ] DM pairing enforced

## Channels (Phase 5b)

- [ ] At least 1 channel connected
- [ ] Agent responds within 5 seconds (standard tier)
- [ ] Message formatting renders correctly
- [ ] DM pairing blocks unauthorized users
- [ ] Group chat requires @mention
- [ ] Channel reconnects after brief disconnect

## Performance Baseline

- [ ] Response latency < 5 seconds (standard tier)
- [ ] Memory usage < 2GB steady state
- [ ] No memory leaks over 10-message sequence
- [ ] CPU usage < 50% at idle

## Final Decision

| Status | Criteria |
|--------|----------|
| **READY** | All checks PASS, all security items green |
| **BLOCKED** | Any security item FAIL, or > 3 non-security FAILs |
| **CONDITIONAL** | 1-3 non-security items FAIL (document and accept risk) |

## Veto Conditions

- **Any security check fails** -> BLOCKED. Non-negotiable.
- **Gateway not responding** -> BLOCKED. Core service down.
- **No channels connected** -> BLOCKED. Agent has no way to communicate.
- **LLM Router errors on all tiers** -> BLOCKED. Agent has no brain.
