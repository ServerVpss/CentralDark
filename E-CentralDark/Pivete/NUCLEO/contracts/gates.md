# CONTRATO - gates
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\squads\autoclaw\.synapse\gates
**SHA:** ea73970a64090a91
**Timestamp:** 2026-08-28T02:19:11.768401
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- GATE_1_BLOCKER=true
- GATE_2_BLOCKER=true
- GATE_3_BLOCKER=true
- GATE_4_BLOCKER=true
- GATE_5_BLOCKER=true
- GATE_6_BLOCKER=true

### Ouro Bruto (primeiros 5000 chars)
```
# AutoClaw — Quality Gates
# NON-NEGOTIABLE gates for OpenClaw whitelabel deployment

# Gate 1: Infrastructure Ready
GATE_1_NAME=INFRA_READY
GATE_1_RULE=VPS provisioned, Tailscale connected, OpenClaw running as systemd service
GATE_1_BLOCKER=true
GATE_1_CHECK=tailscale ping + /health OK + systemd active
GATE_1_AFTER=phase_1_2

# Gate 2: Identity Created
GATE_2_NAME=IDENTITY_CREATED
GATE_2_RULE=Whitelabel agent directory exists with AGENTS.md + SOUL.md
GATE_2_BLOCKER=true
GATE_2_CHECK=apps/{agent-name}/ exists with all subdirs + openclaw agent --list shows agent
GATE_2_AFTER=phase_3

# Gate 3: Architecture Valid
GATE_3_NAME=ARCHITECTURE_VALID
GATE_3_RULE=LLM Router configured with valid tiers, skills mapped, .env populated
GATE_3_BLOCKER=true
GATE_3_CHECK=llm-router-config.yaml valid YAML + all tiers respond + .env has API keys
GATE_3_AFTER=phase_4

# Gate 4: Implementation Complete
GATE_4_NAME=IMPLEMENTATION_COMPLETE
GATE_4_RULE=Skills installed, config.js customized, bridge.js detecting service
GATE_4_BLOCKER=true
GATE_4_CHECK=npm install succeeds + config.js no clawdbot refs + bridge detects service
GATE_4_AFTER=phase_5a

# Gate 5: Security Hardened (CRITICAL)
GATE_5_NAME=SECURITY_HARDENED
GATE_5_RULE=3-layer security active: blocklist + Docker sandbox + audit logging
GATE_5_BLOCKER=true
GATE_5_CHECK=blocked commands rejected + sandbox isolated + logs redacted
GATE_5_AFTER=phase_5b

# Gate 6: Deployment Validated
GATE_6_NAME=DEPLOYMENT_VALIDATED
GATE_6_RULE=All validation items pass, e2e works, security baseline met
GATE_6_BLOCKER=true
GATE_6_CHECK=all 10 validation items pass + e2e flow works + performance baseline met
GATE_6_AFTER=phase_6

# Enforcement
ENFORCEMENT=NON-NEGOTIABLE
OVERRIDE_ALLOWED=false
FAILURE_STRATEGY=block-and-report
SECURITY_GATES_ZERO_TOLERANCE=GATE_5,GATE_6

```