import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TEST_MODEL = 'test/model-primary';
const FALLBACK_MODEL = 'test/model-fallback';
const GATEWAY_KEY = 'test-gateway-key-not-a-secret';
const PROVIDER_KEY = 'test-provider-key-not-a-secret';
const TOKENROUTER_KEY = 'test-tokenrouter-key-not-a-secret';

const stats = {
  abacusModels: 0,
  abacusChat: 0,
  tokenModels: 0,
  tokenChat: 0,
};

function json(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(body));
}

async function body(req) {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

async function listen(handler) {
  const server = http.createServer(handler);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  return server;
}

function portOf(server) {
  return server.address().port;
}

async function freePort() {
  const server = await listen((_req, res) => res.end());
  const port = portOf(server);
  await new Promise((resolveClose) => server.close(resolveClose));
  return port;
}

async function waitForHealth(base, child) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (child.exitCode !== null) throw new Error(`adapter encerrou com ${child.exitCode}`);
    try {
      const response = await fetch(`${base}/health`);
      if (response.ok) return;
    } catch {
      // inicialização ainda em andamento
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 100));
  }
  throw new Error('timeout aguardando /health');
}

async function startAdapter({ fallbackEnabled, abacusPort, tokenPort }) {
  const port = await freePort();
  const logs = [];
  const child = spawn(process.execPath, ['server.mjs'], {
    cwd: ROOT,
    env: {
      ...process.env,
      BIND: '127.0.0.1',
      PORT: String(port),
      ARSENAL_ADAPTER_KEY: GATEWAY_KEY,
      PROVIDER_BASE: `http://127.0.0.1:${abacusPort}/v1`,
      PROVIDER_KEY,
      TOKENROUTER_BASE_URL: `http://127.0.0.1:${tokenPort}/v1`,
      TOKENROUTER_API_KEY: TOKENROUTER_KEY,
      TOKENROUTER_MODEL: FALLBACK_MODEL,
      FALLBACK_ENABLED: String(fallbackEnabled),
      REGRAS_PATH: resolve(ROOT, 'regras.json'),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.on('data', (chunk) => logs.push(chunk.toString()));
  child.stderr.on('data', (chunk) => logs.push(chunk.toString()));
  const base = `http://127.0.0.1:${port}`;
  await waitForHealth(base, child);
  return { child, base, logs };
}

async function stopAdapter(child) {
  if (child.exitCode !== null) return;
  child.kill('SIGTERM');
  await Promise.race([
    once(child, 'exit'),
    new Promise((resolveWait) => setTimeout(resolveWait, 1500)),
  ]);
  if (child.exitCode === null) child.kill('SIGKILL');
}

async function request(base, path, payload) {
  const response = await fetch(`${base}${path}`, {
    method: payload ? 'POST' : 'GET',
    headers: {
      Authorization: `Bearer ${GATEWAY_KEY}`,
      'content-type': 'application/json',
    },
    body: payload ? JSON.stringify(payload) : undefined,
  });
  return {
    status: response.status,
    headers: response.headers,
    body: await response.json(),
  };
}

const abacus = await listen(async (req, res) => {
  if (req.url === '/v1/models') {
    stats.abacusModels += 1;
    return json(res, 200, { object: 'list', data: [{ id: TEST_MODEL }] });
  }
  if (req.url === '/v1/chat/completions') {
    stats.abacusChat += 1;
    await body(req);
    return json(res, 503, { error: 'mock abacus indisponível' });
  }
  return json(res, 404, { error: 'not found' });
});

const tokenRouter = await listen(async (req, res) => {
  if (req.url === '/v1/models') {
    stats.tokenModels += 1;
    return json(res, 200, { object: 'list', data: [{ id: TEST_MODEL }, { id: FALLBACK_MODEL }] });
  }
  if (req.url === '/v1/chat/completions') {
    stats.tokenChat += 1;
    const payload = await body(req);
    return json(res, 200, {
      choices: [{ message: { role: 'assistant', content: `TOKENROUTER_OK:${payload.model}` } }],
    });
  }
  return json(res, 404, { error: 'not found' });
});

let adapter;
try {
  adapter = await startAdapter({
    fallbackEnabled: true,
    abacusPort: portOf(abacus),
    tokenPort: portOf(tokenRouter),
  });

  const providers = await request(adapter.base, '/providers');
  assert.equal(providers.status, 200);
  assert.equal(providers.body.fallback.enabled, true);
  assert.deepEqual(providers.body.fallback.chain, ['abacus', 'tokenrouter']);

  const tokenPureBeforeAbacus = stats.abacusChat;
  const tokenPure = await request(adapter.base, '/providers/tokenrouter/v1/chat/completions', {
    model: TEST_MODEL,
    messages: [{ role: 'user', content: 'ping' }],
  });
  assert.equal(tokenPure.status, 200);
  assert.equal(tokenPure.body.choices[0].message.content, `TOKENROUTER_OK:${TEST_MODEL}`);
  assert.equal(tokenPure.headers.get('x-centraldark-route'), 'providers/tokenrouter');
  assert.equal(stats.abacusChat, tokenPureBeforeAbacus, 'rota TokenRouter pura chamou Abacus');

  const central = await request(adapter.base, '/v1/chat/completions', {
    model: TEST_MODEL,
    messages: [{ role: 'user', content: 'prove fallback' }],
  });
  assert.equal(central.status, 200);
  assert.equal(central.body.choices[0].message.content, `TOKENROUTER_OK:${TEST_MODEL}`);
  assert.match(central.headers.get('x-centraldark-upstream') || '', /^abacus:fail:.*->tokenrouter:ok:/);
  assert.ok(stats.abacusChat >= 1, 'Abacus não foi chamado antes do fallback');
  assert.ok(stats.tokenChat >= 2, 'TokenRouter não recebeu chamada de fallback');

  const abacusPureBeforeToken = stats.tokenChat;
  const abacusPure = await request(adapter.base, '/providers/abacus/v1/chat/completions', {
    model: TEST_MODEL,
    messages: [{ role: 'user', content: 'sem fallback' }],
  });
  assert.equal(abacusPure.status, 502);
  assert.equal(stats.tokenChat, abacusPureBeforeToken, 'rota Abacus pura acionou TokenRouter');

  const combinedLogs = adapter.logs.join('');
  for (const secret of [GATEWAY_KEY, PROVIDER_KEY, TOKENROUTER_KEY]) {
    assert.equal(combinedLogs.includes(secret), false, 'credencial apareceu no log');
  }

  await stopAdapter(adapter.child);
  adapter = await startAdapter({
    fallbackEnabled: false,
    abacusPort: portOf(abacus),
    tokenPort: portOf(tokenRouter),
  });
  const tokenCallsBefore = stats.tokenChat;
  const disabled = await request(adapter.base, '/v1/chat/completions', {
    model: TEST_MODEL,
    messages: [{ role: 'user', content: 'fallback desligado' }],
  });
  assert.equal(disabled.status, 502);
  assert.equal(stats.tokenChat, tokenCallsBefore, 'fallback desligado acionou TokenRouter');

  console.log('OK: rotas puras, fallback, trace, desligamento e redaction validados');
} finally {
  if (adapter) await stopAdapter(adapter.child);
  await Promise.all([
    new Promise((resolveClose) => abacus.close(resolveClose)),
    new Promise((resolveClose) => tokenRouter.close(resolveClose)),
  ]);
}
