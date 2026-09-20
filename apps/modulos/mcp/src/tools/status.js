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
export async function getStatusHtml(_req, res) {
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
    const hasWarn = connectors.some((c) => c.level === "warn") || diff.level === "warn";
    const headPill = overallOk
        ? { cls: "ok", text: "✅ Tudo OK" }
        : hasWarn && !connectors.some((c) => c.level === "bad")
            ? { cls: "warn", text: "🟡 Atenção" }
            : { cls: "bad", text: "❌ Problema crítico" };
    const uptimeSec = Math.floor((Date.now() - startedAt) / 1000);
    const lastSave = stats.lastSaveAt
        ? new Date(stats.lastSaveAt).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
        : "ainda não salvou";
    const connectorsRows = connectors
        .map((c) => `
      <tr>
        <td>${ICON[c.level]} ${escapeHtml(c.name)}</td>
        <td>${escapeHtml(c.detail)}</td>
        <td>${c.latencyMs !== undefined ? c.latencyMs + " ms" : "—"}</td>
      </tr>`)
        .join("");
    const groupCards = groups
        .map((g) => `
      <div class="stat">
        <div class="label">${ICON[g.level]} ${escapeHtml(g.label)}</div>
        <div class="val">${g.count}</div>
        <div class="hint" title="${escapeHtml(g.names.join(", "))}">${g.names.length > 0 ? escapeHtml(g.names.slice(0, 2).join(", ")) + (g.names.length > 2 ? "…" : "") : "—"}</div>
      </div>`)
        .join("");
    const diffBlock = (() => {
        const missing = diff.missingPublish.length > 0
            ? `<div class="kv bad"><b>❌ Faltando publicar (${diff.missingPublish.length}):</b> <code>${escapeHtml(diff.missingPublish.join(", "))}</code></div>`
            : "";
        const orfaos = diff.orphanPublished.length > 0
            ? `<div class="kv warn"><b>🟡 Órfãs publicadas (${diff.orphanPublished.length}):</b> <code>${escapeHtml(diff.orphanPublished.join(", "))}</code></div>`
            : "";
        return `
      <div class="kv"><b>${ICON[diff.level]} ${escapeHtml(diff.detail)}</b></div>
      <div class="kv">Código: <strong>${diff.inCode}</strong> · Publicado: <strong>${diff.published}</strong></div>
      <div class="kv">Hash código: <code>${escapeHtml(diff.hashCode)}</code>${diff.hashPublished ? ` · Hash publicado: <code>${escapeHtml(diff.hashPublished)}</code>` : ""}</div>
      ${missing}${orfaos}`;
    })();
    const deployBlock = (() => {
        const gh = deploy.github
            ? `<code>${escapeHtml(deploy.github.short)}</code> · ${escapeHtml(deploy.github.message)}`
            : `<em>indisponível</em>`;
        const local = deploy.local
            ? `<code>${escapeHtml(deploy.local.short)}</code>${deploy.local.message ? " · " + escapeHtml(deploy.local.message) : ""}`
            : `<em>desconhecido</em>`;
        return `
      <div class="kv"><b>GitHub HEAD (${escapeHtml(config.github.owner)}/${escapeHtml(config.github.repo)}@main):</b> ${gh}</div>
      <div class="kv"><b>Commit local da VPS:</b> ${local}</div>
      <div class="kv ${deploy.diff.level}"><b>${ICON[deploy.diff.level]} ${escapeHtml(deploy.diff.detail)}</b></div>`;
    })();
    const suggestedRows = suggested.length === 0
        ? `<tr><td colspan="3">✅ Nenhuma tool sugerida pendente.</td></tr>`
        : suggested
            .map((s) => {
            const pIcon = s.priority === "high" ? "🔴" : s.priority === "med" ? "🟡" : "🟢";
            return `<tr>
              <td>${pIcon} <code>${escapeHtml(s.name)}</code></td>
              <td>${s.priority}</td>
              <td>${escapeHtml(s.reason)}</td>
            </tr>`;
        })
            .join("");
    const recsRows = recs
        .map((r) => `<li class="${r.level}">${ICON[r.level]} ${escapeHtml(r.text)}</li>`)
        .join("");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.send(`<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<title>MCP CentralDark — Status ${STATUS_VERSION}</title>
<meta http-equiv="refresh" content="15">
<style>
  :root{--bg:#0b0f17;--card:#121826;--border:#1f2937;--fg:#f1f5f9;--mut:#a5b4c6;--ok:#10b981;--warn:#f59e0b;--bad:#ef4444;--info:#38bdf8}
  *{box-sizing:border-box}
  body{font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;max-width:1180px;margin:32px auto;padding:0 24px;color:var(--fg);background:var(--bg);font-size:17px;line-height:1.5}
  h1{margin:0 0 6px;font-size:34px;font-weight:800;letter-spacing:-0.01em}
  h2{margin:0 0 18px;font-size:18px;color:var(--mut);text-transform:uppercase;letter-spacing:.08em;font-weight:700}
  .sub{color:var(--mut);margin-bottom:24px;font-size:15px}
  .card{background:var(--card);border:1px solid var(--border);border-radius:18px;padding:28px 30px;margin-bottom:20px;box-shadow:0 4px 20px rgba(0,0,0,.25)}
  .pill{display:inline-flex;align-items:center;gap:10px;padding:10px 22px;border-radius:999px;font-size:17px;font-weight:800;letter-spacing:.02em}
  .pill.ok{background:rgba(16,185,129,.18);color:var(--ok);box-shadow:0 0 0 1px rgba(16,185,129,.35)}
  .pill.warn{background:rgba(245,158,11,.18);color:var(--warn);box-shadow:0 0 0 1px rgba(245,158,11,.35)}
  .pill.bad{background:rgba(239,68,68,.22);color:#fff;box-shadow:0 0 0 1px rgba(239,68,68,.55)}
  /* DOT — único elemento que pisca. Aplicado via ::before nas linhas/itens com nível. */
  .pill::before,
  tr.row-ok td:first-child::before,
  tr.row-warn td:first-child::before,
  tr.row-bad td:first-child::before,
  ul.recs li.ok::before,
  ul.recs li.warn::before,
  ul.recs li.bad::before,
  .kv.ok::before,
  .kv.warn::before,
  .kv.bad::before{
    content:"";display:inline-block;width:12px;height:12px;border-radius:50%;margin-right:10px;vertical-align:middle;flex-shrink:0
  }
  .pill.ok::before,tr.row-ok td:first-child::before,ul.recs li.ok::before,.kv.ok::before{
    background:var(--ok);box-shadow:0 0 6px var(--ok);animation:dotOk 2.4s ease-in-out infinite
  }
  .pill.warn::before,tr.row-warn td:first-child::before,ul.recs li.warn::before,.kv.warn::before{
    background:var(--warn);box-shadow:0 0 6px var(--warn);animation:dotWarn 1.6s ease-in-out infinite
  }
  .pill.bad::before,tr.row-bad td:first-child::before,ul.recs li.bad::before,.kv.bad::before{
    background:var(--bad);box-shadow:0 0 10px var(--bad);animation:dotBad .9s ease-in-out infinite
  }
  table{width:100%;border-collapse:collapse}
  th,td{text-align:left;padding:14px 14px;border-bottom:1px solid var(--border);font-size:16px;vertical-align:top}
  th{color:var(--mut);font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:.06em}
  .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin-top:10px}
  .stat{background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:12px;padding:18px 20px}
  .stat .label{font-size:13px;color:var(--mut);text-transform:uppercase;letter-spacing:.05em;font-weight:600}
  .stat .val{font-size:30px;font-weight:800;margin-top:6px;letter-spacing:-0.01em}
  .stat .hint{font-size:13px;color:var(--mut);margin-top:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  code{background:rgba(255,255,255,.08);padding:3px 8px;border-radius:6px;font-size:14px;font-family:ui-monospace,Menlo,monospace}
  .kv{margin:10px 0;font-size:16px;padding:4px 0}
  .kv.warn{color:var(--warn);font-weight:600}
  .kv.bad{color:#fca5a5;font-weight:700}
  .kv.ok{color:var(--ok);font-weight:600}
  ul.recs{list-style:none;padding:0;margin:0}
  ul.recs li{padding:14px 16px;border-radius:10px;margin-bottom:10px;font-size:16px;background:rgba(255,255,255,.04);font-weight:500;display:flex;align-items:center}
  ul.recs li.warn{border-left:5px solid var(--warn)}
  ul.recs li.bad{border-left:5px solid var(--bad);color:#fecaca}
  ul.recs li.ok{border-left:5px solid var(--ok)}
  a{color:var(--info);font-weight:600}
  .head{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:8px}
  .meta{color:var(--fg);font-size:15px;line-height:2}
  .meta strong{color:#fff;font-weight:700}
  /* Animações APENAS pros pontinhos (dots). Nada de pulsar card/linha. */
  @keyframes dotBad{
    0%,100%{box-shadow:0 0 6px var(--bad),0 0 0 0 rgba(239,68,68,.7);transform:scale(1)}
    50%{box-shadow:0 0 16px var(--bad),0 0 0 6px rgba(239,68,68,.0);transform:scale(1.25)}
  }
  @keyframes dotWarn{
    0%,100%{box-shadow:0 0 4px var(--warn);opacity:.85}
    50%{box-shadow:0 0 10px var(--warn);opacity:1}
  }
  @keyframes dotOk{
    0%,100%{box-shadow:0 0 4px var(--ok);opacity:.85}
    50%{box-shadow:0 0 10px var(--ok);opacity:1}
  }
  @media (prefers-reduced-motion: reduce){
    .pill::before,tr td:first-child::before,ul.recs li::before,.kv::before{animation:none!important}
  }
</style></head>
<body>
  <div class="head">
    <div>
      <h1>MCP CentralDark — Status</h1>
      <div class="sub">${STATUS_VERSION} · auto-refresh 15s · ${new Date().toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
    })}</div>
    </div>
    <div><span class="pill ${headPill.cls}">${headPill.text}</span></div>
  </div>

  <div class="card">
    <div class="meta">
      Uptime: <strong>${formatUptime(uptimeSec)}</strong> ·
      Catálogo: <code>${escapeHtml(CATALOG_VERSION)}</code> ·
      Tools: <strong>${TOOL_NAMES.length}</strong> ·
      Persistência: <code>${escapeHtml(stats.stateFile)}</code> ·
      Último save: <strong>${escapeHtml(lastSave)}</strong>
    </div>
  </div>

  <div class="card">
    <h2>1 · Conectores</h2>
    <table>
      <thead><tr><th>Item</th><th>Detalhe</th><th>Latência</th></tr></thead>
      <tbody>${connectorsRows}</tbody>
    </table>
  </div>

  <div class="card">
    <h2>2 · Versão & Deploy</h2>
    ${deployBlock}
  </div>

  <div class="card">
    <h2>3 · Grupos de ferramentas (${TOOL_NAMES.length} no total)</h2>
    <div class="grid">${groupCards}</div>
  </div>

  <div class="card">
    <h2>4 · Catálogo diff (código vs publicado)</h2>
    ${diffBlock}
  </div>

  <div class="card">
    <h2>5 · Tools sugeridas / faltando</h2>
    <table>
      <thead><tr><th>Tool</th><th>Prioridade</th><th>Por quê</th></tr></thead>
      <tbody>${suggestedRows}</tbody>
    </table>
  </div>

  <div class="card">
    <h2>6 · Recomendações automáticas</h2>
    <ul class="recs">${recsRows}</ul>
  </div>

  <div class="card">
    <h2>Estado OAuth</h2>
    <div class="grid">
      <div class="stat"><div class="label">Clients DCR</div><div class="val">${stats.clients}</div></div>
      <div class="stat"><div class="label">Access tokens</div><div class="val">${stats.accessTokens}</div></div>
      <div class="stat"><div class="label">Refresh tokens</div><div class="val">${stats.refreshTokens}</div></div>
      <div class="stat"><div class="label">Sessões legadas</div><div class="val">${stats.sessions}</div></div>
      <div class="stat"><div class="label">Auth codes pendentes</div><div class="val">${stats.authCodes}</div></div>
      <div class="stat"><div class="label">Logins GitHub ativos</div><div class="val">${stats.uniqueGhLogins.length}</div></div>
    </div>
  </div>

  <div class="sub">Versão JSON: <a href="/status.json">/status.json</a> · Manifesto: <a href="/tools.json">/tools.json</a></div>
</body></html>`);
}
// ─────────────────────────── Util ──────────────────────────────────────────
function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === '"' ? "&quot;" : "&#39;");
}
function formatUptime(sec) {
    const d = Math.floor(sec / 86400);
    const h = Math.floor((sec % 86400) / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (d > 0)
        return `${d}d ${h}h ${m}m`;
    if (h > 0)
        return `${h}h ${m}m`;
    if (m > 0)
        return `${m}m ${s}s`;
    return `${s}s`;
}
// Export para consumo externo (testes / debug).
export const __internal = {
    classifyTool,
    GROUPS,
    SUGGESTED_TOOLS,
    STATUS_VERSION,
    ALL_TOOLS_COUNT: ALL_TOOLS.length,
};
//# sourceMappingURL=status.js.map