'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  isLocalAiEnabled,
  resolveLocalAiModel,
  parseChatCompletion,
  classifyLocalAiFailure,
} = require('./local-ai-adapter.cjs');

function response(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() { return body; },
    async text() { return JSON.stringify(body); },
  };
}

test('route selection is opt-in and disabled by default', () => {
  assert.equal(isLocalAiEnabled({}), false);
  assert.equal(isLocalAiEnabled({ BOT_USE_LOCAL_AI: '0' }), false);
  assert.equal(isLocalAiEnabled({ BOT_USE_LOCAL_AI: '1' }), true);
});

test('model resolution reads model from bridge health', async () => {
  const calls = [];
  const model = await resolveLocalAiModel({
    baseUrl: 'http://127.0.0.1:18435/v1',
    fetchImpl: async (url, init) => {
      calls.push({ url, init });
      return response(200, { status: 'ok', model: 'kylin-qwen-plus' });
    },
  });
  assert.equal(model, 'kylin-qwen-plus');
  assert.equal(calls[0].url, 'http://127.0.0.1:18435/health');
  assert.equal(calls[0].init.method, 'GET');
});

test('response parsing returns choices[0].message.content', () => {
  assert.equal(parseChatCompletion({
    choices: [{ message: { content: 'resposta local' } }],
  }), 'resposta local');
});

test('local completion resolves health model before posting OpenAI-compatible payload', async () => {
  const calls = [];
  const { requestLocalAiChat } = require('./local-ai-adapter.cjs');
  const text = await requestLocalAiChat({
    baseUrl: 'http://127.0.0.1:18435/v1',
    messages: [{ role: 'user', content: 'oi' }],
    fetchImpl: async (url, init) => {
      calls.push({ url, init });
      if (url.endsWith('/health')) return response(200, { model: 'kylin-qwen-plus' });
      return response(200, { choices: [{ message: { content: 'olá' } }] });
    },
  });
  assert.equal(text, 'olá');
  assert.equal(calls.length, 2);
  assert.equal(calls[1].url, 'http://127.0.0.1:18435/v1/chat/completions');
  assert.deepEqual(JSON.parse(calls[1].init.body), {
    model: 'kylin-qwen-plus',
    max_tokens: 4096,
    messages: [{ role: 'user', content: 'oi' }],
  });
});

test('local failures are classified without implying cloud fallback', () => {
  assert.deepEqual(classifyLocalAiFailure(new Error('bridge down')), {
    code: 'LOCAL_AI_UNAVAILABLE',
    retryable: true,
  });
  assert.deepEqual(classifyLocalAiFailure({ status: 502, message: 'bad gateway' }), {
    code: 'LOCAL_AI_HTTP_ERROR',
    retryable: true,
  });
  assert.deepEqual(classifyLocalAiFailure(new Error('invalid response')), {
    code: 'LOCAL_AI_INVALID_RESPONSE',
    retryable: false,
  });
});
