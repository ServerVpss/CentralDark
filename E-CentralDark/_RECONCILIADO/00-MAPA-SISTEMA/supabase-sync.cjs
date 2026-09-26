/**
 * Supabase Sync Bridge + Auto-installer
 * Sem dependência de dotenv — carrega .env manualmente
 */

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { execSync } = require('child_process');

// Carregar .env sem dotenv
function loadEnv(filePath) {
  try {
    fs.readFileSync(filePath, 'utf-8').split('\n').forEach(line => {
      const match = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.+)/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].trim().replace(/^["']|["']$/g, '');
      }
    });
  } catch {}
}
loadEnv('/root/Multizap/secrets/wabot.env');
loadEnv(path.join(__dirname, '.env'));

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const WUZAPI_URL = process.env.WUZAPI_URL || 'http://127.0.0.1:8081';
const WUZAPI_TOKEN = process.env.WUZAPI_TOKEN || '';
const SYNC_INTERVAL = parseInt(process.env.SYNC_INTERVAL_MS || '15000', 10);

// Instâncias pausadas (CSV de nomes ou IDs, case-insensitive).
// Útil quando uma instância está com token WuzAPI expirado e polui o log com 401.
// Ex: SYNC_PAUSED_INSTANCES="Recargas Brasil,outra-instancia"
const PAUSED_INSTANCES = (process.env.SYNC_PAUSED_INSTANCES || '')
  .split(',')
  .map(s => s.trim().toLowerCase())
  .filter(Boolean);

const { logTimeBR } = require('../lib/log-time.cjs');
function log(level, msg) {
  console.log(`[${logTimeBR()}] [${level}] [sync] ${msg}`);
}

function isPaused(inst) {
  if (PAUSED_INSTANCES.length === 0) return false;
  const name = (inst.name || '').toLowerCase();
  const id = (inst.id || '').toLowerCase();
  return PAUSED_INSTANCES.includes(name) || PAUSED_INSTANCES.includes(id);
}

// AUTO-INSTALLER
function autoInstall() {
  try {
    const PULL_SCRIPT = '/usr/local/bin/clone-deck-gh-pull';
    const NEW_PULL = '/root/Multizap/apps/clone-deck/scripts/clone-deck-gh-pull-with-deploy.sh';
    const POST_DEPLOY = '/root/Multizap/apps/clone-deck/scripts/post-deploy.sh';
    const WEBHOOK_SRC = '/root/Multizap/apps/clone-deck/clone-deck-webhook-deploy/clone-deck-github-webhook-listener.js';
    const WEBHOOK_DST = '/root/clone-deck-webhook/clone-deck-github-webhook-listener.js';

    // Instalar pull script com post-deploy
    if (fs.existsSync(NEW_PULL) && fs.existsSync(PULL_SCRIPT)) {
      const current = fs.readFileSync(PULL_SCRIPT, 'utf-8');
      if (!current.includes('post-deploy')) {
        fs.copyFileSync(PULL_SCRIPT, `${PULL_SCRIPT}.backup`);
        fs.copyFileSync(NEW_PULL, PULL_SCRIPT);
        execSync(`chmod +x ${PULL_SCRIPT}`);
        log('OK', 'Pull script atualizado');
      }
    }

    // Atualizar webhook listener
    if (fs.existsSync(WEBHOOK_SRC) && fs.existsSync(WEBHOOK_DST)) {
      const current = fs.readFileSync(WEBHOOK_DST, 'utf-8');
      if (!current.includes('POST_DEPLOY')) {
        fs.copyFileSync(WEBHOOK_DST, `${WEBHOOK_DST}.backup`);
        fs.copyFileSync(WEBHOOK_SRC, WEBHOOK_DST);
        try { execSync('pm2 restart CloneDeck-GitHub-Webhook', { timeout: 10000 }); } catch {}
        log('OK', 'Webhook listener atualizado');
      }
    }

    // Executar post-deploy (uma única vez por boot da VPS)
    if (fs.existsSync(POST_DEPLOY)) {
      const marker = '/tmp/.sync-bootstrap-done';
      if (!fs.existsSync(marker)) {
        // IMPORTANTE: criar o marker ANTES de rodar o post-deploy.
        // Se o post-deploy reiniciar este próprio processo (pm2 restart),
        // sem o marker entraríamos em loop infinito de bootstrap.
        try { fs.writeFileSync(marker, new Date().toISOString()); } catch {}
        log('INFO', 'Executando post-deploy...');
        try {
          execSync(`bash ${POST_DEPLOY}`, { timeout: 120000 });
          log('OK', 'Post-deploy executado');
        } catch (e) { log('WARN', `Post-deploy: ${e.message}`); }
      }
    }
  } catch (e) { log('WARN', `Auto-install: ${e.message}`); }
}

// SUPABASE REST
async function supabaseREST(method, pathStr, body) {
  const opts = {
    method,
    headers: {
      'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json', 'Prefer': 'return=representation',
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${pathStr}`, opts);
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Supabase ${method} ${pathStr} → ${res.status} ${txt.slice(0, 200)}`);
  }
  return res.json();
}

// WUZAPI — chamada genérica
// Cabeçalho "token" aceita tanto o admin token (rotas /admin/*) quanto o token
// específico da instância (rotas /session/*).
async function wuzapiCall(method, pathStr, token, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json', 'Authorization': token, 'token': token } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${WUZAPI_URL}${pathStr}`, opts);
  const txt = await res.text();
  if (!res.ok) throw new Error(`WuzAPI ${res.status} ${txt.slice(0, 160)}`);
  try { return JSON.parse(txt); } catch { return null; }
}

// Lista todos os usuários da WuzAPI (rota admin). Cache curto pra evitar spam.
let _adminUsersCache = { at: 0, list: [] };
async function listWuzapiUsers() {
  const agora = Date.now();
  if (agora - _adminUsersCache.at < 8000) return _adminUsersCache.list;
  const r = await wuzapiCall('GET', '/admin/users', WUZAPI_TOKEN);
  const list = (r?.data || r || []);
  _adminUsersCache = { at: agora, list: Array.isArray(list) ? list : [] };
  return _adminUsersCache.list;
}

// Garante que a instância existe na WuzAPI e devolve { token, wid }.
// Fluxo:
//   1. Tem token salvo no Supabase + wid → reusa direto.
//   2. Lista users WuzAPI. Achou pelo nome com token preenchido → reusa + grava no Supabase.
//   3. Achou pelo nome mas sem token (instância "órfã") → DELETE e recria.
//   4. Não achou → cria do zero (POST /admin/users com token aleatório).
async function ensureWuzapiSession(inst) {
  const sd = inst.session_data || {};
  // Tudo dentro de session_data (jsonb) — a tabela não tem coluna wuzapi_instance_id.
  if (sd.wuzapi_token && sd.wuzapi_id) {
    return { token: sd.wuzapi_token, wid: sd.wuzapi_id };
  }
  if (!WUZAPI_TOKEN) throw new Error('WUZAPI_TOKEN (admin) ausente no cofre');

  const nome = inst.name || inst.id;
  const users = await listWuzapiUsers();
  const existente = users.find(u => (u.name || '').toLowerCase() === String(nome).toLowerCase());

  // Caso 2: já existe com token preenchido → reusa
  if (existente && existente.token) {
    await supabaseREST('PATCH', `whatsapp_connections?id=eq.${inst.id}`, {
      session_data: { ...sd, wuzapi_token: existente.token, wuzapi_id: String(existente.id) },
      updated_at: new Date().toISOString(),
    });
    log('OK', `${inst.name}: token WuzAPI recuperado (wid=${existente.id})`);
    return { token: existente.token, wid: String(existente.id) };
  }

  // Caso 3: órfã sem token → apaga pra liberar o nome
  if (existente && !existente.token) {
    try {
      await wuzapiCall('DELETE', `/admin/users/${existente.id}`, WUZAPI_TOKEN);
      log('INFO', `${inst.name}: instância órfã apagada (wid=${existente.id}) pra recriar com token`);
      _adminUsersCache.at = 0;
    } catch (e) { log('WARN', `${inst.name}: delete órfã falhou: ${e.message}`); }
  }

  // Caso 4: cria do zero com token aleatório (WuzAPI exige token único do cliente)
  const tokenNovo = crypto.randomBytes(16).toString('hex');
  const novo = await wuzapiCall('POST', '/admin/users', WUZAPI_TOKEN, {
    name: nome,
    token: tokenNovo,
  });
  const data = novo?.data || novo || {};
  const wid = data.id || data.ID || data.uuid;
  if (!wid) throw new Error(`admin/users sem id: ${JSON.stringify(novo).slice(0, 300)}`);

  await supabaseREST('PATCH', `whatsapp_connections?id=eq.${inst.id}`, {
    session_data: { ...sd, wuzapi_token: tokenNovo, wuzapi_id: String(wid) },
    updated_at: new Date().toISOString(),
  });
  log('OK', `${inst.name}: sessão WuzAPI criada (wid=${wid})`);
  _adminUsersCache.at = 0;
  return { token: tokenNovo, wid: String(wid) };
}

// SYNC — agora usa token POR INSTÂNCIA, não o admin global
async function syncInstance(inst) {
  try {
    let token, wid;
    try {
      ({ token, wid } = await ensureWuzapiSession(inst));
    } catch (e) {
      log('WARN', `${inst.name}: ensureSession: ${e.message}`);
      return;
    }

    // Pega status atual
    let status = null;
    try { status = await wuzapiCall('GET', `/session/status`, token); }
    catch (e) {
      // 401 → token quebrou; limpa do banco pra forçar recriação na próxima volta
      if (String(e.message).includes('401')) {
        log('WARN', `${inst.name}: token rejeitado, limpando pra recriar`);
        await supabaseREST('PATCH', `whatsapp_connections?id=eq.${inst.id}`, {
          session_data: { ...(inst.session_data || {}), wuzapi_token: null },
        });
        return;
      }
    }

    const sData = status?.data || status || {};
    // REGRA DE OURO:
    //   Connected=true do WuzAPI = só websocket aberto (acontece após /session/connect).
    //   LoggedIn=true = WhatsApp realmente pareado (QR escaneado).
    // Antes o worker tratava Connected como "logado" e nunca pegava o QR.
    const wsAberto = sData.connected === true || sData.Connected === true || sData.status === 'CONNECTED';
    const loggedIn = sData.loggedIn === true || sData.LoggedIn === true || sData.logged_in === true || sData['Logged In'] === true;
    log('INFO', `[QR_WORKER] user status { name: "${inst.name}", connected: ${!!wsAberto}, loggedIn: ${!!loggedIn} }`);

    let qrStr = '';
    let qrHttpStatus = null;
    let qrKeys = [];
    let qrHasCode = false;
    // Se ainda não logou, garante o socket aberto e busca o QR
    if (!loggedIn) {
      if (!wsAberto) {
        try {
          await wuzapiCall('POST', '/session/connect', token, { Subscribe: ['Message'], Immediate: true });
        } catch (e) {
          if (!String(e.message).includes('400')) log('WARN', `${inst.name}: connect: ${e.message}`);
        }
      }
      log('INFO', `[QR_WORKER] fetching qr { name: "${inst.name}" }`);
      try {
        const qr = await wuzapiCall('GET', '/session/qr', token);
        qrHttpStatus = 200;
        const qd = qr?.data || qr || {};
        qrKeys = Object.keys(qd);
        // Aceita todos os formatos conhecidos
        qrStr = qd.QRCode || qd.qrcode || qd.qr || qd.image || qr?.QRCode || qr?.qrcode || '';
        qrHasCode = !!qrStr;
      } catch (e) {
        qrHttpStatus = String(e.message).match(/WuzAPI (\d+)/)?.[1] || 'erro';
      }
      log('INFO', `[QR_WORKER] qr response { httpStatus: ${qrHttpStatus}, keys: [${qrKeys.join(',')}], hasQRCode: ${qrHasCode} }`);
    }

    // Monta update — só marca connected se DE FATO logou
    const upd = { updated_at: new Date().toISOString() };
    if (loggedIn) {
      upd.status = 'connected'; upd.qr_code = '';
      const phone = sData.phone || sData.jid || sData.JID || '';
      if (phone) upd.phone = String(phone).replace('@s.whatsapp.net', '').split(':')[0];
    } else if (qrStr) {
      upd.status = 'qr_code'; upd.qr_code = qrStr;
    } else if (wsAberto) {
      // socket aberto mas ainda sem QR pronto → aguardando
      upd.status = 'connecting';
    } else if (inst.status === 'connecting' || inst.status === 'qr_code') {
      upd.status = 'connecting';
    } else {
      upd.status = 'disconnected';
    }
    log('INFO', `[QR_WORKER] status mapped { name: "${inst.name}", status: "${upd.status}" }`);

    const mudou = upd.status !== inst.status || (upd.qr_code || '') !== (inst.qr_code || '') || (upd.phone && upd.phone !== inst.phone);
    if (mudou) {
      await supabaseREST('PATCH', `whatsapp_connections?id=eq.${inst.id}`, upd);
      if (upd.qr_code) log('OK', `[QR_WORKER] qr saved { name: "${inst.name}", hasQRCode: true }`);
      log('OK', `${inst.name}: ${inst.status} → ${upd.status}`);
    }
  } catch (e) { log('ERROR', `${inst.name}: ${e.message}`); }
}

async function syncLoop() {
  try {
    const instances = await supabaseREST('GET', 'whatsapp_connections?select=*&order=created_at.asc');
    for (const inst of instances) {
      if (isPaused(inst)) continue;
      await syncInstance(inst);
    }
  } catch (e) { log('ERROR', `Loop: ${e.message}`); }
}

function start() {
  if (!SUPABASE_URL || !SUPABASE_KEY) { log('FATAL', 'SUPABASE vars missing'); process.exit(1); }
  autoInstall();
  if (PAUSED_INSTANCES.length > 0) {
    log('INFO', `Instâncias pausadas (sync ignorado): ${PAUSED_INSTANCES.join(', ')}`);
  }
  log('START', `Sync Bridge (${SYNC_INTERVAL}ms)`);
  syncLoop();
  setInterval(syncLoop, SYNC_INTERVAL);
}

if (require.main === module) start();
module.exports = { start, syncLoop };

// ═══════════════════════════════════
// EMBEDDED WEBHOOK SERVER (porta 5000)
// Recebe eventos do WuzAPI diretamente
