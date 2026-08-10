// Servidor MCP (Streamable HTTP, stateless) via SDK oficial.
// Cada request POST /mcp instancia um Server + StreamableHTTPServerTransport efêmero.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { log } from "./log.js";
import { ALL_TOOLS, CATALOG_VERSION } from "./tools/core/tools-catalog.js";
import { sanitizeOutgoingDeep } from "./lib/sanitize.js";
import { auditToolExecution } from "./audit-logger.js";
import { listInstalledSkills } from "./skills-public.js";
const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(process.env.CENTRALDARK_REPO_ROOT || path.join(MODULE_DIR, "../../../.."));
const BOOT_PATH = path.join(REPO_ROOT, "LEIA-ME-IA.md");
function zodTypeToJsonSchema(schema) {
    if (schema instanceof z.ZodOptional || schema instanceof z.ZodDefault)
        return zodTypeToJsonSchema(schema._def.innerType);
    if (schema instanceof z.ZodObject) {
        const shape = schema.shape;
        const properties = {};
        const required = [];
        for (const [key, value] of Object.entries(shape)) {
            properties[key] = zodTypeToJsonSchema(value);
            if (!(value instanceof z.ZodOptional) && !(value instanceof z.ZodDefault))
                required.push(key);
        }
        return { type: "object", properties, ...(required.length > 0 ? { required } : {}) };
    }
    if (schema instanceof z.ZodString)
        return { type: "string", description: schema.description };
    if (schema instanceof z.ZodNumber)
        return { type: "number", description: schema.description };
    if (schema instanceof z.ZodBoolean)
        return { type: "boolean", description: schema.description };
    if (schema instanceof z.ZodEnum)
        return { type: "string", enum: schema.options, description: schema.description };
    if (schema instanceof z.ZodArray)
        return { type: "array", items: zodTypeToJsonSchema(schema._def.type), description: schema.description };
    if (schema instanceof z.ZodUnion)
        return { oneOf: schema._def.options.map((opt) => zodTypeToJsonSchema(opt)), description: schema.description };
    if (schema instanceof z.ZodLiteral)
        return { const: schema._def.value, description: schema.description };
    return { description: schema.description };
}
function sha256(text) {
    return crypto.createHash("sha256").update(text, "utf8").digest("hex");
}
function liveBootInstructions() {
    let boot = "";
    try {
        boot = fs.readFileSync(BOOT_PATH, "utf8");
    }
    catch (error) {
        log.error("mcp_live_boot_unavailable", { path: "LEIA-ME-IA.md", error: String(error) });
        return [
            "# CENTRALDARK LIVE BOOT — BLOQUEADO",
            "MISSION_ID=UNRESOLVED",
            "STATUS=BLOCKED_BOOT_CONTEXT",
            "ROLE=READ_ONLY",
            "SOURCE_OF_TRUTH=ServerVpss/CentralDark",
            "LEIA-ME-IA.md não está alcançável neste runtime. Não promova, não escreva e não declare PASS até restaurar o contexto canônico.",
        ].join("\n");
    }
    const skills = listInstalledSkills();
    const inventory = skills.length > 0
        ? skills.map((skill) => `- ${skill.pasta}: ${skill.descricao || "sem descrição"} [sha256=${skill.sha256}]`).join("\n")
        : "- SKILL_INVENTORY=EMPTY_OR_UNAVAILABLE";
    return [
        "# CENTRALDARK LIVE BOOT",
        "SOURCE_OF_TRUTH=ServerVpss/CentralDark",
        `BOOT_SHA256=${sha256(boot)}`,
        "SKILL_ROUTING=DISCOVER_ALL_LOAD_ONLY_APPLICABLE",
        "FRESH_CHEFE_DELTA=PRIORITY_HYPOTHESIS_VERIFY_AGAINST_LIVE_STATE",
        "CHEFE_NAO_FICA_CEGO=REPO_OWNED_ACTION_REQUIRES_SANITIZED_OBSERVABILITY",
        "",
        "## Skills instaladas e alcançáveis",
        inventory,
        "",
        "## Porta canônica viva — LEIA-ME-IA.md",
        boot,
    ].join("\n");
}
// Endpoint público nunca anuncia nem executa destrutivas. No endpoint admin,
// toda destrutiva passa exclusivamente pelo dispatcher auditado mcp_admin_call.
export const PUBLIC_CALLABLE_MCP_TOOLS = [];
function auditEntry(options, entry) {
    auditToolExecution({
        correlationId: options.cid ?? null,
        ...entry,
    });
}
function buildServer(options) {
    const requestedVisibleTools = options.visibleTools ?? ALL_TOOLS;
    const visibleTools = options.admin === true
        ? requestedVisibleTools.filter((tool) => tool.annotations?.destructiveHint !== true || tool.name === "mcp_admin_call")
        : requestedVisibleTools.filter((tool) => tool.annotations?.destructiveHint !== true);
    const requestedCallableTools = options.callableTools ?? visibleTools;
    const callableTools = options.admin === true
        ? requestedCallableTools.filter((tool) => tool.annotations?.destructiveHint !== true || tool.name === "mcp_admin_call")
        : requestedCallableTools.filter((tool) => tool.annotations?.destructiveHint !== true);
    const server = new Server({ name: options.label ?? "mcp-centraldark", version: `0.4.0+${CATALOG_VERSION}` }, { capabilities: { tools: {} }, instructions: liveBootInstructions() });
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        const startedAt = Date.now();
        log.info("mcp_tools_list_start", { cid: options.cid, label: options.label ?? "private" });
        const result = {
            tools: visibleTools.map((tool) => {
                const annotations = tool.annotations;
                return {
                    name: tool.name,
                    description: tool.description,
                    inputSchema: zodTypeToJsonSchema(tool.inputSchema),
                    ...(annotations ? { annotations } : {}),
                };
            }),
        };
        auditEntry(options, {
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
        const tool = callableTools.find((candidate) => candidate.name === req.params.name);
        if (!tool) {
            const result = {
                isError: true,
                content: [{ type: "text", text: `Tool desconhecida: ${req.params.name}` }],
            };
            auditEntry(options, {
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
                content: [{ type: "text", text: `Argumentos inválidos: ${parsed.error.message}` }],
            };
            auditEntry(options, {
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
            const toolContext = Object.freeze({
                token: options.token,
                admin: options.admin === true,
                callerUser: options.callerUser ?? null,
                oauthScope: String(options.oauthScope || ""),
                correlationId: options.cid ?? null,
            });
            const raw = await tool.handler(parsed.data, toolContext);
            const result = sanitizeOutgoingDeep(raw);
            auditEntry(options, {
                method: "tools/call",
                toolName: tool.name,
                input: parsed.data,
                result,
                durationMs: Date.now() - startedAt,
                exitCode: typeof result === "object" && result !== null && "exitCode" in result ? Number(result.exitCode) : null,
                ok: !(typeof result === "object" && result !== null && "isError" in result && result.isError === true),
            });
            return result;
        }
        catch (err) {
            log.error("tool_execution_error", { cid: options.cid, tool: tool.name, error: String(err) });
            const result = {
                isError: true,
                content: [{ type: "text", text: `Erro ao executar ${tool.name}: ${String(err)}` }],
            };
            auditEntry(options, {
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