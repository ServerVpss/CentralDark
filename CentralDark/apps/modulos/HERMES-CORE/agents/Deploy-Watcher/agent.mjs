#!/usr/bin/env node
// 🚀 Agente Deploy-Watcher — vigia o estado de deploy da VPS.
// checar(): último commit local vs origin/main + processos PM2 doentes.
// Usado sob demanda (CLI ou import) — não roda em loop próprio; o core delega.
import { execSync } from 'node:child_process';
import { diagnosticar } from '../Auto-Diagnostico/agent.mjs';

const ROOT = '/root/CentralDark';

function sh(cmd) {
  return execSync(cmd, { cwd: ROOT, encoding: 'utf8', timeout: 60_000, maxBuffer: 5 * 1024 * 1024 }).trim();
}

export function checar() {
  const relatorio = { ok: true, itens: [] };
  try {
    const local = sh('git rev-parse HEAD');
    const remoto = sh('git fetch origin main --quiet 2>/dev/null; git rev-parse origin/main');
    if (local === remoto) {
      relatorio.itens.push(`🟢 VPS sincronizada com origin/main (${local.slice(0, 8)})`);
    } else {
      const atras = sh(`git rev-list --count HEAD..origin/main`);
      const frente = sh(`git rev-list --count origin/main..HEAD`);
      relatorio.ok = false;
      relatorio.itens.push(`🟡 VPS fora de sync: ${atras} commit(s) atrás, ${frente} à frente de origin/main`);
    }
  } catch (e) {
    relatorio.ok = false;
    relatorio.itens.push(`🔴 falha ao checar git: ${e.message.slice(0, 120)}`);
  }
  const pm2 = diagnosticar();
  if (!pm2.ok) { relatorio.ok = false; relatorio.itens.push(...pm2.problemas); }
  else relatorio.itens.push('🟢 PM2 saudável');
  return relatorio;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(JSON.stringify(checar(), null, 2));
}
