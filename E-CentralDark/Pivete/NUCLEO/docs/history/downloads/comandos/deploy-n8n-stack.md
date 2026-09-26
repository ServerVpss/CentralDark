# Deploy N8N Stack

## Task Anatomy

```yaml
task_name: Deploy N8N Stack
status: active
responsible: "@devops (Gage)"
responsible_executor: "@devops (Gage)"
execution_type: Agent
deadline: "Phase 5b of wf-whitelabel-deploy (Day 2)"
estimated_time: "1-2h"
dependencies:
  - "setup-security-layers (SECURITY_HARDENED gate must PASS)"
quality_gate: "N8N_OPERATIONAL (wf-whitelabel-deploy.yaml Phase 5b)"
input:
  - "VPS with Docker running"
  - "Tailscale network configured"
  - "Domain or Tailscale Funnel for HTTPS"
  - "squads/autoclaw/data/OPENCLAW-WHITELABEL-INSTALL-GUIDE.md (Phase 9)"
output:
  - "N8N running via Docker Compose"
  - "Portainer for container management"
  - "Traefik for reverse proxy + SSL"
  - "All services accessible via Tailscale"
action_items:
  - "Create docker-compose.yaml for N8N stack"
  - "  n8n: workflow automation"
  - "  portainer: container management UI"
  - "  traefik: reverse proxy + automatic SSL"
  - "Configure Traefik for HTTPS (Let's Encrypt or Tailscale cert)"
  - "Configure N8N environment variables"
  - "Deploy stack: docker compose up -d"
  - "Verify N8N UI accessible via Tailscale IP"
  - "Verify Portainer dashboard accessible"
  - "Create initial N8N workflow: OpenClaw webhook receiver"
  - "Test webhook: send test message through OpenClaw -> N8N"
acceptance_criteria:
  - "docker compose ps shows all services running"
  - "N8N UI loads at https://{tailscale-ip}:5678 or via Traefik"
  - "Portainer dashboard accessible"
  - "Traefik SSL certificate valid"
  - "N8N webhook receives test message from OpenClaw"
  - "Services restart automatically on VPS reboot"
```

## Veto Conditions

- **N8N not accessible** -> STOP. Check Docker logs, port conflicts.
- **SSL not working** -> STOP. No HTTPS = credentials in plaintext.
- **Services don't survive reboot** -> STOP. Add restart: always to compose.

## Notes

Source: OPENCLAW-WHITELABEL-INSTALL-GUIDE.md Phase 9.
N8N enables automation workflows triggered by OpenClaw events.
