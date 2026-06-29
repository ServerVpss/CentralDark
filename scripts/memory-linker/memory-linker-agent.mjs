#!/usr/bin/env node
/**
 * memory-linker-agent.mjs
 *
 * Varre docs/BRAIN/ e docs/CONSCIENCIA/ procurando gaps de memória:
 *   1. Notas sem nenhum [[wikilink]] apontando pra elas (órfãs)
 *   2. [[wikilinks]] que apontam para arquivos que não existem (links quebrados)
 *   3. Arquivos em CONSCIENCIA sem seção "Conexões Rápidas"
 *
 * Roda via cron a cada 30min, mas usa timer interno aleatório (60-120 min)
 * para não encher o Telegram. Só notifica quando encontra problemas.
 */

import fs   from 'fs';
import path from 'path';
import https from 'https';

const RAIZ       = '/root/CentralDark';
const STATE_FILE = path.join(RAIZ, 'scripts/memory-linker/.next_run');
const ENV_FILE   = path.join(RAIZ, 'secrets/mcp.env');

// --- Credenciais ---
const envVars = Object.fromEntries(
  fs.readFileSync(ENV_FILE, 'utf8')
    .split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => {
      const idx = l.indexOf('=');
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '')];
    })
);
const TOKEN    = envVars.TELEGRAM_BOT_TOKEN;
const ADMIN_ID = envVars.TELEGRAM_ADMIN_ID;

// --- Timer aleatório (60–120 min) ---
const now = Date.now();
let nextRun = 0;
try { nextRun = parseInt(fs.readFileSync(STATE_FILE, 'utf8').trim(), 10); } catch {}
if (now < nextRun) process.exit(0);

const delayMin = 60 + Math.floor(Math.random() * 60);
fs.writeFileSync(STATE_FILE, String(now + delayMin * 60 * 1000));

// --- Scanner ---
function scanDir(dir) {
  const result = [];
  if (!fs.existsSync(dir)) return result;
  function walk(d) {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.md')) result.push(full);
    }
  }
  walk(dir);
  return result;
}

function extractWikilinks(content) {
  return [...content.matchAll(/\[\[([^\]|#\n]+?)(?:[|#][^\]]*)?]]/g)]
    .map(m => m[1].trim().toUpperCase());
}

function hasConexoesRapidas(content) {
  return /##\s*(conex[oõ]es?\s*r[aá]pidas?)/i.test(content);
}

function hasFrontmatter(content) {
  return content.trimStart().startsWith('---');
}

// --- Coleta todos os arquivos ---
const conscienciaDir = path.join(RAIZ, 'docs/CONSCIENCIA');
const brainDir       = path.join(RAIZ, 'docs/BRAIN');

const allFiles = [...scanDir(conscienciaDir), ...scanDir(brainDir)];

// Índice: NOME_SEM_EXT_MAIUSCULO → caminho
const fileIndex = {};
for (const f of allFiles) {
  fileIndex[path.basename(f, '.md').toUpperCase()] = f;
}

// --- Análise ---
const allMentioned  = new Set();
const brokenLinks   = new Map(); // link → [arquivo que o menciona]
const noConexoes    = [];
const semFrontmatter = [];

// Pastas/arquivos para ignorar (auto-gerados ou arquivos auxiliares)
const IGNORAR_PREFIXO = ['INDEX', 'README'];
const IGNORAR_PASTA   = ['ARQUIVO-MORTO'];

for (const f of allFiles) {
  const rel = path.relative(RAIZ, f);
  const name = path.basename(f, '.md');
  const isArquivoMorto = IGNORAR_PASTA.some(p => rel.includes(p));
  if (isArquivoMorto) continue;

  let content;
  try { content = fs.readFileSync(f, 'utf8'); } catch { continue; }

  const links = extractWikilinks(content);
  for (const link of links) {
    allMentioned.add(link);
    if (!fileIndex[link]) {
      if (!brokenLinks.has(link)) brokenLinks.set(link, []);
      brokenLinks.get(link).push(name);
    }
  }

  // Verifica Conexões Rápidas apenas em CONSCIENCIA (exceto ARTEFATOS e arquivos de retomada)
  const isConsciencia = rel.startsWith('docs/CONSCIENCIA');
  const isArtefato    = rel.includes('ARTEFATOS');
  const isRetomada    = name.startsWith('RETOMADA');
  const isIgnorado    = IGNORAR_PREFIXO.some(p => name.toUpperCase().startsWith(p));

  if (isConsciencia && !isArtefato && !isRetomada && !isIgnorado) {
    if (!hasConexoesRapidas(content)) {
      noConexoes.push(name);
    }
    if (!hasFrontmatter(content)) {
      semFrontmatter.push(name);
    }
  }
}

// Órfãs: arquivos CONSCIENCIA não mencionados por ninguém
const orfas = [];
for (const f of scanDir(conscienciaDir)) {
  const rel  = path.relative(RAIZ, f);
  const name = path.basename(f, '.md');
  if (IGNORAR_PASTA.some(p => rel.includes(p))) continue;
  if (IGNORAR_PREFIXO.some(p => name.toUpperCase().startsWith(p))) continue;
  if (name.startsWith('RETOMADA')) continue;
  if (!allMentioned.has(name.toUpperCase())) {
    orfas.push(name);
  }
}

// --- Monta relatório ---
const totalProblemas = orfas.length + brokenLinks.size + noConexoes.length + semFrontmatter.length;

if (totalProblemas === 0) process.exit(0); // silêncio quando tudo está ok

let report = `🧠 <b>Memory Linker — Gaps Encontrados</b>\n\n`;

if (orfas.length > 0) {
  report += `📍 <b>Notas sem nenhum link apontando (${orfas.length}):</b>\n`;
  orfas.slice(0, 6).forEach(o => { report += `  • <code>${o}</code>\n`; });
  if (orfas.length > 6) report += `  ... +${orfas.length - 6} mais\n`;
  report += '\n';
}

if (brokenLinks.size > 0) {
  report += `❓ <b>Links quebrados — arquivo não existe (${brokenLinks.size}):</b>\n`;
  [...brokenLinks.entries()].slice(0, 6).forEach(([link, origens]) => {
    report += `  • <code>[[${link}]]</code> ← mencionado em ${origens.slice(0,2).join(', ')}\n`;
  });
  if (brokenLinks.size > 6) report += `  ... +${brokenLinks.size - 6} mais\n`;
  report += '\n';
}

if (noConexoes.length > 0) {
  report += `🔗 <b>Sem seção "Conexões Rápidas" (${noConexoes.length}):</b>\n`;
  noConexoes.slice(0, 6).forEach(n => { report += `  • <code>${n}</code>\n`; });
  if (noConexoes.length > 6) report += `  ... +${noConexoes.length - 6} mais\n`;
  report += '\n';
}

if (semFrontmatter.length > 0) {
  report += `📄 <b>Sem frontmatter YAML (${semFrontmatter.length}):</b>\n`;
  semFrontmatter.slice(0, 5).forEach(n => { report += `  • <code>${n}</code>\n`; });
  if (semFrontmatter.length > 5) report += `  ... +${semFrontmatter.length - 5} mais\n`;
  report += '\n';
}

report += `💡 Próxima varredura em ~${delayMin} min`;

// --- Envia no Telegram ---
function sendTelegram(text) {
  return new Promise(resolve => {
    const body = JSON.stringify({ chat_id: ADMIN_ID, text, parse_mode: 'HTML', disable_notification: true });
    const req  = https.request({
      hostname: 'api.telegram.org',
      path:     `/bot${TOKEN}/sendMessage`,
      method:   'POST',
      headers:  { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, res => { res.resume(); resolve(); });
    req.on('error', resolve);
    req.write(body);
    req.end();
  });
}

await sendTelegram(report);
