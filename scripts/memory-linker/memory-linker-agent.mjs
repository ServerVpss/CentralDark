#!/usr/bin/env node
/**
 * STAGE 1 — memory-linker-agent.mjs (Scout)
 *
 * Varre docs/BRAIN/ e docs/CONSCIENCIA/ e detecta gaps de memória:
 *   1. Notas órfãs (nenhum [[wikilink]] aponta pra elas)
 *   2. Links quebrados ([[wikilink]] aponta para arquivo inexistente)
 *   3. Arquivos CONSCIENCIA sem seção "Conexões Rápidas"
 *   4. Arquivos CONSCIENCIA sem frontmatter YAML
 *
 * Grava resultado em last-report.json para o Stage 2 consumir.
 * Notifica Telegram só se encontrar problemas.
 * Timer interno aleatório 60–120 min (cron roda a cada 30 min).
 */

import fs   from 'fs';
import path from 'path';
import https from 'https';

const RAIZ       = '/root/CentralDark';
const DIR        = path.join(RAIZ, 'scripts/memory-linker');
const STATE_FILE = path.join(DIR, '.next_run');
const REPORT     = path.join(DIR, 'last-report.json');
const ENV_FILE   = path.join(RAIZ, 'secrets/mcp.env');

// Credenciais
const env = Object.fromEntries(
  fs.readFileSync(ENV_FILE, 'utf8').split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0,i).trim(), l.slice(i+1).trim().replace(/^['"]|['"]$/g,'')]; })
);
const TOKEN    = env.TELEGRAM_BOT_TOKEN;
const ADMIN_ID = env.TELEGRAM_ADMIN_ID;

// Timer aleatório 60–120 min
const now = Date.now();
let nextRun = 0;
try { nextRun = parseInt(fs.readFileSync(STATE_FILE,'utf8').trim(),10); } catch {}
if (now < nextRun) process.exit(0);

const delayMin = 60 + Math.floor(Math.random() * 60);
fs.writeFileSync(STATE_FILE, String(now + delayMin * 60 * 1000));

// Scanner
function scanDir(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const f = path.join(d, e.name);
      if (e.isDirectory()) walk(f);
      else if (e.name.endsWith('.md')) out.push(f);
    }
  }
  walk(dir);
  return out;
}

function wikilinks(content) {
  return [...content.matchAll(/\[\[([^\]|#\n]+?)(?:[|#][^\]]*)?]]/g)]
    .map(m => m[1].trim().toUpperCase());
}

const SKIP_PASTA   = ['ARQUIVO-MORTO'];
const SKIP_PREFIXO = ['INDEX', 'README'];

const allFiles = [...scanDir(path.join(RAIZ,'docs/CONSCIENCIA')), ...scanDir(path.join(RAIZ,'docs/BRAIN'))];
const fileIndex = {};
for (const f of allFiles) fileIndex[path.basename(f,'.md').toUpperCase()] = f;

const allMentioned = new Set();
const brokenLinks  = new Map(); // link → [arquivos que mencionam]
const noConexoes   = [];
const semFront     = [];

for (const f of allFiles) {
  const rel  = path.relative(RAIZ, f);
  const name = path.basename(f,'.md');
  if (SKIP_PASTA.some(p => rel.includes(p))) continue;

  let content;
  try { content = fs.readFileSync(f,'utf8'); } catch { continue; }

  for (const link of wikilinks(content)) {
    allMentioned.add(link);
    if (!fileIndex[link]) {
      if (!brokenLinks.has(link)) brokenLinks.set(link, []);
      brokenLinks.get(link).push(name);
    }
  }

  const isC = rel.startsWith('docs/CONSCIENCIA');
  const skip = rel.includes('ARTEFATOS') || name.startsWith('RETOMADA') || SKIP_PREFIXO.some(p => name.toUpperCase().startsWith(p));
  if (isC && !skip) {
    if (!/##\s*(conex[oõ]es?\s*r[aá]pidas?)/i.test(content)) noConexoes.push(name);
    if (!content.trimStart().startsWith('---')) semFront.push(name);
  }
}

const orfas = [];
for (const f of scanDir(path.join(RAIZ,'docs/CONSCIENCIA'))) {
  const rel  = path.relative(RAIZ, f);
  const name = path.basename(f,'.md');
  if (SKIP_PASTA.some(p => rel.includes(p))) continue;
  if (SKIP_PREFIXO.some(p => name.toUpperCase().startsWith(p))) continue;
  if (name.startsWith('RETOMADA')) continue;
  if (!allMentioned.has(name.toUpperCase())) orfas.push(name);
}

// Grava relatório JSON para Stage 2
const report = {
  timestamp: new Date().toISOString(),
  nextRunMin: delayMin,
  orfas,
  brokenLinks: Object.fromEntries(brokenLinks),
  noConexoes,
  semFrontmatter: semFront,
  total: orfas.length + brokenLinks.size + noConexoes.length + semFront.length
};
fs.writeFileSync(REPORT, JSON.stringify(report, null, 2));

// Notifica só se há problemas
if (report.total === 0) process.exit(0);

function send(text) {
  return new Promise(resolve => {
    const body = JSON.stringify({ chat_id: ADMIN_ID, text, parse_mode: 'HTML', disable_notification: true });
    const req  = https.request({
      hostname: 'api.telegram.org', path: `/bot${TOKEN}/sendMessage`, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, res => { res.resume(); resolve(); });
    req.on('error', resolve); req.write(body); req.end();
  });
}

let msg = `🔍 <b>Stage 1 — Scout encontrou gaps (${report.total})</b>\n\n`;
if (orfas.length)          msg += `📍 Órfãs: ${orfas.length} | `;
if (brokenLinks.size)      msg += `❓ Links quebrados: ${brokenLinks.size} | `;
if (noConexoes.length)     msg += `🔗 Sem conexões: ${noConexoes.length} | `;
if (semFront.length)       msg += `📄 Sem frontmatter: ${semFront.length}`;
msg += `\n\n⚙️ Stage 2 (Analyst) vai classificar e decidir o que corrigir automaticamente.`;

await send(msg);
