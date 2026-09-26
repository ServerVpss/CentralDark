# COMANDO - env.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\vercel\commands\env.md
**SHA:** cb1a0174593e1e15
**Timestamp:** 2026-08-26T18:42:40.806045
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- - If missing: `npm i -g vercel` (or `pnpm add -g vercel` / `bun add -g vercel`).

### Ouro Bruto (primeiros 5000 chars)
```
---
description: Manage Vercel environment variables. Commands include list, pull, add, remove, and diff. Use to sync environment variables between Vercel and your local development environment.
---

# Vercel Environment Variables

Manage environment variables for the current Vercel project with safety rails to prevent secret leakage.

> **🔒 Never-Echo-Secrets Rule**: Environment variable **values** must never appear in command output, summaries, or conversation text. Only show variable **names**, **environments**, and **metadata** (created date, type). This rule applies to all subcommands.

## Preflight

1. **CLI available?** — Confirm `vercel` is on PATH.
   - If missing: `npm i -g vercel` (or `pnpm add -g vercel` / `bun add -g vercel`).
2. **Project linked?** — Check for `.vercel/project.json` in the current directory or nearest parent.
   - If not found: run `vercel link` interactively, then re-run `/env`.
3. **Detect environment files** — Check for `.env`, `.env.local`, `.env.production.local`, `.env.development.local` in the project root. Note which exist for the diff subcommand.

## Plan

Based on "$ARGUMENTS", determine the action:

| Argument | Action | Destructive? |
|----------|--------|-------------|
| `list` / `ls` / _(none)_ | List env var names per environment | No |
| `pull` | Download env vars to local `.env.local` | No (overwrites local file) |
| `add <NAME>` | Add a new env var | Yes (if production) |
| `rm <NAME>` / `remove <NAME>` | Remove an env var | **Yes** |
| `diff` | Compare local vs Vercel key names | No |

For any operation that mutates **production** environment variables (`add` or `rm` targeting production):

> ⚠️ **Production environment mutation requested.**
> This will change environment variables on your live production deployment.
> **Ask the user for explicit confirmation before proceeding.** Do not mutate production env vars without a clear "yes."

## Commands

### "list" or "ls" or no arguments

<!-- Sourced from env-vars skill: vercel env CLI > List Environment Variables -->
```bash
# List all environment variables
vercel env ls

# Filter by environment
vercel env ls production
```

Present results as a table of variable **names only** grouped by environment. **Never print values.**

| Name | Production | Preview | Development |
|------|-----------|---------|-------------|
| DATABASE_URL | ✓ | ✓ | ✓ |
| API_KEY | ✓ | ✓ | — |

### "pull"

<!-- Sourced from env-vars skill: vercel env CLI > Pull Environment Variables -->
```bash
# Pull all env vars for the current environment into .env.local
vercel env pull .env.local

# Pull for a specific environment
vercel env pull .env.local --environment=production
vercel env pull .env.local --environment=preview
vercel env pull .env.local --environment=development

# Overwrite existing file without prompting
vercel env pull .env.local --yes

# Pull to a custom file
vercel env pull .env.production.local --environment=production
```

After pulling, remind the user:

> Ensure `.env*.local` is in your `.gitignore` to avoid committing secrets.

### "add \<NAME\>"

1. Ask the user which environments to target: production, preview, development (can select multiple).
2. If **production** is selected, require explicit confirmation (see Plan section).
3. Run the add command:

<!-- Sourced from env-vars skill: vercel env CLI > Add Environment Variables -->
```bash
# Interactive — prompts for value and environments
vercel env add MY_SECRET

# Non-interactive
echo "secret-value" | vercel env add MY_SECRET production

# Add to multiple environments
echo "secret-value" | vercel env add MY_SECRET production preview development

# Add a sensitive variable (encrypted, not shown in logs)
vercel env add MY_SECRET --sensitive
```

The CLI will prompt for the value interactively — **do not pass the value as a CLI argument or echo it**.

### "rm \<NAME\>" or "remove \<NAME\>"

1. If the variable exists in **production**, require explicit confirmation.
2. Run the remove command:

<!-- Sourced from env-vars skill: vercel env CLI > Remove Environment Variables -->
```bash
# Remove from specific environment
vercel env rm MY_SECRET production

# Remove from all environments
vercel env rm MY_SECRET
```

Confirm the target environment(s) with the user before executing.

### "diff"

Compare local environment file key names against Vercel-configured key names. **Only compare names — never read or display values.**

1. Read local env file keys (from `.env.local` or `.env` — whichever exists):

```bash
grep -v '^#' .env.local | grep '=' | cut -d'=' -f1 | sort
```

2. Fetch Vercel env var names:

```bash
vercel env ls
```

Parse the output to extract variable names for the target environment (default: development).

3. Present the diff:

```
## Env Diff — Local vs Vercel (development)

### In local but NOT on Vercel:
- EXTRA_LOCAL_VAR
- DEBUG_MODE

### On Vercel but NOT in local:
- ANALYTICS_KEY
- SENTRY_DSN

### In both:
- DATABASE_URL
- API_KEY
- NEXT_PUBLIC_APP_U
```