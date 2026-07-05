#!/usr/bin/env node
// 🛰️ Daemon Hermes-Verificador — loop 24h que orquestra o agente Log-Verificador.
// - A cada 60s: escaneia todos os PM2, notifica o que virou alerta novo.
// - A cada 1h : manda placar completo pro admin (resumo horário).
// - Auto-restart: se um processo entrou em crash-loop OU errored, tenta restart 1x
//   (respeitando cooldown 30min e máx 3 restarts/24h por serviço).
// - Análise com IA: para cada NOVO alerta com hits, pede parecer ao DarkAI e junta no card.
//
// Registrar no PM2 (rodar UMA vez na VPS, após sync GitHub → VPS):
//   pm2 start /root/CentralDark/apps/modulos/HERMES-CORE/agents/Log-Verificador/daemon.mjs \
//     --name CentralDark-HermesVerificador --time
//   pm2 save

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { escanear, autoRestart, analisarComIA, resumoHorario } from './agent.mjs';

const DIR = dirname(fileURLToPath(import.meta.url));
const ESTADO_PATH = join(DIR, '.estado.json');

// Carrega .env do CentralDark (PM2 não herda ~/.bashrc)
try {
  const envPath = '/root/CentralDark/.env';
  if (existsSync(envPath)) {
    for (const l of readFileSync(envPath, 'utf8').split('\n')) {
      const line = l.split('#')[0].trim();
      if (!line) continue;
      const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
    }
  }
} catch {}

// ── Notificação (Card Hermes) ────────────────────────────────────────
// Prefere o utils/notify.mjs do Hermes Core (que já usa connector Telegram + fallback).
// Se não existir, cai pro log em stdout — nunca derruba o daemon.
let notifyPath = '/root/CentralDark/apps/modulos/HERMES-CORE/utils/notify.mjs';
let notifyFn = null;
try {
  if (existsSync(notifyPath)) {
    const mod = await import(notifyPath);
    notifyFn = mod.notificar || mod.default || null;
  }
} catch (e) { console.warn('[verificador] notify.mjs não carregou:', e.message); }

async function notificar(titulo, mensagem, destino = 'admin') {
  console.log(`[${new Date().toISOString()}] [${destino}] ${titulo}\n${mensagem}\n`);
  if (notifyFn) {
    try { await notifyFn(titulo, mensagem, destino); } catch (e) { console.warn('notify fail:', e.message); }
  }
}

// ── Estado persistido (só o que precisa sobreviver a restart) ────────
function carregarEstado() {
  try { return JSON.parse(readFileSync(ESTADO_PATH, 'utf8')); }
  catch { return { alertasAtivos: {}, ultimoResumo: 0, restarts24h: {} }; }
}
function salvarEstado(s) {
  try { mkdirSync(dirname(ESTADO_PATH), { recursive: true }); writeFileSync(ESTADO_PATH, JSON.stringify(s, null, 2)); }
  catch (e) { console.warn('salvar estado falhou:', e.message); }
}

// ── Loop principal ───────────────────────────────────────────────────
const INTERVALO_SCAN_MS = 60_000;             // 1 min
const INTERVALO_RESUMO_MS = 60 * 60_000;      // 1h
const AUTO_RESTART_HABILITADO = true;

let estado = carregarEstado();

function chaveAlerta(s) {
  // Alerta é considerado "o mesmo" se serviço + nível + primeira hit não mudaram
  const hit = (s.hits[0] || '').replace(/\d/g, '#').slice(0, 80);
  return `${s.nome}|${s.nivel}|${hit}`;
}

async function ciclo() {
  const snap = escanear();
  const agora = Date.now();
  const novosAlertas = [];

  for (const s of snap.servicos) {
    if (s.nivel === 'ok') {
      // Se serviço voltou ao normal e havia alerta ativo, avisa recuperação
      const chavesResolvidas = Object.keys(estado.alertasAtivos).filter(k => k.startsWith(`${s.nome}|`));
      for (const k of chavesResolvidas) {
        delete estado.alertasAtivos[k];
        await notificar('Hermes-Verificador ✅', `✅ <b>${s.nome}</b> voltou ao normal.`);
      }
      continue;
    }

    const chave = chaveAlerta(s);
    if (estado.alertasAtivos[chave]) continue; // já avisou desse jeito

    estado.alertasAtivos[chave] = { ts: agora, servico: s.nome, nivel: s.nivel };
    novosAlertas.push(s);
  }

  // Notifica cada novo alerta (com análise IA opcional)
  for (const s of novosAlertas) {
    const icon = s.nivel === 'erro' ? '❌' : '⚠️';
    let corpo = `${icon} <b>${s.nome}</b>\nstatus: ${s.status} | restarts: ${s.restarts} | uptime: ${s.uptime_min}min`;
    if (s.crash_loop) corpo += `\n💥 <b>CRASH-LOOP detectado</b>`;
    if (s.hits.length) corpo += `\n\n<pre>${s.hits.slice(0, 3).map(h => h.replace(/</g, '&lt;')).join('\n')}</pre>`;

    // IA
    if (s.hits.length) {
      const ia = await analisarComIA(s);
      if (ia.ok) corpo += `\n\n🧠 <b>Análise IA:</b>\n${ia.texto.replace(/</g, '&lt;')}`;
    }

    // Auto-restart
    if (AUTO_RESTART_HABILITADO && (s.crash_loop || s.status === 'errored')) {
      const r = autoRestart(s.nome);
      corpo += `\n\n🔧 auto-restart: ${r.ok ? `✅ enviado (${r.restart_num_24h}/3 hoje)` : `⏸️ ${r.motivo}`}`;
    }

    await notificar('Hermes-Verificador 🚨', corpo);
  }

  // Resumo horário
  if (agora - (estado.ultimoResumo || 0) >= INTERVALO_RESUMO_MS) {
    estado.ultimoResumo = agora;
    await notificar('Hermes-Verificador — Placar 1h', resumoHorario(snap));
  }

  salvarEstado(estado);
}

console.log(`[${new Date().toISOString()}] 🛰️ Hermes-Verificador ONLINE — scan a cada ${INTERVALO_SCAN_MS/1000}s, resumo a cada ${INTERVALO_RESUMO_MS/60_000}min`);
await notificar('Hermes-Verificador: ONLINE', '🟢 daemon 24h vigiando todos os processos PM2.');

// Primeira execução imediata, depois loop
async function loop() {
  while (true) {
    try { await ciclo(); }
    catch (e) { console.error('[verificador] ciclo falhou:', e); }
    await new Promise(r => setTimeout(r, INTERVALO_SCAN_MS));
  }
}
loop();
