#!/usr/bin/env node
/**
 * Bridge VPS: /tmp/grok_request.json -> Grok CLI real -> /tmp/grok_response.json
 *
 * MOTOR PRINCIPAL: grok CLI (/root/.grok/bin/grok) — TERMINAL DE VERDADE.
 *   - --always-approve  => executa comando na VPS de verdade (o que o Pivete pediu)
 *   - --experimental-memory => salva em memoria propria, nunca perde contexto
 *   - -c (continue)     => continua a mesma conversa (memoria de bate-papo)
 *
 * FALLBACK: TokenRouter (texto puro) — se o grok CLI falhar, degrada em vez de morrer.
 *           Lema do Pivete: nao quebrar nada, so melhorar.
 *
 * O bot @Guardiaonotify_bot nao muda: continua escrevendo request e lendo response.
 */
import fs from 'fs';
import { execFile } from 'child_process';

function loadEnv(p) {
  try {
    for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
      const m = line.trim().match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (!m) continue;
      if (process.env[m[1]] === undefined || process.env[m[1]] === '')
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch {}
}
loadEnv('/root/CentralDark/secrets/telegram-alerts.env');
loadEnv('/root/CentralDark/secrets/.env');

const REQ = '/tmp/grok_request.json';
const RES = '/tmp/grok_response.json';
const POLL = Number(process.env.GROK_TMP_POLL_MS || 800);

// ── Grok CLI (motor principal) ──────────────────────────────────────────
const GROK_BIN = process.env.GROK_BIN || '/root/.grok/bin/grok';
const GROK_CWD = process.env.GROK_CWD || '/root/Grock';
const GROK_MAXTURNS = String(process.env.GROK_MAXTURNS || 24);
const GROK_TIMEOUT = Number(process.env.GROK_TIMEOUT_MS || 165000);

// ── TokenRouter (fallback texto puro) ───────────────────────────────────
const TR_KEY = process.env.TOKENROUTER_API_KEY || process.env.USER_EXTRA_API_KEY || '';
const TR_BASE = (process.env.TOKENROUTER_BASE_URL || 'https://api.tokenrouter.com/v1').replace(/\/$/, '');
const TR_MODEL = process.env.TOKENROUTER_MODEL || 'deepseek/deepseek-v4-pro';

const SIG = '\n\n— 🟣 via Grok terminal (VPS · memoria propria ativa)';

let lastId = '';
let busy = false;

/** Limpa codigos ANSI e ruido de saida do CLI. */
function clean(s) {
  return String(s || '')
    // eslint-disable-next-line no-control-regex
    .replace(/\x1B\[[0-9;?]*[A-Za-z]/g, '')
    // eslint-disable-next-line no-control-regex
    .replace(/\x1B\][^\x07]*\x07/g, '')
    .replace(/\r/g, '')
    .trim();
}

function runGrokOnce(text, useContinue) {
  return new Promise((resolve) => {
    const args = [
      '-p', text,
      '--always-approve',
      '--experimental-memory',
      '--max-turns', GROK_MAXTURNS,
      '--cwd', GROK_CWD,
    ];
    if (useContinue) args.push('-c');
    let done = false;
    const child = execFile(
      GROK_BIN,
      args,
      { cwd: GROK_CWD, timeout: GROK_TIMEOUT, maxBuffer: 4 * 1024 * 1024, env: process.env },
      (err, stdout, stderr) => {
        if (done) return;
        done = true;
        const out = clean(stdout);
        const errTxt = clean(stderr);
        if (err && /No session found/i.test(errTxt)) {
          resolve({ noSession: true, out, err: errTxt });
          return;
        }
        if (err && !out) {
          resolve({ fail: true, out: '', err: errTxt || String(err.message || err) });
          return;
        }
        resolve({ out, err: errTxt });
      },
    );
    child.on('error', (e) => {
      if (done) return;
      done = true;
      resolve({ fail: true, out: '', err: String(e.message || e) });
    });
  });
}

/** Motor principal: grok CLI real. Continua a conversa; 1a msg cria sessao. */
async function askGrokCli(text) {
  // tenta continuar a conversa (memoria de bate-papo)
  let r = await runGrokOnce(text, true);
  if (r.noSession) {
    // primeira mensagem: cria sessao nova (sem -c)
    r = await runGrokOnce(text, false);
  }
  if (r.fail) return null;
  const body = r.out || 'Te ouvi no terminal Grok, mas nao veio texto de volta. Manda de novo em 1 linha.';
  return body + SIG;
}

/** Fallback: TokenRouter texto puro (nao executa comando, so responde). */
async function askTokenRouter(text, history = []) {
  if (!TR_KEY) return 'Canal Grok ativo na VPS, mas o terminal falhou e nao ha TOKENROUTER_API_KEY pro fallback.' + SIG;
  const messages = [
    {
      role: 'system',
      content:
        'Voce e o Grok do Pivete no Telegram @Guardiaonotify_bot. PT-BR, curto, claro, humano. ' +
        'Nunca diga que e Claude. Ajuda com CentralDark, VPS, seguranca.',
    },
    ...history.slice(-10).map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content || '').slice(0, 4000),
    })),
  ];
  if (!messages.some((m) => m.role === 'user' && m.content === text)) {
    messages.push({ role: 'user', content: String(text).slice(0, 8000) });
  }
  const r = await fetch(TR_BASE + '/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TR_KEY}` },
    body: JSON.stringify({ model: TR_MODEL, max_tokens: 1200, messages }),
    signal: AbortSignal.timeout(120000),
  });
  const raw = await r.text();
  let d;
  try { d = JSON.parse(raw); } catch { throw new Error('bad json: ' + raw.slice(0, 120)); }
  if (!r.ok) throw new Error(JSON.stringify(d).slice(0, 200));
  const msg = d.choices?.[0]?.message || {};
  let txt = msg.content || '';
  if (!txt && msg.reasoning_content) txt = String(msg.reasoning_content).slice(0, 500);
  return (String(txt).trim() || 'Te ouvi. Manda de novo em 1 linha.') + SIG + ' (fallback)';
}

async function tick() {
  if (busy) return;
  if (!fs.existsSync(REQ)) return;
  let req;
  try { req = JSON.parse(fs.readFileSync(REQ, 'utf8')); } catch { return; }
  if (!req?.id || !req?.text) return;
  if (req.id === lastId) return;
  // se ja existe response com mesmo id, marca e sai
  try {
    if (fs.existsSync(RES)) {
      const old = JSON.parse(fs.readFileSync(RES, 'utf8'));
      if (old?.id === req.id && old?.reply) { lastId = req.id; return; }
    }
  } catch {}

  busy = true;
  console.log('[grok-tmp] pedido', req.id, String(req.text).slice(0, 80).replace(/\n/g, ' '));
  let reply = null;
  let via = 'grok-cli-terminal';
  try {
    reply = await askGrokCli(String(req.text));
    if (!reply) {
      console.warn('[grok-tmp] grok CLI falhou, caindo pro fallback TokenRouter');
      reply = await askTokenRouter(String(req.text), req.history || []);
      via = 'tokenrouter-fallback';
    }
  } catch (e) {
    console.error('[grok-tmp] erro geral', e.message || e);
    try {
      reply = await askTokenRouter(String(req.text), req.history || []);
      via = 'tokenrouter-fallback';
    } catch (e2) {
      reply = 'Canal Grok na VPS: erro agora (' + String(e2.message || e2).slice(0, 120) + '). Manda de novo.' + SIG;
      via = 'error';
    }
  }
  const payload = { id: req.id, chat_id: req.chat_id, reply, ts: new Date().toISOString(), via };
  fs.writeFileSync(RES, JSON.stringify(payload, null, 2) + '\n', { mode: 0o600 });
  lastId = req.id;
  console.log('[grok-tmp] resposta', req.id, 'via', via, '::', String(reply).slice(0, 60).replace(/\n/g, ' '));
  busy = false;
}

console.log('[grok-tmp] online — motor=grok-cli', GROK_BIN, 'cwd=', GROK_CWD, '| fallback=TokenRouter', TR_MODEL);
setInterval(() => { tick().catch((e) => { console.error('[grok-tmp] tick', e.message); busy = false; }); }, POLL);
tick().catch(() => {});
