import { z } from "zod";
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync, copyFileSync, appendFileSync } from "node:fs";
import { join as pathJoin, sep } from "node:path";
const DR = "/root/CentralDark/secrets";
const LOG_DIR = "/root/CentralDark/logs";
const AUDIT = pathJoin(LOG_DIR, "mcp-vault-audit.log");
function audit(action, name, meta) {
    try {
        if (!existsSync(LOG_DIR))
            mkdirSync(LOG_DIR, { recursive: true });
        appendFileSync(AUDIT, JSON.stringify({ ts: new Date().toISOString(), action, name, ...(meta || {}) }) + "\n");
    }
    catch (_) { }
}
function safeResolve(name) {
    if (!name || typeof name !== "string")
        throw new Error("nome obrigatorio");
    if (name.includes("..") || name.includes("/") || name.includes("\\") || name.includes("\0"))
        throw new Error("nome invalido");
    const full = pathJoin(DR, name);
    if (!full.startsWith(DR + sep) && full !== DR)
        throw new Error("path fora do vault");
    return full;
}
function ok(data) {
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}
export const adminVaultRwTools = [
    {
        name: "admin_vault_read",
        description: "ADMIN: le 1 segredo do cofre /root/CentralDark/secrets/ pelo nome do arquivo.",
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "Admin vault read" },
        inputSchema: z.object({
            name: z.string().min(1).describe("Nome do arquivo dentro de /root/CentralDark/secrets/"),
        }),
        handler: async (input) => {
            const full = safeResolve(input.name);
            const raw = readFileSync(full, "utf8");
            audit("admin_read", input.name, { bytes: raw.length });
            return ok({ ok: true, name: input.name, sizeBytes: raw.length, content: raw });
        },
    },
    {
        name: "admin_vault_write",
        description: "ADMIN DESTRUTIVO: cria ou atualiza um segredo em /root/CentralDark/secrets/. Faz backup automatico se ja existir. Exige confirmAdmin=CONFIRMO ADMIN.",
        annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false, title: "Admin vault write" },
        inputSchema: z.object({
            name: z.string().min(1).describe("Nome do arquivo no vault"),
            content: z.string().describe("Conteudo completo do segredo"),
            overwrite: z.boolean().optional().describe("Se false e o arquivo ja existe, falha. Default true."),
        }),
        handler: async (input) => {
            const full = safeResolve(input.name);
            if (!existsSync(DR))
                mkdirSync(DR, { recursive: true, mode: 0o700 });
            const overwrite = input.overwrite !== false;
            let backup = null;
            if (existsSync(full)) {
                if (!overwrite)
                    return ok({ ok: false, status: "JA_EXISTE", name: input.name });
                backup = `${full}.bak.${Date.now()}`;
                try {
                    copyFileSync(full, backup);
                }
                catch (_) {
                    backup = null;
                }
            }
            writeFileSync(full, input.content, { mode: 0o600 });
            const st = statSync(full);
            audit("admin_write", input.name, { bytes: st.size, backup });
            return ok({ ok: true, name: input.name, sizeBytes: st.size, backup });
        },
    },
];
//# sourceMappingURL=admin-vault-rw.js.map