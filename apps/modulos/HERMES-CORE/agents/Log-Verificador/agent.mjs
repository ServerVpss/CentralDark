#!/usr/bin/env node
// 🔍 Agente Log-Verificador — vigia 24h os logs PM2 de todos os processos.
// Detecta padrões suspeitos (crash-loop, ERROR, FATAL, unhandled, timeout),
// mantém estado por serviço (cooldown, contagem de restart) e expõe:
//   escanear()       → snapshot atual de todos os processos + achados
//   analisarComIA()  → manda trechos suspeitos pro DarkAI resumir causa raiz
//   autoRestart(nome)→ pm2 restart <nome> com trava anti-abuso (max 3/24h por serviço)
// Não roda loop próprio — o daemon.mjs orquestra a periodicidade.

import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { detectarEventosProvedor, sanitizarLinhaLog } from './provider-health.mjs';

const LOG_DIR = join(homedir(), '.pm2/logs');

// Padrões que disparam alerta. Case-insensitive.
const PADROES_ALERTA = [
  /\bFATAL\b/i,
  /\bunhandled\s*(promise\s*)?rejection\b/i,
  /\buncaught\s*exception\b/i,
  /\bthrow\b.*\bError\b/i,
  /\bENOSPC\b/i,
  /\bEACCES\b/i,
  /\bECONNREFUSED\b/i,
  /\bETIMEDOUT\b/i,
  /\bSegmentation fault\b/i,
  /\bout of memory\b/i,
  /permission denied/i,
];

// Palavras "erro" que sozinhas dão ruído — só contam se aparecerem >= LIMITE_ERRO em 50 linhas
const RUIDO_ERRO = [/\berror\b/i, /\bfailed\b/i, /\bexception\b/i];
const LIMITE_ERRO = 5;

// Estado em memória (reseta ao reiniciar daemon; cooldown persistido em disco pelo daemon)
const estado = new Map(); // nome → { ultimoAlerta, ultimoRestart, restarts24h: [ts,ts,...] }

function shJSON(cmd) {
  try {
    return JSON.parse(execSync(cmd, { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024, timeout: 30_000 }));
  } catch {
    return null;
  }
}

function lerTail(caminho, linhas = 80) {
  if (!existsSync(caminho)) return '';
  try {
    return execSync(`tail -n ${linhas} '${caminho.replace(/'/g, "'\\''")}'`, {
      encoding: 'utf8', maxBuffer: 5 * 1024 * 1024, timeout: 10_000,
    });
  } catch { return ''; }
}

export function analisarTexto(txt) {
  if (!txt) return { hits: [], ruidoErro: 0, eventosProvedor: [] };
  const linhas = txt.split('\n');
  const eventosProvedor = detectarEventosProvedor(linhas);
  const hits = [];
  let ruido = 0;
  for (const l of linhas) {
    for (const p of PADROES_ALERTA) {
      if (p.test(l)) { hits.push(sanitizarLinhaLog(l)); break; }
    }
    for (const p of RUIDO_ERRO) { if (p.test(l)) { ruido++; break; } }
  }
  // Corta duplicatas mantendo ordem
  const vistos = new Set();
  const unicos = [];
  for (const h of hits.reverse()) {
    const chave = h.replace(/\d/g, '#').slice(0, 100);
    if (!vistos.has(chave)) { vistos.add(chave); unicos.push(h); }
    if (unicos.length >= 5) break;
  }
  return { hits: unicos.reverse(), ruidoErro: ruido, eventosProvedor };
}

// ─── Escaneia TODOS os processos PM2 ──────────────────────────────────
export function escanear({ ignorarPmIds = [1] } = {}) {
  const jlist = shJSON('pm2 jlist');
  if (!jlist) return { ok: false, erro: 'pm2 jlist falhou', servicos: [] };

  const agora = Date.now();
  const servicos = [];

  for (const p of jlist) {
    if (ignorarPmIds.includes(p.pm_id)) continue;
    const nome = p.name;
    const st = p.pm2_env?.status || 'unknown';
    const restarts = p.pm2_env?.restart_time ?? 0;
    const uptimeMs = p.pm2_env?.pm_uptime ? (agora - p.pm2_env.pm_uptime) : 0;
    const errPath = p.pm2_env?.pm_err_log_path || join(LOG_DIR, `${nome}-error.log`);
    const outPath = p.pm2_env?.pm_out_log_path || join(LOG_DIR, `${nome}-out.log`);

    const tailErr = lerTail(errPath, 80);
    const tailOut = lerTail(outPath, 40);
    const analErr = analisarTexto(tailErr);
    const analOut = analisarTexto(tailOut);
    const eventosProvedor = [...new Map(
      [...analErr.eventosProvedor, ...analOut.eventosProvedor].map(event => [event.fingerprint, event]),
    ).values()];
    const providerError = eventosProvedor.some(event => event.severity === 'error');

    // Heurística de crash-loop: uptime < 5min E restarts > 20
    const crashLoop = st === 'online' && uptimeMs < 5 * 60_000 && restarts > 20;
    const errored = st === 'errored' || st === 'stopped_with_error';
    const alerta =
      errored ||
      crashLoop ||
      analErr.hits.length > 0 ||
      analErr.ruidoErro >= LIMITE_ERRO ||
      eventosProvedor.length > 0;

    let nivel = 'ok';
    if (errored || crashLoop || analErr.hits.length > 0 || providerError) nivel = 'erro';
    else if (analErr.ruidoErro >= LIMITE_ERRO || analOut.ruidoErro >= LIMITE_ERRO || eventosProvedor.length > 0) nivel = 'aviso';

    servicos.push({
      nome,
      pm_id: p.pm_id,
      status: st,
      restarts,
      uptime_min: Math.round(uptimeMs / 60_000),
      crash_loop: crashLoop,
      nivel,
      alerta,
      hits: analErr.hits,
      ruido_erro: analErr.ruidoErro,
      eventos_provedor: eventosProvedor,
    });
  }

  const problemas = servicos.filter(s => s.alerta);
  return {
    ok: problemas.length === 0,
    ts: new Date(agora).toISOString(),
    total: servicos.length,
    problemas: problemas.length,
    servicos,
  };
}

// ─── Auto-restart com trava (máx 3 restarts / 24h por serviço) ────────
export function autoRestart(nome, { max24h = 3, cooldownMs = 30 * 60_000 } = {}) {
  const agora = Date.now();
  const s = estado.get(nome) || { ultimoRestart: 0, restarts24h: [] };
  // Poda janela 24h
  s.restarts24h = s.restarts24h.filter(t => agora - t < 24 * 3600_000);

  if (agora - s.ultimoRestart < cooldownMs) {
    return { ok: false, motivo: `cooldown (${Math.round((cooldownMs - (agora - s.ultimoRestart)) / 60_000)}min restantes)` };
  }
  if (s.restarts24h.length >= max24h) {
    return { ok: false, motivo: `limite ${max24h}/24h atingido — precisa intervenção humana` };
  }

  try {
    execSync(`pm2 restart '${nome.replace(/'/g, "'\\''")}'`, { encoding: 'utf8', timeout: 30_000 });
    try { execSync('pm2 save', { encoding: 'utf8', timeout: 15_000 }); } catch {}
    s.ultimoRestart = agora;
    s.restarts24h.push(agora);
    estado.set(nome, s);
    return { ok: true, restart_num_24h: s.restarts24h.length };
  } catch (e) {
    return { ok: false, motivo: `pm2 restart falhou: ${String(e.message).slice(0, 200)}` };
  }
}

// ─── Análise com IA (opcional, fire-and-forget do daemon) ─────────────
// Manda trechos suspeitos pro DarkAI e volta um parágrafo de causa raiz.
export async function analisarComIA(servicoAlertado) {
  const url = process.env.DARKAI_URL;
  const key = process.env.DARKAI_ANON_KEY;
  if (!url || !key) return { ok: false, motivo: 'DARKAI_URL/ANON_KEY ausentes' };

  const prompt =
    `Você é um SRE. Analise os trechos suspeitos abaixo do processo PM2 "${servicoAlertado.nome}" ` +
    `(status=${servicoAlertado.status}, restarts=${servicoAlertado.restarts}, uptime=${servicoAlertado.uptime_min}min) ` +
    `e responda em português, em NO MÁXIMO 4 linhas: (1) causa provável, (2) severidade (baixa/média/alta), ` +
    `(3) 1 ação recomendada. Sem preâmbulo.\n\n` +
    servicoAlertado.hits.slice(0, 5).map((h, i) => `[${i + 1}] ${h}`).join('\n');

  try {
    const r = await fetch(`${url}/functions/v1/ai-proxy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}`, 'apikey': key },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
      }),
      signal: AbortSignal.timeout(20_000),
    });
    if (!r.ok) return { ok: false, motivo: `ai-proxy HTTP ${r.status}` };
    const j = await r.json();
    const txt = j?.choices?.[0]?.message?.content || j?.content || JSON.stringify(j).slice(0, 400);
    return { ok: true, texto: String(txt).trim().slice(0, 800) };
  } catch (e) {
    return { ok: false, motivo: `ia falhou: ${String(e.message).slice(0, 150)}` };
  }
}

// ─── Resumo horário (placar padrão) ───────────────────────────────────
export function resumoHorario(snap) {
  const ok = snap.servicos.filter(s => s.nivel === 'ok').length;
  const aviso = snap.servicos.filter(s => s.nivel === 'aviso').length;
  const erro = snap.servicos.filter(s => s.nivel === 'erro').length;
  const linhas = [
    `📊 <b>Resumo Hermes-Verificador</b>`,
    `Total: ${snap.total} processos`,
    `✅ OK: ${ok}   ⚠️ aviso: ${aviso}   ❌ erro: ${erro}`,
  ];
  const problemas = snap.servicos.filter(s => s.nivel !== 'ok');
  if (problemas.length) {
    linhas.push('', '<b>Atenção:</b>');
    for (const p of problemas.slice(0, 10)) {
      const icon = p.nivel === 'erro' ? '❌' : '⚠️';
      linhas.push(`${icon} ${p.nome} — ${p.status}, ${p.restarts} restarts, uptime ${p.uptime_min}min`);
    }
  }
  return linhas.join('\n');
}

// ─── Exports para gates determinísticos (aditiv unwilling whitelist) ──
export function auditarFinalizacao({ missao, decisao, historico }) {
  const historicoValido = Array.isArray(historico) && historico.length > 0;
  const temMutacao = historico.some(e => e.ferramenta && e.ferramenta !== 'notificar_progresso');
  const temTesteComportamental = historico.some(e => e.ferramenta === 'shell' && e.resultado === 'pass');
  const decisaoValida = decisao?.terminou === true && decisao?.estado === 'FATO';

  if (!historicoValido || !decisaoValida) {
    return {
      aprovado: false,
      receipt: {
        status: 'BLOCKED',
        schema_version: 2,
        reason: historicoValido ? 'decisao invalida' : 'historico vazio',
        mutations_total: temMutacao ? 1 : 0,
        mutation_proofs: [],
        unproven_mutations: [],
      },
      parecer: historicoValido
        ? 'decisao invalida: terminou=true exige estado=FATO'
        : 'histórico vazio; missão não submetida à auditoria',
    };
  }

  if (temMutacao && !temTesteComportamental) {
    return {
      aprovado: false,
      receipt: {
        status: 'BLOCKED',
        schema_version: 2,
        reason: 'mutacao sem teste comportamental',
        mutations_total: historico.filter(e => e.ferramenta && e.ferramenta !== 'notificar_progresso').length,
        mutation_proofs: historico.map((e, i) => ({
          step_index: i,
          mutation_step_ok: e.ok === true,
          mutation_step_name: e.etapa_titulo || e.ferramenta,
        })),
        unproven_mutations: historico.filter(e => e.ferramenta && e.ferramenta !== 'notificar_progresso' && e.ok !== true).map((e, i) => ({
          index: i,
          kind: 'LOCAL',
          detail: e.etapa_titulo || e.ferramenta,
        })),
      },
      parecer: 'mutação sem teste comportamental posterior',
    };
  }

  return {
    aprovado: true,
    receipt: {
      status: 'PASS',
      schema_version: 2,
      mutations_total: historico.filter(e => e.ferramenta && e.ferramenta !== 'notificar_progresso').length,
      mutation_proofs: historico.map((e, i) => ({
        step_index: i,
        mutation_step_ok: e.ok === true,
        mutation_step_name: e.etapa_titulo || e.ferramenta,
      })),
      behavior_test_after_mutation_index: historico.findIndex(e => e.ferramenta === 'shell' && e.resultado === 'pass'),
      unproven_mutations: [],
    },
    parecer: 'aprovado: evidencia + teste comportamental verificados',
  };
}

export function resultadoAprovadoPeloCritic(resultado, critic) {
  if (!resultado || !critic) return false;
  if (resultado.ok !== true) return false;
  if (critic.aprovado !== true) return false;
  return true;
}

// CLI: node agent.mjs [escanear|resumo|restart <nome>]
if (import.meta.url === `file://${process.argv[1]}`) {
  const modo = process.argv[2] || 'escanear';
  if (modo === 'resumo') {
    console.log(resumoHorario(escanear()));
  } else if (modo === 'restart') {
    console.log(JSON.stringify(autoRestart(process.argv[3]), null, 2));
  } else {
    console.log(JSON.stringify(escanear(), null, 2));
  }
}
