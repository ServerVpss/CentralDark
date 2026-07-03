// CentralDark — Proxy Lovable AI Gateway
// Recebe requisições no formato OpenAI (Bearer <token>) e converte pra
// Lovable-API-Key, encaminhando pro ai.gateway.lovable.dev.
// Também roteia /v1/audio/speech pro Lovable TTS (mata o 404 atual).
// Rate limit: 100 req/min por IP.

import http from 'node:http';

const PORT = Number(process.env.PORT || 3102);
const LOVABLE_KEY = process.env.LOVABLE_API_KEY;
const INTERNAL_TOKEN = process.env.LOVABLE_PROXY_TOKEN || ''; // opcional, valida cliente
const UPSTREAM = 'https://ai.gateway.lovable.dev/v1';

if (!LOVABLE_KEY) {
  console.error('[lovable-proxy] FATAL: LOVABLE_API_KEY não definida');
  process.exit(1);
}

// Rate limit simples em memória (janela deslizante 60s)
const RL_MAX = 100;
const RL_WIN = 60_000;
const buckets = new Map(); // ip -> [timestamps]

function rateLimit(ip) {
  const now = Date.now();
  const arr = (buckets.get(ip) || []).filter((t) => now - t < RL_WIN);
  if (arr.length >= RL_MAX) return false;
  arr.push(now);
  buckets.set(ip, arr);
  return true;
}

// Limpa buckets velhos a cada 5min
setInterval(() => {
  const now = Date.now();
  for (const [ip, arr] of buckets) {
    const f = arr.filter((t) => now - t < RL_WIN);
    if (f.length === 0) buckets.delete(ip);
    else buckets.set(ip, f);
  }
}, 5 * 60_000);

function ipDe(req) {
  return (
    req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
    req.socket.remoteAddress ||
    'desconhecido'
  );
}

async function encaminhar(req, res, upstreamPath, body) {
  const upstreamUrl = UPSTREAM + upstreamPath;
  // headers limpos: só passa o que interessa
  const headers = {
    'Lovable-API-Key': LOVABLE_KEY,
    'X-Lovable-AIG-SDK': 'centraldark-webui-proxy',
    'Content-Type': req.headers['content-type'] || 'application/json',
  };
  if (req.headers['accept']) headers['Accept'] = req.headers['accept'];

  try {
    const upstreamRes = await fetch(upstreamUrl, {
      method: req.method,
      headers,
      body: body && body.length > 0 ? body : undefined,
    });

    // repassa status + headers relevantes
    const respHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    };
    const ct = upstreamRes.headers.get('content-type');
    if (ct) respHeaders['Content-Type'] = ct;
    const runId = upstreamRes.headers.get('x-lovable-aig-run-id');
    if (runId) respHeaders['X-Lovable-AIG-Run-ID'] = runId;

    res.writeHead(upstreamRes.status, respHeaders);

    // stream body se possível
    if (upstreamRes.body) {
      const reader = upstreamRes.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(Buffer.from(value));
      }
    }
    res.end();
  } catch (e) {
    console.error('[lovable-proxy] erro upstream:', e.message);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'upstream_error', message: e.message }));
  }
}

const server = http.createServer(async (req, res) => {
  const ip = ipDe(req);

  // preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    });
    return res.end();
  }

  // rate limit
  if (!rateLimit(ip)) {
    res.writeHead(429, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'rate_limited', message: 'Máx 100 req/min por IP' }));
  }

  // parse url — dois formatos aceitos:
  //  /lovable/v1/chat/completions  → /chat/completions
  //  /v1/audio/speech              → /audio/speech (rota direta pro TTS)
  //  /v1/models                    → /models
  let upstreamPath = null;
  const url = req.url || '/';

  if (url.startsWith('/lovable/v1/')) {
    upstreamPath = url.replace(/^\/lovable\/v1/, '');
  } else if (url.startsWith('/v1/')) {
    upstreamPath = url.replace(/^\/v1/, '');
  } else if (url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, service: 'lovable-proxy' }));
  }

  if (!upstreamPath) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'not_found', hint: 'use /lovable/v1/* ou /v1/audio/speech' }));
  }

  // valida token interno (se configurado) — permite qualquer Bearer, só rejeita ausência total
  if (INTERNAL_TOKEN) {
    const auth = req.headers['authorization'] || '';
    if (!auth.toLowerCase().startsWith('bearer ')) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'unauthorized', message: 'Bearer token exigido' }));
    }
    const token = auth.slice(7).trim();
    if (token !== INTERNAL_TOKEN) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'unauthorized', message: 'token inválido' }));
    }
  }

  // coleta body
  const chunks = [];
  req.on('data', (c) => chunks.push(c));
  req.on('end', () => encaminhar(req, res, upstreamPath, Buffer.concat(chunks)));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[lovable-proxy] escutando 127.0.0.1:${PORT} → ${UPSTREAM}`);
  console.log(`[lovable-proxy] token interno: ${INTERNAL_TOKEN ? 'ATIVO' : 'DESATIVADO (aceita qualquer Bearer)'}`);
});
