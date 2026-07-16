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
import { execFile } from 'node:child_process';
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
// utils/notify.mjs é um script de CLI standalone (lê process.argv, chama
// process.exit(0) no final) — NÃO é um módulo pra importar. Importar ele
// diretamente (`import()`) executa o script inteiro na hora e mata o
// processo que importou. Por isso chama como subprocesso, do jeito que
// ele foi desenhado: `node notify.mjs "<titulo>" "<mensagem>" [chat_id]`.
const notifyPath = '/root/CentralDark/apps/modulos/HERMES-CORE/utils/notify.mjs';
const notifyDisponivel = existsSync(notifyPath);
if (!notifyDisponivel) console.warn('[verificador] notify.mjs não encontrado — modo log-only');

async function notificar(titulo, mensagem, destino = 'admin') {
  console.log(`[${new Date().toISOString()}] [${destino}] ${titulo}\n${mensagem}\n`);
  if (!notifyDisponivel) return;
  // 'admin' é o destino simbólico padrão — não é um chat_id real, então
  // não passa como argv nesse caso (deixa o notify.mjs resolver o chat
  // padrão pelas env vars dele). Só passa se for um chat_id de verdade.
  const args = destino && destino !== 'admin' ? [titulo, mensagem, destino] : [titulo, mensagem];
  await new Promise((resolve) => {
    const child = execFile('node', [notifyPath, ...args], { timeout: 15_000 }, (err) => {
      if (err) console.warn('notify fail:', err.message);
      resolve();
    });
    child.stdin?.end();
  });
}

// ── Estado persistido (só o que precisa sobreviver a restart) ────────
function carregarEstado() {
  try {
    const s = JSON.parse(readFileSync(ESTADO_PATH, 'utf8'));
    if (!s.offsets) s.offsets = {};
    if (!s.ultimoHeartbeatDiario) s.ultimoHeartbeatDiario = 0;
    return s;
  }
  catch { return { alertasAtivos: {}, ultimoResumo: 0, ultimoHeartbeatDiario: 0, restarts24h: {}, offsets: {} }; }
}
function salvarEstado(s) {
  try { mkdirSync(dirname(ESTADO_PATH), { recursive: true }); writeFileSync(ESTADO_PATH, JSON.stringify(s, null, 2)); }
  catch (e) { console.warn('salvar estado falhou:', e.message); }
}

// ── Loop principal ───────────────────────────────────────────────────
const INTERVALO_SCAN_MS = 60_000;             // 1 min
const INTERVALO_RESUMO_MS = 60 * 60_000;      // checa o placar a cada 1h...
const INTERVALO_HEARTBEAT_MS = 24 * 3600_000; // ...mas só ENVIA de hora em hora se tiver problema real.
                                               // Se estiver tudo ok, manda 1x por dia (heartbeat "tô vivo").
const AUTO_RESTART_HABILITADO = true;

let estado = carregarEstado();

function chaveAlerta(s) {
  // Alerta é considerado "o mesmo" se serviço + nível + primeira hit não mudaram
  const hit = (s.hits[0] || '').replace(/\d/g, '#').slice(0, 80);
  return `${s.nome}|${s.nivel}|${hit}`;
}

async function ciclo() {
  const snap = escanear({ offsets: estado.offsets });
  estado.offsets = snap.offsets || estado.offsets;
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

  // Placar: checa a cada 1h, mas só ENVIA se tiver problema real (evento) ou
  // se já faz 24h que não manda nada (heartbeat "tô vivo" diário). Isso troca
  // o antigo "manda sempre, toda hora" por um modelo orientado a evento.
  if (agora - (estado.ultimoResumo || 0) >= INTERVALO_RESUMO_MS) {
    estado.ultimoResumo = agora;
    const temProblema = snap.servicos.some(s => s.nivel !== 'ok');
    const heartbeatDevido = agora - (estado.ultimoHeartbeatDiario || 0) >= INTERVALO_HEARTBEAT_MS;
    if (temProblema) {
      await notificar('Hermes-Verificador — Placar (problema ativo)', resumoHorario(snap));
    } else if (heartbeatDevido) {
      estado.ultimoHeartbeatDiario = agora;
      await notificar('Hermes-Verificador — Heartbeat diário', resumoHorario(snap));
    }
    // se não tem problema e o heartbeat diário ainda não venceu: fica em silêncio.
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
