# PADRAO - SKILL.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\vercel\skills\bootstrap\SKILL.md
**SHA:** 509de0d4efe0611e
**Timestamp:** 2026-08-26T18:42:40.909046
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- 5. Create local env file if missing:

### Ouro Bruto (primeiros 5000 chars)
```
---
name: bootstrap
description: Project bootstrapping orchestrator for repos that depend on Vercel-linked resources (databases, auth, and managed integrations). Use when setting up or repairing a repository so linking, environment provisioning, env pulls, and first-run db/dev commands happen in the correct safe order.
metadata:
  priority: 8
  docs:
    - "https://vercel.com/docs/getting-started-with-vercel"
    - "https://nextjs.org/docs/getting-started/installation"
  sitemap: "https://vercel.com/sitemap/docs.xml"
  pathPatterns:
    - '.env.example'
    - '.env.sample'
    - '.env.template'
    - 'README*'
    - 'docs/**/setup*'
    - 'package.json'
    - 'drizzle.config.*'
    - 'prisma/schema.prisma'
    - 'auth.*'
    - 'src/**/auth.*'
  bashPatterns:
    - '\\bcp\\s+\\.env\\.(?:example|sample|template)\\s+\\.env\\.local\\b'
    - '\\b(?:npm|pnpm|bun|yarn)\\s+run\\s+db:(?:push|seed|migrate|generate)\\b'
    - '\\b(?:npm|pnpm|bun|yarn)\\s+run\\s+dev\\b'
    - '\\bvercel\\s+link\\b'
    - '\\bvercel\\s+integration\\s+(?:add|install)\\b'
    - '\\bvercel\\s+env\\s+pull\\b'
  importPatterns:
    - '@neondatabase/serverless'
    - 'drizzle-orm'
    - '@upstash/redis'
    - '@vercel/blob'
    - '@vercel/edge-config'
    - 'next-auth'
    - '@auth/core'
    - 'better-auth'
---

# Project Bootstrap Orchestrator

Execute bootstrap in strict order. Do not run migrations or development server until project linking and environment verification are complete.

## Rules

- Do not run `db:push`, `db:migrate`, `db:seed`, or `dev` until Vercel linking is complete and env keys are verified.
- Prefer Vercel-managed provisioning (`vercel integration ...`) for shared resources.
- Use provider CLIs only as fallback when Vercel integration flow is unavailable.
- Never echo secret values in terminal output, logs, or summaries.

## Preflight

1. Confirm Vercel CLI is installed and authenticated.

```bash
vercel --version
vercel whoami
```

2. Confirm repo linkage by checking `.vercel/project.json`.
3. If not linked, inspect available teams/projects before asking the user to choose:

```bash
vercel teams ls
vercel projects ls --scope <team>
vercel link --yes --scope <team> --project <project>
```

4. Find the env template in priority order: `.env.example`, `.env.sample`, `.env.template`.
5. Create local env file if missing:

```bash
cp .env.example .env.local
```

## Resource Setup: Postgres

### Preferred path (Vercel-managed Neon)

1. Read integration setup guidance:

```bash
vercel integration guide neon
```

2. Add Neon integration to the Vercel scope:

```bash
vercel integration add neon --scope <team>
```

3. Verify expected environment variable names exist in Vercel and pull locally:

```bash
vercel env ls
vercel env pull .env.local --yes
```

### Fallback path 1 (Dashboard)

1. Provision Neon through the Vercel dashboard integration UI.
2. Re-run `vercel env pull .env.local --yes`.

### Fallback path 2 (Neon CLI)

Use Neon CLI only when Vercel-managed provisioning is unavailable. After creating resources, add required env vars in Vercel and pull again.

## AUTH_SECRET Generation

Generate a high-entropy secret without printing it, then store it in Vercel and refresh local env:

```bash
AUTH_SECRET="$(node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))")"
printf "%s" "$AUTH_SECRET" | vercel env add AUTH_SECRET development preview production
unset AUTH_SECRET
vercel env pull .env.local --yes
```

## Env Verification

Compare required keys from template file against `.env.local` keys (names only, never values):

```bash
template_file=""
for candidate in .env.example .env.sample .env.template; do
  if [ -f "$candidate" ]; then
    template_file="$candidate"
    break
  fi
done

comm -23 \
  <(grep -E '^[A-Za-z_][A-Za-z0-9_]*=' "$template_file" | cut -d '=' -f 1 | sort -u) \
  <(grep -E '^[A-Za-z_][A-Za-z0-9_]*=' .env.local | cut -d '=' -f 1 | sort -u)
```

Proceed only when missing key list is empty.

## App Setup

After linkage + env verification:

```bash
npm run db:push
npm run db:seed
npm run dev
```

Use the repository package manager (`npm`, `pnpm`, `bun`, or `yarn`) and run only scripts that exist in `package.json`.

## UI Baseline for Next.js + shadcn Projects

After linkage and env verification, establish the UI foundation before feature work:
1. Add a baseline primitive set: `npx shadcn@latest add button card input label textarea select switch tabs dialog alert-dialog sheet dropdown-menu badge separator skeleton table`
2. Apply the Geist font fix in `layout.tsx` and `globals.css`.
3. Confirm the app shell uses `bg-background text-foreground`.
4. Default to dark mode for product, admin, and AI apps unless the repo is clearly marketing-first.

## Bootstrap Verification

Confirm each checkpoint:

- `vercel whoami` succeeds.
- `.vercel/project.json` exists and matches chosen project.
- Postgres integration path completed (Vercel integration, dashboard, or provider CLI fallback).
- `verc
```