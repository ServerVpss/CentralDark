// Servico MTProto — conta de usuario via Telegram API/MTProto direto (gramjs)
// Nenhum subdominio CentralDark participa do transporte Telegram.
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const QRCode = require('qrcode');
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { Api } = require('telegram');

const API_ID = parseInt(process.env.TELEGRAM_APP_API_ID || '0', 10);
const API_HASH = process.env.TELEGRAM_APP_API_HASH || '';
const PORT = parseInt(process.env.PORT || '8790', 10);
const DATA_DIR = process.env.MTPROTO_DATA_DIR || '/root/CentralDark/secrets/telegram-mtproto';
const SESSION_FILE = path.join(DATA_DIR, 'session.txt');

const CONFIGURED = !!(API_ID && API_HASH);

if (!CONFIGURED) {
  console.warn('TELEGRAM_APP_API_ID / TELEGRAM_APP_API_HASH ausentes — MTProto sobe em modo CONFIG_BLOCKED');
}
fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o700 });

function requireConfigured(res) {
  if (CONFIGURED) return true;
  res.status(503).json({ ok: false, status: 'CONFIG_BLOCKED', error: 'TELEGRAM_APP_API_ID / TELEGRAM_APP_API_HASH ausentes' });
  return false;
}

const app = express();
app.use(cors({ origin: true, credentials: false }));
app.use(express.json({ limit: '1mb' }));

const pending = new Map();
let bridge = null; // Optional capability of the SAME GramJS service; never a second daemon.

async function newClient(sessionString = '') {
  const session = new StringSession(sessionString);
  const client = new TelegramClient(session, API_ID, API_HASH, {
    connectionRetries: 3,
    useWSS: true,
    deviceModel: 'CentralDark Hub',
    systemVersion: 'Linux',
    appVersion: '1.0.0',
  });
  await client.connect();
  return client;
}

app.get('/health', (_req, res) => res.json({ ok: true, service: 'telegram-mtproto', transport: 'TELEGRAM_MTPROTO_DIRECT', configured: CONFIGURED, status: CONFIGURED ? 'READY' : 'CONFIG_BLOCKED', hasSession: fs.existsSync(SESSION_FILE) }));

app.get('/status', async (_req, res) => {
  try {
    if (!CONFIGURED) return res.json({ ok: true, connected: false, status: 'CONFIG_BLOCKED' });
    if (!fs.existsSync(SESSION_FILE)) return res.json({ ok: true, connected: false });
    const s = fs.readFileSync(SESSION_FILE, 'utf8').trim();
    const client = await newClient(s);
    const authed = await client.isUserAuthorized();
    let me = null;
    if (authed) {
      const u = await client.getMe();
      me = { id: String(u.id), firstName: u.firstName, username: u.username, phone: u.phone };
    }
    await client.disconnect();
    res.json({ ok: true, connected: authed, me });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e && e.message || e) });
  }
});


// QR login reuse of this single MTProto owner. Only the authenticated Admin ServerFn
// is allowed to expose the *ephemeral* QR image; never log/store QR tokens.
const QR_LIFETIME_MS = 180000;
let qrAttempt = null;

function qrIsCurrent(attempt) {
  return qrAttempt === attempt && !attempt.cancelled && Date.now() < attempt.deadline;
}

function qrSnapshot(attempt) {
  return {
    ok: true, id: attempt.id, status: attempt.status,
    ...(attempt.status === 'QR_PENDING'
      ? { qrDataUrl: attempt.qrDataUrl, expiresAt: attempt.expiresAt } : {}),
    ...(attempt.status === 'NEEDS_2FA' ? { needsPassword: true } : {}),
  };
}

async function qrCancel(attempt) {
  if (!attempt || attempt.cancelled) return;
  attempt.cancelled = true;
  attempt.status = 'CANCELLED';
  attempt.qrDataUrl = null;
  if (attempt.rejectPassword) attempt.rejectPassword(new Error('QR_CANCELLED'));
  if (attempt.firstQr) attempt.firstQr();
  clearTimeout(attempt.watchdog);
  if (qrAttempt === attempt) qrAttempt = null;
  try { await attempt.client.disconnect(); } catch (_) { /* already closed */ }
}

function qrFinish(attempt, error) {
  if (!qrIsCurrent(attempt)) return;
  attempt.qrDataUrl = null;
  attempt.status = error ? 'FAILED' : 'CONNECTED';
  attempt.failure = error ? String(error.errorMessage || error.message || 'QR_ERROR')
    .replace(/[^A-Z_]/g, '').slice(0, 48) : null;
  clearTimeout(attempt.watchdog);
  attempt.firstQr?.();
  attempt.firstQr = null;
}

app.post('/qr/start', async (_req, res) => {
  if (!requireConfigured(res)) return;
  // Never replace a saved account (including a session not currently reachable).
  if (fs.existsSync(SESSION_FILE))
    return res.status(409).json({ok:false,status:'SESSION_PRESENT'});
  if (pending.size)
    return res.status(409).json({ok:false,status:'PHONE_LOGIN_PENDING'});
  if (qrAttempt && qrIsCurrent(qrAttempt) &&
      ['STARTING','QR_PENDING','NEEDS_2FA','VERIFYING_2FA'].includes(qrAttempt.status))
    return res.status(409).json({ok:false,status:'QR_ALREADY_PENDING'});
  if (qrAttempt) await qrCancel(qrAttempt);
  let client;
  try {
    client = await newClient('');
    const attempt = {
      id: crypto.randomUUID(), client, status: 'STARTING', qrDataUrl: null,
      expiresAt: null, deadline: Date.now() + QR_LIFETIME_MS,
      cancelled: false, resolvePassword: null, rejectPassword: null,
      firstQr: null, watchdog: null,
    };
    qrAttempt = attempt;
    const firstQr = new Promise(resolve => { attempt.firstQr = resolve; });
    attempt.watchdog = setTimeout(() => { void qrCancel(attempt); }, QR_LIFETIME_MS);
    // GramJS owns token rotation, updateLoginToken, DC migration, and 2FA.
    void client.signInUserWithQrCode({apiId: API_ID, apiHash: API_HASH}, {
      qrCode: async ({token, expires}) => {
        if (!qrIsCurrent(attempt)) throw Error('QR_CANCELLED');
        const qrUrl = 'tg://login?token=' + token.toString('base64url');
        const image = await QRCode.toDataURL(qrUrl, {errorCorrectionLevel:'M', margin:2, width:288});
        if (!qrIsCurrent(attempt)) throw Error('QR_CANCELLED');
        attempt.qrDataUrl = image;
        attempt.expiresAt = expires * 1000;
        attempt.status = 'QR_PENDING';
        attempt.firstQr?.();
        attempt.firstQr = null;
      },
      password: async () => {
        if (!qrIsCurrent(attempt)) throw Error('QR_CANCELLED');
        attempt.status = 'NEEDS_2FA';
        attempt.qrDataUrl = null;
        return await new Promise((resolve,reject) => {
          attempt.resolvePassword = resolve;
          attempt.rejectPassword = reject;
        });
      },
      onError: () => true,
    }).then(async () => {
      if (!qrIsCurrent(attempt)) return;
      if (fs.existsSync(SESSION_FILE)) throw Error('SESSION_PRESENT');
      if (!(await client.isUserAuthorized())) throw Error('NOT_AUTHORIZED');
      if (!qrIsCurrent(attempt)) return;
      const sessionString = client.session.save();
      // Exclusive creation forbids overwriting an account that appeared mid-scan.
      fs.writeFileSync(SESSION_FILE, sessionString, {encoding:'utf8',mode:0o600,flag:'wx'});
      qrFinish(attempt, null);
    }).catch(err => {
      qrFinish(attempt, err);
    }).finally(() => {
      if (attempt.firstQr) {attempt.firstQr(); attempt.firstQr = null;}
      if (attempt.rejectPassword) {attempt.rejectPassword(new Error('QR_ENDED')); attempt.rejectPassword=null;}
      void client.disconnect().catch(() => {});
    });
    let firstTimer;
    try {
      await Promise.race([firstQr, new Promise(resolve=>{firstTimer=setTimeout(resolve,14000);})]);
    } finally {clearTimeout(firstTimer);}
    if (!qrIsCurrent(attempt) || attempt.status !== 'QR_PENDING') {
      if (attempt.status !== 'CONNECTED') await qrCancel(attempt);
      return res.status(503).json({ok:false,status:'QR_NOT_READY'});
    }
    return res.json(qrSnapshot(attempt));
  } catch (_) {
    if (qrAttempt && qrAttempt.client === client) await qrCancel(qrAttempt);
    else if (client) try {await client.disconnect();}catch(_){}
    return res.status(503).json({ok:false,status:'QR_START_FAILED'});
  }
});

app.post('/qr/status', (req, res) => {
  const attempt=qrAttempt;
  if (!attempt || attempt.id !== req.body?.id)
    return res.status(404).json({ok:false,status:'QR_NOT_FOUND'});
  if (Date.now() >= attempt.deadline && attempt.status !== 'CONNECTED') {
    void qrCancel(attempt);
    return res.status(410).json({ok:false,status:'QR_EXPIRED'});
  }
  return res.json(qrSnapshot(attempt));
});

app.post('/qr/password', (req, res) => {
  const attempt=qrAttempt;
  if (!attempt || attempt.id !== req.body?.id || !qrIsCurrent(attempt)
      || attempt.status !== 'NEEDS_2FA' || !attempt.resolvePassword)
    return res.status(409).json({ok:false,status:'QR_2FA_NOT_PENDING'});
  const password=req.body?.password;
  if (typeof password !== 'string' || !password || password.length>256)
    return res.status(400).json({ok:false,status:'INVALID_2FA_INPUT'});
  const resolve=attempt.resolvePassword;
  attempt.resolvePassword=null;
  attempt.rejectPassword=null;
  attempt.status='VERIFYING_2FA';
  resolve(password);
  return res.json({ok:true,id:attempt.id,status:'VERIFYING_2FA'});
});

app.post('/qr/cancel', async (req, res) => {
  const attempt=qrAttempt;
  if (!attempt || attempt.id !== req.body?.id)
    return res.status(404).json({ok:false,status:'QR_NOT_FOUND'});
  if (attempt.status === 'CONNECTED')
    return res.status(409).json({ok:false,status:'ALREADY_CONNECTED'});
  await qrCancel(attempt);
  return res.json({ok:true,status:'CANCELLED'});
});

app.post('/start', async (req, res) => {
  try {
    if (!requireConfigured(res)) return;
    const phone = String(req.body && req.body.phone || '').trim();
    if (!/^\+?\d{8,15}$/.test(phone)) return res.status(400).json({ ok: false, error: 'telefone invalido (use +5511999999999)' });
    if (pending.has(phone)) {
      try { await pending.get(phone).client.disconnect(); } catch (_) {}
      pending.delete(phone);
    }
    if (qrAttempt && qrIsCurrent(qrAttempt)) return res.status(409).json({ok:false,status:'QR_ALREADY_PENDING'});
    if (fs.existsSync(SESSION_FILE)) return res.status(409).json({ok:false,status:'SESSION_PRESENT'});
    const client = await newClient('');
    const result = await client.sendCode({ apiId: API_ID, apiHash: API_HASH }, phone);
    pending.set(phone, { client, phoneCodeHash: result.phoneCodeHash });
    setTimeout(() => {
      if (pending.has(phone)) {
        try { pending.get(phone).client.disconnect(); } catch (_) {}
        pending.delete(phone);
      }
    }, 5 * 60 * 1000);
    res.json({ ok: true, phoneCodeHash: result.phoneCodeHash, isCodeViaApp: !!result.isCodeViaApp });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e && (e.errorMessage || e.message) || e) });
  }
});

app.post('/confirm', async (req, res) => {
  try {
    if (!requireConfigured(res)) return;
    const phone = String(req.body && req.body.phone || '').trim();
    const code = String(req.body && req.body.code || '').trim();
    const password = req.body && req.body.password ? String(req.body.password) : undefined;
    const p = pending.get(phone);
    if (!p) return res.status(400).json({ ok: false, error: 'nenhum login pendente pra esse telefone. chama /start de novo' });
    const client = p.client;
    try {
      await client.invoke(new Api.auth.SignIn({
        phoneNumber: phone,
        phoneCodeHash: p.phoneCodeHash,
        phoneCode: code,
      }));
    } catch (err) {
      const msg = String(err && (err.errorMessage || err.message) || err);
      if (msg.includes('SESSION_PASSWORD_NEEDED')) {
        if (!password) return res.status(401).json({ ok: false, needsPassword: true, error: 'senha 2FA necessaria' });
        await client.signInWithPassword({ apiId: API_ID, apiHash: API_HASH }, {
          password: async () => password,
          onError: (e) => { throw e; },
        });
      } else {
        throw err;
      }
    }
    const sessionString = client.session.save();
    fs.writeFileSync(SESSION_FILE, sessionString, { mode: 0o600 });
    const u = await client.getMe();
    const me = { id: String(u.id), firstName: u.firstName, username: u.username, phone: u.phone };
    await client.disconnect();
    pending.delete(phone);
    res.json({ ok: true, sessionSaved: true, me });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e && (e.errorMessage || e.message) || e) });
  }
});

app.post('/logout', async (_req, res) => {
  try {
    if (bridge) await bridge.stop(); // Do not keep a user-account bridge alive after logout.
    if (fs.existsSync(SESSION_FILE)) fs.unlinkSync(SESSION_FILE);
    for (const [_, v] of pending) { try { await v.client.disconnect(); } catch (_) {} }
    pending.clear();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e && e.message || e) });
  }
});

app.listen(PORT, '127.0.0.1', () => {
  console.log('telegram-mtproto ouvindo em 127.0.0.1:' + PORT);
});

// Opt-in ingress: only NEW Saved Messages starting with !CENTRALDARK.
// Reuses the existing @srver1bot Telegram conversation and the existing Hermes.
// API credentials/session never cross the loopback/admin boundary.
const BRIDGE_ENABLED = process.env.MTPROTO_HERMES_BRIDGE === '1';
const BRIDGE_BOT = (process.env.MTPROTO_HERMES_BOT_USERNAME || '').replace(/^@/, '');
app.get('/bridge/status', (_req, res) => {
  res.json({ ok: true, bridge: bridge ? bridge.snapshot() : { enabled: false, status: 'DISABLED' } });
});
if (BRIDGE_ENABLED && CONFIGURED && /^[a-zA-Z0-9_]{5,32}$/.test(BRIDGE_BOT)) {
  const { createHermesBridge } = require('./hermes-bridge.cjs');
  const { NewMessage } = require('telegram/events');
  bridge = createHermesBridge({
    newClient, sessionFile: SESSION_FILE, dataDir: DATA_DIR,
    botUsername: BRIDGE_BOT, NewMessage,
  });
  setImmediate(() => { void bridge.start(); });
  // Login via QR/phone can complete after boot; retry only when not connected.
  const watcher = setInterval(() => {
    if (!bridge.snapshot().connected) void bridge.start();
  }, 60 * 1000);
  watcher.unref();
  // One bounded reconciliation arm inside this owner; events remain the primary path.
  const savedSync = setInterval(() => {
    if (bridge.snapshot().connected) void bridge.sync();
  }, 8 * 1000);
  savedSync.unref();
  process.on('SIGTERM', () => { void bridge.stop().finally(() => process.exit(0)); });
} else if (BRIDGE_ENABLED) {
  console.warn('mtproto-bridge CONFIG_BLOCKED (invalid existing bot username or missing API config)');
}
