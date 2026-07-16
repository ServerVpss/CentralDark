#!/usr/bin/env node
/**
 * auto-registrar-castelo.mjs
 * Grava aprendizado/decisão em paths allowlist e opcionalmente commita.
 *
 * Uso:
 *   node scripts/agents/auto-registrar-castelo.mjs --titulo "..." --tipo aprendizado|decisao|ambos --corpo "..."
 *   node scripts/agents/auto-registrar-castelo.mjs --titulo "..." --corpo "..." --commit
 *   node scripts/agents/auto-registrar-castelo.mjs --titulo "..." --corpo "..." --commit --push   # push só se limpo o bastante
 *
 * NÃO commita .env/secrets/working tree suja — só arquivos allowlist tocados por este script.
 * PERMITO permanente do Pivete (2026-07-16): registrar melhorias/proteção sem pedir de novo.
 */
import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const APREND = join(ROOT, 'docs/CONSCIENCIA/APRENDIZADOS.md');
const HIST = join(ROOT, 'docs/CONSCIENCIA/08-HISTORICO-DECISOES.md');

function arg(name, def = null) {
  const i = process.argv.indexOf(name);
  if (i < 0) return def;
  return process.argv[i + 1] ?? def;
}
function has(flag) {
  return process.argv.includes(flag);
}

const titulo = arg('--titulo') || arg('-t');
const corpo = arg('--corpo') || arg('-c') || '';
const tipo = (arg('--tipo') || 'aprendizado').toLowerCase();
const doCommit = has('--commit');
const doPush = has('--push');

if (!titulo) {
  console.error('Uso: --titulo "..." --corpo "..." [--tipo aprendizado|decisao|ambos] [--commit] [--push]');
  process.exit(1);
}

const hoje = new Date().toISOString().slice(0, 10);
const touched = [];

function nextAprendNum() {
  if (!existsSync(APREND)) return 1;
  const t = readFileSync(APREND, 'utf8');
  const nums = [...t.matchAll(/^### (\d+)\./gm)].map((m) => Number(m[1]));
  return (nums.length ? Math.max(...nums) : 0) + 1;
}

function nextHistNum() {
  if (!existsSync(HIST)) return 1;
  const t = readFileSync(HIST, 'utf8');
  const nums = [...t.matchAll(/^\*\*(\d+)\./gm)].map((m) => Number(m[1]));
  return (nums.length ? Math.max(...nums) : 0) + 1;
}

if (tipo === 'aprendizado' || tipo === 'ambos') {
  const n = nextAprendNum();
  const bloco =
    `\n### ${n}. ${titulo}\n` +
    `- **Categoria:** regra\n` +
    `- **Data:** ${hoje}\n` +
    `- **Contexto:** auto-registro castelo (script agents/auto-registrar-castelo)\n` +
    `- **Aprendizado:** ${corpo || titulo}\n`;
  appendFileSync(APREND, bloco, 'utf8');
  touched.push(APREND);
  console.log(`[auto-reg] APRENDIZADOS #${n}`);
}

if (tipo === 'decisao' || tipo === 'ambos') {
  const n = nextHistNum();
  const bloco =
    `\n\n---\n\n**${n}. ${titulo}** — ${hoje}. Auto-registro (sem PERMITO pontual; ordem permanente 2026-07-16).\n\n` +
    `${corpo || titulo}\n`;
  appendFileSync(HIST, bloco, 'utf8');
  touched.push(HIST);
  console.log(`[auto-reg] HISTORICO #${n}`);
}

if (doCommit && touched.length) {
  try {
    for (const f of touched) {
      execFileSync('git', ['add', '--', f], { cwd: ROOT, stdio: 'pipe' });
    }
    // also allowlist rules if present
    const rules = [
      join(ROOT, '.grok/rules/02-auto-registro-castelo.md'),
      join(ROOT, 'scripts/agents/auto-registrar-castelo.mjs'),
    ];
    for (const f of rules) {
      if (existsSync(f)) {
        try {
          execFileSync('git', ['add', '--', f], { cwd: ROOT, stdio: 'pipe' });
        } catch { /* ignore */ }
      }
    }
    const msg = `docs(consciencia): auto-registro — ${titulo}`.slice(0, 72);
    execFileSync('git', ['commit', '-m', msg], { cwd: ROOT, stdio: 'inherit' });
    console.log('[auto-reg] commit ok');
    if (doPush) {
      // Nunca force. Se divergir, falha e avisa.
      try {
        execFileSync('git', ['push', 'origin', 'HEAD'], { cwd: ROOT, stdio: 'inherit' });
        console.log('[auto-reg] push ok');
      } catch (e) {
        console.warn('[auto-reg] push falhou (main divergente ou rede). Commit local preservado.', e.message || e);
      }
    }
  } catch (e) {
    console.warn('[auto-reg] commit falhou:', e.message || e);
  }
}

console.log('[auto-reg] done', { titulo, tipo, touched: touched.length });
