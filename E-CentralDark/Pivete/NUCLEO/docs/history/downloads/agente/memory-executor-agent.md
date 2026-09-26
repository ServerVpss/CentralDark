# AGENTE - memory-executor-agent.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\scripts\memory-linker\memory-executor-agent.mjs
**SHA:** 4927744dd848a2d1
**Timestamp:** 2026-08-28T02:57:36.866335
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const DRY_RUN     = process.argv.includes('--dry-run');

### Decisoes
- msg += `\n🧬 decisão: <code>${decisionFingerprint.slice(0, 16)}</code>`;

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node
/**
 * STAGE 3 — memory-executor-agent.mjs (Executor)
 *
 * Executa somente auto-fixes seguros classificados pelo Analyst.
 * Toda mutação é atômica; receipt distingue arquivo corrigido, commit e push.
 */

import crypto from 'node:crypto';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { execFileSync } from 'child_process';
import { atomicWriteUtf8Sync, ensureRegularFileInsideRootSync } from './fs-safe.mjs';

const RAIZ        = '/root/CentralDark';
const DIR         = path.join(RAIZ, 'scripts/memory-linker');
const DECISION    = path.join(DIR, 'analyst-decision.json');
const CONSCIENCIA = path.join(RAIZ, 'docs/CONSCIENCIA');
const ENV_FILE    = path.join(RAIZ, 'secrets/mcp.env');
const DRY_RUN     = process.argv.includes('--dry-run');

function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${stable(value[k])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}
function sha256(value) { return crypto.createHash('sha256').update(String(value)).digest('hex'); }
function canonicalDecisionFingerprint(decision) {
  if (typeof decision.decisionFingerprint === 'string' && decision.decisionFingerprint.length > 0) {
    return decision.decisionFingerprint;
  }
  const criticos = Array.isArray(decision.criticos) ? decision.criticos : [];
  const altos = Array.isArray(decision.altos) ? decision.altos : [];
  const autoFix = Array.isArray(decision.autoFix) ? decision.autoFix : [];
  return sha256(stable({
    criticos,
    altos,
    autoFix,
    totalCritico: Number.isFinite(decision.totalCritico) ? decision.totalCritico : criticos.length,
    totalAlto: Number.isFinite(decision.totalAlto) ? decision.totalAlto : altos.length,
    totalAutoFix: Number.isFinite(decision.totalAutoFix) ? decision.totalAutoFix : autoFix.length,
  }));
}
function loadEnv() {
  try {
    return Object.fromEntries(
      fs.readFileSync(ENV_FILE, 'utf8').split('\n')
        .filter(l => l.includes('=') && !l.startsWith('#'))
        .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^['"]|['"]$/g, '')]; })
    );
  } catch { return {}; }
}

if (!fs.existsSync(DECISION)) process.exit(0);
const decision = JSON.parse(fs.readFileSync(DECISION, 'utf8'));
const decisionTime = decision.observedAt ?? decision.timestamp;
const idadeMin = (Date.now() - new Date(decisionTime).getTime()) / 60000;
if (!Number.isFinite(idadeMin) || idadeMin > 180 || decision.totalAutoFix === 0) process.exit(0);
const decisionFingerprint = canonicalDecisionFingerprint(decision);
const migratedLegacyDecision = !decision.decisionFingerprint;

function findFile(nome) {
  function walk(d) {
    if (!fs.existsSync(d)) return null;
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const f = path.join(d, e.name);
      if (e.isDirectory()) {
        const r = walk(f);
        if (r) return r;
      } else if (e.name === `${nome}.md`) return f;
    }
    return null;
  }
  return walk(CONSCIENCIA);
}

const corrigidos = [];
const ignorados = [];
const hoje = new Date().toISOString().split('T')[0];

for (const fix of (decision.autoFix || [])) {
  const candidatePath = findFile(fix.arquivo);
  if (!candidatePath) {
    ignorados.push({ arquivo: fix.arquivo, tipo: fix.tipo, motivo: 'FILE_NOT_FOUND' });
    continue;
  }

  let filePath;
  try {
    filePath = ensureRegularFileInsideRootSync(CONSCIENCIA, candidatePath);
  } catch (error) {
    ignorados.push({ arquivo: fix.arquivo, tipo: fix.tipo, motivo: `SECURITY_BOUNDARY:${error.message}` });
    continue;
  }

  let original;
  try { original = fs.readFileSync(filePath, 'utf8'); }
  catch {
    ignorados.push({ arquivo: fix.arquivo, tipo: fix.tipo, motivo: 'READ_FAILED' });
    continue;
  }

  let content = original;

  if (fix.tipo === 'sem-frontmatter' && !content.trimStart().startsWith('---')) {
    const titulo = fix.arquivo.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const frontmatter = `---\ntitle: "${titulo}"\ndate: ${hoje}\ntags: ["consciencia"]\nupdated: ${hoje}\n---\n\n`;
    content = frontmatter + content;
  }

  if (fix.tipo === 'sem-conexoes-rapidas' && !/##\s*(conex[oõ]es?\s*r[aá]pidas?)/i.test(content)) {
    const secao = `\n\n---\n\n## Conexões Rápidas\n\n- [[00-LEIA-PRIMEIRO]] — portão de entrada\n- [[MAPA-DO-CEREBRO]] — visão geral\n- [[CONSCIENCIA]] — documento mestre\n`;
    content = content.trimEnd() + secao;
  }

  if (content === original) {
    ignorados.push({ arquivo: fix.arquivo, tipo: fix.tipo, motivo: 'ALREADY_SATISFIED' });
    continue;
  }

  if (DRY_RUN) {
    corrigidos.push({ arquivo: fix.arquivo, tipo: fix.tipo, path: path.relative(RAIZ, filePath), write: 'DRY_RUN' });
    continue;
  }

  try {
    const write = atomicWriteUtf8Sync(filePath, content, { skipIfUnchanged: true });
    if (write === 
```