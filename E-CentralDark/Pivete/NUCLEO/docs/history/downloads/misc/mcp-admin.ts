import { z } from "zod";
import { aprendizadoTools } from "./aprendizado.js";
import { conscienciaTools } from "./consciencia.js";
import { deployTools } from "./deploy.js";
import { githubAdminTools } from "./github-admin.js";
import { githubReadTools } from "./github-read.js";
import { githubWriteTools } from "./github-write.js";
import { pendenciasTools } from "./pendencias.js";
import { skillTools } from "./skill.js";
import { supabaseTools } from "./supabase.js";
import { vpsFileTools } from "./vps-files.js";
import { vpsRunOnceTools } from "./vps-run-once.js";
import { vpsTools } from "./vps.js";

type AnyTool = {
  name: string;
  description: string;
  inputSchema: z.ZodType;
  annotations?: Record<string, unknown>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: (input: any, ctx: { token: string }) => Promise<any>;
};

const ADMIN_CONFIRM = "CONFIRMO ADMIN";

function ok(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

const runtimeTools = [
  ...aprendizadoTools,
  ...conscienciaTools,
  ...skillTools,
  ...githubReadTools,
  ...githubWriteTools,
  ...githubAdminTools,
  ...vpsTools,
  ...vpsRunOnceTools,
  ...vpsFileTools,
  ...pendenciasTools,
  ...deployTools,
  ...supabaseTools,
] as unknown as AnyTool[];

const registry = new Map(runtimeTools.map((tool) => [tool.name, tool]));

function safeToolInfo(tool: AnyTool) {
  return {
    name: tool.name,
    description: tool.description,
    readOnly: tool.annotations?.readOnlyHint === true,
    destructive: tool.annotations?.destructiveHint === true,
    title: tool.annotations?.title ?? null,
  };
}

export const mcpAdminTools = [
  {
    name: "mcp_admin_catalog",
    description:
      "Lista o catálogo interno do MCP usado pelo dispatcher fixo mcp_admin_call. Use para descobrir ações disponíveis sem reconectar.",
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "Catálogo admin MCP" },
    inputSchema: z.object({
      filter: z.string().optional().describe("Filtra por trecho do nome ou descrição"),
      includeDestructive: z.boolean().optional().describe("Se true, inclui também tools destrutivas"),
    }),
    handler: async (input: { filter?: string; includeDestructive?: boolean }) => {
      const filter = (input.filter ?? "").toLowerCase().trim();
      const includeDestructive = input.includeDestructive ?? true;

      const tools = runtimeTools
        .map(safeToolInfo)
        .filter((tool) => includeDestructive || !tool.destructive)
        .filter((tool) => {
          if (!filter) return true;
          return tool.name.toLowerCase().includes(filter) || tool.description.toLowerCase().includes(filter);
        })
        .sort((a, b) => a.name.localeCompare(b.name));

      return ok({
        ok: true,
        dispatcher: "mcp_admin_call",
        totalRuntimeTools: runtimeTools.length,
        returned: tools.length,
        confirmForDestructive: ADMIN_CONFIRM,
        tools,
      });
    },
  },
  {
    name: "mcp_admin_status",
    description:
      "Mostra status do dispatcher fixo. Serve para saber se a porta admin está carregada no runtime atual.",
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "Status admin MCP" },
    inputSchema: z.object({}),
    handler: async () =>
      ok({
        ok: true,
        dispatcher: "mcp_admin_call",
        runtimeTools: runtimeTools.length,
        destructiveTools: runtimeTools.filter((tool) => tool.annotations?.destructiveHint === true).length,
        time: new Date().toISOString(),
      }),
  },
  {
    name: "mcp_admin_call",
    description:
      "Dispatcher fixo do MCP. Chama uma tool interna pelo nome, sem precisar reconectar quando o backend ganhar novas ações. Tools destrutivas exigem confirmAdmin='CONFIRMO ADMIN'.",
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false, title: "Chamada admin MCP" },
    inputSchema: z.object({
      tool: z.string().min(1).describe("Nome exato da tool interna"),
      input: z.record(z.string(), z.unknown()).optional().describe("Payload da tool interna"),
      confirmAdmin: z.string().optional().describe("Para tools destrutivas, precisa ser CONFIRMO ADMIN"),
    }),
    handler: async (input: { tool: string; input?: Record<string, unknown>; confirmAdmin?: string }, ctx: { token: string }) => {
      const tool = registry.get(input.tool);

      if (!tool) {
        return ok({
          ok: false,
          status: "TOOL_NAO_ENCONTRADA",
          requested: input.tool,
          sugestao: "Use mcp_admin_catalog para listar as tools disponíveis.",
        });
      }

      const destructive = tool.annotations?.destructiveHint === true;
      if (destructive && input.confirmAdmin !== ADMIN_CONFIRM) {
        return ok({
          ok: false,
          status: "CONFIRMACAO_ADMIN_NECESSARIA",
          tool: input.tool,
          destructive: true,
          requiredConfirmAdmin: ADMIN_CONFIRM,
          observacao:
            "Nada foi executado. Além desta confirmação genérica, a própria tool ainda pode exigir confirmação específica, como CONFIRMO DELETAR ou CONFIRMO LIMPAR.",
        });
      }

      return tool.handler(input.input ?? {}, ctx);
    },
  },
] as const;
