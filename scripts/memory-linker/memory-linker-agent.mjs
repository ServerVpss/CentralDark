#!/usr/bin/env node
/**
 * STAGE 1 — memory-linker-agent.mjs (Scout)
 *
 * Varre docs/BRAIN/ e docs/CONSCIENCIA/ e detecta gaps de memória.
 * Só materializa novo relatório quando o conjunto de achados muda.
 *
 * Modos de auditoria (não escrevem, não notificam):
 *   node scripts/memory-linker/memory-linker-agent.mjs --repo-root . --check-links
 *
 * O checker reutiliza o Scout existente; não cria segundo motor de links.
 */

import fs   from 'fs';
import path from 'path';
import https from 'https';
import { canonicalizeFindings, findingFingerprint, informationGain } from './delta-core.mjs';
import { atomicWriteUtf8Sync, ensureRegularFileInsideRootSync } from './fs-safe.mjs';

function argValue(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : null;
}

const CHECK_LINKS = process.argv.includes('--check-links');
const ROOT_ARG = argValue('--repo-root') || process.env.CENTRALDARK_ROOT || '/root/CentralDark';
const RAIZ = path.resolve(ROOT_ARG);
const DIR = path.join(RAIZ, 'scripts/memory-linker');
const STATE_FILE = path.join(DIR, '.next_run');
const REPORT = path.join(DIR, 'last-report.json');
const ENV_FILE = path.join(RAIZ, 'secrets/mcp.env');
const unsafePaths = new Set();

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

if (!fs.existsSync(path.join(RAIZ, 'docs'))) {
  console.error(`MEMORY_SCOUT=BLOCKED REASON=REPO_ROOT_INVALID ROOT=${RAIZ}`);
  process.exit(2);
}

const now = Date.now();
let nextRun = 0;
if (!CHECK_LINKS) {
  try { nextRun = parseInt(fs.readFileSync(STATE_FILE, 'utf8').trim(), 10); } catch {}
  if (now < nextRun) process.exit(0);
}

const delayMin = 60 + Math.floor(Math.random() * 60);
if (!CHECK_LINKS) {
  atomicWriteUtf8Sync(STATE_FILE, String(now + delayMin * 60 * 1000), { skipIfUnchanged: true });
}

function scanDir(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const f = path.join(d, e.name);
      if (e.isDirectory()) {
        walk(f);
      } else if (e.name.endsWith('.md')) {
        try {
          out.push(ensureRegularFileInsideRootSync(dir, f));
        } catch (error) {
          unsafePaths.add(`${path.relative(RAIZ, f)}:${error.message}`);
        }
      }
    }
  }
  walk(dir);
  return out;
}

function markdownWithoutCode(content) {
  return content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/~~~[\s\S]*?~~~/g, '')
    .replace(/`[^`\n]*`/g, '');
}

function wikilinks(content) {
  const semanticMarkdown = markdownWithoutCode(content);
  return [...semanticMarkdown.matchAll(/\[\[([^\]|#\n]+?)(?:[|#][^\]]*)?]]/g)]
    .map(m => m[1].trim().toUpperCase());
}

const SKIP_PASTA = ['ARQUIVO-MORTO', '_LEGADO_ROOT_DOCS_CONFLITOS'];
const SKIP_PREFIXO = ['INDEX', 'README'];

const allFiles = [
  ...scanDir(path.join(RAIZ, 'docs/CONSCIENCIA')),
  ...scanDir(path.join(RAIZ, 'docs/BRAIN')),
];

// Um basename pode existir em mais de uma pasta. Para resolução de wikilink,
// qualquer destino real com aquele basename satisfaz o elo; duplicidade é
// problema de owner/dedupe separado, não "link quebrado".
const fileIndex = new Map();
for (const f of allFiles) {
  const key = path.basename(f, '.md').toUpperCase();
  if (!fileIndex.has(key)) fileIndex.set(key, []);
  fileIndex.get(key).push(f);
}

const allMentioned = new Set();
const brokenLinks = new Map();
const noConexoes = [];
const semFront = [];

for (const f of allFiles) {
  const rel = path.relative(RAIZ, f);
  const name = path.basename(f, '.md');
  if (SKIP_PASTA.some(p => rel.includes(p))) continue;

  let content;
  try { content = fs.readFileSync(f, 'utf8'); } catch { continue; }

  for (const link of wikilinks(content)) {
    allMentioned.add(link);
    if (!fileIndex.has(link)) {
      if (!brokenLinks.has(link)) brokenLinks.set(link, []);
      brokenLinks.get(link).push(name);
    }
  }

  const isC = rel.startsWith(path.join('docs', 'CONSCIENCIA'));
  const skip = rel.includes('ARTEFATOS') || name.startsWith('RETOMADA') || SKIP_PREFIXO.some(p => name.toUpperCase().startsWith(p));
  if (isC && !skip) {
    if (!/##\s*(conex[oõ]es?\s*r[aá]pidas?)/i.test(content)) noConexoes.push(name);
    if (!content.trimStart().startsWith('---')) semFront.push(name);
  }
}

const orfas = [];
for (const f of scanDir(path.join(RAIZ, 'docs/CONSCIENCIA'))) {
  const rel = path.relative(RAIZ, f);
  const name = path.basename(f, '.md');
  if (SKIP_PASTA.some(p => rel.includes(p))) continue;
  if (SKIP_PREFIXO.some(p => name.toUpperCase().startsWith(p))) continue;
  if (name.startsWith('RETOMADA')) continue;
  if (!allMentioned.has(name.toUpperCase())) orfas.push(name);
}

const findings = canonicalizeFindings({
  orfas,
  brokenLinks: Object.fromEntries(brokenLinks),
  noConexoes,
  semFrontmatter: semFront,
  unsafePaths: [...unsafePaths],
});

const currentFingerprint = findingFingerprint(findings);

if (CHECK_LINKS) {
  const brokenCount = Object.keys(findings.brokenLinks || {}).length;
  const unsafeCount = findings.unsafePaths.length;
  const status = brokenCount === 0 && unsafeCount === 0 ? 'PASS' : 'FAIL';
  console.log([
    `MEMORY_LINK_CHECK=${status}`,
    `ROOT=${RAIZ}`,
    `FILES_SCANNED=${allFiles.length}`,
    `BROKEN_LINKS=${brokenCount}`,
    `ORPHANS_OBSERVED=${findings.orfas.length}`,
    `NO_CONNECTIONS_OBSERVED=${findings.noConexoes.length}`,
    `NO_FRONTMATTER_OBSERVED=${findings.semFrontmatter.length}`,
    `UNSAFE_PATHS=${unsafeCount}`,
    `FINGERPRINT=${currentFingerprint}`,
  ].join(' '));
  if (brokenCount) console.log(`BROKEN_LINK_KEYS=${Object.keys(findings.brokenLinks).sort().join(',')}`);
  if (unsafeCount) console.log(`UNSAFE_PATH_LIST=${findings.unsafePaths.join('|')}`);
  // Nesta fase, órfãs/frontmatter/sem-conexões são medidos e rastreados, mas
  // não derrubam o gate até a dívida atual ser reconciliada sem falso positivo.
  process.exit(status === 'PASS' ? 0 : 1);
}

let previousFingerprint = null;
try {
  const previous = JSON.parse(fs.readFileSync(REPORT, 'utf8'));
  previousFingerprint = previous.findingFingerprint ?? null;
} catch {}

if (!informationGain(previousFingerprint, currentFingerprint)) {
  console.log(`MEMORY_SCOUT=NO_NEW_INFORMATION FINGERPRINT=${currentFingerprint}`);
  process.exit(0);
}

const report = {
  timestamp: new Date().toISOString(),
  observedAt: new Date().toISOString(),
  repoRoot: RAIZ,
  findingFingerprint: currentFingerprint,
  previousFindingFingerprint: previousFingerprint,
  nextRunMin: delayMin,
  ...findings,
};
atomicWriteUtf8Sync(REPORT, `${JSON.stringify(report, null, 2)}\n`, { skipIfUnchanged: true });
console.log(`MEMORY_SCOUT=DELTA FINDINGS=${report.total} UNSAFE_PATHS=${findings.unsafePaths.length} FINGERPRINT=${currentFingerprint}`);

if (report.total === 0) process.exit(0);

const env = loadEnv();
const TOKEN = env.TELEGRAM_BOT_TOKEN;
const ADMIN_ID = env.TELEGRAM_ADMIN_ID;

function send(text) {
  if (!TOKEN || !ADMIN_ID) return Promise.resolve({ sent: false, reason: 'NOT_CONFIGURED' });
  return new Promise(resolve => {
    const body = JSON.stringify({ chat_id: ADMIN_ID, text, parse_mode: 'HTML', disable_notification: findings.unsafePaths.length === 0 });
    const req = https.request({
      hostname: 'api.telegram.org', path: `/bot${TOKEN}/sendMessage`, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, res => { res.resume(); resolve({ sent: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode }); });
    req.on('error', error => resolve({ sent: false, reason: error.message }));
    req.write(body); req.end();
  });
}

let msg = `🔍 <b>Stage 1 — Scout encontrou DELTA (${report.total})</b>\n\n`;
if (findings.unsafePaths.length) msg += `🛡️ Caminhos inseguros: ${findings.unsafePaths.length} | `;
if (findings.orfas.length) msg += `📍 Órfãs: ${findings.orfas.length} | `;
if (Object.keys(findings.brokenLinks).length) msg += `❓ Links quebrados: ${Object.keys(findings.brokenLinks).length} | `;
if (findings.noConexoes.length) msg += `🔗 Sem conexões: ${findings.noConexoes.length} | `;
if (findings.semFrontmatter.length) msg += `📄 Sem frontmatter: ${findings.semFrontmatter.length}`;
msg += `\n\n🧬 fingerprint: <code>${currentFingerprint.slice(0, 16)}</code>\n⚙️ Stage 2 classifica somente porque houve informação nova.`;

await send(msg);
