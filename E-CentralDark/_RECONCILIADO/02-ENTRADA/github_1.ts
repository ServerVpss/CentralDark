// Webhook do GitHub: recebe push/workflow e manda resumo pro Telegram.
// Valida assinatura HMAC com GITHUB_WEBHOOK_SECRET.
import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";
import { sendTelegramAlert } from "@/lib/telegram-alerts.server";

function verifySignature(body: string, signature: string | null, secret: string): boolean {
  if (!signature?.startsWith("sha256=")) return false;
  const expected = "sha256=" + createHmac("sha256", secret).update(body).digest("hex");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export const Route = createFileRoute("/api/public/monitor/github")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.GITHUB_WEBHOOK_SECRET;
        if (!secret) return new Response("GITHUB_WEBHOOK_SECRET não configurado", { status: 503 });

        const body = await request.text();
        const sig = request.headers.get("x-hub-signature-256");
        if (!verifySignature(body, sig, secret)) {
          return new Response("Assinatura inválida", { status: 401 });
        }

        const event = request.headers.get("x-github-event") ?? "unknown";
        const payload: any = JSON.parse(body);
        const repo = payload?.repository?.full_name ?? "?";

        let title = `📦 GitHub: ${event} em ${repo}`;
        let friendly = "";
        let tech = JSON.stringify(payload, null, 2).slice(0, 1500);

        if (event === "push") {
          const branch = (payload?.ref ?? "").replace("refs/heads/", "");
          const commits = payload?.commits ?? [];
          const author = payload?.head_commit?.author?.name ?? payload?.pusher?.name ?? "?";
          const msg = payload?.head_commit?.message?.split("\n")[0] ?? "";
          title = `🟢 Novo push em ${repo} (${branch})`;
          friendly = `${author} enviou ${commits.length} commit(s) pra ${branch}.\nÚltima mensagem: "${msg}"`;
        } else if (event === "workflow_run") {
          const wf = payload?.workflow_run;
          const conclusion = wf?.conclusion ?? wf?.status ?? "?";
          const ok = conclusion === "success";
          title = `${ok ? "✅" : "❌"} Workflow ${wf?.name ?? ""} — ${conclusion}`;
          friendly = ok
            ? `O workflow "${wf?.name}" terminou com sucesso.`
            : `O workflow "${wf?.name}" terminou como ${conclusion}. Confira no GitHub Actions.`;
        } else if (event === "ping") {
          title = `🔔 Webhook do GitHub conectado em ${repo}`;
          friendly = "GitHub confirmou que o webhook está funcionando.";
        }

        await sendTelegramAlert({
          title,
          friendlySummary: friendly || `Evento ${event} recebido.`,
          technicalReport: tech,
        });

        return new Response(JSON.stringify({ ok: true }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
