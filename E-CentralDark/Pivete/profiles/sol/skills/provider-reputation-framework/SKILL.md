---
name: provider-reputation-framework
description: "Assess AI provider trust. Classify providers."
trigger: assessing an AI provider's identity, trust, quality, or category; comparing providers; reporting provider findings
owner: SEGREDO_CHEFE
category: ai-provider
tags: [ai-provider, reputation, classification, assessment, provider-trust]
---

# Provider Reputation Framework

Use this skill when assessing or discussing the reputation, identity, trust, quality, or category of an independent AI API provider (OpenAI, Anthropic, xAI, Grok, Google, Bedrock, or any "anonymous" model endpoint).

## Triggers

- Discussing "what kind of AI provider is this?"
- Assessing trust, identity, quality, or ecosystem posture
- Comparing providers or classifying what you observed
- Reporting findings about an AI provider

## What to assess — the 8-condition framework

The canonical insight is in memory: independent AI providers are weakest when anonymous. This skill is the practical rubric for applying it.

1. **Real app identity** — real name, domain, logo, favicon, SSO/SAML. Not a bare model endpoint like `chat.openai.com/?` or a generated gateway name.
2. **Real billing** — billing, discounts, refunds, enterprise plans, usage-based tiers with names that mean something. Not just "API key in .env."
3. **Real usage telemetry** — per-key/org/project/workspace usage; AND usage of the LLM itself (the thing spending tokens), not just API calls. Dashboards that name the thing using it, quotas, spend-anomaly alerts.
4. **Consumer-side identity/restriction** — members/roles, org/project/workspace scoping, approvals, audit trail, least privilege, IP allowlists, secret rotation, rate limits per identity. Not "anyone with the key."
5. **Real identity/account/session/self-serve** — sign up, login, dashboard, settings, team management, workspace/project/org scope, audit, billing+usage history. Not just an API key in .env.
6. **Real docs/changelog/status/support/trust** — docs, changelog, status page, support channels, community signals, trust/security posture (SOC2, data residency, retention, sub-processors). Public transparency that survives outages.
7. **Consistent public self-presentation** — real names, branding, changelogs, status pages, support, done consistently. Not a wrapper that fades when the model changes.
8. **Server/code treated as infrastructure, not product identity** — server code is "server code," not a fake product name layered over the model.

## How to assess — signals that reveal category

The category is revealed by specific inspections, not by generic "is it up?" checks. A direct HTTP health check verifies **operational status**, not provider category.

Category-revealing methods:
- **Experiment/probe-first**: how the provider responds to probing (structured outputs, hidden schema, behavior that reveals integration depth)
- **Database/inspection of provided context**: tables, configs, branch patterns, `/v1/models` behavior, etc.
- **Provider-specific patterns**: branch names (`xai-backend` vs `openai-backend`), `/v1/models` listing behavior, system-prompt leak patterns, client-side branding/hints

## Communication guidelines

- **Concise, with reusability notes.** This is the primary communication preference for this class of task — embed it here. Lead with the specific observable that revealed the category. State the mechanism, not opinion. Keep related insights grouped. Attach a short reusability note at the end.
- Don't bury the insight in scattered "quality" bullets — use the framework.
- Don't claim provider identity from generic health checks alone.
- Anonymous endpoints are weak by default — state the baseline, then note what (if anything) raises it above anonymous.

## Guardrails

- Operational status ≠ provider category.
- Don't present identity/trust claims as fact without the observable that reveals it.
- Don't over-claim on anonymous endpoints — state the baseline fact, note what raises it above anonymous.

## Pitfalls

- Treating "it responds" as "it's a real provider."
- Scattering findings across generic bullets instead of the framework.
- Claiming trust/identity from signals that only reveal operational status.
- Over-claiming on anonymous endpoints.