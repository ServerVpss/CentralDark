// Listener de auto-deploy do TelePanel.
// Recebe webhook do GitHub, valida HMAC, observa/compara o Git e só avança por fast-forward limpo antes do build.
import http from 'http';
import crypto from 'crypto';
import { spawn } from 'child_process';
import fs from 'fs';
import { safeUpdateFromOrigin } from './lib/safe-git-deploy.mjs';

const PORT = process.env.TELEPAINEL_DEPLOY_PORT || 9310;
const REPO_PATH = '/root/CentralDark/apps/modulos/telepainel';
const LOG_PATH = '/var/log/telepainel-deploy/deploy.log';
const SECRET = process.env.TELEPAINEL_DEPLOY_SECRET;
const CENTRALDARK_ROOT = process.env.CENTRALDARK_ROOT || '/root/CentralDark';
const DISPATCHER = `${CENTRALDARK_ROOT}/scripts/vps/deploy-guards-dispatcher.sh`;

if (!SECRET) {
  console.error('TELEPAINEL_DEPLOY_SECRET ausente — abortando.');
  process.exit(1);
}

let rodando = false;

function log(msg) {
  const linha = `[${new Date().toISOString()}] ${msg}\n`;
  process.stdout.write(linha);
  try {
    fs.appendFileSync(LOG_PATH, linha);
  } catch {
    process.stderr.write(`[telepainel-deploy] LOG_APPEND_FAILED path=${LOG_PATH}\n`);
  }
}

function rodar(comando, args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(comando, args, {
      cwd: REPO_PATH,
      env: { ...process.env, PATH: `${process.env.HOME}/.bun/bin:${process.env.PATH}` },
      shell: false,
    });
    proc.stdout.on('data', (d) => log(`[${comando}] ${d.toString().trim()}`));
    proc.stderr.on('data', (d) => log(`[${comando}!] ${d.toString().trim()}`));
    proc.on('close', (code) => code === 0 ? resolve() : reject(new Error(`${comando} saiu com codigo ${code}`)));
  });
}

async function gateCanonico(targetSha) {
  if (!/^[0-9a-f]{40}$/i.test(String(targetSha || ''))) throw new Error('TARGET_SHA_INVALID');
  await new Promise((resolve, reject) => {
    const proc = spawn('bash', [DISPATCHER, '--gate-only'], {
      cwd: CENTRALDARK_ROOT,
      env: { ...process.env, REPO_DIR: CENTRALDARK_ROOT, BRANCH: 'main', TARGET_SHA: targetSha },
      shell: false,
    });
    proc.stdout.on('data', (d) => log(`[deploy-gate] ${d.toString().trim()}`));
    proc.stderr.on('data', (d) => log(`[deploy-gate!] ${d.toString().trim()}`));
    proc.on('close', (code) => code === 0 ? resolve() : reject(new Error(`canonical deploy gate saiu com codigo ${code}`)));
  });
}

async function deploy(targetSha) {
  if (rodando) { log('Deploy ja em andamento, ignorando.'); return; }
  rodando = true;
  try {
    log('--- deploy iniciado ---');
    await gateCanonico(targetSha);
    const r = await safeUpdateFromOrigin({ repoPath: REPO_PATH, branch: 'main', expectedRemoteSha: targetSha, log });
    if (!r.ok) {
      log(`!!! atualização git bloqueada (${r.reason || 'UNKNOWN'}) -- abortando build; estado local preservado`);
      return;
    }
    await rodar('npm', ['install', '--no-audit', '--no-fund', '--prefer-offline']);
    await rodar('npx', ['vite', 'build']);
    log('--- deploy concluido com sucesso ---');
  } catch (e) {
    log(`!!! deploy falhou: ${e.message} -- versao anterior preservada`);
  } finally {
    rodando = false;
  }
}

function validarAssinatura(corpo, assinatura) {
  if (!assinatura || !assinatura.startsWith('sha256=')) return false;
  const esperado = 'sha256=' + crypto.createHmac('sha256', SECRET).update(corpo).digest('hex');
  const a = Buffer.from(assinatura);
  const b = Buffer.from(esperado);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && (req.url === '/health' || req.url === '/telepainel/health')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'UP', service: 'telepainel-deploy', rodando }));
    return;
  }

  if (req.method !== 'POST') { res.writeHead(405); res.end(); return; }

  const buf = [];
  req.on('data', (c) => buf.push(c));
  req.on('end', () => {
    const corpo = Buffer.concat(buf);
    const sig = req.headers['x-hub-signature-256'];
    if (!validarAssinatura(corpo, sig)) {
      log('assinatura invalida -- rejeitado');
      res.writeHead(401); res.end('unauthorized'); return;
    }
    const evento = req.headers['x-github-event'];
    if (evento === 'ping') { res.writeHead(200); res.end('pong'); return; }
    if (evento !== 'push') { res.writeHead(200); res.end('ignored'); return; }
    let payload;
    try {
      payload = JSON.parse(corpo.toString('utf8'));
    } catch {
      log('payload JSON invalido -- rejeitado');
      res.writeHead(400); res.end('invalid json'); return;
    }
    const targetSha = payload?.after || '';
    if (!/^[0-9a-f]{40}$/i.test(targetSha)) {
      log('push sem after SHA valido -- rejeitado');
      res.writeHead(400); res.end('invalid target sha'); return;
    }
    log(`push recebido -- gateando target ${targetSha.slice(0, 12)}`);
    res.writeHead(202, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, mensagem: 'deploy enfileirado sob gate canonico', target: targetSha }));
    setImmediate(() => deploy(targetSha));
  });
});

server.listen(PORT, '127.0.0.1', () => log(`escutando em 127.0.0.1:${PORT}`));
