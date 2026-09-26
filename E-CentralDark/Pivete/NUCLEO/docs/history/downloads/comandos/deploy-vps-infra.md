# Deploy VPS Infrastructure (Hetzner via Playwright)

## Task Anatomy

```yaml
task_name: Deploy VPS Infrastructure
status: active
responsible: "@devops (Gage)"
responsible_executor: "@devops (Gage)"
execution_type: Hybrid
deadline: "Phase 1-2 of wf-whitelabel-deploy (Day 1)"
estimated_time: "2-3h"
dependencies: []
quality_gate: "INFRA_READY (wf-whitelabel-deploy.yaml)"
input:
  - "User logged into Hetzner console in their browser"
  - "Tailscale account + auth key (user provides)"
  - "SSH public key (ed25519 preferred)"
  - "squads/autoclaw/data/OPENCLAW-WHITELABEL-INSTALL-GUIDE.md (Phases 1-3)"
  - "squads/autoclaw/checklists/hetzner-server-checklist.md"
output:
  - "Running Hetzner CX22 VPS with Ubuntu 22.04"
  - "Node.js 22 + pnpm + Docker installed"
  - "Tailscale connected (VPS + desktop in same tailnet)"
  - "OpenClaw cloned, built, running as systemd service"
  - "Gateway responding on port 18789 (loopback only)"
  - "Completed hetzner-server-checklist.md with all items checked"
  - "Screenshots of each provisioning step"
action_items:
  - "PHASE A: PLAYWRIGHT - HETZNER PROVISIONING (browser automation)"
  - "  1. Ask user to open https://console.hetzner.cloud/ and login"
  - "  2. User confirms they're logged in (handles 2FA themselves)"
  - "  3. Playwright takes over:"
  - "     browser_navigate -> https://console.hetzner.cloud/"
  - "     browser_snapshot -> verify logged in state"
  - "     browser_take_screenshot -> capture initial state"
  - "  4. Navigate to Projects:"
  - "     browser_click -> 'New Project' button"
  - "     browser_type -> project name: openclaw-{agent-name}"
  - "     browser_click -> 'Create' / 'Add Project'"
  - "     browser_take_screenshot -> confirm project created"
  - "  5. Add SSH Key to project:"
  - "     browser_navigate -> project Settings > SSH Keys"
  - "     browser_click -> 'Add SSH Key'"
  - "     browser_type -> paste public key content"
  - "     browser_type -> key name: openclaw-deploy"
  - "     browser_click -> 'Add SSH Key' confirm"
  - "     browser_take_screenshot -> confirm key added"
  - "  6. Create Server:"
  - "     browser_click -> 'Add Server'"
  - "     browser_click -> Location: Helsinki (hel1)"
  - "     browser_click -> Image: Ubuntu 22.04"
  - "     browser_click -> Type: Shared vCPU > CX22 (2 vCPU, 4GB RAM)"
  - "     browser_click -> Networking: Public IPv4 (check enabled)"
  - "     browser_click -> SSH Key: select openclaw-deploy"
  - "     browser_type -> Server name: openclaw-{agent-name}"
  - "     browser_take_screenshot -> confirm all selections before submit"
  - "     ASK USER: 'Server will cost EUR 3.99/mo. Confirm creation?'"
  - "     browser_click -> 'Create & Buy now'"
  - "     browser_wait_for -> server status Running"
  - "     browser_take_screenshot -> capture server details (IP address)"
  - "  7. Extract server IP from page:"
  - "     browser_snapshot -> find public IPv4 in page content"
  - "     Record IP for SSH steps"
  - ""
  - "PHASE B: SSH - INITIAL SERVER SETUP (terminal automation)"
  - "  8. SSH into server:"
  - "     ssh root@{ipv4}"
  - "  9. System update:"
  - "     apt update && apt upgrade -y"
  - " 10. Create non-root user:"
  - "     adduser --disabled-password openclaw"
  - "     usermod -aG sudo,docker openclaw"
  - "     mkdir -p /home/openclaw/.ssh"
  - "     cp ~/.ssh/authorized_keys /home/openclaw/.ssh/"
  - "     chown -R openclaw:openclaw /home/openclaw/.ssh"
  - " 11. Configure SSH security:"
  - "     Edit /etc/ssh/sshd_config:"
  - "       PermitRootLogin no"
  - "       PasswordAuthentication no"
  - "       PubkeyAuthentication yes"
  - "     systemctl restart sshd"
  - " 12. Configure UFW firewall:"
  - "     ufw default deny incoming"
  - "     ufw default allow outgoing"
  - "     ufw allow 22/tcp    # SSH"
  - "     ufw allow 41641/udp # Tailscale"
  - "     ufw enable"
  - "     NOTE: Do NOT open 18789 - gateway stays on loopback"
  - ""
  - "PHASE C: SSH - RUNTIME STACK"
  - " 13. Install Node.js 22:"
  - "     curl -fsSL https://deb.nodesource.com/setup_22.x | bash -"
  - "     apt install -y nodejs"
  - "     node -v  # Must show v22.x"
  - " 14. Install pnpm:"
  - "     npm install -g pnpm"
  - " 15. Install Docker:"
  - "     apt install -y docker.io docker-compose-plugin"
  - "     systemctl enable --now docker"
  - " 16. Install essential tools:"
  - "     apt install -y git curl wget jq htop"
  - ""
  - "PHASE D: SSH - TAILSCALE MESH VPN"
  - " 17. Install Tailscale on VPS:"
  - "     curl -fsSL https://tailscale.com/install.sh | sh"
  - "     tailscale up --hostname=openclaw-{agent-name}"
  - "     # If auth link needed, user opens it"
  - " 18. Verify Tailscale on VPS:"
  - "     tailscale status"
  - "     tailscale ip -4  # Note the 100.x.x.x IP"
  - " 19. Verify desktop connectivity:"
  - "     tailscale ping openclaw-{agent-name}  # Must succeed"
  - ""
  - "PHASE E: SSH - OPENCLAW DEPLOYMENT"
  - " 20. Clone and build OpenClaw:"
  - "     cd /opt"
  - "     git clone https://github.com/nicepkg/openclaw.git"
  - "     cd openclaw && pnpm install && pnpm ui:build && pnpm build"
  - " 21. Initial onboard:"
  - "     pnpm openclaw onboard --install-daemon"
  - " 22. Create systemd service (from templates/systemd-service-tmpl.conf)"
  - "     systemctl daemon-reload && systemctl enable --now openclaw"
  - " 23. Verify:"
  - "     systemctl status openclaw  # active (running)"
  - "     curl http://localhost:18789/health  # OK"
  - ""
  - "PHASE F: VERIFICATION"
  - " 24. From desktop: curl http://{tailscale-ip}:18789/health -> OK"
  - " 25. Run hetzner-server-checklist.md - ALL items must pass"
  - " 26. Playwright: take final screenshot of Hetzner dashboard showing server Running"
acceptance_criteria:
  - "Hetzner server status: Running (screenshot proof)"
  - "SSH as non-root user works (root login disabled)"
  - "UFW active with only SSH + Tailscale ports open"
  - "Node.js >= 22, pnpm, Docker installed"
  - "Tailscale connected (ping succeeds from desktop)"
  - "OpenClaw systemd service active (running)"
  - "curl http://localhost:18789/health returns OK"
  - "curl http://{tailscale-ip}:18789/health returns OK from desktop"
  - "Port 18789 NOT accessible from public internet"
  - "hetzner-server-checklist.md completed 100%"
  - "Screenshots captured at each Playwright step"
```

## Execution Model: Hybrid (Playwright + SSH)

```
PHASE A: Playwright (browser)     USER logs in -> AGENT automates UI
PHASE B-E: SSH (terminal)         AGENT runs commands on VPS
PHASE F: Mixed                    AGENT verifies from both sides
```

### Playwright MCP Tools Used

| Tool | When |
|------|------|
| `browser_navigate` | Open Hetzner console URLs |
| `browser_snapshot` | Read page state (DOM), extract data (IPs, status) |
| `browser_take_screenshot` | Visual proof of each step |
| `browser_click` | Select options, click buttons |
| `browser_type` | Fill form fields (project name, server name, SSH key) |
| `browser_wait_for` | Wait for server provisioning to complete |
| `browser_evaluate` | Extract specific values from page (IP address) |

### Human-in-the-Loop Moments

| Step | Why |
|------|-----|
| Login + 2FA | Security - agent never handles credentials |
| Confirm server creation | Cost - EUR 3.99/mo commitment |
| Tailscale auth link | Security - account pairing |

## Veto Conditions

- **User not logged into Hetzner** -> STOP. Agent cannot handle login/2FA.
- **Tailscale ping fails from desktop** -> STOP. No mesh = no secure access.
- **Gateway /health not OK** -> STOP. Check journalctl for errors.
- **VPS has less than 4GB RAM** -> STOP. CX22 minimum.
- **Root SSH still enabled** -> STOP. Security violation.
- **Port 18789 reachable from public internet** -> STOP. Loopback only. [SOURCE: steipete ST_002]
- **Password authentication enabled** -> STOP. Keys only.

## Cost Reference

| Hetzner Plan | vCPU | RAM | SSD | Price/mo | Recommendation |
|-------------|------|-----|-----|----------|----------------|
| CX22 | 2 | 4GB | 40GB NVMe | EUR 3.99 | Minimum for OpenClaw |
| CX32 | 4 | 8GB | 80GB NVMe | EUR 7.49 | If running N8N + Portainer too |
| CX42 | 8 | 16GB | 160GB NVMe | EUR 14.99 | Heavy usage, many channels |

4GB is sufficient for: OpenClaw gateway + 1-2 channels + Docker sandbox.
If adding N8N + Portainer on same VPS, consider CX32 (8GB).

## Notes

Source: OPENCLAW-WHITELABEL-INSTALL-GUIDE.md Phases 1-3.
Playwright MCP available via `mcp__playwright__*` tools (already configured in .claude/settings.local.json).
Agent never handles user credentials - user logs in, agent automates the rest.
