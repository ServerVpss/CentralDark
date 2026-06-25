#!/usr/bin/env node
/**
 * 🧠 CentralDark · Notion Sync (UPSERT)
 *
 * Espelha conteúdo do Git (docs/CONSCIENCIA/) para os databases do Notion.
 * Lei vigente: Git é fonte da verdade. Notion é painel humano.
 *
 * Estratégia anti-duplicação (UPSERT):
 *   1. Para cada item da fonte, calcular um TÍTULO determinístico.
 *   2. Consultar o database por esse título.
 *   3. Se existir → atualizar propriedades.
 *   4. Se não existir → criar.
 *
 * Variáveis de ambiente:
 *   NOTION_API_KEY (obrigatório) — token de integração
 *   DRY_RUN ("true"/"false") — se true, só mostra o que faria
 *   TARGET — "all" | "regras" | "decisoes" | "aprendizados" | "pendencias"
 *   GITHUB_COMMIT, GITHUB_ACTOR — pra log
 *
 * Mapa dos databases vive em docs/CONSCIENCIA/NOTION-MAPA.md
 */

import { Client } from "@notionhq/client";
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const NOTION_TOKEN = process.env.NOTION_API_KEY;
const DRY_RUN = String(process.env.DRY_RUN || "false").toLowerCase() === "true";
const TARGET = process.env.TARGET || "all";
const COMMIT = process.env.GITHUB_COMMIT || "local";
const ACTOR = process.env.GITHUB_ACTOR || "manual";

if (!NOTION_TOKEN) {
  console.error("❌ NOTION_API_KEY não está definido.");
  process.exit(1);
}

const notion = new Client({ auth: NOTION_TOKEN });

// IDs oficiais dos databases para a API pública do Notion.
// Atenção: não usar aqui os Data Source IDs (collection://) do MCP,
// porque @notionhq/client v2 consulta via databases.query({ database_id }).
// Fonte: docs/CONSCIENCIA/NOTION-MAPA.md
const DB = {
  regras: "fd0a063c-eb21-46fc-9f52-72027a7befdc",
  pendencias: "b37757f1-41a8-4d78-b738-b29068423419",
  decisoes: "3bffaefc-c606-4ed6-957a-c2bfb6fb6c7f",
  aprendizados: "f53285e1-891f-4645-bae8-160b44d6cb6c",
};

const REPO_BASE = "https://github.com/ServerVpss/CentralDark/blob/main";

/* ─────────── Util ─────────── */

const log = (...args) => console.log("[notion-sync]", ...args);
const opLog = []; // pra escrever no relatório no final

async function read(file) {
  try {
    return await fs.readFile(path.join(ROOT, file), "utf8");
  } catch (e) {
    log(`⚠️  arquivo não encontrado: ${file}`);
    return null;
  }
}

/**
 * Procura página existente no database por título exato.
 * Retorna page.id ou null.
 */
async function findByTitle(dataSourceId, titleProp, title) {
  const res = await notion.databases.query({
    database_id: dataSourceId,
    filter: {
      property: titleProp,
      title: { equals: title },
    },
    page_size: 1,
  });
  return res.results[0]?.id || null;
}

async function upsert({ dataSourceId, titleProp, title, properties, children }) {
  const existing = await findByTitle(dataSourceId, titleProp, title);

  if (DRY_RUN) {
    const action = existing ? "ATUALIZARIA" : "CRIARIA";
    log(`  🔸 ${action}: "${title}"`);
    opLog.push({ action: action.toLowerCase(), title, id: existing });
    return;
  }

  if (existing) {
    await notion.pages.update({ page_id: existing, properties });
    log(`  ♻️  atualizado: "${title}"`);
    opLog.push({ action: "atualizado", title, id: existing });
  } else {
    const created = await notion.pages.create({
      parent: { database_id: dataSourceId },
      properties,
      children: children || [],
    });
    log(`  ✨ criado: "${title}"`);
    opLog.push({ action: "criado", title, id: created.id });
  }
}

const text = (s) => ({
  rich_text: [{ type: "text", text: { content: (s || "").slice(0, 2000) } }],
});
const title = (s) => ({
  title: [{ type: "text", text: { content: (s || "").slice(0, 200) } }],
});
const select = (n) => (n ? { select: { name: n } } : { select: null });
const multi = (arr) => ({
  multi_select: (arr || []).map((name) => ({ name })),
});
const url = (u) => (u ? { url: u } : { url: null });
const dateProp = (iso) => (iso ? { date: { start: iso } } : { date: null });
const check = (b) => ({ checkbox: !!b });
const status = (n) => ({ status: { name: n } });

/* ─────────── Parsers ─────────── */

/**
 * Parse de docs/PENDENCIAS.md
 * Formato: ## <emoji> #N — Título  \n **Status:** ... \n descrição até próximo ##
 */
function parsePendencias(md) {
  const items = [];
  const re = /^##\s+([🔴🟡🟢✅])\s+(#\d+)\s+[—–-]\s+(.+?)$/gm;
  let m;
  const indexes = [];
  while ((m = re.exec(md)) !== null) {
    indexes.push({ start: m.index, emoji: m[1], num: m[2], title: m[3].trim() });
  }
  for (let i = 0; i < indexes.length; i++) {
    const cur = indexes[i];
    const end = indexes[i + 1]?.start ?? md.length;
    const body = md.slice(cur.start, end);
    const statusMatch = body.match(/\*\*Status:\*\*\s*([^\n]+)/);
    items.push({
      emoji: cur.emoji,
      num: cur.num,
      title: `${cur.num} — ${cur.title}`,
      statusRaw: statusMatch ? statusMatch[1].trim() : "",
      body,
    });
  }
  return items;
}

function mapPendenciaStatus(emoji, statusRaw) {
  if (emoji === "✅") return "Concluído";
  if (/em andamento/i.test(statusRaw)) return "Em andamento";
  return "Não iniciada";
}
function mapPendenciaPrioridade(emoji) {
  if (emoji === "🔴") return "Urgente";
  if (emoji === "🟡") return "Média";
  if (emoji === "🟢") return "Baixa";
  return "Baixa";
}

/* ─────────── Targets ─────────── */

async function syncPendencias() {
  log("📋 Sincronizando pendências...");
  const md = await read("docs/PENDENCIAS.md");
  if (!md) return;
  const items = parsePendencias(md);
  for (const it of items) {
    await upsert({
      dataSourceId: DB.pendencias,
      titleProp: "Pendência",
      title: it.title,
      properties: {
        "Pendência": title(it.title),
        "Prioridade": select(mapPendenciaPrioridade(it.emoji)),
        "Status": status(mapPendenciaStatus(it.emoji, it.statusRaw)),
      },
    });
  }
}

async function syncRegras() {
  log("📜 Sincronizando regras oficiais...");
  // O conjunto de regras oficiais é estável. Se quiser adicionar, edite aqui.
  const files = [
    {
      file: "docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/REGRA-OFICIAL-MULTI-AGENTE-SEMANTICO.md",
      title: "Protocolo Multi-Agente Semântico (Ler → Agir → Registrar)",
      escopo: "Todos os agentes",
    },
    {
      file: "docs/CONSCIENCIA/REGRA-OFICIAL-HIERARQUIA-MEMORIA.md",
      title: "Hierarquia de Memória — Git é a única fonte da verdade",
      escopo: "Todos os agentes",
    },
    {
      file: "docs/CONSCIENCIA/REGRA-OFICIAL-GUARDIAO-MODO-PROPOR.md",
      title: "Guardião da Consciência — Modo Propor Obrigatório (até 08/07/2026)",
      escopo: "VPS",
    },
    {
      file: "docs/CONSCIENCIA/REGRA-OFICIAL-GUARDIAO-V2-ANALISTA.md",
      title: "Guardião v2 — Arquitetura de 2 camadas (Olho + Cérebro/Fila)",
      escopo: "VPS",
    },
  ];
  for (const r of files) {
    const md = await read(r.file);
    if (!md) continue;
    const detalhes = md.split("\n").slice(0, 12).join(" ").replace(/\s+/g, " ");
    await upsert({
      dataSourceId: DB.regras,
      titleProp: "Regra",
      title: r.title,
      properties: {
        "Regra": title(r.title),
        "Tipo": select("Obrigação"),
        "Escopo": select(r.escopo),
        "Ativa": check(true),
        "Detalhes": text(`${detalhes} | Arquivo: ${r.file}`),
      },
    });
  }
}

// Cache de IDs de páginas do DB de Regras (pra relation)
let _regrasIndex = null;
async function loadRegrasIndex() {
  if (_regrasIndex) return _regrasIndex;
  _regrasIndex = [];
  let cursor;
  do {
    const r = await notion.databases.query({
      database_id: DB.regras,
      start_cursor: cursor,
      page_size: 100,
    });
    for (const p of r.results) {
      const t = (p.properties?.Regra?.title || [])
        .map((x) => x.plain_text)
        .join("");
      if (t) _regrasIndex.push({ id: p.id, title: t });
    }
    cursor = r.has_more ? r.next_cursor : undefined;
  } while (cursor);
  return _regrasIndex;
}

// Heurística: para cada decisão, encontrar regras relacionadas por palavra-chave
function matchRegras(decisaoTexto, regras) {
  const lower = decisaoTexto.toLowerCase();
  const tokens = [
    { kw: ["guardião", "guardiao", "modo propor"], match: (t) => /guardi[ãa]o/i.test(t) },
    { kw: ["hierarquia", "memória", "memoria", "git é a"], match: (t) => /hierarquia|mem[óo]ria/i.test(t) },
    { kw: ["multi-agente", "semântico", "semantico"], match: (t) => /multi[- ]agente|sem[âa]ntico/i.test(t) },
  ];
  const out = new Set();
  for (const tk of tokens) {
    if (tk.kw.some((k) => lower.includes(k))) {
      for (const r of regras) if (tk.match(r.title)) out.add(r.id);
    }
  }
  return [...out];
}

async function syncDecisoes() {
  log("⚖️  Sincronizando decisões com relação a regras...");
  const md = await read("docs/CONSCIENCIA/08-HISTORICO-DECISOES.md");
  if (!md) return;
  const regras = await loadRegrasIndex();

  // Formato esperado: ## <Título> ... blocos até próximo ##
  const heads = [...md.matchAll(/^##\s+(.+?)$/gm)];
  for (let i = 0; i < heads.length; i++) {
    const h = heads[i];
    const titulo = h[1].trim();
    const start = h.index + h[0].length;
    const end = heads[i + 1]?.index ?? md.length;
    const corpo = md.slice(start, end).trim();
    const relIds = matchRegras(`${titulo}\n${corpo}`, regras);

    const props = {
      "Decisão": title(titulo),
      "Motivo": text(corpo.split("\n").slice(0, 6).join(" ").replace(/\s+/g, " ")),
    };
    if (relIds.length) {
      props["Regras Relacionadas"] = { relation: relIds.map((id) => ({ id })) };
    }
    await upsert({
      dataSourceId: DB.decisoes,
      titleProp: "Decisão",
      title: titulo,
      properties: props,
    });
  }
  log(`  ✅ ${heads.length} decisões processadas (com relação ↔ Regras quando aplicável).`);
}

async function syncAprendizados() {
  log("🧠 Sincronizando aprendizados (modo incremental)...");
  // O arquivo é gigante. Por padrão, NÃO re-importamos tudo a cada commit —
  // apenas validamos contagem e pulamos. Para popular em lote, rodar manualmente
  // com TARGET=aprendizados e adicionar lógica de parsing aqui.
  const md = await read("docs/CONSCIENCIA/APRENDIZADOS.md");
  if (!md) return;
  const count = (md.match(/^###\s+/gm) || []).length;
  log(`  ℹ️  ${count} aprendizados detectados no Git. Top 20 já populados via setup inicial.`);
  opLog.push({ action: "info", title: `${count} aprendizados no Git` });
}

/* ─────────── Relatório ─────────── */

async function writeReport() {
  const now = new Date().toISOString();
  const dir = path.join(ROOT, "docs/RELATORIOS/notion-sync");
  await fs.mkdir(dir, { recursive: true });

  const created = opLog.filter((o) => o.action === "criado").length;
  const updated = opLog.filter((o) => o.action === "atualizado").length;
  const infos = opLog.filter((o) => o.action === "info").length;

  const lines = [
    `# 🧠 Notion Sync — ${now}`,
    "",
    `- **Commit fonte:** \`${COMMIT}\``,
    `- **Disparado por:** ${ACTOR}`,
    `- **Modo:** ${DRY_RUN ? "🟡 DRY-RUN (não escreveu nada)" : "🟢 EXECUÇÃO"}`,
    `- **Target:** \`${TARGET}\``,
    `- **Resumo:** ✨ ${created} criadas · ♻️ ${updated} atualizadas · ℹ️ ${infos} infos`,
    "",
    "## Operações",
    "",
    "| Ação | Título |",
    "|---|---|",
    ...opLog.map((o) => `| ${o.action} | ${o.title.replace(/\|/g, "\\|")} |`),
    "",
    "> Gerado automaticamente por `.github/workflows/notion-sync.yml`.",
  ];
  await fs.writeFile(path.join(dir, "latest.md"), lines.join("\n"));
  const stamp = now.replace(/[:.]/g, "-").slice(0, 19);
  await fs.writeFile(path.join(dir, `${stamp}.md`), lines.join("\n"));
}

/* ─────────── Main ─────────── */

async function main() {
  log(`🚀 Iniciando sync · target=${TARGET} · dry=${DRY_RUN}`);
  try {
    if (TARGET === "all" || TARGET === "regras") await syncRegras();
    if (TARGET === "all" || TARGET === "pendencias") await syncPendencias();
    if (TARGET === "all" || TARGET === "decisoes") await syncDecisoes();
    if (TARGET === "all" || TARGET === "aprendizados") await syncAprendizados();
    await writeReport();
    log("✅ Concluído.");
  } catch (err) {
    log("❌ Falha:", err.message);
    opLog.push({ action: "ERRO", title: err.message });
    await writeReport();
    process.exit(1);
  }
}

main();
