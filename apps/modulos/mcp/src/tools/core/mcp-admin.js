import { adminVaultTools } from "../../modes/admin/tools/admin-vault.js";
import { adminFileTools } from "../../modes/admin/tools/admin-files.js";
import { adminPm2Tools } from "../../modes/admin/tools/admin-pm2.js";
import { adminShellTools } from "../../modes/admin/tools/admin-shell.js";
import { adminVaultRwTools } from "../../modes/admin/tools/admin-vault-rw.js";
import { adminGitTools } from "../../modes/admin/tools/admin-git.js";
import { adminProviderControlTools } from "../../modes/admin/tools/admin-provider-control.js";

import { codeReviewerToolDefinition } from "../code-reviewer.js";
import { z } from "zod";
import { cognitivoTools } from "../cognitivo/cognitivo.js";
import { eliteGatewayTools } from "../elite/elite-gateway.js";
import { geminiTools } from "../gemini/gemini.js";
import { integrationsTools } from "../integrations.js";
import { painelTools } from "../painel/painel.js";
import { piveteTools } from "../pivete/pivete-tools.js";
import { aprendizadoTools } from "../aprendizado/aprendizado.js";
import { conscienciaTools } from "../consciencia/consciencia.js";
import { deployTools } from "../deploy/deploy.js";
import { githubAdminTools } from "../github/github-admin.js";
import { githubReadTools } from "../github/github-read.js";
import { githubTools } from "../github/github-tools.js";
import { githubWriteTools } from "../github/github-write.js";
import { pendenciasTools } from "../pendencias/pendencias.js";
import { skillTools } from "../skills/skill.js";
import { supabaseTools } from "../supabase/supabase.js";
import { vpsFileTools } from "../vps/vps-files.js";
import { vpsLazyTools } from "../vps/vps-lazy.js";
import { vpsRunOnceTools } from "../vps/vps-run-once.js";
import {
    ADMIN_CONFIRMATIONS,
    CATALOG_VERSION,
    guardDestructive,
    auditStartupSnapshot,
    getCanonicalExpectation,
} from "../../lib/admin-guard.js";

const ADMIN_CONFIRM = "CONFIRMO ADMIN";
function ok(data) {
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}
function parseToolInput(tool, rawInput) {
    return tool.inputSchema.safeParse(rawInput ?? {});
}
function invalidInputResponse(input, parsed, destructive) {
    return ok({
        ok: false,
        status: "INPUT_INVALIDO",
        tool: input.tool,
        destructive: destructive === true,
        erros: parsed.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
        })),
    });
}
const runtimeTools = [
    codeReviewerToolDefinition,
    ...aprendizadoTools,
    ...conscienciaTools,
    ...skillTools,
    ...githubReadTools,
    ...githubWriteTools,
    ...githubAdminTools,
    ...githubTools,
    ...vpsRunOnceTools,
    ...vpsFileTools,
    ...vpsLazyTools,
    ...pendenciasTools,
    ...deployTools,
    ...supabaseTools,
    ...adminVaultTools,
    ...adminFileTools,
    ...adminPm2Tools,
    ...adminShellTools,
    ...adminVaultRwTools,
    ...adminGitTools,
    ...adminProviderControlTools,
    // MOTIVO  > estes 6 grupos existem no catalogo mas nao entravam em
    //           runtimeTools, entao 24 tools ficavam INALCANCAVEIS pelo
    //           dispatcher mcp_admin_call, entre elas as integracoes.
    // ONDE    > apps/modulos/mcp/src/tools/core/mcp-admin.js, runtimeTools.
    // RESOLVE > incluidos aqui. NAO incluir mcpDiagnosticsTools nem
    //           mcpPolicyTools: os dois importam mcpAdminTools de volta deste
    //           arquivo e formam ciclo — tentativa anterior derrubou o
    //           servico com 'Cannot access mcpAdminTools before
    //           initialization'. Nao ha perda: as 4 tools desses grupos ja
    //           sao expostas direto no catalogo.
    ...cognitivoTools,
    ...eliteGatewayTools,
    ...geminiTools,
    ...integrationsTools,
    ...painelTools,
    ...piveteTools,
];
const registry = new Map(runtimeTools.map((tool) => [tool.name, tool]));
function safeToolInfo(tool) {
    return {
        name: tool.name,
        description: tool.description,
        readOnly: tool.annotations?.readOnlyHint === true,
        destructive: tool.annotations?.destructiveHint === true,
        title: tool.annotations?.title ?? null,
    };
}

// Snapshot de startup é aguardado. Leituras continuam disponíveis em falha,
// porém toda destrutiva permanece fail-closed e tenta reconciliar novamente.
let startupAuditState = await auditStartupSnapshot(runtimeTools);
async function ensureStartupAuditReady() {
    if (startupAuditState?.ready === true) return startupAuditState;
    startupAuditState = await auditStartupSnapshot(runtimeTools);
    return startupAuditState;
}

export const mcpAdminTools = [
    codeReviewerToolDefinition,
    {
        name: "mcp_status",
        description: "Resumo simples do dispatcher MCP e do runtime disponível. Alias de leitura para manter compatibilidade com clientes antigos.",
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "Status MCP" },
        inputSchema: z.object({}),
        handler: async () => ok({
            ok: true, dispatcher: "mcp_admin_call",
            runtimeTools: runtimeTools.length,
            destructiveTools: runtimeTools.filter((tool) => tool.annotations?.destructiveHint === true).length,
            catalogVersion: CATALOG_VERSION,
            auditStartupReady: startupAuditState?.ready === true,
            catalogScope: "mcp_admin_dispatcher",
            time: new Date().toISOString(),
        }),
    },
    {
        name: "mcp_admin_catalog",
        description: "Lista o catálogo interno do MCP usado pelo dispatcher fixo mcp_admin_call. Use para descobrir ações disponíveis sem reconectar.",
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "Catálogo admin MCP" },
        inputSchema: z.object({
            filter: z.string().optional(),
            includeDestructive: z.boolean().optional(),
        }),
        handler: async (input) => {
            const filter = (input.filter ?? "").toString().toLowerCase().trim();
            const includeDestructive = input.includeDestructive ?? true;
            const tools = runtimeTools
                .map(safeToolInfo)
                .filter((tool) => includeDestructive || !tool.destructive)
                .filter((tool) => !filter ||
                    String(tool.name || "").toLowerCase().includes(filter) ||
                    String(tool.description || "").toLowerCase().includes(filter))
                .sort((a, b) => a.name.localeCompare(b.name));
            return ok({
                ok: true, dispatcher: "mcp_admin_call",
                totalRuntimeTools: runtimeTools.length,
                totalDispatchableTools: runtimeTools.length,
                returned: tools.length,
                catalogScope: "mcp_admin_dispatcher",
                catalogVersion: CATALOG_VERSION,
                confirmForDestructive: ADMIN_CONFIRM,
                acceptedConfirmations: Object.keys(ADMIN_CONFIRMATIONS),
                tools,
            });
        },
    },
    {
        name: "mcp_admin_status",
        description: "Mostra status do dispatcher fixo. Serve para saber se a porta admin está carregada no runtime atual.",
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "Status admin MCP" },
        inputSchema: z.object({}),
        handler: async () => ok({
            ok: true, dispatcher: "mcp_admin_call",
            runtimeTools: runtimeTools.length,
            destructiveTools: runtimeTools.filter((tool) => tool.annotations?.destructiveHint === true).length,
            catalogVersion: CATALOG_VERSION,
            auditStartupReady: startupAuditState?.ready === true,
            catalogScope: "mcp_admin_dispatcher",
            time: new Date().toISOString(),
        }),
    },
    {
        name: "mcp_admin_call",
        description: "Dispatcher fixo do MCP. Chama tool interna pelo nome, sem reconectar. Tools destrutivas exigem confirmação admin no caminho interativo canônico; o auto-consumer de missões nunca sintetiza essa aprovação.",
        annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false, title: "Chamada admin MCP" },
        inputSchema: z.object({
            tool: z.string().min(1),
            input: z.record(z.string(), z.unknown()).optional(),
            confirmAdmin: z.string().optional(),
        }),
        handler: async (input, ctx) => {
            const scopes = new Set(String(ctx?.oauthScope || "").split(/\s+/).filter(Boolean));
            const hasAdminContext = ctx?.admin === true && scopes.has("admin");
            const hasAuditIdentity = Boolean(ctx?.callerUser && ctx?.correlationId);
            if (!hasAdminContext || !hasAuditIdentity) {
                const denied = await guardDestructive({
                    toolName: input.tool,
                    confirmAdmin: input.confirmAdmin,
                    runtimeTools,
                    expectation: getCanonicalExpectation(),
                    inputPayload: input.input,
                    actor: ctx?.callerUser ?? undefined,
                    correlationId: ctx?.correlationId ?? undefined,
                    adminAuthorized: false,
                });
                return ok({
                    ok: false,
                    status: !hasAdminContext ? "ESCOPO_ADMIN_NECESSARIO" : "CONTEXTO_ADMIN_INCOMPLETO",
                    executionStatus: "blocked",
                    tool: input.tool,
                    auditSeq: denied.audit?.seq ?? null,
                    auditHash: denied.audit?.hash ?? null,
                });
            }
            const tool = registry.get(input.tool);
            if (!tool) {
                return ok({
                    ok: false, status: "TOOL_NAO_ENCONTRADA",
                    requested: input.tool,
                    sugestao: "Use mcp_admin_catalog para listar as tools disponíveis.",
                });
            }
            const destructive = tool.annotations?.destructiveHint === true;
            const parsed = parseToolInput(tool, input.input);
            if (!parsed.success) return invalidInputResponse(input, parsed, destructive);

            // Missão automática pode executar capacidade não destrutiva, mas não
            // fabrica aprovação humana para uma tool destructiveHint=true.
            if (destructive && ctx?.autoMission === true) {
                return ok({
                    ok: false,
                    status: "INDEPENDENT_APPROVAL_REQUIRED",
                    executionStatus: "blocked",
                    tool: input.tool,
                    destructive: true,
                    observacao: "Nada foi executado. Use o caminho admin interativo com autorização independente aplicável.",
                });
            }

            if (!destructive) {
                return tool.handler(parsed.data, ctx);
            }
            // Destrutiva: startup auditável + guarda canônica versionada.
            const startup = await ensureStartupAuditReady();
            if (startup?.ready !== true) {
                return ok({
                    ok: false,
                    status: "AUDITORIA_STARTUP_INDISPONIVEL",
                    executionStatus: "blocked",
                    tool: input.tool,
                });
            }
            const decision = await guardDestructive({
                toolName: input.tool,
                confirmAdmin: input.confirmAdmin,
                runtimeTools,
                expectation: getCanonicalExpectation(),
                inputPayload: parsed.data,
                actor: ctx?.callerUser ?? undefined,
                correlationId: ctx?.correlationId ?? undefined,
                adminAuthorized: true,
            });
            if (!decision.allow) {
                return ok({
                    ok: false, status: decision.status,
                    executionStatus: decision.executionStatus,
                    tool: input.tool, destructive: true,
                    requiredConfirmAdmin: ADMIN_CONFIRM,
                    acceptedConfirmations: Object.keys(ADMIN_CONFIRMATIONS),
                    reconciliation: decision.recon,
                    auditSeq: decision.audit?.seq ?? null,
                    auditHash: decision.audit?.hash ?? null,
                    observacao: decision.status === "AUDITORIA_INDISPONIVEL"
                        ? "Auditoria fail-closed: destrutiva bloqueada."
                        : (decision.status === "DIVERGENCIA_CATALOGO"
                            ? "Divergência de catálogo detectada. Somente esta destrutiva foi bloqueada."
                            : "Nada foi executado. Passe a confirmação admin exigida pelo caminho interativo canônico."),
                });
            }
            return tool.handler(parsed.data, ctx);
        },
    },
];
