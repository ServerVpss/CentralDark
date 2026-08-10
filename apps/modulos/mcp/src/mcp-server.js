// Servidor MCP (Streamable HTTP, stateless) via SDK oficial.
// Cada request POST /mcp instancia um Server + StreamableHTTPServerTransport efêmero.
import crypto from "node:crypto";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { log } from "./log.js";
import { config } from "./config.js";
import * as gh from "./tools/github/github.js";
import { ALL_TOOLS, CATALOG_VERSION } from "./tools/core/tools-catalog.js";
import { sanitizeOutgoingDeep } from "./lib/sanitize.js";
import { auditToolExecution } from "./audit-logger.js";

const SOURCE_OF_TRUTH = "ServerVpss/CentralDark";
const SKILL_ROOT = ".agents/skills";

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

function decodeRepoFile(file) {
    if (typeof file === "string")
        return { content: file, blobSha: null };
    if (file?.decoded)
        return { content: file.decoded, blobSha: file.sha ?? null };
    if (file?.content)
        return { content: Buffer.from(file.content, "base64").toString("utf8"), blobSha: file.sha ?? null };
    throw new Error("GITHUB_FILE_CONTENT_UNREADABLE");
}

async function readRepoFile(token, relativePath) {
    const file = await gh.getFileContent(token, config.github.owner, config.github.repo, relativePath);
    return decodeRepoFile(file);
}

async function listRepoDir(token, relativePath) {
    const result = await gh.getFileContent(token, config.github.owner, config.github.repo, relativePath);
    return Array.isArray(result) ? result : [];
}

async function liveBootInstructions(token) {
    if (!token) {
        return [
            "# CENTRALDARK LIVE BOOT — BLOQUEADO",
            "MISSION_ID=UNRESOLVED",
            "STATUS=BLOCKED_BOOT_CONTEXT",
            "ROLE=READ_ONLY",
            `SOURCE_OF_TRUTH=${SOURCE_OF_TRUTH}`,
            "AUTHENTICATED_GITHUB_CONTEXT=MISSING",
        ].join("\n");
    }
    try {
        const bootFile = await readRepoFile(token, "LEIA-ME-IA.md");
        const skillEntries = await listRepoDir(token, SKILL_ROOT);
        const skillNames = skillEntries
            .filter((entry) => entry.type === "dir")
            .map((entry) => entry.name)
            .sort();
        return [
            "# CENTRALDARK LIVE BOOT",
            `SOURCE_OF_TRUTH=${SOURCE_OF_TRUTH}`,
            "BOOT_CHANNEL=GITHUB_AUTHENTICATED_DEFAULT_BRANCH",
            `BOOT_BLOB_SHA=${bootFile.blobSha ?? "UNKNOWN"}`,
            `BOOT_SHA256=${sha256(bootFile.content)}`,
            "SKILL_ROUTING=DISCOVER_ALL_LOAD_ONLY_APPLICABLE",
            `SKILLS_DISCOVERED=${skillNames.length}`,
            `SKILL_DIRS=${skillNames.join(",")}`,
            "SKILL_SELECTION=CALL_skill_listar_THEN_skill_instalar_ONLY_IF_APPLICABLE",
            "FRESH_CHEFE_DELTA=PRIORITY_HYPOTHESIS_VERIFY_AGAINST_LIVE_STATE",
            "CHEFE_NAO_FICA_CEGO=REPO_OWNED_ACTION_REQUIRES_SANITIZED_OBSERVABILITY",
            "",
            "## Porta canônica viva — LEIA-ME-IA.md",
            bootFile.content,
        ].join("\n");
    }
    catch (error) {
        log.error("mcp_live_boot_unavailable", { source: SOURCE_OF_TRUTH, error: String(error) });
        return [
            "# CENTRALDARK LIVE BOOT — BLOQUEADO",
            "MISSION_ID=UNRESOLVED",
            "STATUS=BLOCKED_BOOT_CONTEXT",
            "ROLE=READ_ONLY",
            `SOURCE_OF_TRUTH=${SOURCE_OF_TRUTH}`,
            "GITHUB_LIVE_BOOT=UNAVAILABLE",
            "Não promova, não escreva e não declare PASS até restaurar o contexto canônico autenticado.",
        ].join("\n");
    }
}

function steadyInstructions() {
    return [
        `SOURCE_OF_TRUTH=${SOURCE_OF_TRUTH}`,
        "BOOT_CONTEXT=INITIALIZE_ONLY",
        "SKILL_ROUTING=LOAD_ONLY_APPLICABLE",
        "CHEFE_NAO_FICA_CEGO=TELEMETRY_CORRELATED",
    ].join("\n");
}

// Endpoint público nunca anuncia nem executa destrutivas. No endpoint admin,
// toda destrutiva passa exclusivamente pelo dispatcher auditado mcp_admin_call.
export const PUBLIC_CALLABLE_MCP_TOOLS = [];

function auditEntry(options, entry) {
    const cid = options.cid ?? null;
    auditToolExecution({
        correlationId: cid,
        ...entry,
    });
    // CHEFE_NAO_FICA_CEGO: o audit JSONL preserva detalhes sanitizados; o log
    // operacional publica somente metadados não sensíveis no buffer/SSE admin.
    log.info("mcp_tool_execution", {
        cid,
        method: entry.method ?? null,
        toolName: entry.toolName ?? null,
        ok: entry.ok === true,
        durationMs: Number.isFinite(entry.durationMs) ? entry.durationMs : null,
        exitCode: Number.isFinite(entry.exitCode) ? entry.exitCode : null,
        auditTrail: true,
    });
}

async function buildServer(options) {
    const requestedVisibleTools = options.visibleTools ?? ALL_TOOLS;
    const visibleTools = options.admin === true
        ? requestedVisibleTools.filter((tool) => tool.annotations?.destructiveHint !== true || tool.name === "mcp_admin_call")
        : requestedVisibleTools.filter((tool) => tool.annotations?.destructiveHint !== true);
    const requestedCallableTools = options.callableTools ?? visibleTools;
    const callableTools = options.admin === true
        ? requestedCallableTools.filter((tool) => tool.annotations?.destructiveHint !== true || tool.name === "mcp_admin_call")
        : requestedCallableTools.filter((tool) => tool.annotations?.destructiveHint !== true);
    const instructions = options.includeLiveInstructions
        ? await liveBootInstructions(options.token)
        : steadyInstructions();
    const server = new Server(
        { name: options.label ?? "mcp-centraldark", version: `0.4.0+${CATALOG_VERSION}` },
        { capabilities: { tools: {} }, instructions },
    );

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
                content: [{ type: "text", text: "Tool desconhecida." }],
            };
            auditEntry(options, {
                method: "tools/call",
                toolName: "unknown_tool",
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
    const method = String(req.body?.method || "unknown");
    const server = await buildServer({
        ...options,
        token: ghToken,
        includeLiveInstructions: method === "initialize",
    });
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    res.on("close", () => {
        transport.close().catch(() => {});
        server.close().catch(() => {});
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
    log.info("mcp_request_handled", { cid: options.cid, method });
}
