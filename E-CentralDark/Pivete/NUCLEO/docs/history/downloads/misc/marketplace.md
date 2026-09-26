# OUTRO - marketplace.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\vercel\commands\marketplace.md
**SHA:** e4d702ff3e161e65
**Timestamp:** 2026-08-26T18:45:05.254611
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - If local env sync was disabled or `.env.local` is stale, run:

### Gaps
- - If missing: `npm i -g vercel` (or `pnpm add -g vercel` / `bun add -g vercel`).

### Ouro Bruto (primeiros 5000 chars)
```
---
description: Discover and install Vercel Marketplace integrations. Use to find databases, CMS, auth providers, and other services available on the Vercel Marketplace.
---

# Vercel Marketplace

Discover, install, and apply Vercel Marketplace integrations with guided setup and local verification.

## Preflight

1. **Project linked?** — Check for `.vercel/project.json` in the current directory or nearest parent.
   - If not found: run `vercel link` interactively, then re-run `/marketplace`.
   - Do not attempt provisioning until the project is linked.
2. **CLI available?** — Confirm `vercel` is on PATH.
   - If missing: `npm i -g vercel` (or `pnpm add -g vercel` / `bun add -g vercel`).
3. **Repo state** — Note uncommitted changes so the user can diff integration-related code changes later.
4. **Scope** — Detect monorepo (`turbo.json` or `pnpm-workspace.yaml`). If detected, confirm which package is targeted.

## Plan

The marketplace command follows an **apply-guide loop**:

1. **Discover** — Search the Marketplace catalog via `vercel integration discover`.
2. **Select** — User picks an integration (or specifies one in "$ARGUMENTS").
3. **Guide** — Fetch the agent-friendly setup guide via `vercel integration guide <name> --framework <fw>`.
4. **Install** — Run `vercel integration add <name>` for the automated happy path.
5. **Confirm env vars provisioned** — Explicitly verify required environment variables are set after provisioning.
6. **Apply code changes** — Install SDK packages and scaffold configuration code.
7. **Verify drain** — For observability integrations, confirm drain was auto-created and data is flowing.
8. **Run local health check** — Verify the integration works locally before deploying.

If "$ARGUMENTS" specifies an integration name, skip directly to the **Guide** step.

For observability integrations (Datadog, Sentry, Axiom, etc.), the flow extends with drain verification — see Step 7.

No destructive operations unless the user explicitly confirms. Package installs and code scaffolding are additive.

## Commands

### 1. Discover — Search the Marketplace Catalog

```bash
# Search all available integrations
vercel integration discover

# Filter by category
vercel integration discover --category databases
vercel integration discover --category monitoring
vercel integration discover --category auth

# List integrations already installed on this project
vercel integration list
```

Present integrations organized by category:

| Category   | Examples                          |
| ---------- | --------------------------------- |
| Database   | Neon, PlanetScale, Supabase       |
| Cache      | Upstash Redis, Upstash KV         |
| Auth       | Clerk, Auth0                      |
| CMS        | Sanity, Contentful, Prismic       |
| Payments   | Stripe, LemonSqueezy              |
| Monitoring | Datadog, Sentry, Axiom, Honeycomb |

Common replacements for sunset packages:

- **Neon** — Serverless Postgres (replaces `@vercel/postgres`)
- **Upstash** — Serverless Redis (replaces `@vercel/kv`)

### 2. Select — User Picks an Integration

If the user hasn't specified one in "$ARGUMENTS", ask which integration to set up. Accept the integration name or slug.

### 3. Guide — Fetch Setup Steps

```bash
# Get agent-friendly setup guide
vercel integration guide <name> --framework <fw>
```

Use framework-specific guides by default when framework is known. If unknown, infer from the repo and confirm with the user.

The guide returns structured setup steps: required env vars, SDK packages, code snippets, and framework-specific notes. Present these to the user.

### 4. Install — Add the Integration

```bash
vercel integration add <name>
```

`vercel integration add` is the primary scripted/AI flow. It installs against the linked project, auto-connects the integration, and auto-runs local env sync unless disabled.

If the CLI bounces to the dashboard for provider-specific completion, treat it as fallback and open the integration page directly:

```bash
vercel integration open <name>
```

Complete the web step, then continue with env verification.

After installation, the integration auto-provisions environment variables. For observability vendors (Datadog, Sentry, Axiom), this also auto-creates **log and trace drains**.

### 5. Confirm Env Vars Provisioned

Before applying code changes, verify the integration's required environment variables exist:

```bash
vercel env ls
```

Check that each variable name listed in the guide appears in the output. **Never echo variable values — check names only.**

- If local env sync was disabled or `.env.local` is stale, run:

```bash
vercel env pull .env.local --yes
```

- **All present** → Proceed to code changes.
- **Missing vars** → Tell the user which variables are missing. The integration install via `vercel integration add <name>` typically provisions these automatically. Guide the user to provision them before continuing.

### 6. Apply Code Changes

Install the SDK packa
```