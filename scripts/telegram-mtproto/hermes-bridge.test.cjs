'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createHermesBridge } = require('./hermes-bridge.cjs');

class FakeNewMessage {}
function harness(opts = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cd-mtproto-bridge-fixture-'));
  const sessionFile = path.join(dir, 'session.txt');
  if (!opts.noSession) fs.writeFileSync(sessionFile, 'FICTIONAL_SESSION', { mode: 0o600 });
  let client;
  let now = 1000000;
  function fakeClient() {
    client = {
      outgoing: [],
      disconnected: false,
      async isUserAuthorized() { return opts.authorized !== false; },
      async getMe() { return { id: 99n }; },
      async getEntity(u) {
        if (u !== '@srver1bot') throw Error('WRONG_TARGET');
        return { id: 123n, username: opts.badBot ? 'differentbot' : 'srver1bot', bot: true };
      },
      async getMessages() { return [{ id: 10 }]; },
      addEventHandler(fn) { this.handler = fn; },
      removeEventHandler(fn) { this.handlerRemoved = fn === this.handler; },
      async sendMessage(to, options) {
        this.outgoing.push({ to, options });
        return { id: 400 + this.outgoing.length };
      },
      async disconnect() { this.disconnected = true; },
    };
    return client;
  }
  const bridge = createHermesBridge({
    newClient: fakeClient, sessionFile, dataDir: dir, botUsername: 'srver1bot',
    NewMessage: FakeNewMessage, logger: { warn() {} }, clock: () => now,
  });
  return {
    bridge, dir, get client() { return client; },
    setTime(v) { now = v; },
    saved(id, text, user = 99n) { return { message: { id, out: false, peerId: { userId: user }, senderId: user, message: text } }; },
    reply(id, replyTo, text, user = 123n) { return { message: { id, out: false, peerId: { userId: user }, senderId: user, replyTo: { replyToMsgId: replyTo }, message: text } }; },
    close() { fs.rmSync(dir, { recursive: true, force: true }); },
  };
}
test('only !CENTRALDARK from NEW Saved Messages reaches the verified existing Hermes bot', async () => {
  const h = harness();
  try {
    assert.equal((await h.bridge.start()).connected, true);
    await h.bridge.onEvent(h.saved(11, 'personal note — do not route'));
    await h.bridge.onEvent(h.saved(12, '!CENTRALDARK test', 321n));
    await h.bridge.onEvent(h.saved(10, '!CENTRALDARK OLD'));
    assert.equal(h.client.outgoing.length, 0);
    await h.bridge.onEvent(h.saved(13, '!CENTRALDARK confira o estado'));
    assert.equal(h.client.outgoing.length, 1);
    assert.equal(h.client.outgoing[0].to.username, 'srver1bot');
    assert.equal(h.client.outgoing[0].options.message, '!CENTRALDARK confira o estado');
    assert.equal(h.bridge.snapshot().accepted, 1);
    await h.bridge.onEvent(h.saved(13, '!CENTRALDARK duplicate'));
    assert.equal(h.client.outgoing.length, 1);
    assert.equal(fs.statSync(path.join(h.dir, 'hermes-bridge-state.json')).mode & 0o777, 0o600);
    await h.bridge.stop();
    assert.equal(h.client.disconnected, true);
  } finally { h.close(); }
});
test('only correctly correlated bot reply returns to Saved Messages once, without echo loop', async () => {
  const h = harness();
  try {
    await h.bridge.start();
    await h.bridge.onEvent(h.saved(11, '!CENTRALDARK confirme teste'));
    await h.bridge.onEvent(h.reply(31, 401, 'reply spoof', 999n));
    await h.bridge.onEvent(h.reply(32, 900, 'unrelated bot message'));
    assert.equal(h.client.outgoing.length, 1);
    await h.bridge.onEvent(h.reply(33, 401, 'Prova recebida'));
    assert.equal(h.client.outgoing.length, 2);
    assert.equal(h.client.outgoing[1].to, 'me');
    assert.equal(h.client.outgoing[1].options.replyTo, 11);
    assert.match(h.client.outgoing[1].options.message, /^🪬 Hermes:\nProva recebida$/);
    await h.bridge.onEvent(h.reply(33, 401, 'Prova recebida'));
    assert.equal(h.client.outgoing.length, 2);
    await h.bridge.onEvent(h.saved(12, '🪬 Hermes:\nProva recebida'));
    assert.equal(h.client.outgoing.length, 2);
    assert.equal(h.bridge.snapshot().pending, 0);
    assert.equal(h.bridge.snapshot().replies, 1);
    await h.bridge.stop();
  } finally { h.close(); }
});
test('no session, wrong bot, unapproved account and stale histories all fail closed', async () => {
  for (const opt of [{ noSession: true }, { badBot: true }, { authorized: false }]) {
    const h = harness(opt);
    try {
      const result = await h.bridge.start();
      assert.equal(result.connected, false);
      assert.notEqual(result.status, 'WATCHING');
      if (h.client) assert.equal(h.client.outgoing.length, 0);
      await h.bridge.stop();
    } finally { h.close(); }
  }
});
test('oversized messages do not forward, nor can they be retried via duplicate id', async () => {
  const h = harness();
  try {
    await h.bridge.start();
    await h.bridge.onEvent(h.saved(11, '!CENTRALDARK ' + 'x'.repeat(3900)));
    await h.bridge.onEvent(h.saved(11, '!CENTRALDARK small'));
    assert.equal(h.client.outgoing.length, 0);
    await h.bridge.stop();
  } finally { h.close(); }
});
