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
    if (write === 'UPDATED') corrigidos.push({ arquivo: fix.arquivo, tipo: fix.tipo, path: path.relative(RAIZ, filePath), write });
    else ignorados.push({ arquivo: fix.arquivo, tipo: fix.tipo, motivo: 'UNCHANGED' });
  } catch (error) {
    ignorados.push({ arquivo: fix.arquivo, tipo: fix.tipo, motivo: `WRITE_FAILED:${error.message}` });
  }
}

if (DRY_RUN) {
  console.log(`MEMORY_EXECUTOR=DRY_RUN WOULD_CHANGE=${corrigidos.length} SKIPPED=${ignorados.length} DECISION=${decisionFingerprint} LEGACY=${migratedLegacyDecision ? 1 : 0}`);
  process.exit(0);
}

if (corrigidos.length === 0) {
  const receipt = {
    ...decision,
    decisionFingerprint,
    migratedLegacyDecision,
    totalAutoFix: 0,
    executed: new Date().toISOString(),
    execution: {
      status: 'NO_CHANGE',
      decisionFingerprint,
      changed: [],
      skipped: ignorados,
      commit: 'NOT_NEEDED',
      push: 'NOT_NEEDED',
    },
  };
  atomicWriteUtf8Sync(DECISION, `${JSON.stringify(receipt, null, 2)}\n`, { skipIfUnchanged: true });
  console.log(`MEMORY_EXECUTOR=NO_CHANGE DECISION=${decisionFingerprint}`);
  process.exit(0);
}

let commitStatus = 'NOT_ATTEMPTED';
let pushStatus = 'NOT_ATTEMPTED';
let commitSha = null;
let gitError = null;

try {
  execFileSync('git', ['-C', RAIZ, 'add', '--', ...corrigidos.map(c => c.path)], { stdio: 'pipe' });
  const hasDiff = (() => {
    try {
      execFileSync('git', ['-C', RAIZ, 'diff', '--cached', '--quiet'], { stdio: 'pipe' });
      return false;
    } catch { return true; }
  })();

  if (!hasDiff) {
    commitStatus = 'NO_DIFF';
    pushStatus = 'NOT_NEEDED';
  } else {
    const details = corrigidos.map(c => `- ${c.arquivo}: ${c.tipo}`).join('\n');
    execFileSync('git', [
      '-C', RAIZ,
      'commit',
      '-m', `fix(memory-executor): auto-corrige ${corrigidos.length} gap(s) de memória`,
      '-m', details,
    ], { stdio: 'pipe' });
    commitSha = execFileSync('git', ['-C', RAIZ, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
    commitStatus = 'COMMITTED';

    // Fail-closed: only explicit MEMORY_GIT_PUSH=1 allows push to origin/main.
    if (process.env.MEMORY_GIT_PUSH !== '1') {
      pushStatus = 'BLOCKED_BY_MEMORY_GIT_PUSH';
      console.log('MEMORY_GIT_PUSH gate: push skipped (set MEMORY_GIT_PUSH=1 to allow)');
    } else {
      try {
        execFileSync('git', ['-C', RAIZ, 'push', 'origin', 'main'], { stdio: 'pipe' });
        pushStatus = 'PUSHED';
      } catch (error) {
        pushStatus = 'FAILED';
        gitError = `PUSH_FAILED:${error.message}`;
      }
    }
  }
} catch (error) {
  commitStatus = 'FAILED';
  pushStatus = 'NOT_ATTEMPTED';
  gitError = `COMMIT_FAILED:${error.message}`;
}

const receipt = {
  ...decision,
  decisionFingerprint,
  migratedLegacyDecision,
  totalAutoFix: 0,
  executed: new Date().toISOString(),
  execution: {
    status: pushStatus === 'FAILED' || commitStatus === 'FAILED' ? 'PARTIAL' : 'COMPLETED',
    decisionFingerprint,
    changed: corrigidos,
    skipped: ignorados,
    commit: commitStatus,
    push: pushStatus,
    commitSha,
    error: gitError,
  },
};
atomicWriteUtf8Sync(DECISION, `${JSON.stringify(receipt, null, 2)}\n`, { skipIfUnchanged: true });

const env = loadEnv();
const TOKEN = env.TELEGRAM_BOT_TOKEN;
const ADMIN_ID = env.TELEGRAM_ADMIN_ID;
function send(text) {
  if (!TOKEN || !ADMIN_ID) return Promise.resolve({ sent: false, reason: 'NOT_CONFIGURED' });
  return new Promise(resolve => {
    const body = JSON.stringify({ chat_id: ADMIN_ID, text, parse_mode: 'HTML', disable_notification: true });
    const req = https.request({
      hostname: 'api.telegram.org', path: `/bot${TOKEN}/sendMessage`, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, res => { res.resume(); resolve({ sent: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode }); });
    req.on('error', error => resolve({ sent: false, reason: error.message }));
    req.write(body); req.end();
  });
}

let msg = `✅ <b>Stage 3 — Executor alterou ${corrigidos.length} arquivo(s)</b>\n\n`;
corrigidos.forEach(c => {
  const label = c.tipo === 'sem-frontmatter' ? '📄 frontmatter adicionado' : '🔗 Conexões Rápidas adicionadas';
  msg += `  • <code>${c.arquivo}</code> — ${label}\n`;
});
msg += `\n💾 commit: <b>${commitStatus}</b>`;
if (commitSha) msg += ` <code>${commitSha.slice(0, 12)}</code>`;
msg += `\n🔄 push: <b>${pushStatus}</b>`;
if (gitError) msg += `\n⚠️ <code>${gitError.slice(0, 240)}</code>`;
msg += `\n🧬 decisão: <code>${decisionFingerprint.slice(0, 16)}</code>`;
await send(msg);

console.log(`MEMORY_EXECUTOR=${receipt.execution.status} CHANGED=${corrigidos.length} COMMIT=${commitStatus} PUSH=${pushStatus} SHA=${commitSha ?? 'NONE'}`);
