#!/usr/bin/env node
/**
 * STAGE 2 — memory-analyst-agent.mjs (Analyst)
 *
 * Lê o relatório do Stage 1 (last-report.json) e classifica os problemas:
 *   CRÍTICO   → links quebrados em arquivos-chave (00-LEIA-PRIMEIRO, MAPA, etc.)
 *   ALTO      → muitas notas órfãs ou sem frontmatter
 *   BAIXO     → notas sem "Conexões Rápidas" (seguro corrigir automaticamente)
 *
 * Grava analyst-decision.json para o Stage 3 consumir.
 * Notifica Telegram com classificação e o que será corrigido automaticamente.
 * Roda 15 min depois do Stage 1 (cron separado).
 */

import fs   from 'fs';
import path from 'path';
import https from 'https';

const RAIZ     = '/root/CentralDark';
const DIR      = path.join(RAIZ, 'scripts/memory-linker');
const REPORT   = path.join(DIR, 'last-report.json');
const DECISION = path.join(DIR, 'analyst-decision.json');
const ENV_FILE = path.join(RAIZ, 'secrets/mcp.env');

// Se não há relatório novo (menos de 3h), sai
if (!fs.existsSync(REPORT)) process.exit(0);
const report = JSON.parse(fs.readFileSync(REPORT, 'utf8'));
const idadeMin = (Date.now() - new Date(report.timestamp).getTime()) / 60000;
if (idadeMin > 180) process.exit(0); // relatório velho — Stage 1 ainda não rodou
if (report.total === 0) process.exit(0);

// Credenciais
const env = Object.fromEntries(
  fs.readFileSync(ENV_FILE,'utf8').split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0,i).trim(), l.slice(i+1).trim().replace(/^['"]|['"]$/g,'')]; })
);
const TOKEN    = env.TELEGRAM_BOT_TOKEN;
const ADMIN_ID = env.TELEGRAM_ADMIN_ID;

// Arquivos críticos — links quebrados aqui são CRÍTICO
const CRITICOS = ['00-LEIA-PRIMEIRO','MAPA-DO-CEREBRO','CONSCIENCIA','BRAIN','00-MAPA'];

// Classificação
const criticos  = [];
const altos     = [];
const autoFix   = []; // Stage 3 vai corrigir esses

// Links quebrados → verificar se estão em arquivos críticos
for (const [link, origens] of Object.entries(report.brokenLinks || {})) {
  const emCritico = origens.some(o => CRITICOS.some(c => o.toUpperCase().includes(c)));
  if (emCritico) {
    criticos.push({ tipo: 'link-quebrado-critico', link, origens });
  } else {
    altos.push({ tipo: 'link-quebrado', link, origens });
  }
}

// Muitas órfãs → ALTO
if ((report.orfas || []).length > 5) {
  altos.push({ tipo: 'orfas-excessivas', count: report.orfas.length, lista: report.orfas.slice(0,5) });
}

// Sem frontmatter → auto-fix seguro (apenas adiciona header)
for (const nome of (report.semFrontmatter || [])) {
  autoFix.push({ tipo: 'sem-frontmatter', arquivo: nome });
}

// Sem Conexões Rápidas → auto-fix seguro (apenas adiciona seção)
for (const nome of (report.noConexoes || [])) {
  // Não auto-fix se já está na lista de sem-frontmatter (Stage 3 trata junto)
  if (!(report.semFrontmatter || []).includes(nome)) {
    autoFix.push({ tipo: 'sem-conexoes-rapidas', arquivo: nome });
  }
}

const decision = {
  timestamp: new Date().toISOString(),
  baseReport: report.timestamp,
  criticos,
  altos,
  autoFix,
  totalCritico: criticos.length,
  totalAlto: altos.length,
  totalAutoFix: autoFix.length
};
fs.writeFileSync(DECISION, JSON.stringify(decision, null, 2));

// Monta notificação
function send(text) {
  return new Promise(resolve => {
    const body = JSON.stringify({ chat_id: ADMIN_ID, text, parse_mode: 'HTML', disable_notification: criticos.length === 0 });
    const req  = https.request({
      hostname: 'api.telegram.org', path: `/bot${TOKEN}/sendMessage`, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, res => { res.resume(); resolve(); });
    req.on('error', resolve); req.write(body); req.end();
  });
}

let msg = `🧠 <b>Stage 2 — Analyst classificou os gaps</b>\n\n`;

if (criticos.length > 0) {
  msg += `🔴 <b>CRÍTICO (${criticos.length}) — requer atenção do Pivete:</b>\n`;
  criticos.slice(0,4).forEach(c => {
    msg += `  • Link <code>[[${c.link}]]</code> quebrado em arquivo crítico\n`;
  });
  msg += '\n';
}

if (altos.length > 0) {
  msg += `🟡 <b>ALTO (${altos.length}):</b>\n`;
  altos.slice(0,3).forEach(a => {
    if (a.tipo === 'orfas-excessivas') msg += `  • ${a.count} notas órfãs na CONSCIENCIA\n`;
    else msg += `  • Link <code>[[${a.link}]]</code> quebrado\n`;
  });
  msg += '\n';
}

if (autoFix.length > 0) {
  msg += `🟢 <b>AUTO-FIX (${autoFix.length}) — Stage 3 vai corrigir agora:</b>\n`;
  const semF = autoFix.filter(a => a.tipo === 'sem-frontmatter').length;
  const semC = autoFix.filter(a => a.tipo === 'sem-conexoes-rapidas').length;
  if (semF) msg += `  • ${semF} arquivo(s) vão receber frontmatter\n`;
  if (semC) msg += `  • ${semC} arquivo(s) vão receber seção "Conexões Rápidas"\n`;
}

await send(msg);
