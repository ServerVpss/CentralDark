#!/usr/bin/env node
/**
 * 📊 Relatório de Consistência: Git ↔ Notion
 *
 * Compara o que existe no Git (fonte da verdade) com o que existe no Notion
 * (espelho humano) e aponta divergências:
 *
 *   - 🟥 Faltando no Notion (existe no Git, não está espelhado)
 *   - 🟧 Faltando no Git    (existe no Notion mas sumiu do Git → órfão)
 *   - 🟩 OK                 (espelhado dos dois lados)
 *
 * Saída: docs/RELATORIOS/notion-sync/consistencia-latest.md (sobrescreve)
 *        + cópia datada.
 *
 * Vars:
 *   NOTION_API_KEY (obrigatório)
 *   GITHUB_COMMIT, GITHUB_ACTOR (opcional, pra cabeçalho)
 */

import { Client } from "@notionhq/client";
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const TOKEN = process.env.NOTION_API_KEY;
if (!TOKEN) {
  console.error("❌ NOTION_API_KEY ausente.");
  process.exit(1);
}
const notion = new Client({ auth: TOKEN });

const DB = {
  regras: { id: "867966ce-c6bb-4767-af25-e6da4b8eb9f9", title: "Regra" },
  pendencias: { id: "52dcbdf3-f1f2-49dc-8ee7-f26c34bece3e", title: "Pendência" },
  decisoes: { id: "66731d2b-4f3d-4a6d-82e3-323d81259b95", title: "Decisão" },
  aprendizados: { id: "d2dc1197-f0e2-4cea-9f8f-c3a5499a0303", title: "Aprendizado" },
};

async function read(file) {
  try { return await fs.readFile(path.join(ROOT, file), "utf8"); }
  catch { return null; }
}

async function listAll(dbId, titleProp) {
  const out = [];
  let cursor;
  do {
    const r = await notion.databases.query({
      database_id: dbId, start_cursor: cursor, page_size: 100,
    });
    for (const p of r.results) {
      const t = (p.properties?.[titleProp]?.title || [])
        .map((x) => x.plain_text).join("").trim();
      if (t) out.push(t);
    }
    cursor = r.has_more ? r.next_cursor : undefined;
  } while (cursor);
  return out;
}

// ─── Fontes Git ─────────────────────────────────────────────────────────────

function extractGitRegras() {
  // Set fixo (mesma lista do sync.mjs)
  return [
    "Protocolo Multi-Agente Semântico (Ler → Agir → Registrar)",
    "Hierarquia de Memória — Git é a única fonte da verdade",
    "Guardião da Consciência — Modo Propor Obrigatório (até 08/07/2026)",
    "Guardião v2 — Arquitetura de 2 camadas (Olho + Cérebro/Fila)",
  ];
}

function extractGitPendencias(md) {
  const re = /^##\s+([🔴🟡🟢✅])\s+(#\d+)\s+[—–-]\s+(.+?)$/gm;
  const out = [];
  let m;
  while ((m = re.exec(md)) !== null) out.push(`${m[2]} — ${m[3].trim()}`);
  return out;
}

function extractGitDecisoes(md) {
  return [...md.matchAll(/^##\s+(.+?)$/gm)].map((m) => m[1].trim());
}

function extractGitAprendizados(md) {
  return [...md.matchAll(/^###\s+(.+?)$/gm)].map((m) => m[1].trim());
}

// ─── Diff ───────────────────────────────────────────────────────────────────

function diff(gitArr, notionArr) {
  const gset = new Set(gitArr);
  const nset = new Set(notionArr);
  const faltaNoNotion = gitArr.filter((x) => !nset.has(x));
  const faltaNoGit = notionArr.filter((x) => !gset.has(x));
  const ok = gitArr.filter((x) => nset.has(x));
  return { faltaNoNotion, faltaNoGit, ok };
}

function section(nome, d) {
  const lines = [`### ${nome}`, ""];
  lines.push(`- 🟩 OK: **${d.ok.length}**`);
  lines.push(`- 🟥 Faltando no Notion: **${d.faltaNoNotion.length}**`);
  lines.push(`- 🟧 Órfãos no Notion (não existem no Git): **${d.faltaNoGit.length}**`);
  if (d.faltaNoNotion.length) {
    lines.push("", "<details><summary>🟥 Itens a espelhar</summary>", "");
    d.faltaNoNotion.forEach((t) => lines.push(`- ${t}`));
    lines.push("</details>");
  }
  if (d.faltaNoGit.length) {
    lines.push("", "<details><summary>🟧 Itens órfãos</summary>", "");
    d.faltaNoGit.forEach((t) => lines.push(`- ${t}`));
    lines.push("</details>");
  }
  lines.push("");
  return lines.join("\n");
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log("[consistency] coletando Git…");
  const pendMd = (await read("docs/PENDENCIAS.md")) || "";
  const decMd = (await read("docs/CONSCIENCIA/08-HISTORICO-DECISOES.md")) || "";
  const aprMd = (await read("docs/CONSCIENCIA/APRENDIZADOS.md")) || "";

  const gitData = {
    regras: extractGitRegras(),
    pendencias: extractGitPendencias(pendMd),
    decisoes: extractGitDecisoes(decMd),
    aprendizados: extractGitAprendizados(aprMd),
  };

  console.log("[consistency] coletando Notion…");
  const notionData = {};
  for (const [k, v] of Object.entries(DB)) {
    notionData[k] = await listAll(v.id, v.title);
  }

  const now = new Date().toISOString();
  const out = [
    `# 📊 Relatório de Consistência — Git ↔ Notion`,
    ``,
    `- **Gerado:** ${now}`,
    `- **Commit:** \`${process.env.GITHUB_COMMIT || "local"}\``,
    `- **Disparado por:** ${process.env.GITHUB_ACTOR || "manual"}`,
    ``,
    `> Git é fonte da verdade. Notion é painel humano. Divergências aqui = ação necessária.`,
    ``,
    `## Resumo`,
    ``,
    `| Database | Git | Notion | 🟩 OK | 🟥 Falta Notion | 🟧 Órfão |`,
    `|---|---:|---:|---:|---:|---:|`,
  ];
  const diffs = {};
  for (const k of Object.keys(DB)) {
    diffs[k] = diff(gitData[k], notionData[k]);
    out.push(
      `| ${k} | ${gitData[k].length} | ${notionData[k].length} | ${diffs[k].ok.length} | ${diffs[k].faltaNoNotion.length} | ${diffs[k].faltaNoGit.length} |`
    );
  }
  out.push("", "## Detalhes", "");
  for (const k of Object.keys(DB)) out.push(section(k, diffs[k]));

  const dir = path.join(ROOT, "docs/RELATORIOS/notion-sync");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, "consistencia-latest.md"), out.join("\n"));
  const stamp = now.replace(/[:.]/g, "-").slice(0, 19);
  await fs.writeFile(path.join(dir, `consistencia-${stamp}.md`), out.join("\n"));
  console.log(`[consistency] ✅ relatório salvo em ${dir}/consistencia-latest.md`);
}

main().catch((e) => {
  console.error("❌", e.message);
  process.exit(1);
});
