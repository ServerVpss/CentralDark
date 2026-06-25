#!/usr/bin/env node
/**
 * 🧹 CentralDark · Notion Cleanup Orphans
 *
 * Apaga (arquiva) páginas no Notion que NÃO existem mais no Git.
 * Lei vigente: Git é fonte da verdade. Notion só reflete o que está no repo.
 *
 * Segurança:
 *   - Padrão é DRY-RUN. Só apaga de verdade se CONFIRM=YES_DELETE_ORPHANS
 *   - Sempre escreve relatório em docs/RELATORIOS/notion-sync/orphans-*.md
 *
 * Variáveis de ambiente:
 *   NOTION_API_KEY (obrigatório)
 *   CONFIRM        ("YES_DELETE_ORPHANS" pra apagar de verdade)
 *   TARGET         "all" | "regras" | "decisoes" | "aprendizados" | "pendencias"
 *   GITHUB_COMMIT, GITHUB_ACTOR
 */

import { Client } from "@notionhq/client";
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const NOTION_TOKEN = process.env.NOTION_API_KEY;
const CONFIRM = process.env.CONFIRM === "YES_DELETE_ORPHANS";
const TARGET = process.env.TARGET || "all";
const COMMIT = process.env.GITHUB_COMMIT || "local";
const ACTOR = process.env.GITHUB_ACTOR || "manual";

if (!NOTION_TOKEN) {
  console.error("❌ NOTION_API_KEY não definido.");
  process.exit(1);
}

const notion = new Client({ auth: NOTION_TOKEN });
const log = (...a) => console.log("[cleanup-orphans]", ...a);

const DB = {
  regras:       { id: "fd0a063c-eb21-46fc-9f52-72027a7befdc", titleProp: "Regra" },
  pendencias:   { id: "b37757f1-41a8-4d78-b738-b29068423419", titleProp: "Pendência" },
  decisoes:     { id: "3bffaefc-c606-4ed6-957a-c2bfb6fb6c7f", titleProp: "Decisão" },
  aprendizados: { id: "f53285e1-891f-4645-bae8-160b44d6cb6c", titleProp: "Título" },
};

const read = async (f) => {
  try { return await fs.readFile(path.join(ROOT, f), "utf8"); } catch { return null; }
};

/* ─────────── Coleta de títulos esperados (do Git) ─────────── */

async function expectedRegras() {
  return new Set([
    "Protocolo Multi-Agente Semântico (Ler → Agir → Registrar)",
    "Hierarquia de Memória — Git é a única fonte da verdade",
    "Guardião da Consciência — Modo Propor Obrigatório (até 08/07/2026)",
    "Guardião v2 — Arquitetura de 2 camadas (Olho + Cérebro/Fila)",
  ]);
}

async function expectedPendencias() {
  const md = await read("docs/PENDENCIAS.md");
  const set = new Set();
  if (!md) return set;
  const re = /^##\s+[🔴🟡🟢✅]\s+(#\d+)\s+[—–-]\s+(.+?)$/gm;
  let m;
  while ((m = re.exec(md)) !== null) set.add(`${m[1]} — ${m[2].trim()}`);
  return set;
}

async function expectedDecisoes() {
  const md = await read("docs/CONSCIENCIA/08-HISTORICO-DECISOES.md");
  const set = new Set();
  if (!md) return set;
  for (const h of md.matchAll(/^##\s+(.+?)$/gm)) set.add(h[1].trim());
  return set;
}

async function expectedAprendizados() {
  const md = await read("docs/CONSCIENCIA/APRENDIZADOS.md");
  const set = new Set();
  const ids = new Set();
  if (!md) return { set, ids };
  for (const h of md.matchAll(/^###\s+(-?\d+)\.\s+(.+?)$/gm)) {
    const id = parseInt(h[1], 10);
    ids.add(id);
    set.add(`#${id} — ${h[2].trim()}`.slice(0, 200));
  }
  return { set, ids };
}

// Extrai o #N do início do título (formato novo `#N — ...` ou antigo `#N ...`)
function extractAprendizadoId(title) {
  const m = (title || "").match(/^#(-?\d+)\b/);
  return m ? parseInt(m[1], 10) : null;
}

/* ─────────── Lista páginas no Notion ─────────── */

async function listAll(databaseId, titleProp) {
  const out = [];
  let cursor;
  do {
    const r = await notion.databases.query({
      database_id: databaseId,
      page_size: 100,
      start_cursor: cursor,
    });
    for (const p of r.results) {
      const t = (p.properties?.[titleProp]?.title || [])
        .map((x) => x.plain_text).join("");
      out.push({ id: p.id, title: t, archived: p.archived });
    }
    cursor = r.has_more ? r.next_cursor : undefined;
  } while (cursor);
  return out;
}

/* ─────────── Diff e ação ─────────── */

const report = [];

async function processBase(name, getExpected) {
  const meta = DB[name];
  log(`\n🔍 Base: ${name}`);
  const expected = await getExpected();
  const pages = await listAll(meta.id, meta.titleProp);

  let orphans;
  if (name === "aprendizados") {
    // Dedup por ID #N: agrupa páginas por número do aprendizado.
    // Quando existem N páginas com o mesmo #N, mantém só a que bate exato
    // com o título do Git (formato `#N — Título`). As outras são duplicatas órfãs.
    // Páginas sem #N no título → órfãs. Páginas com #N que não existe no Git → órfãs.
    const { set: expectedTitles, ids: expectedIds } = expected;
    const byId = new Map();
    const noId = [];
    for (const p of pages) {
      if (p.archived) continue;
      const id = extractAprendizadoId(p.title);
      if (id == null) { noId.push(p); continue; }
      if (!byId.has(id)) byId.set(id, []);
      byId.get(id).push(p);
    }
    orphans = [...noId];
    for (const [id, group] of byId) {
      if (!expectedIds.has(id)) {
        // ID não existe mais no Git → todas viram órfãs
        orphans.push(...group);
        continue;
      }
      if (group.length === 1) continue; // única página, mantém
      // Múltiplas com mesmo #N → mantém a que bate exato com o título canônico do Git
      const canon = group.find((p) => expectedTitles.has(p.title));
      const keeper = canon || group[0];
      for (const p of group) if (p.id !== keeper.id) orphans.push(p);
    }
    log(`  Notion: ${pages.length} · Git IDs: ${expectedIds.size} · Órfãos (incl. duplicatas por ID): ${orphans.length}`);
  } else {
    orphans = pages.filter((p) => !p.archived && !expected.has(p.title));
    log(`  Notion: ${pages.length} · Git: ${expected.size} · Órfãos: ${orphans.length}`);
  }

  for (const o of orphans) {
    if (CONFIRM) {
      try {
        await notion.pages.update({ page_id: o.id, archived: true });
        log(`  🗑️  arquivado: "${o.title}"`);
        report.push({ base: name, action: "arquivado", title: o.title, id: o.id });
      } catch (e) {
        log(`  ❌ erro ao arquivar "${o.title}": ${e.message}`);
        report.push({ base: name, action: "erro", title: o.title, error: e.message });
      }
    } else {
      log(`  🟡 [DRY] arquivaria: "${o.title}"`);
      report.push({ base: name, action: "arquivaria", title: o.title, id: o.id });
    }
  }
  const gitCount = (name === "aprendizados") ? expected.ids.size : expected.size;
  return { base: name, notion: pages.length, git: gitCount, orphans: orphans.length };
}

async function writeReport(resumo) {
  const now = new Date().toISOString();
  const dir = path.join(ROOT, "docs/RELATORIOS/notion-sync");
  await fs.mkdir(dir, { recursive: true });
  const lines = [
    `# 🧹 Notion Cleanup Orphans — ${now}`,
    "",
    `- **Commit fonte:** \`${COMMIT}\``,
    `- **Disparado por:** ${ACTOR}`,
    `- **Modo:** ${CONFIRM ? "🔴 EXECUÇÃO (apagou de verdade)" : "🟡 DRY-RUN (precisa CONFIRM=YES_DELETE_ORPHANS pra apagar)"}`,
    `- **Target:** \`${TARGET}\``,
    "",
    "## Resumo por base",
    "",
    "| Base | Notion | Git | Órfãos |",
    "|---|---:|---:|---:|",
    ...resumo.map((r) => `| ${r.base} | ${r.notion} | ${r.git} | ${r.orphans} |`),
    "",
    "## Operações",
    "",
    "| Base | Ação | Título |",
    "|---|---|---|",
    ...report.map((o) => `| ${o.base} | ${o.action} | ${(o.title || "").replace(/\|/g, "\\|")} |`),
    "",
    "> Gerado automaticamente por `.github/workflows/notion-sync.yml` (job cleanup).",
  ];
  const stamp = now.replace(/[:.]/g, "-").slice(0, 19);
  await fs.writeFile(path.join(dir, `orphans-${stamp}.md`), lines.join("\n"));
  await fs.writeFile(path.join(dir, "orphans-latest.md"), lines.join("\n"));
}

async function main() {
  log(`🚀 Cleanup órfãos · target=${TARGET} · confirm=${CONFIRM}`);
  // TARGET aceita "all" ou CSV ex: "regras,pendencias,decisoes"
  const wanted = TARGET === "all"
    ? ["regras","pendencias","decisoes","aprendizados"]
    : TARGET.split(",").map((s) => s.trim()).filter(Boolean);
  const resumo = [];
  const map = {
    regras: expectedRegras,
    pendencias: expectedPendencias,
    decisoes: expectedDecisoes,
    aprendizados: expectedAprendizados,
  };
  for (const name of wanted) {
    if (map[name]) resumo.push(await processBase(name, map[name]));
  }
  await writeReport(resumo);
  if (!CONFIRM) {
    log("\n⚠️  DRY-RUN. Pra apagar de verdade, rode com CONFIRM=YES_DELETE_ORPHANS");
  } else {
    log("\n✅ Cleanup concluído.");
  }
}

main().catch((e) => { log("❌ falha:", e.message); process.exit(1); });
