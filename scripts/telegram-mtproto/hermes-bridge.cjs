'use strict';

// MTProto user-account bridge. Same GramJS service, same existing Telegram Hermes bot.
// Only explicitly prefixed, NEW Saved Messages are routed. No private-dialog crawl.
const fs = require('node:fs');
const path = require('node:path');

const TRIGGER = /^!CENTRALDARK(?:\s|$)/i;
const MAX_TEXT = 3800;
const PENDING_TTL_MS = 8 * 60 * 1000;
const MAX_INFLIGHT = 12;
const STATE_NAME = 'hermes-bridge-state.json';

function createHermesBridge({ newClient, sessionFile, dataDir, botUsername, NewMessage, logger = console, clock = () => Date.now() }) {
  let client = null;
  let handler = null;
  let startPromise = null;
  let selfId = '';
  let botId = '';
  let botEntity = null;
  let lastSavedId = 0;
  const pending = new Map();
  const deliveredBotMessageIds = new Set();
  const stateFile = path.join(dataDir, STATE_NAME);
  const counters = { accepted: 0, replies: 0, ignored: 0, failures: 0 };
  let state = 'OFFLINE';
  let lastError = null;

  const sameId = (a, b) => !!a && String(a) === String(b);
  function snapshot() {
    return {
      enabled: true,
      status: state,
      botVerified: !!botId,
      connected: state === 'WATCHING',
      pending: pending.size,
      accepted: counters.accepted,
      replies: counters.replies,
      ignored: counters.ignored,
      failures: counters.failures,
      lastError,
    };
  }
  function readCursor() {
    try {
      const v = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      return v && v.schema === 1 && Number.isSafeInteger(v.lastSavedId) && v.lastSavedId >= 0 ? v.lastSavedId : 0;
    } catch (_) { return 0; }
  }
  function writeCursor(id) {
    const temp = stateFile + '.new-' + process.pid;
    try {
      fs.writeFileSync(temp, JSON.stringify({ schema: 1, lastSavedId: id }) + '\n', { mode: 0o600, flag: 'wx' });
      fs.chmodSync(temp, 0o600);
      fs.renameSync(temp, stateFile);
    } finally {
      if (fs.existsSync(temp)) fs.unlinkSync(temp);
    }
  }
  function prunePending() {
    const cutoff = clock() - PENDING_TTL_MS;
    for (const [id, entry] of pending) if (entry.at < cutoff) pending.delete(id);
    while (deliveredBotMessageIds.size > 120) deliveredBotMessageIds.delete(deliveredBotMessageIds.values().next().value);
  }
  function isSavedMessage(msg) {
    // Telegram Saved Messages can be marked out=false even when sent by self.
    // Use the verified peer AND sender identity, never the ambiguous out flag.
    return msg && sameId(msg.peerId?.userId, selfId) &&
      sameId(msg.senderId, selfId);
  }
  function isHermesReply(msg) {
    return msg && msg.out !== true && sameId(msg.peerId?.userId, botId) &&
      sameId(msg.senderId, botId);
  }
  async function onEvent(event) {
    if (state !== 'WATCHING') return;
    const msg = event?.message;
    if (!msg || !Number.isSafeInteger(Number(msg.id))) return;
    prunePending();
    try {
      if (isSavedMessage(msg)) {
        const id = Number(msg.id);
        if (id <= lastSavedId) return;
        // Persist the cursor before forwarding to fail closed on ambiguous Telegram send failures.
        writeCursor(id);
        lastSavedId = id;
        const raw = String(msg.message || '');
        if (!TRIGGER.test(raw) || raw.length > MAX_TEXT || pending.size >= MAX_INFLIGHT) {
          counters.ignored++;
          return;
        }
        const sent = await client.sendMessage(botEntity, { message: raw });
        const botMessageId = Number(sent?.id);
        if (!Number.isSafeInteger(botMessageId) || botMessageId <= 0) throw new Error('BOT_SEND_NO_MESSAGE_ID');
        pending.set(botMessageId, { savedMessageId: id, at: clock() });
        counters.accepted++;
        return;
      }
      if (isHermesReply(msg)) {
        const replyId = Number(msg.replyTo?.replyToMsgId);
        const track = pending.get(replyId);
        const receivedId = Number(msg.id);
        if (!track || deliveredBotMessageIds.has(receivedId)) return;
        const answer = String(msg.message || '');
        if (!answer || answer.length > MAX_TEXT) { counters.ignored++; return; }
        // Prefix guarantees replies cannot activate the Saved Messages command again.
        await client.sendMessage('me', { message: '🪬 Hermes:\n' + answer, replyTo: track.savedMessageId });
        deliveredBotMessageIds.add(receivedId);
        pending.delete(replyId);
        counters.replies++;
      }
    } catch (e) {
      counters.failures++;
      lastError = String(e?.code || e?.name || 'BRIDGE_ERROR').slice(0, 70);
      logger.warn?.('[mtproto-bridge] event failed (message content omitted)');
    }
  }
  async function start() {
    if (startPromise) return startPromise;
    if (state === 'WATCHING') return snapshot();
    startPromise = (async () => {
      if (!fs.existsSync(sessionFile)) {
        state = 'WAITING_SESSION';
        return snapshot();
      }
      state = 'CONNECTING';
      let c;
      try {
        const session = fs.readFileSync(sessionFile, 'utf8').trim();
        if (!session) throw new Error('EMPTY_SESSION');
        c = await newClient(session);
        if (!await c.isUserAuthorized()) throw new Error('UNAUTHORIZED_SESSION');
        selfId = String((await c.getMe()).id);
        botEntity = await c.getEntity('@' + botUsername.replace(/^@/, ''));
        if (!botEntity?.bot || !botEntity?.id) throw new Error('BOT_IDENTITY_INVALID');
        if (String(botEntity.username || '').toLowerCase() !== botUsername.replace(/^@/, '').toLowerCase()) {
          throw new Error('BOT_USERNAME_MISMATCH');
        }
        botId = String(botEntity.id);
        // First boot: anchor the cursor to the most recent Saved Message. Never replay history.
        const latest = await c.getMessages('me', { limit: 1 });
        const latestId = Number(latest?.[0]?.id || 0);
        lastSavedId = Math.max(readCursor(), Number.isSafeInteger(latestId) ? latestId : 0);
        writeCursor(lastSavedId);
        client = c;
        handler = (event) => { void onEvent(event); };
        c.addEventHandler(handler, new NewMessage({}));
        state = 'WATCHING';
        lastError = null;
        return snapshot();
      } catch (e) {
        state = 'CONNECT_ERROR';
        counters.failures++;
        lastError = String(e?.code || e?.name || 'START_ERROR').slice(0, 70);
        if (c) await c.disconnect().catch(() => {});
        client = null;
        botId = '';
        botEntity = null;
        logger.warn?.('[mtproto-bridge] start failed (credentials and identities omitted)');
        return snapshot();
      }
    })();
    try { return await startPromise; } finally { startPromise = null; }
  }
  async function stop() {
    if (client) {
      try { if (handler) client.removeEventHandler(handler); } catch (_) {}
      try { await client.disconnect(); } catch (_) {}
    }
    client = null;
    handler = null;
    botEntity = null;
    botId = '';
    pending.clear();
    state = 'STOPPED';
    return snapshot();
  }
  return { start, stop, snapshot, onEvent };
}
module.exports = { createHermesBridge, TRIGGER };
