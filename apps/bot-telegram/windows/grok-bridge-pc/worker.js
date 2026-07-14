/**
 * E:\grok-bridge\worker.js  — PC Windows 24/7
 *
 * Fluxo:
 *   VPS /tmp/grok_request.json  → (scp) → processa Grok local → scp → VPS /tmp/grok_response.json
 *
 * O bot na VPS NÃO chama API no botão Grok. Só grava/lê /tmp.
 * Claude/Plano na VPS ficam intactos.
 *
 * Env (PowerShell ou .env ao lado):
 *   VPS_HOST=89.xxx.xxx.xxx          (IP ou hostname da VPS)
 *   VPS_USER=root
 *   VPS_SSH_KEY=C:\Users\danda\.ssh\id_ed25519   (opcional)
 *   GROK_BIN=grok                    (CLI local)
 *   GROK_SIGNATURE=...               (assinatura no final)
 *   POLL_MS=1200
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { spawn, execFile } = require('child_process');
const os = require('os');

// ── config ──────────────────────────────────────────────────────────
const VPS_HOST = process.env.VPS_HOST || process.env.CENTRALDARK_VPS || '';
const VPS_USER = process.env.VPS_USER || 'root';
const VPS_KEY = process.env.VPS_SSH_KEY || '';
const VPS_REQ = '/tmp/grok_request.json';
const VPS_RES = '/tmp/grok_response.json';

const LOCAL_DIR = process.env.GROK_LOCAL_DIR || 'C:\\temp';
const REQ_FILE = path.join(LOCAL_DIR, 'grok_request.json');
const RES_FILE = path.join(LOCAL_DIR, 'grok_response.json');

const GROK_BIN = process.env.GROK_BIN || 'grok';
const SIGNATURE =
  process.env.GROK_SIGNATURE ||
  '\n\n— via CentralDark Terminal (PC local)';
const POLL_MS = Number(process.env.POLL_MS || 1200);
const BUSY_LOCK = path.join(LOCAL_DIR, 'grok_bridge.busy');

// ── utils ───────────────────────────────────────────────────────────
function ensureDir() {
  if (!fs.existsSync(LOCAL_DIR)) fs.mkdirSync(LOCAL_DIR, { recursive: true });
}

function sshArgs(remoteCmd) {
  const args = ['-o', 'BatchMode=yes', '-o', 'ConnectTimeout=15', '-o', 'StrictHostKeyChecking=accept-new'];
  if (VPS_KEY) args.push('-i', VPS_KEY);
  args.push(`${VPS_USER}@${VPS_HOST}`, remoteCmd);
  return args;
}

function scpArgs(from, to) {
  const args = ['-o', 'BatchMode=yes', '-o', 'ConnectTimeout=15', '-o', 'StrictHostKeyChecking=accept-new'];
  if (VPS_KEY) args.push('-i', VPS_KEY);
  args.push(from, to);
  return args;
}

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { windowsHide: true, maxBuffer: 2 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) {
        err.stderr = stderr;
        return reject(err);
      }
      resolve({ stdout: stdout || '', stderr: stderr || '' });
    });
  });
}

async function pullRequest() {
  if (!VPS_HOST) throw new Error('Defina VPS_HOST (IP da VPS)');
  // baixa só se existir na VPS
  const check = `test -f ${VPS_REQ} && cat ${VPS_REQ} || true`;
  const { stdout } = await run('ssh', sshArgs(check));
  const raw = (stdout || '').trim();
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function pushResponse(obj) {
  ensureDir();
  fs.writeFileSync(RES_FILE, JSON.stringify(obj, null, 2) + '\n', 'utf8');
  const remote = `${VPS_USER}@${VPS_HOST}:${VPS_RES}`;
  await run('scp', scpArgs(RES_FILE, remote));
  // remove request na VPS (evita reprocessar)
  await run('ssh', sshArgs(`rm -f ${VPS_REQ}`));
}

function runGrokLocal(prompt) {
  return new Promise((resolve) => {
    const args = process.env.GROK_ARGS
      ? process.env.GROK_ARGS.split(' ').concat([prompt])
      : ['run', '--prompt', prompt];

    const child = spawn(GROK_BIN, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
      shell: false,
    });

    let out = '';
    let err = '';
    const timer = setTimeout(() => {
      try { child.kill(); } catch {}
      resolve((out.trim() || err.trim() || 'Timeout no Grok local') + SIGNATURE);
    }, Number(process.env.GROK_TIMEOUT_MS || 170000));

    child.stdout.on('data', (d) => { out += d.toString(); });
    child.stderr.on('data', (d) => { err += d.toString(); });
    child.on('error', (e) => {
      clearTimeout(timer);
      resolve(`Erro ao spawn Grok (${GROK_BIN}): ${e.message}${SIGNATURE}`);
    });
    child.on('close', () => {
      clearTimeout(timer);
      const body = (out.trim() || err.trim() || 'Grok local sem saída') + SIGNATURE;
      resolve(body);
    });
  });
}

let lastId = '';
let busy = false;

async function tick() {
  if (busy) return;
  busy = true;
  try {
    ensureDir();
    const req = await pullRequest();
    if (!req || !req.id || !req.text) return;
    if (req.id === lastId) return;

    console.log('[GrokBridge] pedido', req.id, String(req.text).slice(0, 80));
    fs.writeFileSync(REQ_FILE, JSON.stringify(req, null, 2) + '\n'); // espelho local

    const reply = await runGrokLocal(String(req.text));
    const payload = {
      id: req.id,
      chat_id: req.chat_id,
      reply,
      ts: new Date().toISOString(),
      via: 'pc-local-grok',
    };

    await pushResponse(payload);
    lastId = req.id;
    console.log('[GrokBridge] resposta enviada p/ VPS', req.id, reply.slice(0, 60));
  } catch (e) {
    console.error('[GrokBridge] erro:', e.message || e);
    if (e.stderr) console.error(String(e.stderr).slice(0, 300));
  } finally {
    busy = false;
  }
}

if (!VPS_HOST) {
  console.error('[GrokBridge] ERRO: defina VPS_HOST=IP_DA_VPS');
  console.error('Exemplo PowerShell:');
  console.error('  $env:VPS_HOST="89.117.78.124"');
  console.error('  $env:VPS_SSH_KEY="C:\\Users\\danda\\.ssh\\id_ed25519"');
  console.error('  pm2 restart grok-bridge-pc --update-env');
  process.exit(1);
}

console.log('[GrokBridge] PC Windows → VPS', VPS_USER + '@' + VPS_HOST);
console.log('[GrokBridge] puxa', VPS_REQ, '→ devolve', VPS_RES);
console.log('[GrokBridge] GROK_BIN=', GROK_BIN);
setInterval(() => { tick().catch(() => {}); }, POLL_MS);
tick().catch(() => {});
