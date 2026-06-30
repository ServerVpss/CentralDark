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
  estrutura: "e9c95779-7a72-4bcc-872f-9903e7c1cf7e",
};

// NUNCA espelhar — mesma lista de docs/CONSCIENCIA/NOTION-MAPA.md
// (IP público, paths de SSH, mapa de secrets). Editar os dois juntos.
const NUNCA_ESPELHAR = new Set([
  "04-ESTRUTURA-VPS.md",
  "05-SSH-VPS.md",
  "12-COFRE-LOVABLE.md",
  "14-COFRE-SECRETS-CENTRALIZADO.md",
]);

// Caminhos (substring) que nunca entram no inventário — legado e mapa de secrets.
// Mesma decisão de segurança de docs/CONSCIENCIA/NOTION-MAPA.md.
const PATH_BLOQUEADO = ["/ARQUIVO-MORTO/", "/secrets-mapeamento/"];

const REPO_BASE = "https://github.com/ServerVpss/CentralDark/blob/main";

/* ─────────── Util ─────────── */

const log = (...args) => console.log("[notion-sync]", ...args);
const opLog = []; // pra escrever no relatório no final

// Estatísticas por base — alimentam changelog
const stats = {
  regras:       { criadas: 0, atualizadas: 0, ignoradas: 0, erros: 0, total_git: 0 },
  pendencias:   { criadas: 0, atualizadas: 0, ignoradas: 0, erros: 0, total_git: 0 },
  decisoes:     { criadas: 0, atualizadas: 0, ignoradas: 0, erros: 0, total_git: 0 },
  aprendizados: { criadas: 0, atualizadas: 0, ignoradas: 0, erros: 0, total_git: 0 },
  estrutura:    { criadas: 0, atualizadas: 0, ignoradas: 0, erros: 0, total_git: 0 },
};
let _currentBase = null;
const setBase = (b) => { _currentBase = b; };

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
  try {
    const existing = await findByTitle(dataSourceId, titleProp, title);

    if (DRY_RUN) {
      const action = existing ? "ATUALIZARIA" : "CRIARIA";
      log(`  🔸 ${action}: "${title}"`);
      opLog.push({ base: _currentBase, action: action.toLowerCase(), title, id: existing });
      if (_currentBase) stats[_currentBase][existing ? "atualizadas" : "criadas"]++;
      return;
    }

    if (existing) {
      await notion.pages.update({ page_id: existing, properties });
      log(`  ♻️  atualizado: "${title}"`);
      opLog.push({ base: _currentBase, action: "atualizado", title, id: existing });
      if (_currentBase) stats[_currentBase].atualizadas++;
    } else {
      const created = await notion.pages.create({
        parent: { database_id: dataSourceId },
        properties,
        children: children || [],
      });
      log(`  ✨ criado: "${title}"`);
      opLog.push({ base: _currentBase, action: "criado", title, id: created.id });
      if (_currentBase) stats[_currentBase].criadas++;
    }
  } catch (err) {
    log(`  ❌ erro em "${title}": ${err.message}`);
    opLog.push({ base: _currentBase, action: "erro", title, error: err.message });
    if (_currentBase) stats[_currentBase].erros++;
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
  setBase("pendencias");
  log("📋 Sincronizando pendências...");
  const md = await read("docs/PENDENCIAS.md");
  if (!md) return;
  const items = parsePendencias(md);
  stats.pendencias.total_git = items.length;
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
  setBase("regras");
  log("📜 Sincronizando regras oficiais...");
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
  stats.regras.total_git = files.length;
  for (const r of files) {
    const md = await read(r.file);
    if (!md) { stats.regras.ignoradas++; continue; }
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
  setBase("decisoes");
  log("⚖️  Sincronizando decisões com relação a regras...");
  const md = await read("docs/CONSCIENCIA/08-HISTORICO-DECISOES.md");
  if (!md) return;
  const regras = await loadRegrasIndex();

  const heads = [...md.matchAll(/^##\s+(.+?)$/gm)];
  stats.decisoes.total_git = heads.length;
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
  log(`  ✅ ${heads.length} decisões processadas.`);
}

/* ─────────── Parser COMPLETO de Aprendizados (262 itens) ─────────── */

function parseAprendizados(md) {
  // Cada item começa em `^### N. Titulo` (N pode ser negativo). Vai até o próximo `### `.
  const heads = [...md.matchAll(/^###\s+(-?\d+)\.\s+(.+?)$/gm)];
  const items = [];
  for (let i = 0; i < heads.length; i++) {
    const h = heads[i];
    const num = parseInt(h[1], 10);
    const tituloCru = h[2].trim();
    const start = h.index + h[0].length;
    const end = heads[i + 1]?.index ?? md.length;
    const corpo = md.slice(start, end).trim();

    const get = (label) => {
      const re = new RegExp(`\\*\\*${label}:\\*\\*\\s*([^\\n]+(?:\\n(?!\\*\\*|###|---)[^\\n]+)*)`, "i");
      const m = corpo.match(re);
      return m ? m[1].trim().replace(/\s+/g, " ") : "";
    };

    const categoriaRaw = get("Categoria").toLowerCase();
    const dataRaw = get("Data");
    const contexto = get("Contexto");
    const aprendizado = get("Aprendizado");

    // Mapear categoria do MD para options do Notion
    let categoria = "Insight";
    if (/bug|erro/i.test(categoriaRaw)) categoria = "Bug";
    else if (/regra|obriga|decis/i.test(categoriaRaw)) categoria = "Decisão";
    else if (/padr[ãa]o/i.test(categoriaRaw) && /anti/i.test(categoriaRaw)) categoria = "Anti-padrão";
    else if (/padr[ãa]o|atalho|protocolo/i.test(categoriaRaw)) categoria = "Padrão";

    let origem = "Observação";
    if (/bug|erro|falha/i.test(categoriaRaw) || /erro|bug|falha|quebrou/i.test(tituloCru)) origem = "Erro";
    else if (/acerto|sucesso|funcionou/i.test(categoriaRaw)) origem = "Acerto";

    // Tags por heurística no conteúdo
    const tags = [];
    const blob = `${tituloCru} ${contexto} ${aprendizado}`.toLowerCase();
    if (/vps|pm2|caddy|\/root\//.test(blob)) tags.push("VPS");
    if (/\bbot\b|whatsapp|telegram/.test(blob)) tags.push("Bot");
    if (/\bia\b|claude|gpt|lovable|grok|gemini|codex/.test(blob)) tags.push("IA");
    if (/deploy|build|dist|publish/.test(blob)) tags.push("Deploy");
    if (/\bmcp\b/.test(blob)) tags.push("MCP");
    if (/notion/.test(blob)) tags.push("Notion");

    const titulo = `#${num} — ${tituloCru}`.slice(0, 200);
    const resumo = (aprendizado || contexto || tituloCru).slice(0, 1900);

    const dateIso = /^\d{4}-\d{2}-\d{2}$/.test(dataRaw) ? dataRaw : null;

    items.push({ num, titulo, resumo, categoria, origem, tags, dateIso });
  }
  return items;
}

async function syncAprendizados() {
  setBase("aprendizados");
  log("🧠 Sincronizando aprendizados (parser completo)...");
  const md = await read("docs/CONSCIENCIA/APRENDIZADOS.md");
  if (!md) return;
  const items = parseAprendizados(md);
  stats.aprendizados.total_git = items.length;
  log(`  ℹ️  ${items.length} aprendizados detectados. Subindo todos...`);

  const arquivoUrl = `${REPO_BASE}/docs/CONSCIENCIA/APRENDIZADOS.md`;
  let i = 0;
  for (const it of items) {
    i++;
    if (i % 25 === 0) log(`  ⏳ progresso: ${i}/${items.length}`);
    await upsert({
      dataSourceId: DB.aprendizados,
      titleProp: "Título",
      title: it.titulo,
      properties: {
        "Título": title(it.titulo),
        "Resumo": text(it.resumo),
        "Categoria": select(it.categoria),
        "Origem": select(it.origem),
        "Tags": multi(it.tags),
        "Data": dateProp(it.dateIso),
        "Arquivo Git": url(arquivoUrl),
      },
    });
  }
  log(`  ✅ ${items.length} aprendizados processados.`);
}

/* ─────────── Documentos gerais (inventário no DB Estrutura) ─────────── */

// Extrai título do doc: frontmatter `title:` → primeiro heading `#` → fallback.
function tituloDoDoc(md, fallback) {
  const fm = md.match(/^---\n([\s\S]*?)\n---/);
  if (fm) {
    const t = fm[1].match(/^title:\s*["']?(.+?)["']?\s*$/m);
    if (t) return t[1].trim();
  }
  const h = md.match(/^#\s+(.+?)\s*$/m);
  if (h) return h[1].trim();
  return fallback;
}

// Resumo curto: 1ª linha de blockquote (boa descrição) ou 1ª linha de texto.
function resumoDoDoc(md) {
  const semFm = md.replace(/^---\n[\s\S]*?\n---\n?/, "");
  const linhas = semFm.split("\n");
  for (const l of linhas) {
    const s = l.trim();
    if (s.startsWith(">")) return s.replace(/^>\s*/, "").trim();
  }
  for (const l of linhas) {
    const s = l.trim();
    if (!s || s.startsWith("#") || s.startsWith("---") ||
        s.startsWith("|") || s.startsWith("```")) continue;
    return s;
  }
  return "";
}

// Inventaria TODOS os .md de docs/CONSCIENCIA/ no DB "Estrutura de Pastas &
// Agentes" (Caminho = chave de UPSERT). Mapa, não conteúdo — por isso convive
// com os syncs dedicados (regras/decisoes/aprendizados) sem duplicar de verdade.
async function syncDocumentosGerais() {
  setBase("estrutura");
  log("📂 Inventariando documentos da CONSCIENCIA...");
  const baseDir = "docs/CONSCIENCIA";
  let entries = [];
  try {
    entries = await fs.readdir(path.join(ROOT, baseDir), { recursive: true });
  } catch (e) {
    log(`⚠️  não consegui listar ${baseDir}: ${e.message}`);
    return;
  }
  const docs = entries
    .map((rel) => `${baseDir}/${rel}`.replace(/\\/g, "/"))
    .filter((p) => p.endsWith(".md"))
    .filter((p) => !NUNCA_ESPELHAR.has(path.basename(p)))
    .filter((p) => !PATH_BLOQUEADO.some((b) => p.includes(b)))
    .sort();

  stats.estrutura.total_git = docs.length;
  log(`  ℹ️  ${docs.length} documentos a inventariar.`);

  let i = 0;
  for (const relPath of docs) {
    i++;
    if (i % 25 === 0) log(`  ⏳ progresso: ${i}/${docs.length}`);
    const md = await read(relPath);
    if (md === null) { stats.estrutura.ignoradas++; continue; }
    const base = path.basename(relPath);
    const tipo = /^REGRA-OFICIAL/i.test(base) ? "Arquivo de regra" : "Doc";
    const funcao = tituloDoDoc(md, base);
    const resumo = resumoDoDoc(md);
    const notas = `${resumo}${resumo ? " · " : ""}${REPO_BASE}/${relPath}`;

    await upsert({
      dataSourceId: DB.estrutura,
      titleProp: "Caminho",
      title: relPath,
      properties: {
        "Caminho": title(relPath),
        "Tipo": select(tipo),
        "Função": text(funcao),
        "Notas": text(notas),
        "Repo": select("CentralDark2"),
      },
    });
  }
  log(`  ✅ ${docs.length} documentos processados.`);
}

/* ─────────── Relatório + Changelog ─────────── */

async function writeReport() {
  const now = new Date().toISOString();
  const dir = path.join(ROOT, "docs/RELATORIOS/notion-sync");
  await fs.mkdir(dir, { recursive: true });

  const created = opLog.filter((o) => o.action === "criado").length;
  const updated = opLog.filter((o) => o.action === "atualizado").length;
  const erros   = opLog.filter((o) => o.action === "erro").length;

  const targetsRodados = TARGET === "all"
    ? ["regras","pendencias","decisoes","aprendizados","estrutura"]
    : [TARGET];
  const targetsIgnorados = ["regras","pendencias","decisoes","aprendizados","estrutura"]
    .filter((t) => !targetsRodados.includes(t));

  const tabela = [
    "| Base | Git | Criadas | Atualizadas | Ignoradas | Erros |",
    "|---|---:|---:|---:|---:|---:|",
    ...targetsRodados.map((t) => {
      const s = stats[t];
      return `| ${t} | ${s.total_git} | ${s.criadas} | ${s.atualizadas} | ${s.ignoradas} | ${s.erros} |`;
    }),
  ].join("\n");

  const lines = [
    `# 🧠 Notion Sync — ${now}`,
    "",
    `- **Commit fonte:** \`${COMMIT}\``,
    `- **Disparado por:** ${ACTOR}`,
    `- **Modo:** ${DRY_RUN ? "🟡 DRY-RUN (não escreveu nada)" : "🟢 EXECUÇÃO"}`,
    `- **Target:** \`${TARGET}\``,
    `- **Bases rodadas:** ${targetsRodados.join(", ") || "—"}`,
    `- **Bases ignoradas:** ${targetsIgnorados.join(", ") || "—"}`,
    `- **Resumo:** ✨ ${created} criadas · ♻️ ${updated} atualizadas · ❌ ${erros} erros`,
    "",
    "## Por base",
    "",
    tabela,
    "",
    "## Operações",
    "",
    "| Base | Ação | Título |",
    "|---|---|---|",
    ...opLog.map((o) => `| ${o.base || "-"} | ${o.action} | ${(o.title || "").replace(/\|/g, "\\|")} |`),
    "",
    "> Gerado automaticamente por `.github/workflows/notion-sync.yml`.",
  ];
  await fs.writeFile(path.join(dir, "latest.md"), lines.join("\n"));
  const stamp = now.replace(/[:.]/g, "-").slice(0, 19);
  await fs.writeFile(path.join(dir, `${stamp}.md`), lines.join("\n"));

  // Changelog acumulado
  const changelogPath = path.join(ROOT, "docs/RELATORIOS/notion-sync/CHANGELOG.md");
  const head = "# 📒 Changelog Notion Sync\n\n> Histórico cronológico de cada execução do workflow `notion-sync.yml`.\n\n";
  let prev = "";
  try { prev = await fs.readFile(changelogPath, "utf8"); } catch {}
  if (!prev) prev = head;
  const entryLines = [
    `## ${now} · ${DRY_RUN ? "DRY-RUN" : "EXEC"} · target=${TARGET} · por @${ACTOR}`,
    "",
    `- Commit fonte: \`${COMMIT}\``,
    `- Bases atualizadas: ${targetsRodados.join(", ") || "—"}`,
    `- Bases ignoradas: ${targetsIgnorados.join(", ") || "—"}`,
    ...targetsRodados.map((t) => {
      const s = stats[t];
      return `  - **${t}**: ${s.criadas} criadas · ${s.atualizadas} atualizadas · ${s.ignoradas} ignoradas · ${s.erros} erros (Git: ${s.total_git})`;
    }),
    "",
  ].join("\n");
  // Insere nova entrada logo abaixo do cabeçalho
  const body = prev.startsWith(head) ? prev.slice(head.length) : prev;
  await fs.writeFile(changelogPath, head + entryLines + "\n" + body);
}

/* ─────────── Main ─────────── */

async function main() {
  log(`🚀 Iniciando sync · target=${TARGET} · dry=${DRY_RUN}`);
  try {
    if (TARGET === "all" || TARGET === "regras") await syncRegras();
    if (TARGET === "all" || TARGET === "pendencias") await syncPendencias();
    if (TARGET === "all" || TARGET === "decisoes") await syncDecisoes();
    if (TARGET === "all" || TARGET === "aprendizados") await syncAprendizados();
    if (TARGET === "all" || TARGET === "estrutura") await syncDocumentosGerais();
    await writeReport();
    log("✅ Concluído.");
  } catch (err) {
    log("❌ Falha:", err.message);
    opLog.push({ base: _currentBase, action: "ERRO", title: err.message });
    await writeReport();
    process.exit(1);
  }
}

main();
