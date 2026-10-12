#!/usr/bin/env node
// 🧠 HERMES CORE v5.0 — Orquestrador central
// Loop 5s vigiando missions/pendente/ + retomada automática de órfãs (sobrevive a restart/crash).
// Delegação: decisor (core) escolhe a etapa → Executor executa → Critic audita → Knowledge-Collector registra.
import { readdir, readFile, writeFile, mkdir, rename, appendFile, stat, cp, rm, access } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { createServer as httpCreateServer } from 'node:http';
import { buildStatusOverview, buildStatusDetail } from '../../status/status-api.mjs';
import { renameComRetry as renameComRetryUtil } from '../utils/fs-safe.mjs';
import { continuityBlockReceipt, validateContinuityState } from './continuity-guard.mjs';
import { registrar as registrarAprendizado } from '../agents/Knowledge-Collector/agent.mjs';

// Carrega /root/CentralDark/.env no boot — PM2 não herda ~/.bashrc (DARKAI_URL, DARKAI_ANON_KEY, ELITE_ANTHROPIC_TOKEN)
try {
  for (const l of readFileSync('/root/CentralDark/.env', 'utf8').split('\n')) {
    const line = l.split('#')[0].trim();
    if (!line) continue;
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
} catch {}

// Sub-agentes — o Core só orquestra; todo trabalho pesado é deles.
// (Auto-Diagnostico e Deploy-Watcher são standalone: rodam como missão/cron, não moram no loop do Core.)
const { decidir, provarContratoRuntime } = await import('./decisor.mjs'); // cérebro + probe do runtime canônico
const { executar } = await import('../agents/Executor/agent.mjs');     // braço (com travas)
const { auditar, auditarFinalizacao, resultadoAprovadoPeloCritic, vetar } = await import('../agents/Critic/agent.mjs'); // auditor + gate final
const { atualizarGrafo } = await import('../agents/GraphRAG-Master/agent.mjs'); // memória viva + auto-update do grafo
const { calibrateRuntime, buildCalibrationMission, markCalibrationEnqueued, getCalibrationSummary } = await import('./runtime-calibrator.mjs'); // máquina de estado calibra o runtime; Hermes executa

const BASE = dirname(dirname(fileURLToPath(import.meta.url))); // /root/CentralDark/apps/modulos/HERMES-CORE
const PENDENTE  = `${BASE}/missions/pendente`;
const LEGACY_PENDENTE = '/root/CentralDark/missoes/pendente'; // compat: produtores antigos convergem no mesmo Core
const ANDAMENTO = `${BASE}/missions/em-andamento`;
const CONCLUIDA = `${BASE}/missions/concluidas`;
const NOTIFY    = `${BASE}/utils/notify.mjs`;
const INTERVAL  = 5000;
const MAX_FALHAS = 3;
const RUNTIME_CALIBRATION_INTERVAL = Number(process.env.CENTRALDARK_RUNTIME_CALIBRATION_INTERVAL_MS || 60_000);

async function garantirRuntimeDirs() {
  await mkdir(PENDENTE, { recursive: true });
  await mkdir(ANDAMENTO, { recursive: true });
  await mkdir(CONCLUIDA, { recursive: true });
}

let ocupado = false; // trava: nunca rodar duas missões ao mesmo tempo
let calibracaoRuntimeEmCurso = false;

const log = (...a) => console.log(`[${new Date().toISOString()}]`, ...a);

async function calibrarRuntimeInterno() {
  if (calibracaoRuntimeEmCurso) return;
  calibracaoRuntimeEmCurso = true;
  try {
    // Mission directories are runtime state and may disappear after boot.
    // Recreate them before a calibration sidecar is enqueued.
    await garantirRuntimeDirs();
    const estado = await calibrateRuntime();
    log(`[calibracao] verdict=${estado.verdict} wounds=${estado.wound_count} streak=${estado.streak} reward=${estado.reward}`);

    const headSha = await new Promise((resolve, reject) => {
      exec("git -C /root/CentralDark rev-parse HEAD", { timeout: 10_000 }, (error, stdout, stderr) => {
        if (error) return reject(new Error(String(stderr || error.message).trim()));
        resolve(String(stdout || "").trim());
      });
    });
    const missao = buildCalibrationMission(estado, { headSha });
    if (!missao) return;
    if (!missao.continuity_state) throw new Error("CALIBRATION_CONTINUITY_STATE_MISSING");

    const destino = join(PENDENTE, missao.filename);
    const sidecar = destino + '.state.json';
    try {
      // Sidecar primeiro e .md por último: o dispatcher nunca enxerga missão sem contrato.
      await writeFile(sidecar, JSON.stringify(missao.continuity_state, null, 2) + '\n', {
        encoding: 'utf8',
        mode: 0o600,
        flag: 'wx',
      });
      await writeFile(destino, missao.content, { encoding: 'utf8', mode: 0o600, flag: 'wx' });
      await markCalibrationEnqueued(estado, destino);
      log(`[calibracao] missão interna enfileirada ${destino} com continuity sidecar`);
    } catch (error) {
      if (error?.code !== 'EEXIST') throw error;
      log(`[calibracao] missão equivalente já pendente ${destino}`);
    }
  } catch (error) {
    log(`[calibracao] erro sem mascarar loop: ${String(error?.message || error).slice(0, 220)}`);
  } finally {
    calibracaoRuntimeEmCurso = false;
  }
}

const LEARNING_ALWAYS_TOOLS = new Set(['git', 'escrever_arquivo', 'handler']);
const LEARNING_SKIP_TOOLS = new Set(['ler_arquivo', 'darkai', 'notificar_progresso', 'aprender']);
const LEARNING_MATERIAL_SIGNAL = /\b(PASS|FAIL|BLOCKED|VERIFIED|ROOT_CAUSE|MISMATCH|HEALTH|DEPLOY|FIXED|REGRESSION|ERROR|ERRO|FALHA|CAUSA|CORRIG|REMEDI|RECOVER)\b/i;

function compactarAprendizado(value, max = 260) {
  return String(value ?? '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, max);
}

function deveCapturarAprendizadoMaterial(ferramenta, resultado) {
  if (!resultado?.ok) return false;
  if (LEARNING_SKIP_TOOLS.has(ferramenta)) return false;
  if (LEARNING_ALWAYS_TOOLS.has(ferramenta)) return true;
  return ferramenta === 'shell' && LEARNING_MATERIAL_SIGNAL.test(String(resultado?.saida || ''));
}

function registrarAprendizadoMaterial({ slug, etapa_titulo, ferramenta, resultado }) {
  if (!deveCapturarAprendizadoMaterial(ferramenta, resultado)) return null;

  const contexto = `missao=${compactarAprendizado(slug, 80)}; etapa=${compactarAprendizado(etapa_titulo, 120)}; ferramenta=${compactarAprendizado(ferramenta, 40)}`;
  const acao = compactarAprendizado(resultado?.saida || 'etapa material aprovada', 260);
  const registro = registrarAprendizado(
    'runtime',
    contexto,
    'ETAPA_MATERIAL_APROVADA_PELO_CRITIC',
    acao,
    'HERMES_CORE_CRITIC'
  );
  return {
    ref: registro?.ref || null,
    persisted: registro?.written === true || registro?.deduped === true,
    deduped: registro?.deduped === true,
  };
}

// ── Rastreio de ENOTEMPTY (janela deslizante) — alimenta o /health ──
// Cada vez que um rename bate ENOTEMPTY, guardamos o timestamp. O /health conta
// quantos ocorreram nas últimas 24h. Se ficar > 0 por muito tempo, é sinal de FS problemático.
const enotemptyEvents = []; // timestamps ms
function registrarEnotempty(tag) {
  const now = Date.now();
  enotemptyEvents.push(now);
  const corte = now - 48 * 3600_000; // poda > 48h pra não crescer sem limite
  while (enotemptyEvents.length && enotemptyEvents[0] < corte) enotemptyEvents.shift();
  log('[enotempty] capturado (' + (tag || '') + ') — 24h agora=' + enotempty24h());
}
function enotempty24h() {
  const corte = Date.now() - 24 * 3600_000;
  return enotemptyEvents.filter(t => t >= corte).length;
}

async function notificar(titulo, mensagem, destino = 'ambos') {
  try {
    await new Promise((res, rej) => {
      exec(`node '${NOTIFY}' '${titulo.replace(/'/g,"'\\''")}' '${mensagem.replace(/'/g,"'\\''")}' '${destino}'`,
        { timeout: 30_000 }, (err) => err ? rej(err) : res());
    });
  } catch (e) { log('notify falhou:', e.message.slice(0,150)); }
}

function slugify(s) {
  return s.toLowerCase().replace(/[^\w-]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || `m-${Date.now()}`;
}

async function pegarProximaMissao() {
  // REUSE_BEFORE_CREATE: um único executor; aceita a fila canônica e a fila legada
  // somente como portas de entrada. Toda execução converge para HERMES-CORE.
  for (const inbox of [PENDENTE, LEGACY_PENDENTE]) {
    if (!existsSync(inbox)) continue;
    const files = (await readdir(inbox)).filter(f => f.endsWith('.md')).sort();
    if (files[0]) return join(inbox, files[0]);
  }
  return null;
}

async function executarMissao(arquivoPendente) {
  const nome = arquivoPendente.split('/').pop().replace('.md', '');
  const slug = slugify(nome);
  const dir = join(ANDAMENTO, slug);

  const missao = (await readFile(arquivoPendente, 'utf8')).trim();
  const sidecar = arquivoPendente + '.state.json';
  if (!existsSync(sidecar)) {
    await registrarRetomadaBloqueada({
      mission: nome, source: sidecar,
      receiptPath: `${arquivoPendente}.blocked.json`,
      validation: validateContinuityState(null),
    });
    return; // manter a missao pendente intacta ate chegar seu sidecar
  }
  let continuityState = {};
  if (existsSync(sidecar)) {
    try { continuityState = JSON.parse(await readFile(sidecar, 'utf8')); }
    catch {
      await registrarRetomadaBloqueada({
        mission: nome, source: sidecar,
        receiptPath: `${arquivoPendente}.blocked.json`,
        validation: { head_sha: null, reasons: ['INVALID_STATE_JSON'] },
      });
      return;
    }
    const validation = validateContinuityState(continuityState);
    if (!validation.ok) {
      await registrarRetomadaBloqueada({
        mission: nome, source: sidecar,
        receiptPath: `${arquivoPendente}.blocked.json`, validation,
      });
      return;
    }
  }

  await mkdir(dir, { recursive: true });
  const movingMission = join(dir, 'missao.md');
  const movingState = join(dir, 'state.json');
  if (existsSync(movingMission) || existsSync(movingState)) {
    throw new Error('BLOCKED: destino de missao ja existe; preservar estado anterior');
  }
  const rr = await renameComRetry(arquivoPendente, movingMission, 'pend->and');
  if (!rr.ok) throw new Error('mover pendente falhou: ' + rr.error);
  try {
    const rrState = await renameComRetry(sidecar, movingState, 'pend-state->and');
    if (!rrState.ok) throw new Error('mover continuity sidecar falhou: ' + rrState.error);
  } catch (error) {
    // Rollback estritamente local e somente quando origem ausente.
    if (!existsSync(arquivoPendente) && existsSync(movingMission)) {
      try { await renameComRetry(movingMission, arquivoPendente, 'rollback-pend'); }
      catch (rollbackError) {
        throw new AggregateError([error, rollbackError], 'MOVE_SIDECAR_AND_ROLLBACK_FAILED');
      }
    }
    throw error;
  }

  await notificar(
    `Hermes: nova missão`,
    `🚀 <b>${slug}</b>\n\n<i>${missao.slice(0, 400)}</i>\n\nProgresso será postado a cada etapa.`
  );

  await rodarMissao(dir, slug, missao, [], 0, continuityState);
}

// 🔄 Missões órfãs: daemon caiu/reiniciou no meio — continua da etapa onde parou usando o state.json
// Agora aceita tanto pasta com missao.md quanto arquivo .json solto em missions/em-andamento/
// === renameComRetry: rename À PROVA DE BALAS (lógica em utils/fs-safe.mjs, testável isolada) ===
// Wrapper fino que injeta o logger do Core + o contador de ENOTEMPTY do /health.
function renameComRetry(src, dst, tag) {
  return renameComRetryUtil(src, dst, {}, { log, onEnotempty: registrarEnotempty, tag });
}

async function registrarRetomadaBloqueada({ mission, source, receiptPath, validation }) {
  const receipt = continuityBlockReceipt({ mission, source, validation });
  const serialized = `${JSON.stringify(receipt, null, 2)}\n`;
  const anterior = await readFile(receiptPath, 'utf8').catch(() => '');
  if (anterior === serialized) return false;

  await writeFile(receiptPath, serialized, { encoding: 'utf8', mode: 0o600 });
  const reasons = receipt.reasons.join(',');
  log(`⛔ RETOMADA BLOCKED: ${mission} — ${reasons}`);
  await notificar(
    'Hermes: RETOMADA BLOQUEADA ⛔',
    `⛔ <b>${mission}</b>\nLOCAL: <code>${source}</code>\nFALHA: ${reasons.slice(0, 500)}\nAÇÃO: corrigir o contrato no mesmo HEAD antes de DECIDE/APPLY.`,
    'admin'
  );
  return true;
}

async function retomarOrfas() {
  if (!existsSync(ANDAMENTO)) return;
  const orfas = [];
  for (const nome of await readdir(ANDAMENTO)) {
    const dir = join(ANDAMENTO, nome);
    const statEntry = await stat(dir).catch(() => null);
    if (!statEntry) continue;

    if (statEntry.isDirectory()) {
      // Pasta com missao.md dentro
      if (!existsSync(join(dir, 'missao.md'))) continue;
      orfas.push({ dir, nome, mtime: statEntry.mtimeMs, tipo: 'pasta' });
    } else if (statEntry.isFile() && nome.endsWith('.json') && !nome.endsWith('.blocked.json')) {
      // Arquivo .json solto — missão órfã em formato JSON
      orfas.push({ dir, nome, mtime: statEntry.mtimeMs, tipo: 'json' });
    }
  }
  orfas.sort((a, b) => a.mtime - b.mtime);

  for (const entry of orfas) {
    resetWatchdog(); // retomar várias órfãs em sequência é trabalho legítimo — não deixar o watchdog interromper
    const { dir, nome, tipo } = entry;

    if (tipo === 'json') {
      // .json solto — valida antes de criar pasta, mover ou decidir
      try {
        const conteudo = JSON.parse(await readFile(dir, 'utf8'));
        const estadoContinuidade = conteudo.state || null;
        const validation = validateContinuityState(estadoContinuidade);
        if (!validation.ok) {
          await registrarRetomadaBloqueada({
            mission: nome,
            source: dir,
            receiptPath: `${dir}.blocked.json`,
            validation,
          });
          continue;
        }

        if (conteudo.state?.terminal_state === 'BLOCKED') {
          log(`⏸️ RETOMADA BLOQUEADA: ${nome} — requer novo delta/autorização para sair de BLOCKED`);
          continue;
        }
        const slug = slugify(conteudo.titulo || nome.replace('.json', ''));
        const pasta = join(ANDAMENTO, slug);
        await mkdir(pasta, { recursive: true });
        await writeFile(join(pasta, 'missao.md'), conteudo.missao || conteudo.descricao || '');
        await writeFile(join(pasta, 'state.json'), JSON.stringify(estadoContinuidade, null, 2));
        await renameComRetry(dir, join(pasta, `original-${nome}`), 'orfa-json-original');

        let missao = (conteudo.missao || conteudo.descricao || '').trim();
        const historico = Array.isArray(estadoContinuidade.historico) ? estadoContinuidade.historico : [];
        let retomadas = estadoContinuidade.retomadas || 0;
        if (!missao) { try { missao = (await readFile(join(pasta, 'missao.md'), 'utf8')).trim(); } catch { continue; } }
        retomadas++;
        log(`🔄 RETOMADA (.json): ${slug} — continuando da etapa ${historico.length} (retomada #${retomadas})`);
        await notificar('Hermes: RETOMADA 🔄', `🔄 <b>${slug}</b>\nMissão órfã (.json) — continuando da etapa ${historico.length} (retomada #${retomadas}).`);
        await rodarMissao(pasta, slug, missao, historico, retomadas, estadoContinuidade);
      } catch (e) { log(`erro ao processar .json órfão ${nome}: ${e.message}`); }
      continue;
    }

    // Pasta com missao.md: state.json ausente/corrompido bloqueia; não cai para execução cega.
    let estadoContinuidade = null;
    try {
      estadoContinuidade = JSON.parse(await readFile(join(dir, 'state.json'), 'utf8'));
    } catch {}
    const validation = validateContinuityState(estadoContinuidade);
    if (!validation.ok) {
      await registrarRetomadaBloqueada({
        mission: nome,
        source: join(dir, 'state.json'),
        receiptPath: join(dir, 'retomada-blocked.json'),
        validation,
      });
      continue;
    }

    if (estadoContinuidade.terminal_state === 'BLOCKED') {
      log(`⏸️ RETOMADA BLOQUEADA: ${nome} — estado terminal BLOCKED preservado`);
      continue;
    }

    let missao = (estadoContinuidade.missao || '').trim();
    const historico = Array.isArray(estadoContinuidade.historico) ? estadoContinuidade.historico : [];
    let retomadas = estadoContinuidade.retomadas || 0;
    if (!missao) {
      try { missao = (await readFile(join(dir, 'missao.md'), 'utf8')).trim(); } catch { continue; }
    }
    retomadas++;
    log(`🔄 RETOMADA: ${nome} — continuando da etapa ${historico.length} (retomada #${retomadas})`);
    await notificar(
      'Hermes: RETOMADA 🔄',
      `🔄 <b>${nome}</b>\nContrato de continuidade validado — continuando da etapa ${historico.length} (retomada #${retomadas}). Nada foi re-executado.`
    );
    await rodarMissao(dir, nome, missao, historico, retomadas, estadoContinuidade);
  }
}

// Persist the same Goal's live cursor without replacing its validated T0 contract.
// Only action-result metadata from the existing Hermes decider is carried forward.
function stitchGoalCursor(existing, decisao) {
  const cursor = decisao?.continuity ?? decisao?.args?.continuity;
  if (!cursor || typeof cursor !== 'object' || Array.isArray(cursor)) return existing;
  const delta = {};
  for (const field of ['next_cursor', 'next_readonly_probe', 'open_work',
    'recoverable_unknown', 'recoverable_fail', 'oracle_uncertainty',
    'writer_conflict', 'reality_judge']) {
    if (Object.hasOwn(cursor, field)) delta[field] = cursor[field];
  }
  return { ...existing, ...delta };
}

async function rodarMissao(dir, slug, missao, historico = [], retomadas = 0, continuityState = {}) {
  const logPath = join(dir, 'hermes.log');
  const statePath = join(dir, 'state.json');
  const finalReceiptPath = join(dir, 'finalization-receipt.json');
  const lg = (msg) => appendFile(logPath, `[${new Date().toISOString()}] ${msg}\n`).catch(()=>{});

  await lg(historico.length
    ? `🔄 retomando missão: ${slug} (etapa ${historico.length}, retomada #${retomadas})`
    : `🚀 iniciando missão: ${slug}`);

  let falhasSeguidas = 0;
  let etapa = historico.length;
  let terminalState = 'RUNNING';
  let terminalReason = null;
  let finalMessage = null;
  let lastFinalizationFingerprint = null;
  let repeatedFinalizationWithoutProgress = 0;

  while (true) {
    etapa++;
    resetWatchdog(); // missão em andamento é loop VIVO — não deixar o watchdog matar durante trabalho legítimo
    let decisao;
    try {
      decisao = await decidir(missao, historico, continuityState);
      await lg(`etapa ${etapa} decisão: ${JSON.stringify(decisao).slice(0, 300)}`);
    } catch (e) {
      await lg(`❌ decisor falhou: ${e.message}`);
      await notificar(`Hermes: decisor falhou`, `❌ etapa ${etapa}\n${e.message.slice(0,300)}`);
      falhasSeguidas++;
      if (falhasSeguidas >= MAX_FALHAS) {
        terminalState = 'BLOCKED';
        terminalReason = 'MAX_FALHAS_DECISOR';
        registrarFalha();
        break;
      }
      await new Promise(r => setTimeout(r, 10_000));
      continue;
    }

    const { etapa_titulo, ferramenta, args = {}, terminou } = decisao;
    continuityState = stitchGoalCursor(continuityState, decisao);

    if (terminou) {
      let finalizacao;
      let gateDisponivel = true;
      try {
        finalizacao = auditarFinalizacao({ missao, decisao, historico });
      } catch (e) {
        gateDisponivel = false;
        finalizacao = {
          aprovado: false,
          parecer: `gate final indisponível: ${String(e.message || e).slice(0, 180)}`,
          receipt: {
            schema_version: 1,
            gate: 'HERMES_FINALIZATION_CRITIC',
            status: 'BLOCKED',
            problems: [`gate final indisponível: ${String(e.message || e).slice(0, 180)}`],
          },
        };
      }

      await writeFile(finalReceiptPath, `${JSON.stringify(finalizacao.receipt, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });

      if (!gateDisponivel) {
        const bloqueio = String(finalizacao.parecer || 'gate final indisponível').slice(0, 500);
        terminalState = 'BLOCKED';
        terminalReason = 'FINALIZATION_GATE_UNAVAILABLE';
        await lg(`⛔ gate final indisponível na etapa ${etapa}: ${bloqueio}`);
        historico.push({
          etapa_titulo: 'Gate final indisponível',
          ferramenta: 'finalization_gate',
          args: { proposta: ferramenta },
          resultado: bloqueio,
          ok: false,
          critic: bloqueio,
        });
        await writeFile(statePath, JSON.stringify({ ...continuityState, missao, historico, retomadas, terminal_state: terminalState, terminal_reason: terminalReason }, null, 2));
        registrarEtapa(false);
        registrarFalha();
        await notificar(
          'Hermes: conclusão BLOQUEADA ⛔',
          `⛔ <b>${slug}</b>\nO gate final está indisponível. Fail-closed aplicado.\n\n<pre>${bloqueio.replace(/</g,'&lt;')}</pre>\n\nA missão permanece bloqueada em em-andamento; nenhum verde foi emitido.`,
          'admin'
        );
        break;
      }

      if (!finalizacao.aprovado) {
        const bloqueio = String(finalizacao.parecer || 'prova insuficiente').slice(0, 500);
        // Repeated identical refusal is not information gain. Do not loop endlessly.
        const fingerprint = JSON.stringify({
          gate: finalizacao.receipt?.problems || bloqueio,
          cursor: continuityState.next_cursor || '',
          probe: continuityState.next_readonly_probe || '',
          ferramenta,
        });
        repeatedFinalizationWithoutProgress = fingerprint === lastFinalizationFingerprint
          ? repeatedFinalizationWithoutProgress + 1 : 0;
        lastFinalizationFingerprint = fingerprint;
        if (repeatedFinalizationWithoutProgress >= 1) {
          terminalState = 'BLOCKED';
          terminalReason = 'REPEATED_FINALIZATION_NO_PROGRESS';
          await writeFile(statePath, JSON.stringify({
            ...continuityState, missao, historico, retomadas,
            terminal_state: terminalState, terminal_reason: terminalReason,
          }, null, 2));
          await lg('⛔ fingerprint de finalização repetido; preserving Goal/cursor sem retry cego');
          await notificar('Hermes: revisão causal necessária',
            `⛔ <b>${slug}</b>\\nFinalization sem nova evidência. Cursor preservado; exigir outra rota/receita.`,
            'admin');
          break;
        }
        await lg(`⛔ conclusão bloqueada na etapa ${etapa}: ${bloqueio}`);
        historico.push({
          etapa_titulo: 'Gate final de conclusão',
          ferramenta: 'finalization_gate',
          args: { proposta: ferramenta },
          resultado: bloqueio,
          ok: false,
          critic: bloqueio,
        });
        await writeFile(statePath, JSON.stringify({ ...continuityState, missao, historico, retomadas, terminal_state: 'RUNNING', terminal_reason: 'FINALIZATION_GATE_BLOCKED' }, null, 2));
        registrarEtapa(false);
        await notificar(
          'Hermes: conclusão BLOQUEADA ⛔',
          `⛔ <b>${slug}</b>\nO decisor propôs terminar, mas o gate final reprovou.\n\n<pre>${bloqueio.replace(/</g,'&lt;')}</pre>\n\nA missão continua para produzir a prova faltante.`,
          'admin'
        );
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }

      await lg(`🏁 proposta de conclusão aprovada na etapa ${etapa} — finalization gate PASS`);
      terminalState = 'CONCLUIDA';
      terminalReason = 'FINALIZATION_GATE_PASS';
      finalMessage = String(decisao.args?.mensagem || decisao.pensamento || 'concluído').slice(0, 800);
      break;
    }

    // ── Delegação: Critic veta ANTES (área protegida) → Executor roda ──
    const veto = vetar(ferramenta, args);
    const resultado = veto ? { ok: false, saida: veto } : await executar(ferramenta, args);
    await lg(`etapa ${etapa} resultado ok=${resultado.ok}: ${resultado.saida.slice(0, 200)}`);

    // ── Delegação: Critic audita o resultado. Falha/reprovação agora é fail-closed. ──
    let parecer = null;
    try {
      parecer = await auditar({ etapa_titulo, ferramenta, args }, resultado, historico);
      if (parecer && !parecer.aprovado) await lg(`🧐 critic reprovou: ${parecer.parecer.slice(0, 200)}`);
    } catch (e) {
      parecer = { aprovado: false, parecer: `critic indisponível: ${String(e.message || e).slice(0, 160)}` };
      await lg(`critic falhou (fail-closed): ${parecer.parecer}`);
    }

    const etapaAprovada = resultadoAprovadoPeloCritic(resultado, parecer);
    const entrada = { etapa_titulo, ferramenta, args, resultado: resultado.saida, ok: etapaAprovada };
    if (parecer && !parecer.aprovado) entrada.critic = parecer.parecer.slice(0, 300);

    // Aprendizado contínuo: etapa material aprovada alimenta o core AGORA.
    // FIXED_POINT é checkpoint de verificação, não gate para capacitação do Hermes.
    if (etapaAprovada) {
      try {
        const aprendizagem = registrarAprendizadoMaterial({ slug, etapa_titulo, ferramenta, resultado });
        if (aprendizagem?.ref) {
          entrada.learning_ref = aprendizagem.ref;
          entrada.learning_persisted = aprendizagem.persisted === true;
          entrada.learning_deduped = aprendizagem.deduped === true;
          await lg(`🧠 aprendizado contínuo learning_ref=${aprendizagem.ref} persisted=${aprendizagem.persisted}`);
        }
      } catch (e) {
        entrada.learning_error = String(e?.message || e).slice(0, 220);
        await lg(`⚠️ aprendizado contínuo falhou sem mascarar a etapa: ${entrada.learning_error}`);
      }
    }

    historico.push(entrada);
    // Any new executed action changes the causal cone; a previous finalization
    // fingerprint cannot classify this new evidence as an identical blind retry.
    lastFinalizationFingerprint = null;
    repeatedFinalizationWithoutProgress = 0;
    const runningState = {
      ...continuityState,
      missao,
      historico,
      retomadas,
      terminal_state: 'RUNNING',
      terminal_reason: null,
    };
    await writeFile(statePath, JSON.stringify(runningState, null, 2));
    registrarEtapa(etapaAprovada);

    const emoji = etapaAprovada ? '✅' : '⚠️';
    const blocoCritic = parecer && !parecer.aprovado ? `\n\n🧐 <b>Critic:</b> ${parecer.parecer.slice(0, 200)}` : '';
    await notificar(
      `Hermes: etapa ${etapa}`,
      `${emoji} <b>${etapa_titulo}</b>\n<code>${ferramenta}</code>\n\n<pre>${(resultado.saida || '').slice(0, 700).replace(/</g,'&lt;')}</pre>${blocoCritic}`,
      'admin'
    );

    if (!etapaAprovada) {
      falhasSeguidas++;
      if (falhasSeguidas >= MAX_FALHAS) {
        terminalState = 'BLOCKED';
        terminalReason = 'MAX_FALHAS_EXECUTOR_OR_CRITIC';
        await lg(`🔴 pausando após ${MAX_FALHAS} falhas/reprovações seguidas`);
        registrarFalha();
        await notificar(
          `Hermes: PAUSEI 🔴`,
          `❌ <b>${slug}</b>\n${MAX_FALHAS} falhas/reprovações seguidas na etapa ${etapa}.\nÚltimo resultado:\n<pre>${String(resultado.saida || parecer?.parecer || '').slice(0,500).replace(/</g,'&lt;')}</pre>`
        );
        break;
      }
    } else {
      falhasSeguidas = 0;
    }

    await new Promise(r => setTimeout(r, 2000));
  }

  await writeFile(statePath, JSON.stringify({ ...continuityState, missao, historico, retomadas, terminal_state: terminalState, terminal_reason: terminalReason }, null, 2));

  if (terminalState !== 'CONCLUIDA') {
    await lg(`⏸️ missão permanece em-andamento: state=${terminalState} reason=${terminalReason || 'UNKNOWN'}`);
    return { ok: false, state: terminalState, reason: terminalReason };
  }

  const movida = await moverMissaoParaConcluida(dir, slug, lg);
  if (!movida.ok) {
    terminalState = 'BLOCKED';
    terminalReason = `MOVE_CONCLUIDAS_FAILED:${movida.reason || 'UNKNOWN'}`;
    registrarFalha();
    await writeFile(statePath, JSON.stringify({ ...continuityState, missao, historico, retomadas, terminal_state: terminalState, terminal_reason: terminalReason }, null, 2)).catch(() => {});
    await notificar(
      'Hermes: conclusão BLOQUEADA ⛔',
      `⛔ <b>${slug}</b>\nGate final passou, mas a promoção física para concluídas falhou.\nMotivo: <code>${String(movida.reason || 'UNKNOWN').replace(/</g,'&lt;')}</code>\nNenhum verde final foi emitido.`,
      'admin'
    );
    return { ok: false, state: terminalState, reason: terminalReason };
  }

  registrarConclusao();
  await writeFile(
    join(movida.path, 'state.json'),
    JSON.stringify({ ...continuityState, missao, historico, retomadas, terminal_state: 'CONCLUIDA', terminal_reason: terminalReason }, null, 2)
  ).catch(() => {});
  await notificar(
    `Hermes: MISSÃO CONCLUÍDA 🎉`,
    `✅ <b>${slug}</b>\n\n${finalMessage || 'concluído'}\n\nGate final: PASS\nTotal: ${etapa-1} etapas`
  );
  return { ok: true, state: 'CONCLUIDA', path: movida.path };
}

// ═══════════════════════════════════════════════════════════════
// Mover missão para concluída — com retry + backoff + jitter
// ═══════════════════════════════════════════════════════════════
async function moverMissaoParaConcluida(missaoPath, nomeMissao, lg) {
  const MAX_TENTATIVAS = 30;
  const BASE_DELAY_MS = 400;
  const MAX_DELAY_MS = 8000;
  const hoje = new Date().toISOString().slice(0,10);
  const CONCLUIDAS_DIR = join(CONCLUIDA, hoje);
  let destino = join(CONCLUIDAS_DIR, nomeMissao);

  try {
    await mkdir(CONCLUIDAS_DIR, { recursive: true });

    // Resolve colisão
    try {
      await access(destino);
      const ext = extname(nomeMissao);
      const base = basename(nomeMissao, ext);
      destino = join(CONCLUIDAS_DIR, `${base}_${Date.now()}_${randomBytes(3).toString('hex')}${ext}`);
      await lg(`⚠️ Colisão resolvida → ${basename(destino)}`);
    } catch {}

    for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
      try {
        const rmv = await renameComRetry(missaoPath, destino, 'conc');
        if (!rmv.ok) throw Object.assign(new Error(rmv.error || 'renameComRetry falhou'), { code: rmv.reason || 'UNKNOWN' });
        await lg(`✅ Missão movida: ${nomeMissao}`);
        return { ok: true, path: destino };
      } catch (err) {
        if (err.code === 'EXDEV') {
          await cp(missaoPath, destino, { recursive: true, errorOnExist: true });
          await rm(missaoPath, { recursive: true, force: true });
          await lg(`✅ Missão movida (cross-device): ${nomeMissao}`);
          return { ok: true, path: destino, crossDevice: true };
        }

        const transitorio = ['EBUSY', 'EMFILE', 'ENFILE', 'EAGAIN', 'EPERM', 'ENOTEMPTY'].includes(err.code);

        if (!transitorio || tentativa === MAX_TENTATIVAS) {
          await lg(`❌ Falha [${err.code}] em ${nomeMissao}: ${err.message}`);
          return { ok: false, reason: err.code, error: err.message, path: missaoPath };
        }

        // Backoff exponencial + jitter 80%-120%
        let delay = Math.min(BASE_DELAY_MS * 2 ** (tentativa - 1), MAX_DELAY_MS);
        delay = Math.round(delay * (0.8 + Math.random() * 0.4));
        if (tentativa === 1) delay = 250; // delay inicial pequeno

        await lg(`⚠️ Tentativa ${tentativa}/${MAX_TENTATIVAS} [${err.code}] — aguardando ${delay}ms`);
        await new Promise(r => setTimeout(r, delay));
      }
    }

    await lg(`❌ Falha: excedeu ${MAX_TENTATIVAS} tentativas para ${nomeMissao}`);
    return { ok: false, reason: 'MAX_TENTATIVAS', path: missaoPath };
  } catch (err) {
    await lg(`❌ Erro fatal ao mover ${nomeMissao}: ${err.message}`);
    return { ok: false, reason: err.code || 'UNKNOWN', error: err.message, path: missaoPath };
  }
}

// ═══════════════════════════════════════════════════════════════
// WATCHDOG — auto-recuperação: detecta travamento e reinicia
// ═══════════════════════════════════════════════════════════════
const WATCHDOG_TIMEOUT = 120_000; // 2min sem heartbeat = travado
let ultimoHeartbeat = Date.now();
let watchdogTimer = null;
let watchdogAtivo = false;
let watchdogResets = 0; // quantas vezes o watchdog forçou restart (process.exit 42)

let ultimoLogHeartbeat = 0;
function resetWatchdog() {
  ultimoHeartbeat = Date.now();
  if (Date.now() - ultimoLogHeartbeat > 60000) {
    ultimoLogHeartbeat = Date.now();
    log('[watchdog] HEARTBEAT resetWatchdog() chamado - loop vivo');
  }
}

async function watchdogLoop() {
  watchdogAtivo = true;
  log('[watchdog] INICIADO - timeout ' + (WATCHDOG_TIMEOUT/1000) + 's, check 30s');
  while (true) {
    await new Promise(r => setTimeout(r, 30_000));
    const elapsed = Date.now() - ultimoHeartbeat;
    log('[watchdog] CHECK: ' + Math.round(elapsed/1000) + 's desde ultimo heartbeat');
    if (elapsed > WATCHDOG_TIMEOUT) {
      watchdogResets++;
      log(`💀 WATCHDOG: ${Math.round(elapsed/1000)}s sem heartbeat — reiniciando processo`);
      await notificar('Hermes: WATCHDOG 🔴', `💀 ${Math.round(elapsed/1000)}s sem heartbeat. Reiniciando...`);
      process.exit(42); // PM2 restart com código especial
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// GC — limpeza periódica de lixo (a cada 6h, DELETA de verdade)
// ═══════════════════════════════════════════════════════════════
const GC_INTERVAL     = 6 * 3600_000;  // 6h (pedido do Pivete)
const GC_PHANTOM_AGE  = 3600_000;      // 1h — pasta sem missao.md mais velha que isso = lixo
const GC_JSON_PRESO   = 6 * 3600_000;  // 6h — .json que retomarOrfas não conseguiu processar
const GC_LOG_AGE      = 7 * 86_400_000; // 7 dias — concluídas mais velhas viram history removido
let ultimoGCResumo = { ts: 0, fantasmas: 0, stateOrfaos: 0, logsAntigos: 0, lixoLimpo: 0 };

async function gc() {
  const resumo = { fantasmas: 0, stateOrfaos: 0, logsAntigos: 0, lixoLimpo: 0, detalhes: [] };
  try {
    if (existsSync(ANDAMENTO)) {
      for (const nome of await readdir(ANDAMENTO)) {
        const dir = join(ANDAMENTO, nome);
        const st = await stat(dir).catch(() => null);
        if (!st) continue;

        // (a) Sobras __lixo-* de versões antigas do GC → apaga de vez
        if (nome.startsWith('__lixo-')) {
          await rm(dir, { recursive: true, force: true }).catch(() => {});
          resumo.lixoLimpo++; resumo.detalhes.push('lixo:' + nome);
          continue;
        }

        if (st.isDirectory()) {
          const temMissao = existsSync(join(dir, 'missao.md'));
          const temState  = existsSync(join(dir, 'state.json'));
          // Pasta fantasma / state.json órfão: SEM missao.md o retomarOrfas nunca a retoma
          // (ele exige missao.md). Se está parada > 1h, é lixo garantido → DELETA.
          if (!temMissao && (Date.now() - st.mtimeMs) > GC_PHANTOM_AGE) {
            await rm(dir, { recursive: true, force: true }).catch(() => {});
            if (temState) { resumo.stateOrfaos++; resumo.detalhes.push('state-orfao:' + nome); }
            else          { resumo.fantasmas++;  resumo.detalhes.push('fantasma:' + nome); }
          }
        } else if (st.isFile() && nome.endsWith('.json')) {
          // .json solto: o retomarOrfas tenta processar. Só apaga se ficou preso > 6h.
          if ((Date.now() - st.mtimeMs) > GC_JSON_PRESO) {
            await rm(dir, { force: true }).catch(() => {});
            resumo.stateOrfaos++; resumo.detalhes.push('json-preso:' + nome);
          }
        }
      }
    }

    // Logs / concluídas antigas (> 7 dias) → remove a pasta do dia inteira
    if (existsSync(CONCLUIDA)) {
      for (const data of await readdir(CONCLUIDA)) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) continue;
        const dir = join(CONCLUIDA, data);
        const st = await stat(dir).catch(() => null);
        if (!st || !st.isDirectory()) continue;
        const idade = Date.now() - new Date(data + 'T23:59:59Z').getTime();
        if (idade > GC_LOG_AGE) {
          await rm(dir, { recursive: true, force: true }).catch(() => {});
          resumo.logsAntigos++; resumo.detalhes.push('log-antigo:' + data);
        }
      }
    }

    ultimoGCResumo = { ts: Date.now(), fantasmas: resumo.fantasmas, stateOrfaos: resumo.stateOrfaos, logsAntigos: resumo.logsAntigos, lixoLimpo: resumo.lixoLimpo, detalhes: resumo.detalhes };
    const total = resumo.fantasmas + resumo.stateOrfaos + resumo.logsAntigos + resumo.lixoLimpo;
    if (total > 0) {
      log(`🧹 GC: fantasmas=${resumo.fantasmas} stateOrfaos=${resumo.stateOrfaos} logsAntigos=${resumo.logsAntigos} lixo=${resumo.lixoLimpo}`);
      await notificar('Hermes: GC 🧹', `🧹 Limpeza automática\n${resumo.fantasmas} pasta(s) fantasma\n${resumo.stateOrfaos} state órfão(s)\n${resumo.logsAntigos} log(s) >7d\n${resumo.lixoLimpo} lixo antigo`, 'admin');
    } else {
      log('🧹 GC: nada a limpar');
    }
    return resumo;
  } catch (e) {
    log('gc erro:', e.message);
    return resumo;
  }
}

// ═══════════════════════════════════════════════════════════════
// HEARTBEAT — métricas de saúde do Hermes
// ═══════════════════════════════════════════════════════════════
const HEARTBEAT_INTERVAL = 300_000; // 5min
let metricas = {
  inicio: Date.now(),
  missoesConcluidas: 0,
  missoesFalhas: 0,
  totalEtapas: 0,
  totalFalhasEtapa: 0,
  ultimoHeartbeatEnviado: 0,
};

function registrarConclusao() { metricas.missoesConcluidas++; }
function registrarFalha() { metricas.missoesFalhas++; }
function registrarEtapa(ok) { metricas.totalEtapas++; if (!ok) metricas.totalFalhasEtapa++; }

const RECONCILIATION_RECEIPT = '/root/CentralDark/.artifacts/system-sentinel/reconciliation.json';
let ultimaReconciliacao = null;

async function reconciliarEstadoCanonico() {
  const observadoEm = new Date().toISOString();
  const resultado = {
    schema: 'centraldark.reconciliation.v1',
    observado_em: observadoEm,
    fonte: 'HERMES_CORE_HEARTBEAT',
    status: 'UNKNOWN',
    current: {},
    checklist_diario: {},
    pr_mother_1562: { status: 'UNKNOWN', motivo: 'NAO_MEDIDO' },
    prs_abertos: { status: 'UNKNOWN', motivo: 'NAO_MEDIDO' },
    regra: 'UNKNOWN_NAO_VIRA_PASS',
  };
  try {
    const git = (comando) => new Promise((resolve, reject) => exec(comando, { timeout: 30_000 }, (err, stdout, stderr) => err ? reject(new Error(stderr.trim() || err.message)) : resolve(stdout.trim())));
    const head = await git("git -C /root/CentralDark rev-parse HEAD");
    const main = await git("git -C /root/CentralDark rev-parse origin/main");
    resultado.current = { head, origin_main: main, alinhado: head === main };
    const checklist = '/root/CentralDark/docs/BRAIN/00-MAPA-SISTEMA/CHECK-LIST-DIARIO.md';
    resultado.checklist_diario = { path: checklist, presente: existsSync(checklist) };
    try {
      const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'CentralDark-Hermes-Core' };
      if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
      const response = await fetch('https://api.github.com/repos/ServerVpss/CentralDark/pulls?state=open&per_page=100', { headers });
      if (!response.ok) throw new Error(`HTTP_${response.status}`);
      const prs = await response.json();
      resultado.prs_abertos = { status: 'PASS', total: Array.isArray(prs) ? prs.length : 0, numeros: Array.isArray(prs) ? prs.map(pr => pr.number) : [] };
      const mother = Array.isArray(prs) ? prs.find(pr => pr.number === 1562) : null;
      resultado.pr_mother_1562 = mother ? { status: 'OPEN', title: mother.title, head_sha: mother.head?.sha || null, base: mother.base?.ref || null } : { status: 'NOT_OPEN', motivo: 'NAO_LISTADO_ABERTO' };
    } catch (error) {
      resultado.prs_abertos = { status: 'UNKNOWN', motivo: String(error.message || error) };
      resultado.pr_mother_1562 = { status: 'UNKNOWN', motivo: String(error.message || error) };
    }
    resultado.status = resultado.current.alinhado && resultado.checklist_diario.presente && resultado.prs_abertos.status === 'PASS' ? 'PASS' : 'UNKNOWN';
  } catch (error) {
    resultado.motivo = String(error.message || error);
  }
  await mkdir(dirname(RECONCILIATION_RECEIPT), { recursive: true });
  await writeFile(RECONCILIATION_RECEIPT, JSON.stringify(resultado, null, 2) + '\n', { encoding: 'utf8', mode: 0o600 });
  const assinatura = JSON.stringify({ status: resultado.status, current: resultado.current, prs: resultado.prs_abertos, mother: resultado.pr_mother_1562 });
  if (assinatura !== ultimaReconciliacao) {
    ultimaReconciliacao = assinatura;
    log('[reconciliacao] ' + resultado.status + ' current=' + (resultado.current.alinhado ? 'ALINHADO' : 'DIVERGENTE/UNKNOWN') + ' prs=' + resultado.prs_abertos.status);
  }
  return resultado;
}

async function enviarHeartbeat() {
  const uptime = Math.round((Date.now() - metricas.inicio) / 1000);
  const h = uptime / 3600;
  const reconciliacao = await reconciliarEstadoCanonico();
  const msg = `🟢 <b>Hermes Core</b>\\nUptime: ${h.toFixed(1)}h\\nMissões: ✅ ${metricas.missoesConcluidas} | ❌ ${metricas.missoesFalhas}\\nEtapas: ${metricas.totalEtapas} (${metricas.totalFalhasEtapa} falhas)\\nReconciliação: ${reconciliacao.status}\\nOcupado: ${ocupado ? 'sim' : 'não'}`;
  await notificar('Hermes: heartbeat', msg, 'admin');
  metricas.ultimoHeartbeatEnviado = Date.now();
}

// ═══════════════════════════════════════════════════════════════
// /health — endpoint HTTP de saúde (heartbeat externo)
// GET :8899/health  → JSON com watchdog, missões em andamento, ENOTEMPTY 24h, etc.
// ═══════════════════════════════════════════════════════════════
const HEALTH_PORT = Number(process.env.HERMES_HEALTH_PORT) || 8899;

async function contarEmAndamento() {
  if (!existsSync(ANDAMENTO)) return 0;
  let n = 0;
  for (const nome of await readdir(ANDAMENTO).catch(() => [])) {
    if (existsSync(join(ANDAMENTO, nome, 'missao.md'))) n++;
  }
  return n;
}

async function montarHealth() {
  const agora = Date.now();
  const elapsed = agora - ultimoHeartbeat;
  const saudavel = elapsed < WATCHDOG_TIMEOUT;
  return {
    status: saudavel ? 'ok' : 'degraded',
    servico: 'hermes-core',
    versao: '5.0',
    ts: new Date(agora).toISOString(),
    uptime_s: Math.round((agora - metricas.inicio) / 1000),
    ocupado,
    watchdog: {
      ativo: watchdogAtivo,
      saudavel,
      timeout_s: WATCHDOG_TIMEOUT / 1000,
      segundos_desde_ultimo_reset: Math.round(elapsed / 1000),
      ultimo_reset: new Date(ultimoHeartbeat).toISOString(),
      restarts_forcados: watchdogResets,
    },
    missoes_em_andamento: await contarEmAndamento(),
    enotempty_24h: enotempty24h(),
    enotempty_total_registrado: enotemptyEvents.length,
    metricas: {
      missoes_concluidas: metricas.missoesConcluidas,
      missoes_falhas: metricas.missoesFalhas,
      total_etapas: metricas.totalEtapas,
      total_falhas_etapa: metricas.totalFalhasEtapa,
    },
    gc: {
      intervalo_h: GC_INTERVAL / 3600_000,
      ultimo: ultimoGCResumo.ts ? new Date(ultimoGCResumo.ts).toISOString() : null,
      ultimo_resumo: ultimoGCResumo,
    },
    grafo: {
      intervalo_min: GRAFO_INTERVAL / 60_000,
      ultimo: ultimoGrafoResumo.ts ? new Date(ultimoGrafoResumo.ts).toISOString() : null,
      ok: ultimoGrafoResumo.ok,
      resumo: ultimoGrafoResumo.saida,
    },
    calibracao_runtime: await getCalibrationSummary(),
  };
}

function iniciarHealthServer() {
  const srv = httpCreateServer(async (req, res) => {
    try {
      const url = (req.url || '/').split('?')[0];
      // O Mega Painel é uma capability da MESMA API pública, não outro serviço.
      // /health conserva a semântica Hermes; /status/overview é a projeção rica sanitizada.
      if (req.method === 'GET' && (url === '/status/overview' || url === '/status/details')) {
        const query = new URL(req.url || '/', 'http://localhost');
        const isDetail = url === '/status/details';
        const result = isDetail
          ? await buildStatusDetail(query.searchParams.get('section'))
          : await buildStatusOverview();
        res.writeHead(result ? 200 : 404, {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
          'X-Content-Type-Options': 'nosniff',
          'Access-Control-Allow-Origin': '*',
        });
        res.end(JSON.stringify(result || { ok: false, error: 'UNKNOWN_STATUS_SECTION' }));
        return;
      }
      if (['/health', '/', '/status', '/metrics'].includes(url)) {
        const body = JSON.stringify(await montarHealth(), null, 2);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' });
        res.end(body);
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end('{"error":"not found"}');
      }
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ status: 'error', error: String(e.message || e) }));
    }
  });
  srv.on('error', (e) => {
    log('[health] erro no server: ' + e.message + (e.code === 'EADDRINUSE' ? ' (porta ' + HEALTH_PORT + ' ocupada)' : ''));
  });
  srv.listen(HEALTH_PORT, '0.0.0.0', () => log(`[health] 🩺 /health ouvindo em 0.0.0.0:${HEALTH_PORT}`));
  return srv;
}

// ═══════════════════════════════════════════════════════════════
// LOOP PRINCIPAL
// ═══════════════════════════════════════════════════════════════
const RETOMAR_INTERVALO = 45_000;
const GRAFO_INTERVAL = 30 * 60_000; // 30min — o grafo se atualiza sozinho
let ultimaRetomada = 0;
let ultimoGC = 0;
let ultimoHeartbeatEnvio = 0;
let ultimoGrafo = 0;
let ultimaCalibracaoRuntime = 0;
let ultimoGrafoResumo = { ts: 0, ok: null, saida: null };

async function loop() {
  await garantirRuntimeDirs();
  log('🤖 HERMES CORE v5.0 online — vigiando missions/pendente/');
  await notificar('Hermes Core: ONLINE', '🟢 orquestrador v5.0 vivo, aguardando missões.\n\nEntregue em: <code>missions/pendente/&lt;nome&gt;.md</code>');

  // Dispara watchdog em background
  watchdogLoop();

  // Sobe o endpoint /health (heartbeat externo)
  iniciarHealthServer();

  // Antes de tudo: retoma missões que ficaram órfãs no último restart/crash
  ocupado = true;
  try { await retomarOrfas(); ultimaRetomada = Date.now(); }
  catch (e) {
    log('erro na retomada:', e.message);
    await notificar('Hermes: erro retomada', `⚠️ ${e.message.slice(0,300)}`);
  }
  finally { ocupado = false; }

  while (true) {
    try {
      if (!ocupado) {
        // Watchdog: marca que o loop está vivo
        resetWatchdog();

        // Varre órfãs a cada RETOMAR_INTERVALO
        if (Date.now() - ultimaRetomada >= RETOMAR_INTERVALO) {
          ultimaRetomada = Date.now();
          try { await retomarOrfas(); }
          catch (e) { log('erro na retomada periódica:', e.message); }
        }

        // Calibração interna do runtime: duas leituras iguais fecham falso-verde.
        // A IA local sugere; Hermes/Executor/Critic executam; Reality Judge fecha.
        if (Date.now() - ultimaCalibracaoRuntime >= RUNTIME_CALIBRATION_INTERVAL) {
          ultimaCalibracaoRuntime = Date.now();
          calibrarRuntimeInterno(); // fire-and-forget; não bloqueia watchdog/loop
        }

        // GC periódico
        if (Date.now() - ultimoGC >= GC_INTERVAL) {
          ultimoGC = Date.now();
          gc(); // fire-and-forget
        }

        // Grafo se atualiza sozinho (fire-and-forget)
        if (Date.now() - ultimoGrafo >= GRAFO_INTERVAL) {
          ultimoGrafo = Date.now();
          atualizarGrafo()
            .then(r => { ultimoGrafoResumo = { ts: Date.now(), ok: r.ok, saida: r.saida }; log('🕸️ grafo auto-update: ' + r.saida); })
            .catch(e => log('grafo auto-update erro: ' + e.message));
        }

        // Heartbeat periódico
        if (Date.now() - ultimoHeartbeatEnvio >= HEARTBEAT_INTERVAL) {
          ultimoHeartbeatEnvio = Date.now();
          enviarHeartbeat(); // fire-and-forget
        }

        const proxima = await pegarProximaMissao();
        if (proxima) {
          ocupado = true;
          log('nova missão:', proxima);
          try { await executarMissao(proxima); } finally { ocupado = false; }
        }
      }
    } catch (e) {
      ocupado = false;
      log('erro no loop:', e.message);
      await notificar('Hermes: erro loop', `⚠️ ${e.message.slice(0,300)}`);
    }
    await new Promise(r => setTimeout(r, INTERVAL));
  }
}

loop().catch(async e => {
  await notificar('Hermes: CRASH', `💥 ${e.message}`);
  process.exit(1);
});
