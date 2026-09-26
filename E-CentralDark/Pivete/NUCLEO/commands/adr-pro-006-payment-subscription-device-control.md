# COMANDO - adr-pro-006-payment-subscription-device-control.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\architecture\adr\adr-pro-006-payment-subscription-device-control.md
**SHA:** d3663184a3826f50
**Timestamp:** 2026-08-28T02:02:32.720138
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- > 1. **Gateway Adapter Pattern:** The webhook handler MUST use a provider adapter interface. Define `WebhookProvider { verifySignature(), parseEvent(), mapToLicenseAction() }` so switching gateways re

### Gaps
- **The gap:** No automated payment flow exists. Users cannot purchase, receive credentials automatically, manage subscriptions, or recover lost keys. Device limits (max 2 per license) exist in schema (

### Ouro Bruto (primeiros 5000 chars)
```
# ADR-PRO-006: Payment Gateway, Subscription Management & Device Control

**ID:** ADR-PRO-006
**Status:** Proposed
**Created:** 2026-02-11
**Author:** Atlas (@analyst) + Aria (@architect)
**Story:** PRO-9
**Deciders:** Aria (@architect), Morgan (@pm), Stakeholder

---

## Context

AIOS Pro operates as an open-core CLI product: `aios-core` is MIT-licensed and free, while `aios-pro` is a proprietary git submodule with premium squads, persistent memory, usage metrics, and enterprise integrations. The existing infrastructure (PRO-1 through PRO-8) provides feature gating, license key validation, encrypted local cache, machine fingerprinting, and graceful degradation.

**The gap:** No automated payment flow exists. Users cannot purchase, receive credentials automatically, manage subscriptions, or recover lost keys. Device limits (max 2 per license) exist in schema (`seats: { used, max }`) but are not enforced per-device.

This ADR consolidates findings from a comprehensive investigation (PRO-9) across 5 areas:
1. Payment gateway comparison (6 gateways analyzed)
2. Open-core benchmarking (10 projects analyzed)
3. Subscription and pricing model design
4. Device control strategy (hybrid identification)
5. Credential delivery and recovery flows

---

## Decision 1: Payment Gateway — Polar.sh (Primary) / LemonSqueezy (Alternative)

### Recommendation: Polar.sh as Primary Gateway

After analyzing 6 gateways, **Polar.sh** is recommended as the primary payment gateway, with **LemonSqueezy** as a strong alternative.

### Comparison Matrix

| Feature | Stripe | Paddle | LemonSqueezy | Gumroad | Polar.sh | GitHub Sponsors |
|---------|--------|--------|--------------|---------|----------|-----------------|
| **Type** | PSP | MoR | MoR | Marketplace | MoR | Sponsorship |
| **Base Fee** | 2.9%+$0.30 | 5%+$0.50 | 5%+$0.50+1.5% intl | 10%+$0.50 | 4%+$0.40 | 0-6% |
| **Tax/VAT Handled** | No (add-on) | Yes | Yes | Yes (2025+) | Yes | No |
| **Hosted Checkout** | Yes (Links) | Yes (web) | Yes (URL) | Yes | Yes (URL) | No |
| **Webhooks** | Excellent | Good | Good | Basic | Good | Limited |
| **Subscriptions** | Full | Full | Full | Basic | Full | Monthly tiers |
| **Built-in License Keys** | No | No | YES | YES | YES | No |
| **Node.js SDK** | Excellent | Good | Good | None | Excellent | N/A |
| **CLI Product Fit** | Good | Medium | Strong | Weak | Excellent | Poor |
| **Developer Focus** | General | SaaS | Indie | Creators | Dev Tools | OSS |

### Why Polar.sh

1. **Lowest MoR fees** (4% + $0.40) -- 20% cheaper than Paddle/LemonSqueezy
2. **Purpose-built for developer tools** -- exact fit for CLI open-core products
3. **Built-in license keys** with validation API -- eliminates need for custom license server for key generation
4. **GitHub repository access grants** -- can automatically manage private submodule access per subscription
5. **Type-safe Node.js SDK** (`@polar-sh/sdk`) with built-in webhook validation
6. **Open source** (Apache 2.0) -- aligns with AIOS open-core philosophy
7. **Checkout links** -- shareable URLs work perfectly for CLI products without a website

### Why LemonSqueezy as Alternative

1. More mature/battle-tested than Polar.sh
2. Acquired by Stripe (July 2024) -- signals stability
3. Strong built-in license key system with activation limits
4. Better international payment method support

### Trade-offs and Risks

| Risk | Polar.sh | LemonSqueezy |
|------|----------|--------------|
| Platform maturity | Newer, still maturing | Proven, larger user base |
| Payment methods | Cards via Stripe Connect only | Cards, PayPal, Apple Pay |
| Long-term viability | Open-source (can self-host) | May merge into Stripe MoR |
| Fee at $19/mo | $1.16 (6.1%) | $1.95 (10.3% with intl) |
| GitHub integration | Native repo access grants | Manual webhook integration |

### Architect Review Note

> **Aria (@architect):** Both are viable. The decision should weigh platform maturity (LemonSqueezy advantage) against cost savings and developer-focus (Polar.sh advantage). For a launch with <500 subscribers, the risk of Polar.sh's relative newness is manageable, and the 40% fee savings compound meaningfully. The open-source nature of Polar provides an escape hatch. **Recommendation: Start with Polar.sh, keep LemonSqueezy as documented fallback. Architecture must be gateway-agnostic at the webhook handler level.**

### Why Stripe is NOT Recommended as Primary

- No built-in license key system (requires custom infrastructure)
- YOU are the Merchant of Record -- full tax compliance burden
- Stripe Tax adds 0.5% and still does not remit
- Higher operational complexity for a small team
- Stripe Managed Payments (MoR) is in private preview, not GA

---

## Decision 2: Subscription Model — Hybrid Tiered ($19/mo Individual, $39/mo Team)

### Pricing Tiers

| Tier | Target | Seats | Monthly | Annual |
|------|--------|-------|---------|--------|
| **Pro Individual** | Solo developers | 1 (2 devices) | $19/mo | $190/yr (~17% off) |
| **Pro Te
```