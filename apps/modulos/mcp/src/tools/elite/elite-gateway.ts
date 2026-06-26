// Tools do Elite HTTP Gateway — ChatGPT via Zendriver.
// Expõe chat, health check e leitura de logs via MCP.

import { z } from "zod";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const GATEWAY_URL = "http://localhost:8080";
const GATEWAY_TOKEN = "SEGREDO_ELITE_123";
const LOG_OUT = "/root/.pm2/logs/elite-http-gateway-out.log";
const LOG_ERR = "/root/.pm2/logs/elite-http-gateway-error.log";

function ok(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

function tail(path: string, lines: number): string {
  try {
    return execSync(`tail -n ${lines} "${path}" 2>/dev/null || echo "arquivo não encontrado"`, {
      encoding: "utf8",
      timeout: 5000,
    });
  } catch {
    return "erro ao ler arquivo";
  }
}

export const eliteGatewayTools = [
  {
    name: "elite_gateway_chat",
    description:
      "Envia uma mensagem ao Elite HTTP Gateway (ChatGPT via Zendriver headless) e retorna a resposta. O gateway roda em localhost:8080 e autentica com Bearer token fixo. Use para testar o gateway ou enviar prompts ao ChatGPT real através da infraestrutura CentralDark.",
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      title: "Elite Gateway — Chat",
    },
    inputSchema: z.object({
      message: z.string().min(1).describe("Mensagem a enviar ao ChatGPT via gateway"),
      model: z.string().default("gpt-4o").optional().describe("Modelo (padrão: gpt-4o)"),
    }),
    handler: async (input: { message: string; model?: string }) => {
      const res = await fetch(`${GATEWAY_URL}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GATEWAY_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: input.model ?? "gpt-4o",
          messages: [{ role: "user", content: input.message }],
        }),
        signal: AbortSignal.timeout(150_000),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        return ok({ error: `HTTP ${res.status}`, body });
      }

      const data = await res.json() as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = data.choices?.[0]?.message?.content ?? "(sem resposta)";
      return ok({ status: "ok", resposta: content });
    },
  },

  {
    name: "elite_gateway_status",
    description:
      "Verifica saúde do Elite HTTP Gateway: PM2 status, latência do endpoint /v1/models e se o processo está online. Fonte: PM2 + HTTP ping local.",
    annotations: {
      readOnlyHint: true,
      title: "Elite Gateway — Health",
    },
    inputSchema: z.object({}),
    handler: async () => {
      // PM2 status
      let pm2Status = "desconhecido";
      try {
        const out = execSync("pm2 jlist 2>/dev/null", { encoding: "utf8", timeout: 5000 });
        const list = JSON.parse(out) as Array<{ name: string; pm2_env?: { status?: string }; pid?: number }>;
        const proc = list.find((p) => p.name === "elite-http-gateway");
        if (proc) {
          pm2Status = proc.pm2_env?.status ?? "desconhecido";
        } else {
          pm2Status = "não encontrado";
        }
      } catch {
        pm2Status = "erro ao consultar PM2";
      }

      // HTTP ping
      let httpStatus: string;
      let latencyMs: number | null = null;
      try {
        const t0 = Date.now();
        const res = await fetch(`${GATEWAY_URL}/v1/models`, {
          headers: { Authorization: `Bearer ${GATEWAY_TOKEN}` },
          signal: AbortSignal.timeout(8000),
        });
        latencyMs = Date.now() - t0;
        httpStatus = res.ok ? "ok" : `HTTP ${res.status}`;
      } catch (e) {
        httpStatus = `erro: ${(e as Error).message}`;
      }

      return ok({
        gateway: "elite-http-gateway",
        pm2: pm2Status,
        http: httpStatus,
        latencyMs,
        endpoint: `${GATEWAY_URL}/v1/chat/completions`,
        publicUrl: "https://api.centralldark.com/v1/chat/completions",
      });
    },
  },

  {
    name: "elite_gateway_logs",
    description:
      "Lê as últimas linhas dos logs PM2 do Elite HTTP Gateway (stdout e stderr). Útil para diagnosticar erros do Zendriver, Cloudflare block ou seletor DOM não encontrado.",
    annotations: {
      readOnlyHint: true,
      title: "Elite Gateway — Logs",
    },
    inputSchema: z.object({
      lines: z.number().int().min(10).max(500).default(50).optional().describe("Número de linhas (padrão: 50)"),
      tipo: z.enum(["out", "err", "ambos"]).default("ambos").optional().describe("Tipo de log"),
    }),
    handler: async (input: { lines?: number; tipo?: "out" | "err" | "ambos" }) => {
      const n = input.lines ?? 50;
      const tipo = input.tipo ?? "ambos";
      const result: Record<string, string> = {};

      if (tipo === "out" || tipo === "ambos") {
        result.stdout = tail(LOG_OUT, n);
      }
      if (tipo === "err" || tipo === "ambos") {
        result.stderr = tail(LOG_ERR, n);
      }

      return ok({ linhas: n, ...result });
    },
  },
];
