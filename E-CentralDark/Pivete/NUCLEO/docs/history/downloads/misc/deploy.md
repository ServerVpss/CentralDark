# OUTRO - deploy.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\vercel\commands\deploy.md
**SHA:** b45ce44b2db2025d
**Timestamp:** 2026-08-26T18:45:05.021118
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- - If missing: `npm i -g vercel` (or `pnpm add -g vercel` / `bun add -g vercel`).

### Ouro Bruto (primeiros 5000 chars)
```
---
description: Deploy the current project to Vercel. Pass "prod" or "production" as argument to deploy to production. Default is preview deployment.
---

# Deploy to Vercel

Deploy the current project to Vercel using the CLI, with preflight safety checks, explicit production confirmation, and post-deploy verification.

## Preflight

Run these checks before any deployment. Stop on failure and print actionable guidance.

1. **CLI available?** — Confirm `vercel` is on PATH.
   - If missing: `npm i -g vercel` (or `pnpm add -g vercel` / `bun add -g vercel`).
2. **Project linked?** — Check for `.vercel/project.json` in the current directory or nearest parent.
   - If not found: run `vercel link` interactively, then re-run `/deploy`.
3. **Monorepo detection** — Look for `turbo.json` or `pnpm-workspace.yaml` at the repo root.
   - If detected: confirm which package is targeted. If ambiguous, ask the user before proceeding.
4. **Uncommitted changes** — Run `git status --porcelain`.
   - If output is non-empty: warn the user that uncommitted changes will **not** be included in the deploy. Ask whether to continue or commit first.
   - If not a git repo, skip this check.
5. **Observability preflight** (production deploys only) —

<!-- Sourced from observability skill: Drains > Deploy Preflight Observability -->
Before promoting to production, verify observability readiness:

- **Drains check**: Query configured drains via MCP `list_drains` or REST API. If no drains are configured on a Pro/Enterprise plan, warn:
  > ⚠️ No drains configured. Production errors won't be forwarded to external monitoring.
  > Configure drains via Dashboard or REST API before promoting. See `⤳ skill: observability`.
- **Errored drains**: If any drain is in error state, warn and suggest remediation before deploying:
  > ⚠️ Drain "<url>" is errored. Fix or recreate before production deploy to avoid monitoring gaps.
- **Error monitoring**: Check that at least one of these is in place: configured drains, an error tracking integration (e.g., Sentry, Datadog via `vercel integration ls`), or `@vercel/analytics` in the project.
- These are warnings, not blockers — the user may proceed after acknowledgment.

## Plan

State the intended action before executing:

- **Preview deploy** (default): `vercel` — creates a preview deployment on a unique URL.
- **Production deploy**: `vercel --prod` — deploys to production domains.

If "$ARGUMENTS" contains "prod" or "production":

> ⚠️ **Production deployment requested.**
> This will deploy to your live production URL and affect real users.
> **Ask the user for explicit confirmation before proceeding.** Do not deploy to production without a clear "yes."

If "$ARGUMENTS" does not indicate production:

> Deploying a **preview** build. This creates an isolated URL and does not affect production.

## Commands

### Preview Deployment

<!-- Sourced from deployments-cicd skill: Deployment Commands > Preview Deployment -->
```bash
# Deploy from project root (creates preview URL)
vercel

# Equivalent explicit form
vercel deploy
```

Preview deployments are created automatically for every push to a non-production branch when using Git integration. They provide a unique URL for testing.

### Production Deployment (requires confirmation)

<!-- Sourced from deployments-cicd skill: Deployment Commands > Production Deployment -->
```bash
# Deploy directly to production
vercel --prod
vercel deploy --prod

# Force a new deployment (skip cache)
vercel --prod --force
```

Capture the full command output. Extract the **deployment URL** from the output (the line containing the `.vercel.app` URL or custom domain URL).

Record the current git commit SHA for the summary:

```bash
git rev-parse --short HEAD
```

## Verification

After deployment completes, verify the result:

### 1. Inspect the Deployment

<!-- Sourced from deployments-cicd skill: Deployment Commands > Inspect Deployments -->
```bash
# View deployment details (build info, functions, metadata)
vercel inspect <deployment-url>

# List recent deployments
vercel ls

# View logs for a deployment
vercel logs <deployment-url>
vercel logs <deployment-url> --follow
```

Extract: deployment state (READY / ERROR / QUEUED / BUILDING), build duration, framework, Node.js version, function count.

### 2. On Failure — Fetch Build Logs

If the deployment state is **ERROR** or the deploy command exited non-zero:

```bash
vercel logs <deployment-url>
```

Present the last 50 lines of build logs to help diagnose the failure. Highlight any lines containing `error`, `Error`, `ERR!`, or `FATAL`.

### 3. On Success — Quick Smoke Check

If the deployment state is **READY**, note the URL is live and accessible.

### 4. Post-Deploy Error Scan (production deploys)

<!-- Sourced from observability skill: Drains > Post-Deploy Error Scan -->
For production deployments, wait 60 seconds after READY state, then scan for early runtime errors:

```bash
vercel logs <deployment-url> --level error --since 
```

---

# OUTRO - deploy.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\mcp\src\tools\deploy.ts
**SHA:** 5b406d40376ea1e8
**Timestamp:** 2026-08-26T19:32:45.429969
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- branch: z.string().optional().describe("Branch (padrão: main)"),

### Ouro Bruto (primeiros 5000 chars)
```
// Tool unificada de status do deploy: junta GitHub Actions + último commit + PM2 + commit atual na VPS
// num resumo único com veredito OK / ALERTA / ERRO.

import { z } from "zod";
import { config } from "../config.js";
import * as gh from "../github.js";
import { runShell } from "../vps.js";

type Ctx = { token: string };

function ok(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

export const deployTools = [
  {
    name: "deploy_status",
    description:
      "Resumo unificado do estado do deploy: último commit no GitHub vs commit atual na VPS, status dos últimos workflows, processos PM2 com restart anormal. Devolve STATUS: OK | ALERTA | ERRO + detalhes. Apenas leitura.",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
      title: "Status do deploy (unificado)",
    },
    inputSchema: z.object({
      owner: z.string().optional(),
      repo: z.string().optional(),
      branch: z.string().optional().describe("Branch (padrão: main)"),
    }),
    handler: async (
      input: { owner?: string; repo?: string; branch?: string },
      ctx: Ctx
    ) => {
      const owner = input.owner ?? config.github.owner;
      const repo = input.repo ?? config.github.repo;
      const branch = input.branch ?? "main";

      const alerts: string[] = [];
      const errors: string[] = [];

      // 1. Último commit no GitHub
      let githubCommit: { sha?: string; message?: string; date?: string } = {};
      try {
        const commits = (await gh.listCommits(ctx.token, owner, repo, { branch, perPage: 1 })) as Array<{
          sha: string;
          commit: { message: string; author: { date: string } };
        }>;
        if (commits[0]) {
          githubCommit = {
            sha: commits[0].sha.slice(0, 7),
            message: commits[0].commit.message.split("\n")[0].slice(0, 100),
            date: commits[0].commit.author.date,
          };
        }
      } catch (e) {
        errors.push(`github_commits: ${String(e)}`);
      }

      // 2. Últimos workflow runs
      let workflowRuns: Array<{ name?: string; status?: string; conclusion?: string; created_at?: string; url?: string }> = [];
      try {
        const runs = (await gh.listWorkflowRuns(ctx.token, owner, repo, { perPage: 5, branch })) as {
          workflow_runs?: Array<{
            name: string;
            status: string;
            conclusion: string | null;
            created_at: string;
            html_url: string;
          }>;
        };
        workflowRuns = (runs.workflow_runs ?? []).map((r) => ({
          name: r.name,
          status: r.status,
          conclusion: r.conclusion ?? undefined,
          created_at: r.created_at,
          url: r.html_url,
        }));
        const failed = workflowRuns.filter((r) => r.conclusion === "failure");
        if (failed.length > 0) {
          errors.push(`${failed.length} workflow run(s) com conclusion=failure nos últimos 5`);
        }
        const running = workflowRuns.filter((r) => r.status === "in_progress" || r.status === "queued");
        if (running.length > 0) {
          alerts.push(`${running.length} workflow run(s) ainda em execução`);
        }
      } catch (e) {
        errors.push(`github_workflows: ${String(e)}`);
      }

      // 3. Commit atual na VPS
      let vpsCommit: { sha?: string; message?: string; behind?: boolean } = {};
      try {
        const res = await runShell(
          `git log -1 --format='%h|%s' && echo '---' && git rev-list --count HEAD..origin/${branch} 2>/dev/null || echo 0`,
          { cwd: config.vps.repoPath, timeoutMs: 15_000 }
        );
        const lines = res.stdout.trim().split("\n");
        const [sha, ...msgParts] = (lines[0] ?? "").split("|");
        vpsCommit.sha = sha;
        vpsCommit.message = msgParts.join("|").slice(0, 100);
        const behindLine = lines[lines.length - 1] ?? "0";
        const behind = parseInt(behindLine, 10) || 0;
        vpsCommit.behind = behind > 0;
        if (behind > 0) {
          alerts.push(`VPS está ${behind} commit(s) atrás da branch ${branch}`);
        }
      } catch (e) {
        errors.push(`vps_commit: ${String(e)}`);
      }

      // 4. PM2 — processos com restart anormal ou parados
      let pm2Summary: Array<{ name: string; status: string; restarts: number; uptime_min: number }> = [];
      try {
        const res = await runShell("pm2 jlist", { timeoutMs: 15_000 });
        const list = JSON.parse(res.stdout) as Array<{
          name: string;
          pm2_env: { status: string; restart_time: number; pm_uptime: number };
        }>;
        const now = Date.now();
        pm2Summary = list.map((p) => ({
          name: p.name,
          status: p.pm2_env.status,
          restarts: p.pm2_env.restart_time,
          uptime_min: Math.round((now - p.pm2_env.pm_uptime) / 60_000),
        }));
        const stopped = pm2Summary.filter(
```

---

# OUTRO - deploy.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\apps\modulos\mcp\dist\tools\deploy\deploy.js
**SHA:** 0d338483b7627dfe
**Timestamp:** 2026-08-28T02:54:52.993306
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const jsonStart = res.stdout.indexOf("[");

### Padroes
- branch: z.string().optional().describe("Branch (padrão: main)"),

### Ouro Bruto (primeiros 5000 chars)
```
// Tool unificada de status do deploy: junta GitHub Actions + último commit + PM2 + commit atual na VPS
// num resumo único com veredito OK / ALERTA / ERRO.
import { z } from "zod";
import { config } from "../../config.js";
import * as gh from "../github/github.js";
import { runShell } from "../vps/vps.js";
function ok(data) {
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}
export const deployTools = [
    {
        name: "deploy_status",
        description: "Resumo unificado do estado do deploy: último commit no GitHub vs commit atual na VPS, status dos últimos workflows, processos PM2 com restart anormal. Devolve STATUS: OK | ALERTA | ERRO + detalhes. Apenas leitura.",
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: true,
            title: "Status do deploy (unificado)",
        },
        inputSchema: z.object({
            owner: z.string().optional(),
            repo: z.string().optional(),
            branch: z.string().optional().describe("Branch (padrão: main)"),
        }),
        handler: async (input, ctx) => {
            const owner = input.owner ?? config.github.owner;
            const repo = input.repo ?? config.github.repo;
            const branch = input.branch ?? "main";
            const alerts = [];
            const errors = [];
            // 1. Último commit no GitHub
            let githubCommit = {};
            try {
                const commits = (await gh.listCommits(ctx.token, owner, repo, { branch, perPage: 1 }));
                if (commits[0]) {
                    githubCommit = {
                        sha: commits[0].sha.slice(0, 7),
                        message: commits[0].commit.message.split("\n")[0].slice(0, 100),
                        date: commits[0].commit.author.date,
                    };
                }
            }
            catch (e) {
                errors.push(`github_commits: ${String(e)}`);
            }
            // 2. Últimos workflow runs
            let workflowRuns = [];
            try {
                const runs = (await gh.listWorkflowRuns(ctx.token, owner, repo, { perPage: 5, branch }));
                workflowRuns = (runs.workflow_runs ?? []).map((r) => ({
                    name: r.name,
                    status: r.status,
                    conclusion: r.conclusion ?? undefined,
                    created_at: r.created_at,
                    url: r.html_url,
                }));
                const failed = workflowRuns.filter((r) => r.conclusion === "failure");
                if (failed.length > 0) {
                    errors.push(`${failed.length} workflow run(s) com conclusion=failure nos últimos 5`);
                }
                const running = workflowRuns.filter((r) => r.status === "in_progress" || r.status === "queued");
                if (running.length > 0) {
                    alerts.push(`${running.length} workflow run(s) ainda em execução`);
                }
            }
            catch (e) {
                errors.push(`github_workflows: ${String(e)}`);
            }
            // 3. Commit atual na VPS
            let vpsCommit = {};
            try {
                const res = await runShell(`git log -1 --format='%h|%s' && echo '---' && git rev-list --count HEAD..origin/${branch} 2>/dev/null || echo 0`, { cwd: config.vps.repoPath, timeoutMs: 15_000 });
                const lines = res.stdout.trim().split("\n");
                const [sha, ...msgParts] = (lines[0] ?? "").split("|");
                vpsCommit.sha = sha;
                vpsCommit.message = msgParts.join("|").slice(0, 100);
                const behindLine = lines[lines.length - 1] ?? "0";
                const behind = parseInt(behindLine, 10) || 0;
                vpsCommit.behind = behind > 0;
                if (behind > 0) {
                    alerts.push(`VPS está ${behind} commit(s) atrás da branch ${branch}`);
                }
            }
            catch (e) {
                errors.push(`vps_commit: ${String(e)}`);
            }
            // 4. PM2 — processos com restart anormal ou parados
            let pm2Summary = [];
            try {
                const res = await runShell("pm2 jlist 2>/dev/null", { timeoutMs: 15_000 });
                // pm2 jlist pode emitir linhas de aviso antes do JSON — extrai só o array
                const jsonStart = res.stdout.indexOf("[");
                const raw = jsonStart >= 0 ? res.stdout.slice(jsonStart) : res.stdout;
                const list = JSON.parse(raw);
                const now = Date.now();
                pm2Summary = list.map((p) => ({
                    name: p.name,
                    status: p.pm2_env.status,
                    restarts: p.pm2_env.restart_time,
                    uptime_min: Math.round((now - p.pm2_env.pm_uptime) / 60_000),
                }));
                const stopped = pm2Summar
```

---

# OUTRO - deploy.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\apps\modulos\mcp\src\tools\deploy\deploy.js
**SHA:** 68d9f7ed0c835678
**Timestamp:** 2026-08-28T02:55:03.968670
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const jsonStart = res.stdout.indexOf("[");

### Padroes
- branch: z.string().optional().describe("Branch (padrão: main)"),

### Ouro Bruto (primeiros 5000 chars)
```
// Tool unificada de status do deploy: junta GitHub Actions + último commit + PM2 + commit atual na VPS
// num resumo único com veredito OK / ALERTA / ERRO.
import { z } from "zod";
import { config } from "../../config.js";
import * as gh from "../github/github.js";
import { runShell } from "../vps/vps.js";
function ok(data) {
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}
export const deployTools = [
    {
        name: "deploy_status",
        description: "Resumo unificado do estado do deploy: último commit no GitHub vs commit atual na VPS, status dos últimos workflows, processos PM2 com restart anormal. Devolve STATUS: OK | ALERTA | ERRO + detalhes. Apenas leitura.",
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: true,
            title: "Status do deploy (unificado)",
        },
        inputSchema: z.object({
            owner: z.string().optional(),
            repo: z.string().optional(),
            branch: z.string().optional().describe("Branch (padrão: main)"),
        }),
        handler: async (input, ctx) => {
            const owner = input.owner ?? config.github.owner;
            const repo = input.repo ?? config.github.repo;
            const branch = input.branch ?? "main";
            const alerts = [];
            const errors = [];
            // 1. Último commit no GitHub
            let githubCommit = {};
            try {
                const commits = (await gh.listCommits(ctx.token, owner, repo, { branch, perPage: 1 }));
                if (commits[0]) {
                    githubCommit = {
                        sha: commits[0].sha.slice(0, 7),
                        message: commits[0].commit.message.split("\n")[0].slice(0, 100),
                        date: commits[0].commit.author.date,
                    };
                }
            }
            catch (e) {
                errors.push(`github_commits: ${String(e)}`);
            }
            // 2. Últimos workflow runs
            let workflowRuns = [];
            try {
                const runs = (await gh.listWorkflowRuns(ctx.token, owner, repo, { perPage: 5, branch }));
                workflowRuns = (runs.workflow_runs ?? []).map((r) => ({
                    name: r.name,
                    status: r.status,
                    conclusion: r.conclusion ?? undefined,
                    created_at: r.created_at,
                    url: r.html_url,
                }));
                const failed = workflowRuns.filter((r) => r.conclusion === "failure");
                if (failed.length > 0) {
                    errors.push(`${failed.length} workflow run(s) com conclusion=failure nos últimos 5`);
                }
                const running = workflowRuns.filter((r) => r.status === "in_progress" || r.status === "queued");
                if (running.length > 0) {
                    alerts.push(`${running.length} workflow run(s) ainda em execução`);
                }
            }
            catch (e) {
                errors.push(`github_workflows: ${String(e)}`);
            }
            // 3. Commit atual na VPS
            let vpsCommit = {};
            try {
                const res = await runShell(`git log -1 --format='%h|%s' && echo '---' && git rev-list --count HEAD..origin/${branch} 2>/dev/null || echo 0`, { cwd: config.vps.repoPath, timeoutMs: 15_000 });
                const lines = res.stdout.trim().split("\n");
                const [sha, ...msgParts] = (lines[0] ?? "").split("|");
                vpsCommit.sha = sha;
                vpsCommit.message = msgParts.join("|").slice(0, 100);
                const behindLine = lines[lines.length - 1] ?? "0";
                const behind = parseInt(behindLine, 10) || 0;
                vpsCommit.behind = behind > 0;
                if (behind > 0) {
                    alerts.push(`VPS está ${behind} commit(s) atrás da branch ${branch}`);
                }
            }
            catch (e) {
                errors.push(`vps_commit: ${String(e)}`);
            }
            // 4. PM2 — processos com restart anormal ou parados
            let pm2Summary = [];
            try {
                const res = await runShell("pm2 jlist 2>/dev/null", { timeoutMs: 15_000 });
                // pm2 jlist pode emitir linhas de aviso antes do JSON — extrai só o array
                const jsonStart = res.stdout.indexOf("[");
                const raw = jsonStart >= 0 ? res.stdout.slice(jsonStart) : res.stdout;
                const list = JSON.parse(raw);
                const now = Date.now();
                pm2Summary = list.map((p) => ({
                    name: p.name,
                    status: p.pm2_env.status,
                    restarts: p.pm2_env.restart_time,
                    uptime_min: Math.round((now - p.pm2_env.pm_uptime) / 60_000),
                }));
                const stopped = pm2Summar
```