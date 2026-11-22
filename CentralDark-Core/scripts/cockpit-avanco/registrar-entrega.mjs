#!/usr/bin/env node
// Registra prova SHA256 antes/depois + arquivos modificados + data no
// item do COCKPIT-AVANCO.json. Fonte única no Git, sem backend.
//
// Uso:
//   node scripts/cockpit-avanco/registrar-entrega.mjs \
//     --id menu-avanco \
//     --files src/paginas/admin-cockpit/painéis/PainelAvanco.tsx src/paginas/admin-cockpit/sala-controle.css
//
// Opções:
//   --status feito|andando|pendente|bloqueado   (opcional)
//   --pct 0..100                                (opcional)
//   --prova "texto"                             (opcional)
//   --dry                                       (não grava, só imprime)

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { execSync } from "node:child_process";
import { resolve } from "node:path";

const JSON_PATH = "docs/CONSCIENCIA/COCKPIT-AVANCO.json";

function parseArgs(argv) {
  const out = { files: [] };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--id") out.id = argv[++i];
    else if (a === "--status") out.status = argv[++i];
    else if (a === "--pct") out.pct = Number(argv[++i]);
    else if (a === "--prova") out.prova = argv[++i];
    else if (a === "--dry") out.dry = true;
    else if (a === "--files") {
      while (i + 1 < argv.length && !argv[i + 1].startsWith("--")) {
        out.files.push(argv[++i]);
      }
    }
  }
  return out;
}

function sha256(buf) {
  return createHash("sha256").update(buf).digest("hex");
}

function shaHead(file) {
  try {
    const buf = execSync(`git show HEAD:${file}`, { stdio: ["ignore", "pipe", "ignore"] });
    return sha256(buf);
  } catch {
    return "N/A (novo)";
  }
}

function shaWorking(file) {
  if (!existsSync(file)) return "N/A (removido)";
  return sha256(readFileSync(file));
}

const args = parseArgs(process.argv);
if (!args.id) {
  console.error("faltou --id <item>");
  process.exit(1);
}
if (!args.files.length) {
  console.error("faltou --files <a> <b> ...");
  process.exit(1);
}

const raw = readFileSync(JSON_PATH, "utf8");
const doc = JSON.parse(raw);
const item = doc.itens.find((x) => x.id === args.id);
if (!item) {
  console.error(`item id="${args.id}" não achado em ${JSON_PATH}`);
  process.exit(1);
}

const antes = args.files.map((f) => `${f}=${shaHead(f)}`).join(" | ");
const depois = args.files.map((f) => `${f}=${shaWorking(f)}`).join(" | ");
const hoje = new Date().toISOString().slice(0, 10);

item.card = item.card ?? {};
item.card.antes_sha256 = antes;
item.card.depois_sha256 = depois;
item.card.arquivos_modificados = args.files.map((f) => resolve(f).replace(process.cwd() + "/", ""));
item.atualizado_em = hoje;
if (args.status) item.status = args.status;
if (Number.isFinite(args.pct)) item.porcentagem = Math.max(0, Math.min(100, args.pct));
if (args.prova) item.card.prova = args.prova;

const saida = JSON.stringify(doc, null, 2) + "\n";

if (args.dry) {
  console.log(saida);
  console.log("\n[dry] nada gravado.");
} else {
  writeFileSync(JSON_PATH, saida);
  console.log(`✅ item "${args.id}" atualizado em ${JSON_PATH}`);
  console.log(`   antes:  ${antes}`);
  console.log(`   depois: ${depois}`);
  console.log(`   data:   ${hoje}`);
}
