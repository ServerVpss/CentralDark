'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

process.env.SRVER1_BOT_TOKEN = 'mock-token';
process.env.ADMIN_CHAT_ID = '42';
process.env.BOT_USE_LOCAL_AI = '1';
process.env.LOCAL_AI_BASE_URL = 'http://mock.local/v1';
const bot = require('./unified-bot.cjs');

function unrefBotTimers() {
  const setTimeoutImpl = global.setTimeout;
  global.setTimeout = (...args) => {
    const timer = setTimeoutImpl(...args);
    timer.unref?.();
    return timer;
  };
}

function restoreTimers() {
  global.setTimeout = setTimeout;
}

function configureProofRuntime() {
  unrefBotTimers();
}

test('mocked update reaches model, preserves sendMessage message_id, and edits that message', async () => {
  configureProofRuntime();
  const calls = [];
  global.fetch = async (url, init = {}) => {
    const body = init.body ? JSON.parse(init.body) : undefined;
    calls.push({ url: String(url), method: init.method || 'GET', body });
    if (String(url).endsWith('/health')) {
      return { ok: true, status: 200, async json() { return { model: 'mock-model' }; } };
    }
    if (String(url).endsWith('/chat/completions')) {
      return {
        ok: true,
        status: 200,
        async json() { return { choices: [{ message: { content: 'resposta mockada' } }] }; },
      };
    }
    if (body?.chat_id === 42 && String(url).endsWith('/sendChatAction')) {
      return { ok: true, status: 200, async json() { return { ok: true, result: true }; } };
    }
    if (String(url).endsWith('/sendMessage')) {
      return {
        ok: true,
        status: 200,
        async json() { return { ok: true, result: { message_id: 9001, chat: { id: 42 }, text: body.text } }; },
      };
    }
    if (String(url).endsWith('/editMessageText')) {
      return {
        ok: true,
        status: 200,
        async json() { return { ok: true, result: { message_id: body.message_id, chat: { id: 42 }, text: body.text } }; },
      };
    }
    throw new Error(`unexpected mocked request: ${url}`);
  };

  await bot.processUpdate({
    update_id: 1,
    message: { chat: { id: 42, type: 'private' }, from: { id: 42 }, text: 'responda com prova' },
  });

  const modelCall = calls.find(call => call.url.endsWith('/chat/completions'));
  const sendCall = calls.find(call => call.url.endsWith('/sendMessage'));
  const editCall = calls.find(call => call.url.endsWith('/editMessageText'));
  assert.ok(modelCall, 'model transport was not called');
  assert.ok(sendCall, 'Telegram sendMessage was not called');
  assert.ok(editCall, 'Telegram editMessageText was not called');
  assert.equal(sendCall.body.chat_id, 42);
  assert.equal(editCall.body.chat_id, 42);
  assert.equal(editCall.body.message_id, 9001, 'edit must use result.message_id from sendMessage');
  assert.match(editCall.body.text, /resposta mockada/);
  assert.ok(calls.indexOf(modelCall) < calls.indexOf(sendCall), 'model must run before sendMessage');
  assert.ok(calls.indexOf(sendCall) < calls.indexOf(editCall), 'sendMessage must run before editMessageText');
  assert.deepEqual(new Set(calls.map(call => new URL(call.url).hostname)), new Set(['mock.local', 'api.telegram.org']), 'only model mock and Telegram API mock hosts were addressed');
  restoreTimers();
});
