#!/usr/bin/env node
/**
 * STAGE 2 — memory-analyst-agent.mjs (Analyst)
 *
 * Consome somente relatório novo do Scout, classifica gaps e grava decisão
 * de forma atômica/idempotente. Mesmo fingerprint já analisado = STOP.
 */

import crypto from 'node:crypto';
import fs   from 'fs';
import path from 'path';
import https from 'https';
import { atomicWriteUtf8Sync } from './fs-safe.mjs';

const RAIZ     = '/root/CentralDark';
const DIR      = path.join(RAIZ, 'scripts/memory-linker');
const REPORT   = path.join(DIR, 'last-report.json');
const DECISION = path.join(DIR, 'analyst-decision.json');
const ENV_FILE = path.join(RAIZ, 'secrets/mcp.env');

function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${stable(value[k])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}
function sha256(value) { return crypto.createHash('sha256').update(String(value)).digest('hex'); }
function loadEnv() {
  try {
    return Object.fromEntries(
      fs.readFileSync(ENV_FILE, 'utf8').split('\n')
        .filter(l => l.includes('=') && !l.startsWith('#'))
        .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^['"]|['"]$/g, '')]; })
    );
  } catch { return {}; }
}

if (!fs.existsSync(REPORT)) process.exit(0);
const report = JSON.parse(fs.readFileSync(REPORT, 'utf8'));
const reportTime = report.observedAt ?? report.timestamp;
const idadeMin = (Date.now() - new Date(reportTime).getTime()) / 60000;
if (!Number.isFinite(idadeMin) || idadeMin > 180) process.exit(0);
if (report.total === 0) process.exit(0);
if (!report.findingFingerprint) throw new Error('REPORT_FINGERPRINT_MISSING');

let previousDecision = null;
try { previousDecision = JSON.parse(fs.readFileSync(DECISION, 'utf8')); } catch {}
if (previousDecision?.baseFingerprint === report.findingFingerprint) {
  console.log(`MEMORY_ANALYST=NO_NEW_INFORMATION FINGERPRINT=${report.findingFingerprint}`);
  process.exit(0);
}

const CRITICOS = ['00-LEIA-PRIMEIRO', 'MAPA-DO-CEREBRO', 'CONSCIENCIA', 'BRAIN', '00-MAPA'];
const criticos = [];
const altos = [];
const autoFix = [];

for (const [link, origens] of Object.entries(report.brokenLinks || {})) {
  const emCritico = origens.some(o => CRITICOS.some(c => o.toUpperCase().includes(c)));
  if (emCritico) criticos.push({ tipo: 'link-quebrado-critico', link, origens });
  else altos.push({ tipo: 'link-quebrado', link, origens });
}

if ((report.orfas || []).length > 5) {
  altos.push({ tipo: 'orfas-excessivas', count: report.orfas.length, lista: report.orfas.slice(0, 5) });
}

for (const nome of (report.semFrontmatter || [])) {
  autoFix.push({ tipo: 'sem-frontmatter', arquivo: nome });
}
for (const nome of (report.noConexoes || [])) {
  if (!(report.semFrontmatter || []).includes(nome)) {
    autoFix.push({ tipo: 'sem-conexoes-rapidas', arquivo: nome });
  }
}

autoFix.sort((a, b) => `${a.arquivo}:${a.tipo}`.localeCompare(`${b.arquivo}:${b.tipo}`));
criticos.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
altos.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));

const classification = {
  criticos,
  altos,
  autoFix,
  totalCritico: criticos.length,
  totalAlto: altos.length,
  totalAutoFix: autoFix.length,
};
const decisionFingerprint = sha256(stable(classification));
const decision = {
  timestamp: new Date().toISOString(),
  observedAt: new Date().toISOString(),
  baseReport: report.timestamp,
  baseFingerprint: report.findingFingerprint,
  decisionFingerprint,
  ...classification,
};
atomicWriteUtf8Sync(DECISION, `${JSON.stringify(decision, null, 2)}\n`, { skipIfUnchanged: true });
console.log(`MEMORY_ANALYST=DELTA AUTOFIX=${autoFix.length} CRITICAL=${criticos.length} HIGH=${altos.length} FINGERPRINT=${decisionFingerprint}`);

const env = loadEnv();
const TOKEN = env.TELEGRAM_BOT_TOKEN;
const ADMIN_ID = env.TELEGRAM_ADMIN_ID;
function send(text) {
  if (!TOKEN || !ADMIN_ID) return Promise.resolve({ sent: false, reason: 'NOT_CONFIGURED' });
  return new Promise(resolve => {
    const body = JSON.stringify({ chat_id: ADMIN_ID, text, parse_mode: 'HTML', disable_notification: criticos.length === 0 });
    const req = https.request({
      hostname: 'api.telegram.org', path: `/bot${TOKEN}/sendMessage`, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, res => { res.resume(); resolve({ sent: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode }); });
    req.on('error', error => resolve({ sent: false, reason: error.message }));
    req.write(body); req.end();
  });
}

let msg = `🧠 <b>Stage 2 — Analyst classificou DELTA</b>\n\n`;
if (criticos.length > 0) {
  msg += `🔴 <b>CRÍTICO (${criticos.length})</b>\n`;
  criticos.slice(0, 4).forEach(c => { msg += `  • <code>[[${c.link}]]</code> quebrado em arquivo crítico\n`; });
  msg += '\n';
}
if (altos.length > 0) {
  msg += `🟡 <b>ALTO (${altos.length})</b>\n`;
  altos.slice(0, 3).forEach(a => {
    if (a.tipo === 'orfas-excessivas') msg += `  • ${a.count} notas órfãs\n`;
    else msg += `  • <code>[[${a.link}]]</code> quebrado\n`;
  });
  msg += '\n';
}
if (autoFix.length > 0) {
  msg += `🟢 <b>AUTO-FIX (${autoFix.length})</b>\n`;
  const semF = autoFix.filter(a => a.tipo === 'sem-frontmatter').length;
  const semC = autoFix.filter(a => a.tipo === 'sem-conexoes-rapidas').length;
  if (semF) msg += `  • ${semF} frontmatter\n`;
  if (semC) msg += `  • ${semC} Conexões Rápidas\n`;
}
msg += `\n🧬 base: <code>${report.findingFingerprint.slice(0, 16)}</code>`;
await send(msg);
