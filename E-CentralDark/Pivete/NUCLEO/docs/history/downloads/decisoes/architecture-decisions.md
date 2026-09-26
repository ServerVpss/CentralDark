# AutoClaw Architecture Decisions

> Key architectural decisions and their rationale.
> Each decision traces back to steipete's principles or OpenClaw docs.

---

## ADR-001: Single Expert Agent + AIOS Handoffs

**Decision:** Squad has ONE expert agent (steipete) who delegates to existing AIOS agents.

**Rationale:** steipete knows WHY every decision was made. AIOS agents know HOW to execute. Combining domain expertise (steipete) with execution capability (AIOS) avoids duplicating agent capabilities.

**Alternatives rejected:**
- Multiple domain experts: OpenClaw has one creator, not a committee
- steipete does everything: AIOS agents already have VPS, Docker, testing capabilities

**Source:** Squad architecture design session, 2026-02-14

---

## ADR-002: Hetzner CX22 as Minimum VPS

**Decision:** CX22 (2 vCPU, 4GB RAM, 40GB NVMe) is the minimum spec.

**Rationale:** OpenClaw gateway + Docker sandbox + systemd overhead requires ~2GB steady state. CX22 at EUR 3.99/mo gives sufficient headroom. CX32 (8GB) recommended if running N8N + Portainer on same VPS.

**Source:** OPENCLAW-WHITELABEL-INSTALL-GUIDE.md, deploy-vps-infra.md cost reference

---

## ADR-003: Loopback-Only Gateway + Tailscale

**Decision:** Gateway binds to 127.0.0.1:18789. External access ONLY through Tailscale mesh VPN.

**Rationale:** Fail-closed security (steipete ST_002). Nothing reachable unless explicitly shared. Tailscale gives zero-config mesh VPN where everything is private by default.

**Alternatives rejected:**
- Open port with firewall rules: One misconfiguration = exposed
- Regular VPN: Requires manual firewall configuration
- Cloudflare Tunnel: Adds external dependency, less control

**Source:** steipete ST_002 - Fail-Closed Default, OpenClaw security docs

---

## ADR-004: 3-Layer Security Model

**Decision:** Defense in depth with 3 layers: Access Control + Sandboxing + Audit.

**Rationale:** Each layer catches what the previous missed. Blocklist catches known patterns, sandbox contains unknown attacks, audit trail provides forensics.

**Layer 1 — Access Control:** Loopback binding, DM pairing, token auth, UFW firewall
**Layer 2 — Sandboxing:** Docker (Alpine, non-root, network=none), workspace isolation
**Layer 3 — Audit:** journald logging, logrotate, secret redaction, detect-secrets

**Source:** OpenClaw security docs, steipete ST_002

---

## ADR-005: LLM Tier Routing (Budget/Standard/Premium)

**Decision:** 3-tier LLM routing with automatic fallback chain.

**Rationale:** 85% cost reduction by routing simple queries to budget models. Budget tier handles ~70% of traffic. Premium reserved for security-critical and complex analysis.

| Tier | Models | Traffic | Use Case |
|------|--------|---------|----------|
| Budget | DeepSeek | ~70% | Status checks, simple queries |
| Standard | Claude Sonnet | ~25% | Normal operations |
| Premium | Claude Opus | ~5% | Complex analysis, security decisions |

**Critical rule:** NEVER use cheap models for agents with system access (steipete ST_013).

**Source:** steipete ST_013, LLM Router concept, Lex Fridman #491

---

## ADR-006: Pedro Valerio 6-Phase Deployment Pipeline

**Decision:** Deployment follows a strict 6-phase pipeline with gates between each phase.

**Rationale:** Unidirectional flow prevents regression. Gates are walls, not suggestions. Security gate (QG-AC-5) has zero tolerance.

**Pipeline:** Infrastructure → Identity → Architecture → Implementation → Security → Validation

**Source:** wf-whitelabel-deploy.yaml, Pedro Valerio process design

---

## ADR-007: GitHub URL Standardization (nicepkg/openclaw)

**Decision:** All references use `github.com/nicepkg/openclaw` as canonical URL.

**Rationale:** OpenClaw was renamed from Clawdbot → Moltbot → OpenClaw. The `nicepkg` org is the canonical GitHub organization. Consistent references prevent confusion during deployment.

**Source:** Research report 2026-02-14, systemd-service-tmpl.conf
