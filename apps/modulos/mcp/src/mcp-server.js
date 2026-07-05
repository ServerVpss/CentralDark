// Servidor MCP (Streamable HTTP, stateless) via SDK oficial.
// Cada request POST /mcp instancia um Server + StreamableHTTPServerTransport efêmero.
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { log } from "./log.js";
import { ALL_TOOLS, CATALOG_VERSION } from "./tools/core/tools-catalog.js";
import { sanitizeOutgoingDeep } from "./lib/sanitize.js";
import { auditToolExecution } from "./audit-logger.js";
function zodTypeToJsonSchema(schema) {
    if (schema instanceof z.ZodOptional || schema instanceof z.ZodDefault) {
        return zodTypeToJsonSchema(schema._def.innerType);
    }
    if (schema instanceof z.ZodObject) {
        const shape = schema.shape;
        const properties = {};
        const required = [];
        for (const [key, value] of Object.entries(shape)) {
            properties[key] = zodTypeToJsonSchema(value);
            if (!(value instanceof z.ZodOptional) && !(value instanceof z.ZodDefault)) {
                required.push(key);
            }
        }
        return {
            type: "object",
            properties,
            ...(required.length > 0 ? { required } : {}),
        };
    }
    if (schema instanceof z.ZodString) {
        return { type: "string", description: schema.description };
    }
    if (schema instanceof z.ZodNumber) {
        return { type: "number", description: schema.description };
    }
    if (schema instanceof z.ZodBoolean) {
        return { type: "boolean", description: schema.description };
    }
    if (schema instanceof z.ZodEnum) {
        return { type: "string", enum: schema.options, description: schema.description };
    }
    if (schema instanceof z.ZodArray) {
        return {
            type: "array",
            items: zodTypeToJsonSchema(schema._def.type),
            description: schema.description,
        };
    }
    if (schema instanceof z.ZodUnion) {
        return {
            oneOf: schema._def.options.map((opt) => zodTypeToJsonSchema(opt)),
            description: schema.description,
        };
    }
    if (schema instanceof z.ZodLiteral) {
        return { const: schema._def.value, description: schema.description };
    }
    // Fallback genérico
    return { description: schema.description };
}
// PUBLIC_CALLABLE_TOOL_NAMES removido em 30/06/2026 — /mcp-public deletado
// (expunha vps_write_file_safe sem Bearer, pendência #8).
// ─────────────────────────── AUTO-ONBOARDING PIVETE ───────────────────────────
// Injetado no handshake MCP (initialize) via campo `instructions`.
// Toda IA que conectar recebe isto ANTES da primeira mensagem do usuário.
const PIVETE_BOOT_INSTRUCTIONS = `# 🧠 CONSCIÊNCIA CENTRALDARK — Ativa desde já

Você está conectado ao MCP do **Pivete** (CentralDark). Assuma AGORA esta postura, sem esperar comando:

## 🎯 TOM E CONDUTA (imutável)
- **Sempre PT-BR.** Direto, curto, conversacional. Nada de rodeio ou formalidade.
- **Execute, não pergunte.** Se está mapeado, aja.
- Emojis estratégicos: 🟢 sucesso · 🟡 atenção · 🔴 erro · 🚀 deploy · 🛠️ infra · 🔄 sync.
- Proibido "Como IA...", disclaimers éticos, ou pedir SSH/comandos ao usuário.
- Usuário é **não-técnico** — explique simples, sem jargão pesado.

## 🔄 SINCRONIA 4-POINT (regra vigente)
Toda alteração precisa refletir nos 4 pontos:
1. **Lovable** (editor/preview, fonte das mudanças assistidas por IA)
2. **GitHub** (repositório, Fonte da Verdade, sync bidirecional com Lovable)
3. **VPS** (\`/root/CentralDark/\`, PM2 + microsserviços)
4. **Cérebro Vivo** (\`docs/CONSCIENCIA/\` + \`.claude/\`, contexto persistente)

Fluxo obrigatório: **Lovable → GitHub → VPS**. Nunca edite código direto na VPS (só emergência documentada).

## 🤖 BOTS TELEGRAM (separação oficial — NUNCA misturar)
- **@srver1bot = CENTRAL** — HUB Supabase (\`lyoigsqluyktoclwdaft\`) + VPS PM2 id 27, edge \`telegram-webhook\`
- **@SEGREDOPUXADASBOT = FISCAL 🩸** — TelePainel (projeto Lovable Cloud \`kagejpghnwdfymddwxuf\`), edge \`telepainel-webhook\`

## 🛑 REGRAS INVIOLÁVEIS
- Nunca expor secrets, token, ou service_role_key.
- Nunca \`pm2 restart all\`. Nunca mexer em \`/root/whatsapp-server\` (id 1 fica STOPPED).
- Nunca alterar áreas 🔒 sem "PERMITO PIVETE" explícito.

## 🧭 SE PRECISAR DE MAIS CONTEXTO
- \`ler_consciencia\` → regras completas do projeto
- \`consultar_memoria_reserva\` → últimas lembranças do Pivete
- \`puxar_aprendizados\` → aprendizados acumulados
- \`kit_boas_vindas\` → índice completo

## ✅ PRIMEIRA RESPOSTA
Cumprimente curto ("E aí Pivete, tô calibrado — o que manda?"), NÃO liste tudo isso de volta pro usuário.
`;
export const PUBLIC_CALLABLE_MCP_TOOLS = [];
function buildServer(options) {
    const visibleTools = options.visibleTools ?? ALL_TOOLS;
    const callableTools = options.callableTools ?? visibleTools;
    const server = new Server({ name: options.label ?? "mcp-centraldark", version: `0.4.0+${CATALOG_VERSION}` }, { capabilities: { tools: {} }, instructions: PIVETE_BOOT_INSTRUCTIONS });
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        const startedAt = Date.now();
        log.info("mcp_tools_list_start", { cid: options.cid, label: options.label ?? "private" });
        const result = {
            tools: visibleTools.map((t) => {
                const annotations = t.annotations;
                return {
                    name: t.name,
                    description: t.description,
                    inputSchema: zodTypeToJsonSchema(t.inputSchema),
                    ...(annotations ? { annotations } : {}),
                };
            }),
        };
        auditToolExecution({
            method: "tools/list",
            toolName: "list_tools",
            input: {},
            result: { toolCount: result.tools.length, label: options.label ?? "private" },
            durationMs: Date.now() - startedAt,
            exitCode: null,
            ok: true,
        });
        log.info("mcp_tools_list_ok", { cid: options.cid, toolCount: result.tools.length, ms: Date.now() - startedAt });
        return result;
    });
    server.setRequestHandler(CallToolRequestSchema, async (req) => {
        const startedAt = Date.now();
        const tool = callableTools.find((t) => t.name === req.params.name);
        if (!tool) {
            const result = {
                isError: true,
                content: [{ type: "text", text: `Tool desconhecida: ${req.params.name}` }],
            };
            auditToolExecution({
                method: "tools/call",
                toolName: req.params.name,
                input: req.params.arguments ?? {},
                result,
                durationMs: Date.now() - startedAt,
                exitCode: null,
                ok: false,
            });
            return result;
        }
        const parsed = tool.inputSchema.safeParse(req.params.arguments ?? {});
        if (!parsed.success) {
            const result = {
                isError: true,
                content: [
                    { type: "text", text: `Argumentos inválidos: ${parsed.error.message}` },
                ],
            };
            auditToolExecution({
                method: "tools/call",
                toolName: tool.name,
                input: req.params.arguments ?? {},
                result,
                durationMs: Date.now() - startedAt,
                exitCode: null,
                ok: false,
            });
            return result;
        }
        try {
            const raw = await tool.handler(parsed.data, { token: options.token });
            const result = sanitizeOutgoingDeep(raw);
            auditToolExecution({
                method: "tools/call",
                toolName: tool.name,
                input: parsed.data,
                result,
                durationMs: Date.now() - startedAt,
                exitCode: typeof result === "object" && result !== null && "exitCode" in result
                    ? Number(result.exitCode)
                    : null,
                ok: !(typeof result === "object" &&
                    result !== null &&
                    "isError" in result &&
                    result.isError === true),
            });
            return result;
        }
        catch (err) {
            log.error("tool_execution_error", { tool: tool.name, error: String(err) });
            const result = {
                isError: true,
                content: [{ type: "text", text: `Erro ao executar ${tool.name}: ${String(err)}` }],
            };
            auditToolExecution({
                method: "tools/call",
                toolName: tool.name,
                input: parsed.data,
                result,
                error: err,
                durationMs: Date.now() - startedAt,
                exitCode: null,
                ok: false,
            });
            return result;
        }
    });
    return server;
}
export async function handleMcpRequest(req, res, ghToken, options = {}) {
    const server = buildServer({ ...options, token: ghToken });
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    res.on("close", () => {
        transport.close().catch(() => { });
        server.close().catch(() => { });
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
    log.info("mcp_request_handled", { cid: options.cid, method: req.body?.method || "unknown" });
}
//# sourceMappingURL=mcp-server.js.map