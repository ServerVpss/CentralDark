#!/usr/bin/env node
/**
 * Importa graphify-out/graph.json → formato do graph-panel.
 * NÃO roda extract LLM — só converte o que Graphify já gerou.
 *
 * Uso:
 *   node import-graphify-to-panel.mjs
 *   node import-graphify-to-panel.mjs --max-nodes=2500
 *   node import-graphify-to-panel.mjs --src=/path/to/graph.json
 *
 * Saídas:
 *   graph-panel/data/graph-full.json  — grafo inteiro (API ?mode=full)
 *   graph-panel/data/graph.json       — reduzido pra UI 3D (default /api/graph)
 *   status/graph-import-meta.json     — contagens / origem
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = "/root/CentralDark";
const OUT_DIR = join(ROOT, "apps/modulos/graph-panel/data");
const FULL_OUT = join(OUT_DIR, "graph-full.json");
const UI_OUT = join(OUT_DIR, "graph.json");
const META_OUT = join(ROOT, "apps/modulos/status/graph-import-meta.json");

function arg(name, def) {
  const a = process.argv.find((x) => x.startsWith(`--${name}=`));
  return a ? a.split("=").slice(1).join("=") : def;
}

const MAX_UI = Math.max(100, parseInt(arg("max-nodes", "2500"), 10) || 2500);
const SRC_ARG = arg("src", "");

function findLatestGraphify() {
  if (SRC_ARG && existsSync(SRC_ARG)) return SRC_ARG;
  const candidates = [];
  const base = join(ROOT, "graphify-out");
  const main = join(base, "graph.json");
  if (existsSync(main)) candidates.push(main);
  try {
    for (const d of readdirSync(base)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) continue;
      const p = join(base, d, "graph.json");
      if (existsSync(p)) candidates.push(p);
    }
  } catch { /* */ }
  if (!candidates.length) throw new Error("Nenhum graphify-out/**/graph.json encontrado");
  candidates.sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
  return candidates[0];
}

function groupOf(n) {
  if (n.group) return String(n.group);
  if (n.file_type) return String(n.file_type);
  if (n.community != null) return `c${n.community}`;
  return "doc";
}

function convert(raw) {
  const rawNodes = raw.nodes || [];
  const rawLinks = raw.links || raw.edges || [];
  const nodes = rawNodes.map((n) => ({
    id: String(n.id),
    label: String(n.label || n.norm_label || n.id).slice(0, 120),
    group: groupOf(n),
    size: Math.min(24, Math.max(2, Number(n.size) || (n.file_type === "document" ? 4 : 6))),
    source_file: n.source_file || undefined,
    community: n.community,
  }));
  const idSet = new Set(nodes.map((n) => n.id));
  const edges = [];
  for (const e of rawLinks) {
    const from = String(e.source ?? e.from ?? "");
    const to = String(e.target ?? e.to ?? "");
    if (!from || !to || !idSet.has(from) || !idSet.has(to)) continue;
    edges.push({
      from,
      to,
      label: e.relation || e.label || undefined,
      weight: e.weight ?? 1,
    });
  }
  return {
    nodes,
    edges,
    meta: {
      source: "graphify-import",
      importedAt: new Date().toISOString(),
      graphify_built_at_commit: raw.built_at_commit || null,
      original_nodes: rawNodes.length,
      original_links: rawLinks.length,
    },
    updatedAt: new Date().toISOString(),
  };
}

/** Reduz para UI: prioriza nós com mais grau + comunidades diversas */
function reduceForUi(graph, maxNodes) {
  if (graph.nodes.length <= maxNodes) return graph;
  const degree = new Map();
  for (const e of graph.edges) {
    degree.set(e.from, (degree.get(e.from) || 0) + 1);
    degree.set(e.to, (degree.get(e.to) || 0) + 1);
  }
  const ranked = graph.nodes
    .map((n) => ({ n, d: degree.get(n.id) || 0 }))
    .sort((a, b) => b.d - a.d);
  // garante diversidade de group
  const picked = new Map();
  for (const { n } of ranked) {
    if (picked.size >= maxNodes) break;
    const g = n.group || "?";
    const countG = [...picked.values()].filter((x) => x.group === g).length;
    if (countG > maxNodes / 8 && picked.size > maxNodes * 0.5) continue;
    picked.set(n.id, n);
  }
  // completa por grau se ainda faltar
  for (const { n } of ranked) {
    if (picked.size >= maxNodes) break;
    picked.set(n.id, n);
  }
  const ids = picked;
  const nodes = [...ids.values()];
  const edges = graph.edges.filter((e) => ids.has(e.from) && ids.has(e.to));
  return {
    nodes,
    edges,
    meta: {
      ...graph.meta,
      reduced: true,
      max_nodes: maxNodes,
      full_nodes: graph.nodes.length,
      full_edges: graph.edges.length,
    },
    updatedAt: graph.updatedAt,
  };
}

const src = findLatestGraphify();
console.log("[import] lendo", src);
const raw = JSON.parse(readFileSync(src, "utf8"));
const full = convert(raw);
full.meta.src_file = src;
const ui = reduceForUi(full, MAX_UI);

writeFileSync(FULL_OUT, JSON.stringify(full));
writeFileSync(UI_OUT, JSON.stringify(ui, null, 2));
const meta = {
  ok: true,
  src,
  full_nodes: full.nodes.length,
  full_edges: full.edges.length,
  ui_nodes: ui.nodes.length,
  ui_edges: ui.edges.length,
  importedAt: full.updatedAt,
  full_path: FULL_OUT,
  ui_path: UI_OUT,
};
writeFileSync(META_OUT, JSON.stringify(meta, null, 2));
console.log("[import] full", meta.full_nodes, "nós →", FULL_OUT);
console.log("[import] ui  ", meta.ui_nodes, "nós →", UI_OUT);
console.log(JSON.stringify(meta));
