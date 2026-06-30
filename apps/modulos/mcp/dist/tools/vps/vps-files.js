import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { config } from "../../config.js";
import { sanitize } from "./vps.js";
const CONFIRM_WRITE = "CONFIRMO ESCREVER";
const REPORT_BASE = path.join(config.vps.repoPath, "revisoes");
const DENY_PATH = /(^|\/)(\.env|secrets?|credenciais|tokens?|sessions?|sessao|sessão|\.ssh)(\/|$)|\.(pem|key|p12|pfx|sqlite|db)$/i;
const SKIP_DIRS = new Set([".git", "node_modules", ".next", "dist", "build"]);
function ok(data) {
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}
function roots() {
    const mcp = path.resolve(process.cwd());
    return {
        project: path.resolve(config.vps.repoPath),
        mcp,
        mcpRepo: path.resolve(config.vps.repoPath),
    };
}
function inside(parent, child) {
    const rel = path.relative(parent, child);
    return rel === "" || (!!rel && !rel.startsWith("..") && !path.isAbsolute(rel));
}
function safeRel(p) {
    const clean = p.replace(/\\/g, "/").replace(/^\/+/, "");
    if (!clean || clean.includes("..") || clean.startsWith("/"))
        throw new Error("Path inválido.");
    if (DENY_PATH.test(clean))
        throw new Error("Path bloqueado por segurança.");
    return clean;
}
function resolveSafe(rootKey, relPath) {
    const all = roots();
    const rootName = rootKey ?? "project";
    const root = all[rootName];
    if (!root)
        throw new Error("Root inválido.");
    const rel = safeRel(relPath);
    const abs = path.resolve(root, rel);
    if (!inside(root, abs))
        throw new Error("Path fora da raiz permitida.");
    if (DENY_PATH.test(abs.replace(/\\/g, "/")))
        throw new Error("Path bloqueado por segurança.");
    return { rootName, root, rel, abs };
}
async function statSafe(abs) {
    try {
        return await fs.stat(abs);
    }
    catch {
        return null;
    }
}
async function mkdirpForFile(abs) {
    await fs.mkdir(path.dirname(abs), { recursive: true });
}
function stamp() {
    return new Date().toISOString().replace(/[:.]/g, "-");
}
function safeBackupName(rel) {
    return rel.replace(/[^a-zA-Z0-9_.-]+/g, "__").slice(0, 160);
}
export const vpsFileTools = [
    {
        name: "vps_read_file_safe",
        description: "Lê arquivo de texto com limite de bytes e sanitização. Bloqueia .env, secrets, tokens, sessões, WhatsApp/WuzAPI, backups e bancos locais.",
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "Ler arquivo seguro" },
        inputSchema: z.object({
            path: z.string().min(1),
            root: z.enum(["project", "mcpRepo", "mcp"]).optional(),
            maxBytes: z.number().int().min(1).max(100000).optional(),
        }),
        handler: async (input) => {
            const target = resolveSafe(input.root, input.path);
            const st = await statSafe(target.abs);
            if (!st)
                return ok({ status: "NAO_ENCONTRADO", ...target });
            if (!st.isFile())
                return ok({ status: "NAO_E_ARQUIVO", ...target, type: st.isDirectory() ? "dir" : "outro" });
            const max = input.maxBytes ?? 20000;
            const buf = await fs.readFile(target.abs);
            const truncated = buf.length > max;
            const text = buf.subarray(0, max).toString("utf8");
            return ok({
                status: "OK",
                root: target.rootName,
                path: target.rel,
                sizeBytes: st.size,
                truncated,
                maxBytes: max,
                content: sanitize(text),
            });
        },
    },
    {
        name: "vps_write_file_safe",
        description: "Cria ou atualiza arquivo de texto com backup e dry-run por padrão. Escrita real exige CONFIRMO ESCREVER. Bloqueia paths sensíveis.",
        annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false, title: "Escrever arquivo seguro" },
        inputSchema: z.object({
            path: z.string().min(1),
            content: z.string().max(200000),
            root: z.enum(["project", "mcpRepo", "mcp"]).optional(),
            createDirs: z.boolean().optional(),
            dryRun: z.boolean().optional(),
            confirm: z.string().optional(),
        }),
        handler: async (input) => {
            const target = resolveSafe(input.root, input.path);
            const dryRun = input.dryRun ?? true;
            const before = await statSafe(target.abs);
            if (before && !before.isFile())
                return ok({ status: "BLOQUEADO", reason: "Destino existe e não é arquivo.", ...target });
            const wouldCreate = !before;
            const wouldUpdate = !!before;
            if (dryRun || input.confirm !== CONFIRM_WRITE) {
                return ok({
                    status: "DRY_RUN",
                    root: target.rootName,
                    path: target.rel,
                    exists: !!before,
                    wouldCreate,
                    wouldUpdate,
                    bytes: Buffer.byteLength(input.content, "utf8"),
                    requiredConfirm: CONFIRM_WRITE,
                    observacao: "Nada foi escrito.",
                });
            }
            if (input.createDirs) {
                await mkdirpForFile(target.abs);
            }
            const reportDir = path.join(REPORT_BASE, `${stamp()}-vps-write-file-safe`);
            await fs.mkdir(reportDir, { recursive: true });
            let backupPath = null;
            if (before) {
                backupPath = path.join(reportDir, safeBackupName(target.rel));
                await fs.copyFile(target.abs, backupPath);
            }
            await fs.writeFile(target.abs, input.content, "utf8");
            return ok({
                status: wouldCreate ? "CRIADO" : "ATUALIZADO",
                root: target.rootName,
                path: target.rel,
                backupPath,
                reportDir,
                bytes: Buffer.byteLength(input.content, "utf8"),
            });
        },
    },
    {
        name: "vps_list_dir_safe",
        description: "Lista diretório dentro das raízes permitidas, pulando paths sensíveis. Apenas leitura.",
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "Listar diretório seguro" },
        inputSchema: z.object({
            path: z.string().optional(),
            root: z.enum(["project", "mcpRepo", "mcp"]).optional(),
            maxEntries: z.number().int().min(1).max(500).optional(),
        }),
        handler: async (input) => {
            const target = resolveSafe(input.root, input.path ?? ".");
            const entries = await fs.readdir(target.abs, { withFileTypes: true });
            const max = input.maxEntries ?? 200;
            const out = [];
            for (const entry of entries.slice(0, max)) {
                const rel = path.posix.join(target.rel === "." ? "" : target.rel, entry.name);
                if (DENY_PATH.test(rel))
                    continue;
                let size = null;
                try {
                    const st = await fs.stat(path.join(target.abs, entry.name));
                    size = st.size;
                }
                catch {
                    size = null;
                }
                out.push({
                    name: entry.name,
                    type: entry.isDirectory() ? "dir" : entry.isFile() ? "file" : "other",
                    size,
                });
            }
            return ok({
                status: "OK",
                root: target.rootName,
                path: target.rel,
                returned: out.length,
                truncated: entries.length > max,
                entries: out,
            });
        },
    },
    {
        name: "vps_tree_safe",
        description: "Mostra árvore curta de arquivos/pastas, pulando paths sensíveis, node_modules e .git. Apenas leitura.",
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "Tree seguro" },
        inputSchema: z.object({
            path: z.string().optional(),
            root: z.enum(["project", "mcpRepo", "mcp"]).optional(),
            maxDepth: z.number().int().min(1).max(5).optional(),
            maxEntries: z.number().int().min(1).max(800).optional(),
        }),
        handler: async (input) => {
            const target = resolveSafe(input.root, input.path ?? ".");
            const maxDepth = input.maxDepth ?? 3;
            const maxEntries = input.maxEntries ?? 300;
            const rows = [];
            let count = 0;
            async function walk(abs, prefix, depth) {
                if (depth > maxDepth || count >= maxEntries)
                    return;
                let entries = await fs.readdir(abs, { withFileTypes: true });
                entries = entries
                    .filter((e) => !SKIP_DIRS.has(e.name))
                    .filter((e) => !DENY_PATH.test(path.join(abs, e.name).replace(/\\/g, "/")))
                    .sort((a, b) => a.name.localeCompare(b.name));
                for (const entry of entries) {
                    if (count >= maxEntries)
                        return;
                    count += 1;
                    rows.push(`${prefix}${entry.isDirectory() ? "📁" : "📄"} ${entry.name}`);
                    if (entry.isDirectory()) {
                        await walk(path.join(abs, entry.name), `${prefix}  `, depth + 1);
                    }
                }
            }
            await walk(target.abs, "", 1);
            return ok({
                status: "OK",
                root: target.rootName,
                path: target.rel,
                maxDepth,
                count,
                truncated: count >= maxEntries,
                tree: rows,
            });
        },
    },
];
//# sourceMappingURL=vps-files.js.map