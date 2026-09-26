# Security Audit Checklist

> Run during Phase 5b and Phase 6. Any FAIL is a VETO - deployment blocked.

## Layer 1: Access Control

- [ ] Gateway bound to loopback (127.0.0.1:18789) - NOT 0.0.0.0
- [ ] Tailscale is the ONLY external access path
- [ ] DM pairing configured (agent only responds to paired users)
- [ ] Group chats require @mention (no unsolicited responses)
- [ ] Token/password auth enabled for API endpoints
- [ ] SSH is key-only (no password authentication)
- [ ] UFW firewall active with default deny incoming

## Layer 2: Sandboxing

- [ ] Docker sandbox enabled for agent execution
- [ ] Sandbox uses Alpine base image (minimal attack surface)
- [ ] Sandbox runs as non-root user
- [ ] Sandbox has network=none (no outbound internet)
- [ ] Workspace isolation configured (scope: agent or session)
- [ ] workspaceAccess correctly set (none/ro/rw per agent profile)
- [ ] Tool allow/deny lists configured per agent profile
- [ ] Container cannot access host filesystem outside workspace

## Layer 3: Audit & Monitoring

- [ ] journald logging active for openclaw service
- [ ] logrotate configured (minimum 7 days retention)
- [ ] Sensitive data redaction enabled in logs
- [ ] API keys never appear in plain text in logs
- [ ] detect-secrets scanning configured
- [ ] Session transcript retention enabled
- [ ] Custom redact patterns configured for domain-specific secrets

## Blocklist Validation (Minimum 50 patterns)

- [ ] `rm -rf /` blocked
- [ ] `rm -rf ~` blocked
- [ ] `dd if=/dev/zero` blocked
- [ ] `mkfs` blocked
- [ ] `chmod 777` blocked
- [ ] `curl | bash` (pipe to shell) blocked
- [ ] `wget | sh` blocked
- [ ] `nc -l` (netcat listener) blocked
- [ ] `nmap` blocked
- [ ] `ssh-keygen -t rsa` (key generation) - allowed but logged
- [ ] Custom domain-specific patterns added

## Penetration Tests

- [ ] Send blocked command via channel -> rejected with clear message
- [ ] Attempt DM from unpaired number -> ignored
- [ ] Attempt to escape Docker sandbox -> contained
- [ ] Send message with fake API key -> redacted in logs
- [ ] Attempt path traversal in skill input -> blocked
- [ ] Attempt prompt injection to bypass blocklist -> handled

## Veto Conditions

- **ANY access control check fails** -> STOP IMMEDIATELY
- **Sandbox escape possible** -> STOP IMMEDIATELY
- **Secrets visible in logs** -> STOP. Fix redaction.
- **Blocklist has < 50 patterns** -> STOP. Insufficient coverage.
- **Unpaired user can reach agent** -> STOP. DM pairing broken.
