// Servico MTProto — login do Telegram como usuario (gramjs)
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { Api } = require('telegram');

const API_ID = parseInt(process.env.TELEGRAM_APP_API_ID || '0', 10);
const API_HASH = process.env.TELEGRAM_APP_API_HASH || '';
const PORT = parseInt(process.env.PORT || '8790', 10);
const DATA_DIR = process.env.MTPROTO_DATA_DIR || '/root/CentralDark/data/telegram-mtproto';
const SESSION_FILE = path.join(DATA_DIR, 'session.txt');

if (!API_ID || !API_HASH) {
  console.error('TELEGRAM_APP_API_ID / TELEGRAM_APP_API_HASH ausentes');
  process.exit(1);
}
fs.mkdirSync(DATA_DIR, { recursive: true });

const app = express();
app.use(cors({ origin: true, credentials: false }));
app.use(express.json({ limit: '1mb' }));

const pending = new Map();

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

app.get('/health', (_req, res) => res.json({ ok: true, service: 'telegram-mtproto', hasSession: fs.existsSync(SESSION_FILE) }));

app.get('/status', async (_req, res) => {
  try {
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

app.post('/start', async (req, res) => {
  try {
    const phone = String(req.body && req.body.phone || '').trim();
    if (!/^\+?\d{8,15}$/.test(phone)) return res.status(400).json({ ok: false, error: 'telefone invalido (use +5511999999999)' });
    if (pending.has(phone)) {
      try { await pending.get(phone).client.disconnect(); } catch (_) {}
      pending.delete(phone);
    }
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
    res.json({ ok: true, sessionString, me });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e && (e.errorMessage || e.message) || e) });
  }
});

app.post('/logout', async (_req, res) => {
  try {
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
