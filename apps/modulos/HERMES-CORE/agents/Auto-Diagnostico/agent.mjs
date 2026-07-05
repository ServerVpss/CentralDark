#!/usr/bin/env node
// 🩺 Agente Auto-Diagnostico — vigia pendências + saúde do ecossistema (migrado de vigia.mjs).
// verificar(): pendência prioritária de docs/PENDENCIAS.md (com janela de horário e anti-spam)
// diagnosticar(): saúde dos processos PM2 (errored/restart alto)
import { readFileSync, existsSync, appendFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const DIR = dirname(fileURLToPath(import.meta.url));
const PENDENCIAS_PATH = '/root/CentralDark/docs/PENDENCIAS.md';
const LOGS_DIR = join(DIR, '../../logs');
const LOG_PATH = join(LOGS_DIR, 'vigia.log');
const ULTIMA_PERGUNTA_PATH = join(LOGS_DIR, 'ultima_pergunta.json');

function log(mensagem) {
  const linha = `${new Date().toISOString()} | ${mensagem}\n`;
  try { mkdirSync(LOGS_DIR, { recursive: true }); appendFileSync(LOG_PATH, linha); } catch {}
  console.log('[VIGIA]', mensagem);
}

function horarioPermitido() {
  const hora = new Date().getHours();
  return hora >= 7 && hora <= 23;
}

function podePerguntar() {
  if (!existsSync(ULTIMA_PERGUNTA_PATH)) return true;
  const ultima = JSON.parse(readFileSync(ULTIMA_PERGUNTA_PATH, 'utf-8'));
  const diffMin = (Date.now() - ultima.timestamp) / 1000 / 60;
  if (ultima.ignorada && diffMin < 60) return false;
  return diffMin > 30;
}

function getPrioridade(item) {
  if (item.includes('P0')) return 0;
  if (item.includes('P1')) return 1;
  if (item.includes('P2')) return 2;
  return 3;
}

export async function verificar() {
  log('Iniciando verificação...');
  if (!horarioPermitido()) { log('Horário 00-07. Dormindo.'); return; }
  if (!podePerguntar()) { log('Intervalo/ignorada. Dormindo.'); return; }
  if (!existsSync(PENDENCIAS_PATH)) { log('PENDENCIAS.md ausente.'); return; }
  const pendencias = readFileSync(PENDENCIAS_PATH, 'utf-8');
  const itens = pendencias.split('\n').filter(l => l.startsWith('- [ ]') || l.startsWith('- [x]'));
  const abertos = itens.filter(l => l.startsWith('- [ ]'));
  if (abertos.length === 0) { log('Sem pendencias.'); return; }
  abertos.sort((a, b) => getPrioridade(a) - getPrioridade(b));
  const item = abertos[0];
  const prioridade = getPrioridade(item) === 0 ? 'P0' : getPrioridade(item) === 1 ? 'P1' : 'P2';
  log(`Prioritário: ${item.trim().slice(0, 80)}`);
  const urgente = prioridade === 'P0';
  writeFileSync(ULTIMA_PERGUNTA_PATH, JSON.stringify({
    timestamp: Date.now(), item: item.trim(), prioridade, ignorada: false
  }));
  return { pergunta: `🔔 PENDENCIAS: ${item.trim().slice(0, 100)}`, prioridade, urgente };
}

// Saúde do PM2 — processos errored ou com restart alto (exceto whatsapp-server id 1, estado desejado = stopped)
export function diagnosticar() {
  try {
    const jlist = JSON.parse(execSync('pm2 jlist', { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }));
    const problemas = [];
    for (const p of jlist) {
      if (p.pm_id === 1) continue; // whatsapp-server: stopped é o estado desejado
      const st = p.pm2_env?.status;
      const restarts = p.pm2_env?.restart_time ?? 0;
      if (st === 'errored') problemas.push(`🔴 ${p.name} (id ${p.pm_id}) errored`);
      else if (restarts > 50) problemas.push(`🟡 ${p.name} (id ${p.pm_id}) ${restarts} restarts`);
    }
    return { ok: problemas.length === 0, problemas };
  } catch (e) {
    return { ok: false, problemas: [`falha ao ler pm2: ${e.message.slice(0, 120)}`] };
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const modo = process.argv[2] || 'verificar';
  if (modo === 'diagnosticar') console.log(JSON.stringify(diagnosticar(), null, 2));
  else verificar().then(r => { if (r) console.log(JSON.stringify(r, null, 2)); process.exit(0); });
}
