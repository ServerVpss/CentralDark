// Helper server-only: monta requisição compatível com o listener da VPS
// (multizap-github-webhook-listener.js, porta 9002) que valida via
// x-hub-signature-256 = HMAC-SHA256(body, secret) — formato webhook do GitHub.
//
// NUNCA importar no client. Usado apenas em serverFns.
import { createHmac, randomUUID } from "node:crypto";

export type GhEventKind = "push" | "ping";

export interface BuildOpts {
  url: string;
  secret: string | null | undefined;
  event: GhEventKind;
  repoFullName: string;          // "segredounlock/atendimentoo"
  branch: string;                // "main"
  commitSha: string | null;
  commitMessage: string | null;
  triggeredBy: string;           // userId (vai em pusher.email só p/ rastro)
}

export interface BuiltRequest {
  url: string;
  init: RequestInit;
  signatureHeader: string | null; // p/ debug em log (sem expor o segredo)
  bodyLength: number;
}

export function buildGithubWebhookRequest(opts: BuildOpts): BuiltRequest {
  const { url, secret, event, repoFullName, branch, commitSha, commitMessage, triggeredBy } = opts;
  const payload =
    event === "ping"
      ? {
          zen: "MultiZap signature test",
          hook_id: 0,
          repository: { full_name: repoFullName },
        }
      : {
          ref: `refs/heads/${branch}`,
          repository: { full_name: repoFullName },
          head_commit: commitSha
            ? { id: commitSha, message: (commitMessage ?? "").slice(0, 500) }
            : null,
          pusher: { name: "multizap-master-panel", email: triggeredBy },
        };
  const body = JSON.stringify(payload);

  const headers: Record<string, string> = {
    "content-type": "application/json",
    "x-github-event": event,
    "x-github-delivery": randomUUID(),
    "user-agent": "MultiZap-Master/1.0 (github-webhook-emulator)",
  };

  const cleanSecret = (secret ?? "").trim();
  let signatureHeader: string | null = null;
  if (cleanSecret) {
    signatureHeader =
      "sha256=" + createHmac("sha256", cleanSecret).update(body).digest("hex");
    headers["x-hub-signature-256"] = signatureHeader;
  }

  return {
    url,
    init: { method: "POST", headers, body },
    signatureHeader,
    bodyLength: body.length,
  };
}

// Traduz resposta do listener pra mensagem amigável em PT-BR.
export function explainWebhookHttp(status: number, body: string): string {
  if (status === 401 || /invalid signature/i.test(body)) {
    return "O segredo enviado pelo painel não confere com o segredo configurado na VPS. Salve o mesmo valor no painel e em MULTIZAP_GITHUB_WEBHOOK_SECRET na VPS, sem espaços antes/depois.";
  }
  if (status === 403 && /repo/i.test(body)) {
    return "Repositório não permitido pelo listener da VPS (espera segredounlock/atendimentoo).";
  }
  if (status === 404 && /"code":"not_found"/.test(body)) {
    return 'O webhook caiu no Gateway (porta 3100), não no listener de deploy (porta 9002). Ajuste o Nginx para rotear /webhook → 127.0.0.1:9002 ou use http://IP:9002/webhook.';
  }
  if (status === 202) return "Deploy enfileirado com sucesso.";
  if (status === 204) return "Segredo confere — listener aceitou a assinatura.";
  if (status === 0) return "Não consegui falar com a VPS. Verifique a URL/firewall.";
  return `HTTP ${status} — ${body.slice(0, 200)}`;
}
