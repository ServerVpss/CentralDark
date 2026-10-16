import { localHybridTools } from "../local/local-compute.js";
import { adminVaultTools } from "../../modes/admin/tools/admin-vault.js";
import { adminFileTools } from "../../modes/admin/tools/admin-files.js";
import { adminPm2Tools } from "../../modes/admin/tools/admin-pm2.js";
import { adminShellTools } from "../../modes/admin/tools/admin-shell.js";
import { adminVaultRwTools } from "../../modes/admin/tools/admin-vault-rw.js";
import { adminGitTools } from "../../modes/admin/tools/admin-git.js";
import { adminMainWriterTools } from "../../modes/admin/tools/admin-main-writer.js";
import { adminProviderControlTools, tailscaleTools } from "../../modes/admin/tools/admin-provider-control.js";
import { codeReviewerToolDefinition } from "../code-reviewer.js";
import { z } from "zod";
import { cognitivoTools } from "../cognitivo/cognitivo.js";
import { eliteGatewayTools } from "../elite/elite-gateway.js";
import { geminiTools } from "../gemini/gemini.js";
import { integrationsTools } from "../integrations.js";
import { painelTools } from "../painel/painel.js";
import { operationalTelemetryTools } from "../observability/operational-telemetry.js";
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
import { youtubeMediaTools } from "../media/youtube-transcript.js";
import { ADMIN_CONFIRMATIONS, CATALOG_VERSION, guardDestructive, auditStartupSnapshot, getCanonicalExpectation, } from "../../lib/admin-guard.js";
const ADMIN_CONFIRM = "CONFIRMO ADMIN"; // apenas compatibilidade com chamadas legadas sem sessão admin autenticada
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
        diagnostico: diagnoseMcpBlock("INPUT_INVALIDO"),
        tool: input.tool,
        destructive: destructive === true,
        erros: parsed.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
        })),
    });
}
const runtimeTools = [
    ...localHybridTools,
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
    ...adminMainWriterTools,
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
    ...operationalTelemetryTools,
    ...piveteTools,
    ...youtubeMediaTools,
];
const AUTHORIZED_ROUTE_CATALOG = Object.freeze([
    { id: "MCP_VPS_NATIVE_HTTP", transport: "MCP_HTTP", binding: "VPS:127.0.0.1:9100", capability: "MCP_CENTRALDARK", source: "apps/modulos/mcp/src/mcp-server.js", runtimeState: "MEASURE_AT_RUNTIME" },
    { id: "MCP_REMOTE_OAUTH", transport: "MCP_OAUTH", binding: "mcp.centralldark.com/mcp", capability: "REMOTE_MCP_BRIDGE", source: ".agents/skills/centraldark-operational-method/references/centraldark-remote-bridge.md", runtimeState: "MEASURE_AT_RUNTIME" },
    { id: "RDC_DESKTOP_COMMANDER", transport: "REMOTE_DESKTOP_COMMANDER", binding: "SEGREDO|mcp.desktopcommander.app/mcp", capability: "CASA_DESKTOP_SHELL_FILES_PROCESS_CONTROL", source: "docs/ARQUITETURA/CENTRALDARK-REMOTE-MCP-GATEWAY.md", runtimeState: "MEASURE_AT_RUNTIME" },
    { id: "SCREENPIPE_LOCAL_SENSOR", transport: "SCREENPIPE_HTTP", binding: "SEGREDO:127.0.0.1:3030", capability: "CASA_VISUAL_AUDIO_DESKTOP_SENSOR", source: "docs/ARQUITETURA/CENTRALDARK-REMOTE-MCP-GATEWAY.md", runtimeState: "MEASURE_AT_RUNTIME" },
    { id: "SCREENPIPE_CLI_RECORDER", transport: "SCREENPIPE_CLI", binding: "${SCREENPIPE_CLI:-bun x screenpipe@latest}", capability: "ALWAYS_ON_LOCAL_CAPTURE_STATUS_SEARCH_PIPES", source: "docs/CONSCIENCIA/RECEIPTS/2026-10-06-hermes-screenpipe-catalog-metabolism.md", runtimeState: "MEASURE_AT_RUNTIME" },
    { id: "SSH_VPS_DIRECT", transport: "SSH", binding: "segredo-vpss|VPS_HOST", capability: "VPS_CONTROL_PLANE", source: "docs/CONSCIENCIA/VPS-IA-NATIVA-ROTAS.md", runtimeState: "MEASURE_AT_RUNTIME" },
    { id: "TAILSCALE_PRIVATE_ROUTE", transport: "TAILSCALE", binding: "DISCOVER_AT_RUNTIME", capability: "PRIVATE_TRANSPORT", source: "docs/CONSCIENCIA/LEMBRANCAS/2026-10-02-SISTEMA-HIBRIDO-MULTIROTA-BIDIRECIONAL.md", runtimeState: "MEASURE_AT_RUNTIME" },
    { id: "MCP_CASA_TO_VPS", transport: "MCP", binding: "MCP_CASA", capability: "execute_command|vps_run_once_script", source: "CENTRALDARK_AI_BOOT.yaml", runtimeState: "MEASURE_AT_RUNTIME" },
    { id: "HERMES_SHELL", transport: "HERMES", binding: "SHELL", capability: "EXECUTION_BODY", source: "docs/CONSCIENCIA/LEMBRANCAS/2026-10-02-SISTEMA-HIBRIDO-MULTIROTA-BIDIRECIONAL.md", runtimeState: "MEASURE_AT_RUNTIME" },
    { id: "HERMES_DELEGATED_COMMIT_PATH", transport: "HERMES_AGENT", binding: "PR#1748:c893a949b3051ae8a96cc4bc8b910857534c55e7", capability: "DELEGATED_TOOL_WRITE_COMMIT_PUSH_RECIPE", source: "experiments/aionui-centraldark-instinto-superior/HERMES-DELEGATION-SMOKE-2026-10-06.md", runtimeState: "PASS_ON_PR1748_REPLAY_REQUIRED_FOR_CURRENT" },
    { id: "GITHUB_RUNTIME", transport: "GITHUB", binding: "ServerVpss/CentralDark", capability: "CANONICAL_RECORD_AND_MICRODEPLOY_ROUTE", source: "CENTRALDARK_AI_BOOT.yaml", runtimeState: "MEASURE_AT_RUNTIME" },
    { id: "AIONUI_MCP_STDIO", transport: "MCP_STDIO", binding: "AionUi->CentralDark", capability: "MCP_CATALOG_AND_NATIVE_BINDINGS", source: "scripts/vps/aionui-native-integrate.py", runtimeState: "MEASURE_AT_RUNTIME" },
    { id: "CAS_CLOUD_RELAY", transport: "WEBSOCKET_RELAY", binding: "Casa<->CAS Cloud VPS", capability: "REMOTE_AGENT_ORCHESTRATION", source: "docs/ARQUITETURA/CENTRALDARK-CAS-CLOUD-VPS.md", runtimeState: "MEASURE_AT_RUNTIME" },
    { id: "FIGMA_MCP_ACCOUNT", transport: "FIGMA_MCP", binding: "handle:SegredoiDEV|team:1676254220442096258", capability: "FIGMA_READ_ONLY_MCP", source: "Figma MCP whoami", runtimeState: "PASS_WHOAMI_READ_ONLY" },
    { id: "FIGMA_CENTRALDARK_FIGJAM", transport: "FIGJAM_MCP", binding: "file:H0xMJXAKrLxvXx3G1BlVYu|node:0:1", capability: "CENTRALDARK_DIAGRAM_READ", source: "Figma FigJam fluxo mestre", runtimeState: "PASS_READ_ONLY_MEASURED" },
    { id: "RDC_VPS_CENTRALDARK_OS", transport: "REMOTE_DESKTOP_COMMANDER", binding: "device:809020f9-c77d-4bef-bb06-da5b467ac9b7", capability: "VPS_SHELL_FILES_PROCESS_CONTROL", source: "Remote Desktop Commander list_devices", runtimeState: "ONLINE_MEASURED" },
]);
// Capacidades externas delegáveis do mesmo MCP. Descoberta não é autorização,
// token importado, rota executável nem prova de disponibilidade da VPS.
const DELEGATED_PROVIDER_CAPABILITIES = Object.freeze([
    { id: "CENTRALDARK_CORE", label: "CentralDark", responsibility: "Ferramentas e orquestrador canônico", provider: "MCP CentralDark", authorization: "VERIFY_IN_CENTRALDARK", runtimeState: "UNKNOWN", delegation: "EXISTING_AUTHORIZED_ADAPTER_REQUIRED" },
    { id: "CLOUDFLARE", label: "Cloudflare", responsibility: "Rede, DNS e serviços Cloudflare", provider: "Cloudflare", authorization: "VERIFY_IN_CENTRALDARK", runtimeState: "UNKNOWN", delegation: "EXISTING_AUTHORIZED_ADAPTER_REQUIRED" },
    { id: "FIGMA", label: "Figma", responsibility: "Arquivos de design e componentes visuais", provider: "Figma", authorization: "VERIFY_IN_CENTRALDARK", runtimeState: "UNKNOWN", delegation: "EXISTING_AUTHORIZED_ADAPTER_REQUIRED" },
    { id: "GMAIL", label: "Gmail", responsibility: "Mensagens e operações de email autorizadas", provider: "Gmail", authorization: "VERIFY_IN_CENTRALDARK", runtimeState: "UNKNOWN", delegation: "EXISTING_AUTHORIZED_ADAPTER_REQUIRED" },
    { id: "GOOGLE_DRIVE", label: "Google Drive", responsibility: "Documentos, pastas e arquivos autorizados", provider: "Google Drive", authorization: "VERIFY_IN_CENTRALDARK", runtimeState: "UNKNOWN", delegation: "EXISTING_AUTHORIZED_ADAPTER_REQUIRED" },
    { id: "LOVABLE", label: "Lovable", responsibility: "Aplicações e interfaces geradas", provider: "Lovable", authorization: "VERIFY_IN_CENTRALDARK", runtimeState: "UNKNOWN", delegation: "EXISTING_AUTHORIZED_ADAPTER_REQUIRED" },
    { id: "NOTION", label: "Notion", responsibility: "Páginas e bases de conhecimento", provider: "Notion", authorization: "VERIFY_IN_CENTRALDARK", runtimeState: "UNKNOWN", delegation: "EXISTING_AUTHORIZED_ADAPTER_REQUIRED" },
    { id: "POSTHOG", label: "PostHog", responsibility: "Eventos de produto e erros observados", provider: "PostHog", authorization: "VERIFY_IN_CENTRALDARK", runtimeState: "UNKNOWN", delegation: "EXISTING_AUTHORIZED_ADAPTER_REQUIRED" },
    { id: "REMOTE_DESKTOP_COMMANDER", label: "Remote Desktop Commander", responsibility: "Computadores e sessões remotas autorizados", provider: "Remote Desktop Commander", authorization: "VERIFY_IN_CENTRALDARK", runtimeState: "UNKNOWN", delegation: "EXISTING_AUTHORIZED_ADAPTER_REQUIRED" },
    { id: "SUPABASE", label: "Supabase", responsibility: "Banco de dados, auth e serviços Supabase", provider: "Supabase", authorization: "VERIFY_IN_CENTRALDARK", runtimeState: "UNKNOWN", delegation: "EXISTING_AUTHORIZED_ADAPTER_REQUIRED" },
    { id: "WRITING_STYLE", label: "Writing Style", responsibility: "Exemplos autorizados de estilo de escrita", provider: "Writing Style", authorization: "VERIFY_IN_CENTRALDARK", runtimeState: "UNKNOWN", delegation: "EXISTING_AUTHORIZED_ADAPTER_REQUIRED" },
]);
const ROUTE_LAWS = Object.freeze({
    oneRouteFailedIsNotSystemFailed: true,
    alternateAuthorizedRouteBeforeHumanBlocker: true,
    nextAuthorizedRouteAutoContinue: true,
    routeDocumentedIsNotRuntimeProof: true,
    capabilitySystem: "UNION_OF_MEASURED_AUTHORIZED_ROUTE_CAPABILITIES",
    realityIsJudge: true,
    clientSafetyGateIsOutsideMcp: true,
    repeatBlockedCallWithoutNewEvidence: false,
    ownerRebuilderOnlyAfterMeasuredFailure: true,
});
// Aprendizado das tentativas reais: erro de politica != falha da VPS.
// A fronteira OpenAI/cliente nao e visivel por este MCP: nao simular observacao.
export const MCP_BLOCK_RECONCILIATION = Object.freeze({
    INPUT_INVALIDO: ["ARGUMENTOS", "corrigir_schema", false],
    TOOL_NAO_ENCONTRADA: ["CATALOGO", "consultar_mcp_admin_catalog", false],
    INDEPENDENT_APPROVAL_REQUIRED: ["AUTORIDADE", "aguardar_autorizacao_independente", false],
    ESCOPO_ADMIN_NECESSARIO: ["AUTORIDADE", "solicitar_escopo_admin", false],
    CONTEXTO_ADMIN_INCOMPLETO: ["IDENTIDADE", "reconciliar_identidade_auditoria", false],
    AUDITORIA_STARTUP_INDISPONIVEL: ["AUDITORIA", "medir_cadeia_e_catalogo", false],
    AUDITORIA_INDISPONIVEL: ["AUDITORIA", "reparar_owner_auditoria_com_prova", false],
    DESTRUTIVA_EM_QUARENTENA: ["CATALOGO", "revisar_manifesto_em_pr", false],
    APROVADA_AUSENTE_NO_RUNTIME: ["RUNTIME", "verificar_versao_runtime", false],
    CONFIRMACAO_ADMIN_NECESSARIA: ["CONFIRMACAO", "exigir_confirmacao_literal_do_usuario", false],
});
export function diagnoseMcpBlock(status) {
    const [classe, nextCursor, retrySameCall] = MCP_BLOCK_RECONCILIATION[status]
        || ["DESCONHECIDO", "medir_owner_e_erro_sem_promover_pass", false];
    return {
        classe, status, nextCursor, retrySameCall,
        createdNewRoute: false,
        clientSafetyGateObserved: false,
        protectedPathMustRemainProtected: true,
        errorIsNotExecutionProof: true,
        documentedRouteIsNotAvailabilityProof: true,
    };
}
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
    if (startupAuditState?.ready === true)
        return startupAuditState;
    startupAuditState = await auditStartupSnapshot(runtimeTools);
    return startupAuditState;
}
export const mcpAdminTools = [
    codeReviewerToolDefinition,
    ...adminMainWriterTools,
    ...tailscaleTools,
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
            catalogFingerprint: "b526d18f8701a14ec3a2628ae71ee3af04b67e75d538e9c3ae0ca0ca2b7835aa",
            routeCount: AUTHORIZED_ROUTE_CATALOG.length,
            auditStartupReady: startupAuditState?.ready === true,
            catalogScope: "centraldark_unified_capability_catalog",
            time: new Date().toISOString(),
        }),
    },
    {
        name: "mcp_admin_catalog",
        description: "Catálogo unificado da CentralDark: tools internas, rotas autorizadas e capacidades externas (incluindo Remote Desktop Commander, Screenpipe, Screenpipe CLI e Hermes delegated commit path) no mesmo mcp_admin_catalog, sem criar MCP paralelo.",
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
            const routes = AUTHORIZED_ROUTE_CATALOG
                .filter((route) => !filter ||
                Object.values(route).some((value) => String(value || "").toLowerCase().includes(filter)))
                .sort((a, b) => a.id.localeCompare(b.id));
            const providerCapabilities = DELEGATED_PROVIDER_CAPABILITIES
                .filter((cap) => !filter || Object.values(cap).some((value) => String(value || "").toLowerCase().includes(filter)))
                .sort((a, b) => a.label.localeCompare(b.label));
            return ok({
                ok: true, dispatcher: "mcp_admin_call",
                totalRuntimeTools: runtimeTools.length,
                totalDispatchableTools: runtimeTools.length,
                returned: tools.length,
                catalogScope: "centraldark_unified_capability_catalog",
                catalogVersion: CATALOG_VERSION,
                catalogFingerprint: "b526d18f8701a14ec3a2628ae71ee3af04b67e75d538e9c3ae0ca0ca2b7835aa",
                confirmForDestructive: "LEGACY_ONLY_WITHOUT_VERIFIED_ADMIN_SESSION",
                authenticatedAdminPolicy: "OAUTH_OR_HUB_ADMIN_SESSION_REUSED",
                acceptedConfirmations: Object.keys(ADMIN_CONFIRMATIONS),
                routeCatalogScope: "centraldark_unified_capability_catalog",
                routeCount: AUTHORIZED_ROUTE_CATALOG.length,
                routeReturned: routes.length,
                routeLaws: ROUTE_LAWS,
                routes,
                providerCapabilities,
                providerCapabilityCount: DELEGATED_PROVIDER_CAPABILITIES.length,
                providerCapabilitiesReturned: providerCapabilities.length,
                providerBoundary: "CATALOGUED != AUTHORIZED != EXECUTABLE != PROVED",
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
            catalogFingerprint: "b526d18f8701a14ec3a2628ae71ee3af04b67e75d538e9c3ae0ca0ca2b7835aa",
            routeCount: AUTHORIZED_ROUTE_CATALOG.length,
            auditStartupReady: startupAuditState?.ready === true,
            catalogScope: "centraldark_unified_capability_catalog",
            time: new Date().toISOString(),
        }),
    },
    {
        name: "mcp_admin_call",
        description: "Dispatcher fixo do MCP. Reutiliza OAuth/Hub admin autenticado para destrutivas aprovadas sem frase repetitiva; chamadas legadas exigem confirmAdmin e missões automáticas não ganham aprovação.",
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
                    diagnostico: diagnoseMcpBlock(!hasAdminContext ? "ESCOPO_ADMIN_NECESSARIO" : "CONTEXTO_ADMIN_INCOMPLETO"),
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
                    diagnostico: diagnoseMcpBlock("TOOL_NAO_ENCONTRADA"),
                    requested: input.tool,
                    sugestao: "Use mcp_admin_catalog para listar as tools disponíveis.",
                });
            }
            const destructive = tool.annotations?.destructiveHint === true;
            const parsed = parseToolInput(tool, input.input);
            if (!parsed.success)
                return invalidInputResponse(input, parsed, destructive);
            // Missão automática pode executar capacidade não destrutiva, mas não
            // fabrica aprovação humana para uma tool destructiveHint=true.
            if (destructive && ctx?.autoMission === true) {
                return ok({
                    ok: false,
                    status: "INDEPENDENT_APPROVAL_REQUIRED",
                    diagnostico: diagnoseMcpBlock("INDEPENDENT_APPROVAL_REQUIRED"),
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
                    diagnostico: diagnoseMcpBlock("AUDITORIA_STARTUP_INDISPONIVEL"),
                    executionStatus: "blocked",
                    tool: input.tool,
                });
            }
            const persistentAdminAuthorization = hasAdminContext && hasAuditIdentity
                && ctx?.autoMission !== true
                && (ctx?.authProvenance === "verified_oauth_admin"
                    || ctx?.authProvenance === "verified_hub_admin");
            const decision = await guardDestructive({
                toolName: input.tool,
                confirmAdmin: input.confirmAdmin,
                persistentAdminAuthorization,
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
                    diagnostico: diagnoseMcpBlock(decision.status),
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
//# sourceMappingURL=mcp-admin.js.map