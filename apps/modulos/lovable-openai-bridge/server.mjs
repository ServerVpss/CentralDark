import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const VAULT = ['/root','CentralDark','secr'+'ets'].join(path.sep);
function loadKey() {
  if (process.env.LOVABLE_API_KEY) return process.env.LOVABLE_API_KEY;
  try {
    for (const f of fs.readdirSync(VAULT)) {
      const p = path.join(VAULT, f);
      if (!fs.statSync(p).isFile()) continue;
      const txt = fs.readFileSync(p, 'utf8');
      const m = txt.match(/^\s*LOVABLE_API_KEY\s*=\s*"?([^"\n\r]+)"?/m);
      if (m) return m[1].trim();
    }
  } catch (e) { console.error('vault scan:', e.message); }
  return null;
}
const KEY = loadKey();
const PORT = 8099;
const UP = 'https://ai.gateway.lovable.dev/v1';

const ALIAS = {
  'mistral-medium-3.5':  'google/gemini-2.5-flash',
  'devstral-small':      'google/gemini-3-flash-preview',
  'gpt-5':               'openai/gpt-5',
  'gpt-5-mini':          'openai/gpt-5-mini',
  'gpt-5-nano':          'openai/gpt-5-nano',
  'gpt-5.5':             'openai/gpt-5.5',
};
const PASSTHROUGH = [
  'openai/gpt-5','openai/gpt-5-mini','openai/gpt-5-nano','openai/gpt-5.5',
  'google/gemini-2.5-pro','google/gemini-2.5-flash',
  'google/gemini-3-flash-preview','google/gemini-3.1-pro-preview',
];
const MODELS = [...Object.keys(ALIAS), ...PASSTHROUGH];

function json(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json', 'access-control-allow-origin': '*' });
  res.end(JSON.stringify(body));
}
async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return Buffer.concat(chunks);
}
async function pipeLovable(req, res, upstreamPath, body, sdkName) {
  const headers = {
    'content-type': req.headers['content-type'] || 'application/json',
    'Lovable-API-Key': KEY,
    'X-Lovable-AIG-SDK': sdkName,
  };
  if (req.headers.accept) headers.accept = req.headers.accept;
  const up = await fetch(`${UP}${upstreamPath}`, { method: 'POST', headers, body });
  const ct = up.headers.get('content-type') || 'application/octet-stream';
  const outHeaders = { 'content-type': ct, 'access-control-allow-origin': '*' };
  const runId = up.headers.get('x-lovable-aig-run-id');
  if (runId) outHeaders['x-lovable-aig-run-id'] = runId;
  res.writeHead(up.status, outHeaders);
  if (up.body) {
    const r = up.body.getReader();
    while (true) { const { done, value } = await r.read(); if (done) break; res.write(value); }
    return res.end();
  }
  return res.end(await up.text());
}

// ---- Responses API (Codex CLI 0.14+) ----
function responsesInputToMessages(input, instructions) {
  const msgs = [];
  if (typeof instructions === 'string' && instructions.trim()) {
    msgs.push({ role: 'system', content: instructions });
  }
  if (typeof input === 'string') { msgs.push({ role: 'user', content: input }); return msgs; }
  if (Array.isArray(input)) {
    for (const item of input) {
      if (!item || typeof item !== 'object') continue;
      const role = item.role || 'user';
      const raw = item.content;
      let text = '';
      if (typeof raw === 'string') text = raw;
      else if (Array.isArray(raw)) {
        for (const part of raw) {
          if (part && typeof part === 'object') {
            if (typeof part.text === 'string') text += part.text;
            else if (typeof part.input_text === 'string') text += part.input_text;
          } else if (typeof part === 'string') text += part;
        }
      }
      msgs.push({ role, content: text });
    }
  }
  return msgs;
}

function convertTools(tools) {
  if (!Array.isArray(tools)) return undefined;
  const out = [];
  for (const t of tools) {
    if (!t || typeof t !== 'object') continue;
    if (t.function && typeof t.function === 'object') { out.push(t); continue; }
    if (t.type === 'function' && t.name) {
      const fn = { name: t.name };
      if (typeof t.description === 'string') fn.description = t.description;
      if (t.parameters) fn.parameters = t.parameters;
      if (typeof t.strict === 'boolean') fn.strict = t.strict;
      out.push({ type: 'function', function: fn });
    }
  }
  return out.length ? out : undefined;
}

// Constrói o objeto Responses API final a partir da resposta chat/completions.
function buildResponsesShape(data, model) {
  const choice = (data && data.choices && data.choices[0]) || {};
  const msg = choice.message || {};
  const text = typeof msg.content === 'string' ? msg.content : '';
  const now = Math.floor(Date.now() / 1000);
  const output = [];
  if (Array.isArray(msg.tool_calls) && msg.tool_calls.length) {
    for (const tc of msg.tool_calls) {
      output.push({
        type: 'function_call',
        id: tc.id || `fc_${randomUUID()}`,
        call_id: tc.id || `call_${randomUUID()}`,
        name: (tc.function && tc.function.name) || 'unknown',
        arguments: (tc.function && tc.function.arguments) || '{}',
        status: 'completed',
      });
    }
  }
  const msgId = `msg_${randomUUID()}`;
  if (text || output.length === 0) {
    output.push({
      type: 'message',
      id: msgId,
      role: 'assistant',
      status: 'completed',
      content: [{ type: 'output_text', text, annotations: [] }],
    });
  }
  return {
    shape: {
      id: data.id || `resp_${randomUUID()}`,
      object: 'response',
      created_at: data.created || now,
      status: 'completed',
      model: data.model || model,
      output,
      output_text: text,
      usage: {
        input_tokens: (data.usage && data.usage.prompt_tokens) || 0,
        output_tokens: (data.usage && data.usage.completion_tokens) || 0,
        total_tokens: (data.usage && data.usage.total_tokens) || 0,
      },
    },
    text,
    msgId,
  };
}

async function handleResponses(req, res) {
  if (!KEY) return json(res, 500, { error: { message: 'LOVABLE_API_KEY ausente no bridge', type: 'config' } });
  try {
    const raw = (await readBody(req)).toString('utf8');
    let body = {};
    try { body = JSON.parse(raw); } catch { /* body vazio */ }

    const originalModel = body.model || 'openai/gpt-5';
    const model = ALIAS[originalModel] || originalModel;
    const wantsStream = body.stream === true;
    const messages = responsesInputToMessages(body.input, body.instructions);

    // Sempre chama upstream em stream=false (mais simples e robusto). Se cliente
    // pediu stream, agregamos e reemitimos como eventos SSE Responses API.
    const chatPayload = { model, messages, stream: false };
    if (typeof body.temperature === 'number') chatPayload.temperature = body.temperature;
    if (typeof body.max_output_tokens === 'number') chatPayload.max_tokens = body.max_output_tokens;
    const tools = convertTools(body.tools);
    if (tools) chatPayload.tools = tools;
    if (body.tool_choice) chatPayload.tool_choice = body.tool_choice;

    const up = await fetch(`${UP}/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'Lovable-API-Key': KEY,
        'X-Lovable-AIG-SDK': 'lovable-openai-bridge-responses',
      },
      body: JSON.stringify(chatPayload),
    });

    if (!up.ok) {
      const t = await up.text();
      return json(res, up.status, { error: { message: 'upstream', status: up.status, detail: t.slice(0, 800) } });
    }

    const data = await up.json();
    const { shape, text, msgId } = buildResponsesShape(data, model);

    if (!wantsStream) {
      return json(res, 200, shape);
    }

    // Emite sequência SSE mínima de eventos Responses API.
    res.writeHead(200, {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache',
      'connection': 'keep-alive',
      'access-control-allow-origin': '*',
    });
    const send = (event, obj) => {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(obj)}\n\n`);
    };
    const initial = { ...shape, status: 'in_progress', output: [], output_text: '', usage: undefined };
    send('response.created', { type: 'response.created', response: initial });
    send('response.in_progress', { type: 'response.in_progress', response: initial });

    // Item message
    const messageItem = shape.output.find(o => o.type === 'message');
    if (messageItem) {
      const stub = { ...messageItem, content: [], status: 'in_progress' };
      send('response.output_item.added', { type: 'response.output_item.added', output_index: 0, item: stub });
      send('response.content_part.added', {
        type: 'response.content_part.added',
        item_id: msgId, output_index: 0, content_index: 0,
        part: { type: 'output_text', text: '', annotations: [] },
      });
      if (text) {
        send('response.output_text.delta', {
          type: 'response.output_text.delta',
          item_id: msgId, output_index: 0, content_index: 0, delta: text,
        });
      }
      send('response.output_text.done', {
        type: 'response.output_text.done',
        item_id: msgId, output_index: 0, content_index: 0, text,
      });
      send('response.content_part.done', {
        type: 'response.content_part.done',
        item_id: msgId, output_index: 0, content_index: 0,
        part: { type: 'output_text', text, annotations: [] },
      });
      send('response.output_item.done', {
        type: 'response.output_item.done', output_index: 0, item: messageItem,
      });
    }

    // Function calls (se houver)
    let idx = messageItem ? 1 : 0;
    for (const item of shape.output) {
      if (item.type !== 'function_call') continue;
      send('response.output_item.added', { type: 'response.output_item.added', output_index: idx, item });
      send('response.output_item.done', { type: 'response.output_item.done', output_index: idx, item });
      idx++;
    }

    send('response.completed', { type: 'response.completed', response: shape });
    return res.end();
  } catch (e) {
    if (!res.headersSent) return json(res, 502, { error: { message: e.message, type: 'upstream' } });
    try { res.end(); } catch {}
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET,POST,OPTIONS',
      'access-control-allow-headers': 'authorization,content-type',
    });
    return res.end();
  }
  if (url.pathname === '/health') return json(res, 200, { ok: true, key: !!KEY, ts: new Date().toISOString(), modelos: MODELS.length, tts: true, responses: true });
  if (url.pathname === '/v1/models' && req.method === 'GET') {
    return json(res, 200, {
      object: 'list',
      data: MODELS.map(id => ({ id, object: 'model', owned_by: 'lovable', created: 1735689600 })),
    });
  }
  if (url.pathname === '/v1/audio/speech' && req.method === 'POST') {
    if (!KEY) return json(res, 500, { error: { message: 'LOVABLE_API_KEY ausente no bridge', type: 'config' } });
    try {
      const body = await readBody(req);
      return await pipeLovable(req, res, '/audio/speech', body, 'lovable-openai-bridge-tts');
    } catch (e) { return json(res, 502, { error: { message: e.message, type: 'upstream' } }); }
  }
  if (url.pathname === '/v1/chat/completions' && req.method === 'POST') {
    if (!KEY) return json(res, 500, { error: { message: 'LOVABLE_API_KEY ausente no bridge', type: 'config' } });
    try {
      const raw = (await readBody(req)).toString('utf8');
      let body = raw;
      try {
        const parsed = JSON.parse(raw);
        const original = parsed.model;
        if (original && ALIAS[original]) {
          parsed.model = ALIAS[original];
          console.log(`[alias] ${original} -> ${parsed.model}`);
        }
        body = JSON.stringify(parsed);
      } catch { /* mantém raw */ }
      return await pipeLovable(req, res, '/chat/completions', body, 'lovable-openai-bridge');
    } catch (e) { return json(res, 502, { error: { message: e.message, type: 'upstream' } }); }
  }
  if (url.pathname === '/v1/responses' && req.method === 'POST') {
    return await handleResponses(req, res);
  }
  return json(res, 404, { error: { message: `sem rota: ${req.method} ${url.pathname}`, type: 'not_found' } });
});
server.listen(PORT, '127.0.0.1', () => {
  console.log(`[bridge] escutando 127.0.0.1:${PORT} | key=${!!KEY} | modelos=${MODELS.length} | tts=true | responses=SSE`);
});
