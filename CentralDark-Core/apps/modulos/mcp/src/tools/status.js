// Página /status do MCP CentralDark — v2.
// Operacional, com cores semânticas (✅ 🟡 ❌ 🔁 ⚠️), comparação de commit
// (GitHub HEAD vs commit local da VPS), diff de catálogo (código vs publicado),
// agrupamento de tools por domínio, lista de tools sugeridas/faltantes e
// recomendações automáticas. Auto-refresh 15s.
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "../config.js";
import { fetchWithRetry } from "../lib/fetch-retry.js";
import { getStateStats } from "../sessions.js";
import { ALL_TOOLS, CATALOG_HASH, CATALOG_VERSION, TOOL_NAMES, getCatalogSummary, } from "./core/tools-catalog.js";
const startedAt = Date.now();
const STATUS_VERSION = "v2";
// Agrupamento por prefixo (mais alguns exatos). Ordem da lista = ordem visual.
const GROUPS = [
    { id: "github", label: "GitHub", prefixes: ["github_"] },
    { id: "vps", label: "VPS / PM2", prefixes: ["vps_"] },
    { id: "supabase", label: "Supabase", prefixes: ["supabase_"] },
    { id: "deploy", label: "Deploy", prefixes: ["deploy_"] },
    { id: "mcp", label: "MCP interno", prefixes: ["mcp_"] },
    { id: "skill", label: "Skills", prefixes: ["skill_", "kit_"] },
    {
        id: "pendencias",
        label: "Pendências",
        prefixes: ["pendencias_"],
        exact: ["adicionar_pendencia", "fechar_pendencia", "ler_pendencias"],
    },
    {
        id: "consciencia",
        label: "Consciência",
        prefixes: [],
        exact: [
            "ler_consciencia",
            "atualizar_consciencia",
            "ler_regras_inviolaveis",
            "ler_instalador",
        ],
    },
    {
        id: "aprendizado",
        label: "Aprendizado",
        prefixes: [],
        exact: ["registrar_aprendizado", "puxar_aprendizados"],
    },
];
const SUGGESTED_TOOLS = [
    {
        name: "github_upload_binary_file",
        priority: "high",
        reason: "Alias direto pra upload binário (hoje só tem github_upload_base64_file, que obriga o cliente a codificar).",
    },
    {
        name: "vps_pm2_logs_stream",
        priority: "med",
        reason: "Streaming de logs PM2 em tempo real pra debug ao vivo.",
    },
    {
        name: "supabase_run_sql_readonly",
        priority: "med",
        reason: "Executar SELECT cru com timeout curto (read-only, sem DDL/DML).",
    },
    {
        name: "vps_caddy_reload_safe",
        priority: "low",
        reason: "Reload do Caddy com validação prévia (caddy validate) antes do reload.",
    },
];
// ─────────────────────────── Helpers de check ──────────────────────────────
async function checkGithubApi() {
    const t0 = Date.now();
    try {
        const res = await fetchWithRetry("https://api.github.com/", {
            headers: { "User-Agent": "MCP-CentralDark/status" },
            retries: 1,
            label: "github_health",
        });
        return {
            name: "GitHub API",
            level: res.ok ? "ok" : "bad",
            detail: `HTTP ${res.status}`,
            latencyMs: Date.now() - t0,
        };
    }
    catch (err) {
        return {
            name: "GitHub API",
            level: "bad",
            detail: String(err).slice(0, 120),
            latencyMs: Date.now() - t0,
        };
    }
}
function checkOAuthConfig() {
    const has = !!config.github.clientSecret;
    return {
        name: "OAuth GitHub",
        level: has ? "ok" : "warn",
        detail: has ? "client_secret presente" : "GITHUB_CLIENT_SECRET ausente",
    };
}
function checkSupabaseConfig() {
    // Não fazemos rede aqui — só checa se cofre/env aponta pra algum projeto.
    const hint = process.env.SUPABASE_URL ||
        process.env.SUPABASE_PROJECT_URL ||
        process.env.SUPABASE_REF ||
        "";
    return {
        name: "Supabase",
        level: hint ? "ok" : "warn",
        detail: hint ? "config detectada" : "sem env Supabase (cofre opcional)",
    };
}
function checkSshHint() {
    const has = !!(process.env.VPS_SSH_KEY_LOVABLE || process.env.VPS_HOST_LOVABLE);
    return {
        name: "VPS SSH (hint)",
        level: has ? "ok" : "warn",
        detail: has ? "secret presente no ambiente" : "sem VPS_SSH_KEY_LOVABLE/VPS_HOST_LOVABLE",
    };
}
function checkStatePersistence(stats) {
    return {
        name: "Persistência de estado",
        level: stats.stateFile ? "ok" : "warn",
        detail: stats.stateFile
            ? `arquivo: ${stats.stateFile}`
            : "arquivo de estado não configurado",
    };
}
const COMMIT_CACHE = { at: 0, value: null };
async function fetchGithubHead() {
    // Cache 30s pra não estourar rate-limit anônimo.
    if (COMMIT_CACHE.value && Date.now() - COMMIT_CACHE.at < 30_000) {
        return COMMIT_CACHE.value;
    }
    try {
        const owner = config.github.owner;
        const repo = config.github.repo;
        const url = `https://api.github.com/repos/${owner}/${repo}/commits/main`;
        const res = await fetchWithRetry(url, {
            headers: {
                "User-Agent": "MCP-CentralDark/status",
                Accept: "application/vnd.github+json",
            },
            retries: 1,
            label: "github_head",
        });
        if (!res.ok)
            return null;
        const j = (await res.json());
        const info = {
            sha: j.sha,
            short: j.sha.slice(0, 7),
            message: (j.commit?.message ?? "").split("\n")[0].slice(0, 80),
            authoredAt: j.commit?.author?.date,
        };
        COMMIT_CACHE.at = Date.now();
        COMMIT_CACHE.value = info;
        return info;
    }
    catch {
        return null;
    }
}
// Lê commit local — primeiro variáveis de ambiente injetadas pelo deploy,
// depois marcador `dist/.git-commit` (opcional). Sem isso → null.
function readLocalCommit() {
    const fromEnv = process.env.GIT_COMMIT ||
        process.env.SOURCE_COMMIT ||
        process.env.MCP_GIT_COMMIT ||
        "";
    if (fromEnv) {
        return {
            sha: fromEnv,
            short: fromEnv.slice(0, 7),
            message: process.env.GIT_COMMIT_MSG ?? "",
        };
    }
    try {
        const here = path.dirname(fileURLToPath(import.meta.url));
        const file = path.join(here, ".git-commit");
        const raw = readFileSync(file, "utf8").trim();
        if (raw) {
            return { sha: raw, short: raw.slice(0, 7), message: "" };
        }
    }
    catch {
        /* arquivo opcional */
    }
    return null;
}
async function buildDeployInfo() {
    const [gh, local] = await Promise.all([fetchGithubHead(), Promise.resolve(readLocalCommit())]);
    let diff;
    if (!gh) {
        diff = { level: "warn", detail: "não consegui consultar o GitHub agora" };
    }
    else if (!local) {
        diff = { level: "warn", detail: "commit local desconhecido (defina GIT_COMMIT no boot)" };
    }
    else if (gh.sha === local.sha) {
        diff = { level: "ok", detail: "VPS em dia com a main" };
    }
    else {
        diff = { level: "warn", detail: `VPS desatualizada — rode vps_git_pull` };
    }
    return { github: gh ?? undefined, local: local ?? undefined, diff };
}
function classifyTool(name) {
    for (const g of GROUPS) {
        if (g.prefixes.some((p) => name.startsWith(p)))
            return g.id;
        if (g.exact?.includes(name))
            return g.id;
    }
    return "outros";
}
function buildGroupCounts() {
    const byGroup = new Map();
    for (const n of TOOL_NAMES) {
        const id = classifyTool(n);
        if (!byGroup.has(id))
            byGroup.set(id, []);
        byGroup.get(id).push(n);
    }
    const out = GROUPS.map((g) => {
        const names = (byGroup.get(g.id) ?? []).sort();
        return {
            id: g.id,
            label: g.label,
            count: names.length,
            level: names.length === 0 ? "warn" : "ok",
            names,
        };
    });
    const orfaos = byGroup.get("outros") ?? [];
    if (orfaos.length > 0) {
        out.push({
            id: "outros",
            label: "Outros (sem grupo)",
            count: orfaos.length,
            level: "warn",
            names: orfaos.sort(),
        });
    }
    return out;
}
async function buildCatalogDiff() {
    const inCode = new Set(TOOL_NAMES);
    try {
        const res = await fetchWithRetry(`http://127.0.0.1:${config.port}/tools.json`, {
            retries: 0,
            label: "tools_self",
        });
        if (!res.ok) {
            return {
                level: "warn",
                detail: `não consegui ler /tools.json (HTTP ${res.status})`,
                inCode: inCode.size,
                published: 0,
                missingPublish: [],
                orphanPublished: [],
                hashCode: CATALOG_HASH,
            };
        }
        const j = (await res.json());
        const publishedNames = j.toolNames ??
            (j.tools ?? [])
                .map((tool) => (typeof tool === "string" ? tool : tool.name))
                .filter((name) => typeof name === "string" && name.length > 0);
        const pub = new Set(publishedNames);
        const missing = [...inCode].filter((n) => !pub.has(n));
        const orfaos = [...pub].filter((n) => !inCode.has(n));
        const sameHash = j.catalogHash === CATALOG_HASH;
        let level;
        let detail;
        if (missing.length === 0 && orfaos.length === 0 && sameHash) {
            level = "ok";
            detail = "código e publicação sincronizados";
        }
        else if (!sameHash) {
            level = "warn";
            detail = "hashes diferentes — possível cache antigo no cliente";
        }
        else {
            level = missing.length > 0 ? "bad" : "warn";
            detail = `${missing.length} faltando publicar · ${orfaos.length} órfãs`;
        }
        return {
            level,
            detail,
            inCode: inCode.size,
            published: pub.size,
            missingPublish: missing,
            orphanPublished: orfaos,
            hashCode: CATALOG_HASH,
            hashPublished: j.catalogHash,
        };
    }
    catch (err) {
        return {
            level: "warn",
            detail: `falhou ao consultar /tools.json: ${String(err).slice(0, 80)}`,
            inCode: inCode.size,
            published: 0,
            missingPublish: [],
            orphanPublished: [],
            hashCode: CATALOG_HASH,
        };
    }
}
// ─────────────────────────── Sugestões e Recs ──────────────────────────────
function buildSuggested() {
    const present = new Set(TOOL_NAMES);
    return SUGGESTED_TOOLS.filter((s) => !present.has(s.name));
}
function buildRecommendations(cfg, deploy, diff, groups) {
    const recs = [];
    if (cfg.level !== "ok") {
        recs.push({
            level: "warn",
            text: "Configurar GITHUB_CLIENT_SECRET no cofre /root/CentralDark/secrets/mcp.env e reiniciar o MCP.",
        });
    }
    if (deploy.diff.level === "warn") {
        recs.push({
            level: "warn",
            text: `Rodar vps_git_pull pra alinhar a VPS com a main (HEAD ${deploy.github?.short ?? "?"}).`,
        });
    }
    if (diff.missingPublish.length > 0) {
        recs.push({
            level: "bad",
            text: `${diff.missingPublish.length} tool(s) no código mas fora do /tools.json — rebuild + restart do MCP.`,
        });
    }
    if (diff.orphanPublished.length > 0) {
        recs.push({
            level: "warn",
            text: `Há tool(s) publicada(s) sem código (${diff.orphanPublished
                .slice(0, 3)
                .join(", ")}...) — provável cache antigo do cliente, peça replug.`,
        });
    }
    const grupoVazio = groups.find((g) => g.count === 0);
    if (grupoVazio) {
        recs.push({
            level: "warn",
            text: `Grupo "${grupoVazio.label}" sem nenhuma tool — verificar imports em tools-catalog.ts.`,
        });
    }
    if (recs.length === 0) {
        recs.push({ level: "ok", text: "Nada urgente. Catálogo limpo e deploy alinhado." });
    }
    return recs;
}
// ─────────────────────────── Saída JSON ────────────────────────────────────
export async function getStatusJson(_req, res) {
    const [github, deploy, diff] = await Promise.all([
        checkGithubApi(),
        buildDeployInfo(),
        buildCatalogDiff(),
    ]);
    const cfg = checkOAuthConfig();
    const supa = checkSupabaseConfig();
    const ssh = checkSshHint();
    const stats = getStateStats();
    const persist = checkStatePersistence(stats);
    const connectors = [github, cfg, supa, ssh, persist];
    const groups = buildGroupCounts();
    const suggested = buildSuggested();
    const recs = buildRecommendations(cfg, deploy, diff, groups);
    const overallOk = connectors.every((c) => c.level === "ok") && diff.level === "ok";
    res.setHeader("Cache-Control", "no-store");
    res.json({
        ok: overallOk,
        service: "mcp-centraldark",
        statusVersion: STATUS_VERSION,
        uptimeSec: Math.floor((Date.now() - startedAt) / 1000),
        catalog: getCatalogSummary(),
        catalogVersion: CATALOG_VERSION,
        catalogDiff: diff,
        connectors,
        groups,
        deploy,
        suggestedTools: suggested,
        recommendations: recs,
        state: stats,
        time: new Date().toISOString(),
    });
}
// ─────────────────────────── Saída HTML ────────────────────────────────────
const ICON = {
    ok: "✅",
    warn: "🟡",
    bad: "❌",
    info: "🔁",
};
// UI transferida para Sala de Controle do Cockpit.
