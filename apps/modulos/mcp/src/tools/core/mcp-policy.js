import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { config } from "../../config.js";
const LOG_BASE = path.join(config.vps.repoPath, "revisoes");
function ok(data) {
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}
const policy = {
    mode: {
        autoSafe: true,
        sensitiveConfirmed: true,
        hardSecretBlock: true,
        obraMode: process.env.MCP_MODO_OBRA === "true",
        obraFullAdmin: process.env.MCP_OBRA_FULL_ADMIN === "true" || process.env.MCP_FULL_ADMIN === "true",
        note: process.env.MCP_OBRA_FULL_ADMIN === "true" || process.env.MCP_FULL_ADMIN === "true"
            ? "Modo Obra Full Admin ativo para acelerar tarefas seguras; secrets reais continuam bloqueados."
            : "Modo seguro padrão.",
    },
    levels: {
        readonly: [
            "status",
            "catalog",
            "git status",
            "logs sanitizados",
            "listar secrets apenas por nome",
            "listar arquivos seguros",
        ],
        write_safe: [
            "criar/atualizar arquivo seguro",
            "criar PR",
            "setar variável não secreta",
            "upload base64",
        ],
        destructive_confirmed: [
            "deletar arquivo",
            "deletar branch",
            "limpar pasta",
            "run-once real",
            "restart PM2 permitido",
            "release",
        ],
    },
    requiredConfirmations: {
        genericAdmin: "CONFIRMO ADMIN",
        delete: "CONFIRMO DELETAR",
        clean: "CONFIRMO LIMPAR",
        write: "CONFIRMO ESCREVER",
        runOnce: "CONFIRMO RUN ONCE",
        release: "CONFIRMO RELEASE",
    },
    // Política ajustada: não bloquear esqueleto seguro apenas pelo nome da pasta.
    // Continuar bloqueando secrets reais, env real, tokens, sessions, chaves e dumps privados.
    // Continuar bloqueando secrets reais, env real, tokens, sessions, credenciais e chaves.
    // Política ajustada: bloquear risco real, não nome técnico seguro.
    // Permitido: README, .gitkeep, docs, templates e código sanitizado.
    blockedPaths: [
        ".env",
        "secrets/",
        "tokens/",
        "sessions/",
        "credenciais/",
        ".ssh/",
        "*.pem",
        "*.key",
        "*.p12",
        "*.pfx",
    ],
    rules: [
        "Ações seguras e documentação executam direto.",
        "Ações sensíveis exigem confirmação explícita.",
        "Segredo real continua bloqueado sempre.",
        "Nunca retornar valor de secret/token/cookie/sessão.",
        "Dry-run por padrão em ações destrutivas.",
        "Logs completos ficam em /root/CentralDark/revisoes; chat recebe só resumo.",
        "CRM, WhatsApp, WuzAPI, Caddy, Docker e banco real exigem confirmação explícita.",
        "mcp_admin_call é dispatcher fixo; tools destrutivas exigem confirmação adicional.",
        "Modo Obra Full Admin aparece no resumo quando MCP_OBRA_FULL_ADMIN=true ou MCP_FULL_ADMIN=true.",
    ],
};
async function readRecentLogDirs(limit) {
    try {
        const entries = await fs.readdir(LOG_BASE, { withFileTypes: true });
        return entries
            .filter((e) => e.isDirectory())
            .map((e) => e.name)
            .sort()
            .reverse()
            .slice(0, limit);
    }
    catch {
        return [];
    }
}
export const mcpPolicyTools = [
    {
        name: "mcp_policy_summary",
        description: "Mostra a política de segurança MCP: níveis de risco, confirmações literais e paths bloqueados.",
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "Política MCP" },
        inputSchema: z.object({}),
        handler: async () => ok({
            ok: true,
            policy,
            updatedAt: new Date().toISOString(),
        }),
    },
    {
        name: "mcp_audit_recent_logs",
        description: "Lista pastas recentes de logs/auditoria em /root/CentralDark/revisoes sem expor conteúdo sensível.",
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "Auditoria recente" },
        inputSchema: z.object({
            limit: z.number().int().min(1).max(50).optional(),
        }),
        handler: async (input) => {
            const limit = input.limit ?? 20;
            const dirs = await readRecentLogDirs(limit);
            return ok({
                ok: true,
                base: LOG_BASE,
                returned: dirs.length,
                dirs: dirs.map((name) => ({
                    name,
                    path: path.posix.join(LOG_BASE, name),
                })),
            });
        },
    },
];
//# sourceMappingURL=mcp-policy.js.map