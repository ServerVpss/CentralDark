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
        const stopped = pm2Summary.filter((p) => p.status !== "online");
        if (stopped.length > 0) {
          const real = stopped.filter((p) => p.name !== "whatsapp-server");
          if (real.length > 0) {
            errors.push(`PM2 com status≠online: ${real.map((p) => p.name).join(", ")}`);
          } else {
            alerts.push(`PM2 stopped (esperado): ${stopped.map((p) => p.name).join(", ")}`);
          }
        }
        const looping = pm2Summary.filter((p) => p.status === "online" && p.uptime_min < 2 && p.restarts > 5);
        if (looping.length > 0) {
          errors.push(`PM2 em restart loop: ${looping.map((p) => p.name).join(", ")}`);
        }
      } catch (e) {
        errors.push(`vps_pm2: ${String(e)}`);
      }

      // 5. Sync GitHub ↔ VPS
      const synced =
        githubCommit.sha && vpsCommit.sha && githubCommit.sha.startsWith(vpsCommit.sha) === false
          ? !vpsCommit.behind
          : true;
      if (githubCommit.sha && vpsCommit.sha && vpsCommit.behind) {
        // já adicionado acima
      }

      const status: "OK" | "ALERTA" | "ERRO" = errors.length > 0 ? "ERRO" : alerts.length > 0 ? "ALERTA" : "OK";

      return ok({
        status,
        resumo: {
          erros: errors,
          alertas: alerts,
          ok: status === "OK" ? "Tudo sincronizado e rodando." : undefined,
        },
        github: {
          owner,
          repo,
          branch,
          ultimoCommit: githubCommit,
          ultimosWorkflows: workflowRuns,
        },
        vps: {
          repoPath: config.vps.repoPath,
          commitAtual: vpsCommit,
          pm2: pm2Summary,
        },
        sincronizado: synced,
        verificadoEm: new Date().toISOString(),
      });
    },
  },
] as const;
