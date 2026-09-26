# DECISAO - sync.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\scripts\notion-sync\sync.mjs
**SHA:** 7fea64281597eacd
**Timestamp:** 2026-08-28T02:57:37.403002
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const DRY_RUN = String(process.env.DRY_RUN || "false").toLowerCase() === "true";
- const dateProp = (iso) => (iso ? { date: { start: iso } } : { date: null });
- indexes.push({ start: m.index, emoji: m[1], num: m[2], title: m[3].trim() });
- const start = h.index + h[0].length;
- const start = h.index + h[0].length;

### Ouro Bruto (primeiros 5000 chars)
```
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
import { wrap } from "./with-retry.mjs";
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

const notion = wrap(new Client({ auth: NOTION_TOKEN }));

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
    opLog.push({ base: _currentBase, a
```