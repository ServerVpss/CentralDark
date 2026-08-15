#!/usr/bin/env node
/**
 * STAGE 1 — memory-linker-agent.mjs (Scout)
 *
 * Varre docs/BRAIN/ e docs/CONSCIENCIA/ e detecta gaps de memória.
 * Só materializa novo relatório quando o conjunto de achados muda.
 */

import crypto from 'node:crypto';
import fs   from 'fs';
import path from 'path';
import https from 'https';
import { atomicWriteUtf8Sync } from './fs-safe.mjs';

const RAIZ       = '/root/CentralDark';
const DIR        = path.join(RAIZ, 'scripts/memory-linker');
const STATE_FILE = path.join(DIR, '.next_run');
const REPORT     = path.join(DIR, 'last-report.json');
const ENV_FILE   = path.join(RAIZ, 'secrets/mcp.env');

function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${stable(value[k])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function loadEnv() {
  try {
    return Object.fromEntries(
      fs.readFileSync(ENV_FILE, 'utf8').split('\n')
        .filter(l => l.includes('=') && !l.startsWith('#'))
        .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^['"]|['"]$/g, '')]; })
    );
  } catch {
    return {};
  }
}

// Timer aleatório 60–120 min. O timer pode mudar sem significar aprendizado novo.
const now = Date.now();
let nextRun = 0;
try { nextRun = parseInt(fs.readFileSync(STATE_FILE, 'utf8').trim(), 10); } catch {}
if (now < nextRun) process.exit(0);

const delayMin = 60 + Math.floor(Math.random() * 60);
atomicWriteUtf8Sync(STATE_FILE, String(now + delayMin * 60 * 1000), { skipIfUnchanged: true });

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

const allFiles = [...scanDir(path.join(RAIZ, 'docs/CONSCIENCIA')), ...scanDir(path.join(RAIZ, 'docs/BRAIN'))];
const fileIndex = {};
for (const f of allFiles) fileIndex[path.basename(f, '.md').toUpperCase()] = f;

const allMentioned = new Set();
const brokenLinks  = new Map();
const noConexoes   = [];
const semFront     = [];

for (const f of allFiles) {
  const rel  = path.relative(RAIZ, f);
  const name = path.basename(f, '.md');
  if (SKIP_PASTA.some(p => rel.includes(p))) continue;

  let content;
  try { content = fs.readFileSync(f, 'utf8'); } catch { continue; }

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
for (const f of scanDir(path.join(RAIZ, 'docs/CONSCIENCIA'))) {
  const rel  = path.relative(RAIZ, f);
  const name = path.basename(f, '.md');
  if (SKIP_PASTA.some(p => rel.includes(p))) continue;
  if (SKIP_PREFIXO.some(p => name.toUpperCase().startsWith(p))) continue;
  if (name.startsWith('RETOMADA')) continue;
  if (!allMentioned.has(name.toUpperCase())) orfas.push(name);
}

// Ordenação estável: a ordem do filesystem não pode fabricar delta.
orfas.sort();
noConexoes.sort();
semFront.sort();
const brokenObject = Object.fromEntries(
  [...brokenLinks.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([link, origins]) => [link, [...new Set(origins)].sort()])
);

const findings = {
  orfas,
  brokenLinks: brokenObject,
  noConexoes,
  semFrontmatter: semFront,
  total: orfas.length + Object.keys(brokenObject).length + noConexoes.length + semFront.length,
};
const findingFingerprint = sha256(stable(findings));

let previousFingerprint = null;
try {
  const previous = JSON.parse(fs.readFileSync(REPORT, 'utf8'));
  previousFingerprint = previous.findingFingerprint ?? null;
} catch {}

if (previousFingerprint === findingFingerprint) {
  console.log(`MEMORY_SCOUT=NO_NEW_INFORMATION FINGERPRINT=${findingFingerprint}`);
  process.exit(0);
}

const report = {
  timestamp: new Date().toISOString(),
  observedAt: new Date().toISOString(),
  findingFingerprint,
  previousFindingFingerprint: previousFingerprint,
  nextRunMin: delayMin,
  ...findings,
};
atomicWriteUtf8Sync(REPORT, `${JSON.stringify(report, null, 2)}\n`, { skipIfUnchanged: true });
console.log(`MEMORY_SCOUT=DELTA FINDINGS=${report.total} FINGERPRINT=${findingFingerprint}`);

if (report.total === 0) process.exit(0);

const env = loadEnv();
const TOKEN    = env.TELEGRAM_BOT_TOKEN;
const ADMIN_ID = env.TELEGRAM_ADMIN_ID;

function send(text) {
  if (!TOKEN || !ADMIN_ID) return Promise.resolve({ sent: false, reason: 'NOT_CONFIGURED' });
  return new Promise(resolve => {
    const body = JSON.stringify({ chat_id: ADMIN_ID, text, parse_mode: 'HTML', disable_notification: true });
    const req  = https.request({
      hostname: 'api.telegram.org', path: `/bot${TOKEN}/sendMessage`, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, res => { res.resume(); resolve({ sent: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode }); });
    req.on('error', error => resolve({ sent: false, reason: error.message }));
    req.write(body); req.end();
  });
}

let msg = `🔍 <b>Stage 1 — Scout encontrou DELTA (${report.total})</b>\n\n`;
if (orfas.length)               msg += `📍 Órfãs: ${orfas.length} | `;
if (Object.keys(brokenObject).length) msg += `❓ Links quebrados: ${Object.keys(brokenObject).length} | `;
if (noConexoes.length)          msg += `🔗 Sem conexões: ${noConexoes.length} | `;
if (semFront.length)            msg += `📄 Sem frontmatter: ${semFront.length}`;
msg += `\n\n🧬 fingerprint: <code>${findingFingerprint.slice(0, 16)}</code>\n⚙️ Stage 2 classifica somente porque houve informação nova.`;

await send(msg);
