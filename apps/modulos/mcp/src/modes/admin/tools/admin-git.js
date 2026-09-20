import { z } from "zod";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const pexec = promisify(execFile);
const REPO = "/root/CentralDark";

function ok(data) {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

async function git(args, timeoutMs = 30000) {
  return pexec("git", ["-C", REPO, ...args], { timeout: timeoutMs, maxBuffer: 8 * 1024 * 1024 });
}

export const adminGitTools = [
  {
    name: "admin_git_status",
    description: "ADMIN: mostra git status curto, branch atual e ultimo commit do repo /root/CentralDark.",
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "Admin git status" },
    inputSchema: z.object({}),
    handler: async () => {
      const [status, branch, last] = await Promise.all([
        git(["status", "--short", "--branch"]),
        git(["rev-parse", "--abbrev-ref", "HEAD"]),
        git(["log", "-1", "--pretty=format:%h %an %ad %s", "--date=iso"]),
      ]);
      return ok({
        ok: true,
        repo: REPO,
        branch: branch.stdout.trim(),
        lastCommit: last.stdout.trim(),
        status: status.stdout.trim(),
      });
    },
  },
  {
    name: "admin_git_pull",
    description: "ADMIN DESTRUTIVO: executa git pull --ff-only no repo /root/CentralDark. Exige confirmAdmin=CONFIRMO ADMIN.",
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false, title: "Admin git pull" },
    inputSchema: z.object({
      rebase: z.boolean().optional().describe("Se true, usa --rebase. Default false (--ff-only)."),
    }),
    handler: async (input) => {
      const args = ["pull", input.rebase ? "--rebase" : "--ff-only"];
      try {
        const { stdout, stderr } = await git(args, 60000);
        return ok({ ok: true, repo: REPO, args, stdout: stdout.slice(-4000), stderr: stderr.slice(-2000) });
      } catch (e) {
        return ok({ ok: false, repo: REPO, args, error: String(e?.message || e), stdout: (e?.stdout || "").slice(-4000), stderr: (e?.stderr || "").slice(-2000) });
      }
    },
  },
];
