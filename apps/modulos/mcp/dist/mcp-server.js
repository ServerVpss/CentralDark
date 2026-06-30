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
export const PUBLIC_CALLABLE_MCP_TOOLS = [];
function buildServer(options) {
    const visibleTools = options.visibleTools ?? ALL_TOOLS;
    const callableTools = options.callableTools ?? visibleTools;
    const server = new Server({ name: options.label ?? "mcp-centraldark", version: `0.4.0+${CATALOG_VERSION}` }, { capabilities: { tools: {} } });
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        const startedAt = Date.now();
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
    log.info("mcp_request_handled", {});
}
//# sourceMappingURL=mcp-server.js.map