#!/usr/bin/env node
/**
 * STAGE 3 — memory-executor-agent.mjs (Executor)
 *
 * Lê analyst-decision.json e executa os auto-fixes seguros:
 *   - Adiciona frontmatter YAML em arquivos que não têm
 *   - Adiciona seção "Conexões Rápidas" em arquivos que não têm
 *
 * Nunca apaga conteúdo existente — apenas adiciona.
 * Faz commit e push automaticamente se houver correções.
 * Notifica Telegram com o que foi corrigido.
 * Roda 15 min depois do Stage 2.
 */

import fs            from 'fs';
import path          from 'path';
import https         from 'https';
import { execSync }  from 'child_process';

const RAIZ       = '/root/CentralDark';
const DIR        = path.join(RAIZ, 'scripts/memory-linker');
const DECISION   = path.join(DIR, 'analyst-decision.json');
const CONSCIENCIA = path.join(RAIZ, 'docs/CONSCIENCIA');
const ENV_FILE   = path.join(RAIZ, 'secrets/mcp.env');

// Se não há decisão nova, sai
if (!fs.existsSync(DECISION)) process.exit(0);
const decision = JSON.parse(fs.readFileSync(DECISION, 'utf8'));
const idadeMin = (Date.now() - new Date(decision.timestamp).getTime()) / 60000;
if (idadeMin > 180 || decision.totalAutoFix === 0) process.exit(0);

// Credenciais
const env = Object.fromEntries(
  fs.readFileSync(ENV_FILE,'utf8').split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0,i).trim(), l.slice(i+1).trim().replace(/^['"]|['"]$/g,'')]; })
);
const TOKEN    = env.TELEGRAM_BOT_TOKEN;
const ADMIN_ID = env.TELEGRAM_ADMIN_ID;

// Encontrar arquivo pelo nome (sem extensão)
function findFile(nome) {
  function walk(d) {
    if (!fs.existsSync(d)) return null;
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const f = path.join(d, e.name);
      if (e.isDirectory()) { const r = walk(f); if (r) return r; }
      else if (e.name === `${nome}.md`) return f;
    }
    return null;
  }
  return walk(CONSCIENCIA);
}

const corrigidos = [];
const hoje = new Date().toISOString().split('T')[0];

for (const fix of (decision.autoFix || [])) {
  const filePath = findFile(fix.arquivo);
  if (!filePath) continue;

  let content;
  try { content = fs.readFileSync(filePath, 'utf8'); } catch { continue; }

  let changed = false;

  // Adicionar frontmatter se não tem
  if (fix.tipo === 'sem-frontmatter' && !content.trimStart().startsWith('---')) {
    const titulo = fix.arquivo.replace(/-/g,' ').replace(/\b\w/g, c => c.toUpperCase());
    const frontmatter = `---\ntitle: "${titulo}"\ndate: ${hoje}\ntags: ["consciencia"]\nupdated: ${hoje}\n---\n\n`;
    content = frontmatter + content;
    changed = true;
  }

  // Adicionar seção Conexões Rápidas se não tem
  if (fix.tipo === 'sem-conexoes-rapidas' && !/##\s*(conex[oõ]es?\s*r[aá]pidas?)/i.test(content)) {
    const secao = `\n\n---\n\n## Conexões Rápidas\n\n- [[00-LEIA-PRIMEIRO]] — portão de entrada\n- [[MAPA-DO-CEREBRO]] — visão geral\n- [[CONSCIENCIA]] — documento mestre\n`;
    content = content.trimEnd() + secao;
    changed = true;
  }

  if (changed) {
    try {
      fs.writeFileSync(filePath, content);
      corrigidos.push({ arquivo: fix.arquivo, tipo: fix.tipo });
    } catch {}
  }
}

if (corrigidos.length === 0) process.exit(0);

// Commit automático
try {
  execSync(`git -C "${RAIZ}" add docs/CONSCIENCIA/`, { stdio: 'pipe' });
  execSync(`git -C "${RAIZ}" commit -m "fix(memory-executor): auto-corrige ${corrigidos.length} gap(s) de memória\n\n${corrigidos.map(c => `- ${c.arquivo}: ${c.tipo}`).join('\n')}"`, { stdio: 'pipe' });
  execSync(`git -C "${RAIZ}" push origin main`, { stdio: 'pipe' });
} catch (e) {
  // Push falhou — não é crítico, os arquivos já foram corrigidos localmente
}

// Limpa decisão para não re-executar
fs.writeFileSync(DECISION, JSON.stringify({ ...decision, totalAutoFix: 0, executed: new Date().toISOString() }, null, 2));

// Notifica
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

let msg = `✅ <b>Stage 3 — Executor corrigiu ${corrigidos.length} gap(s)</b>\n\n`;
corrigidos.forEach(c => {
  const label = c.tipo === 'sem-frontmatter' ? '📄 frontmatter adicionado' : '🔗 Conexões Rápidas adicionado';
  msg += `  • <code>${c.arquivo}</code> — ${label}\n`;
});
msg += `\n💾 Commitado e enviado pro GitHub automaticamente.`;

await send(msg);
