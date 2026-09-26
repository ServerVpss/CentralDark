# AGENTE - memory-linker-agent.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\scripts\memory-linker\memory-linker-agent.mjs
**SHA:** d4bca5f499fbea00
**Timestamp:** 2026-08-28T02:57:36.870352
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let nextRun = 0;
- try { nextRun = parseInt(fs.readFileSync(STATE_FILE, 'utf8').trim(), 10); } catch {}

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node
/**
 * STAGE 1 — memory-linker-agent.mjs (Scout)
 *
 * Varre docs/BRAIN/ e docs/CONSCIENCIA/ e detecta gaps de memória.
 * Só materializa novo relatório quando o conjunto de achados muda.
 */

import fs   from 'fs';
import path from 'path';
import https from 'https';
import { canonicalizeFindings, findingFingerprint, informationGain } from './delta-core.mjs';
import { atomicWriteUtf8Sync, ensureRegularFileInsideRootSync } from './fs-safe.mjs';

const RAIZ       = '/root/CentralDark';
const DIR        = path.join(RAIZ, 'scripts/memory-linker');
const STATE_FILE = path.join(DIR, '.next_run');
const REPORT     = path.join(DIR, 'last-report.json');
const ENV_FILE   = path.join(RAIZ, 'secrets/mcp.env');
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

const findings = canonicalizeFindings({
  orfas,
  brokenLinks: Object.fromEntries(brokenLinks),
  noConexoes,
  semFrontmatter: semFront,
  unsafePaths: [...unsafePaths],
});
const currentFingerprint = findingFingerprint(findings);

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
  findingFingerprint: currentFingerprint,
  previousFindingFingerprint: previousFingerprint,
  nextRunMin: delayMin,
  ...findings,
};
atomicWriteUtf8Sync(REPORT, `${JSON.stringify(report, null, 2)}\n`, { skipIfUnchanged: true });
console.log(`MEMORY_SCOUT=DELTA FINDINGS=${report.total} UNSAFE_PATHS=${findings.unsafePaths.length} FINGERPRINT=${currentFingerprint}`);

if (report.total === 0) process.exit(0);

const env = loadEnv();
const TOKEN    = env.TELEGRAM_BOT_TOKEN;
const ADMIN_ID = env.TELEGRAM_ADMIN_ID;

function send(text) {
  if (!TOKEN || !ADMIN_ID) return Promise.resolve({ sent: f
```