#!/usr/bin/env node
// Atualiza painel-data.json com status ao vivo dos processos PM2 (campos pm2 e iasVivas).
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ARQ = resolve(__dirname, "painel-data.json");
const INTERVALO_MS = 10_000;

function log(m) { console.log(`[${new Date().toISOString()}] ${m}`); }

function pegarPm2() {
  try {
    const arr = JSON.parse(execSync("pm2 jlist", { encoding: "utf8" }));
    const mapa = {};
    for (const p of arr) mapa[p.name] = p.pm2_env?.status || "unknown";
    return mapa;
  } catch (e) { log(`⚠️ pm2 jlist falhou: ${e.message}`); return null; }
}

function atualizar() {
  const pm2Map = pegarPm2();
  if (!pm2Map) return;
  let data;
  try { data = JSON.parse(readFileSync(ARQ, "utf8")); }
  catch (e) { log(`❌ leitura falhou: ${e.message}`); return; }

  data.pm2 = Object.fromEntries(Object.entries(pm2Map).sort());
  if (Array.isArray(data.iasVivas)) {
    for (const ia of data.iasVivas) {
      if (ia?.nome && pm2Map[ia.nome] !== undefined) ia.status = pm2Map[ia.nome];
    }
  }
  const agora = new Date().toISOString();
  data.updatedAt = agora;
  data.updated_at = agora;
  writeFileSync(ARQ, JSON.stringify(data, null, 2));
}

log(`🚀 refresh-ias-vivas ativo (${INTERVALO_MS}ms)`);
atualizar();
setInterval(atualizar, INTERVALO_MS);
