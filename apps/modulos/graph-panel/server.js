import http from "node:http";
import { readFile, readdir, stat } from "node:fs/promises";
import { createReadStream, existsSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { spawn } from "node:child_process";

const PORT = Number(process.env.PORT || 3030);
const ROOT = resolve(process.cwd());
const PUBLIC_DIR = join(ROOT, "public");
const DATA_DIR = join(ROOT, "data");
const SCRIPTS_DIR = join(ROOT, "scripts");

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8"
};

function json(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  res.end(JSON.stringify(body, null, 2));
}

function text(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
  res.end(body);
}

async function readText(relativePath, fallback = "") {
  try { return await readFile(join(DATA_DIR, relativePath), "utf8"); } catch { return fallback; }
}

async function readJson(relativePath, fallback) {
  try { return JSON.parse(await readFile(join(DATA_DIR, relativePath), "utf8")); } catch { return fallback; }
}

function countGraph(graph) {
  const nodes = Array.isArray(graph?.nodes) ? graph.nodes.length : 0;
  const edges = Array.isArray(graph?.edges) ? graph.edges.length : 0;
  const groups = new Set((graph?.nodes || []).map((node) => node.group).filter(Boolean));
  return { nodes, edges, communities: groups.size };
}

async function latestHistory() {
  try {
    const entries = await readdir(join(DATA_DIR, "history"));
    const files = [];
    for (const entry of entries.filter((name) => name.endsWith(".json"))) {
      const full = join(DATA_DIR, "history", entry);
      const info = await stat(full);
      files.push({ file: entry, updatedAt: info.mtime.toISOString(), size: info.size });
    }
    return files.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 25);
  } catch { return []; }
}

async function api(req, res, pathname) {
  if (pathname === "/api/health") {
    const graph = await readJson("graph.json", { nodes: [], edges: [] });
    return json(res, 200, { ok: true, service: "graph-panel", port: PORT, data: countGraph(graph), time: new Date().toISOString() });
  }
  if (pathname === "/api/graph") return json(res, 200, await readJson("graph.json", { nodes: [], edges: [], meta: { source: "empty" } }));
  if (pathname === "/api/report") return json(res, 200, { markdown: await readText("report.md", "# Resumo\n\nSem relatório disponível.") });
  if (pathname === "/api/audit") return json(res, 200, { markdown: await readText("audit.md", "# Auditoria\n\nSem auditoria disponível.") });
  if (pathname === "/api/stats") {
    const graph = await readJson("graph.json", { nodes: [], edges: [] });
    const graphFile = join(DATA_DIR, "graph.json");
    const modifiedAt = existsSync(graphFile) ? (await stat(graphFile)).mtime.toISOString() : null;
    return json(res, 200, { ...countGraph(graph), modifiedAt, meta: graph.meta || {} });
  }
  if (pathname === "/api/history") return json(res, 200, { items: await latestHistory() });
  if (pathname === "/api/run") {
    if (req.method !== "POST") return json(res, 405, { error: "Use POST para iniciar um run." });
    const url = new URL(req.url, `http://${req.headers.host}`);
    const mode = url.searchParams.get("mode") === "graphifyy" ? "graphifyy" : "lovable";
    const script = mode === "graphifyy" ? "pipeline-graphifyy.sh" : "pipeline-lovable.py";
    const command = mode === "graphifyy" ? "bash" : "python3";
    const child = spawn(command, [join(SCRIPTS_DIR, script)], { cwd: ROOT, env: process.env, detached: true, stdio: ["ignore", "ignore", "ignore"] });
    child.unref();
    return json(res, 202, { ok: true, started: true, mode, message: "Run iniciado em segundo plano." });
  }
  return json(res, 404, { error: "Endpoint não encontrado." });
}

function safePublicPath(pathname) {
  const requested = pathname === "/" ? "/index.html" : pathname;
  const decoded = decodeURIComponent(requested);
  const full = normalize(join(PUBLIC_DIR, decoded));
  if (!full.startsWith(PUBLIC_DIR)) return null;
  return full;
}

async function servePublic(req, res, pathname) {
  const filePath = safePublicPath(pathname);
  if (!filePath || !existsSync(filePath)) return text(res, 404, "Arquivo não encontrado.");
  res.writeHead(200, { "Content-Type": contentTypes[extname(filePath)] || "application/octet-stream", "X-Content-Type-Options": "nosniff" });
  createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname.startsWith("/api/")) return await api(req, res, url.pathname);
    return await servePublic(req, res, url.pathname);
  } catch (error) {
    return json(res, 500, { error: "Falha interna no graph-panel.", detail: error.message });
  }
});

server.listen(PORT, "127.0.0.1", () => console.log(`graph-panel ativo em http://127.0.0.1:${PORT}`));
