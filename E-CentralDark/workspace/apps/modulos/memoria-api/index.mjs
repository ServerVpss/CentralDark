// CentralDark — Memória API
// Leitura da memória viva + ingestão autenticada de matéria CANDIDATE.
// RANDOLF/session/profile são proveniência; nunca autoridade nem promoção direta.

import http from 'node:http';
import { appendFile, mkdir, readFile, readdir, stat } from 'node:fs/promises';
import { createHash, timingSafeEqual } from 'node:crypto';
import path from 'node:path';

const PORT = Number(process.env.PORT || 3101);
const RAIZ = path.resolve('/root/CentralDark/docs');
const INGEST_DIR = path.join(RAIZ, 'BRAIN', '09-INGESTAO');
const MAX_BYTES = 200 * 1024;
const MAX_INGEST_BYTES = 256 * 1024;
const MAX_EVENT_TEXT = 64 * 1024;

function jsonResp(res, code, body) {
  const s = JSON.stringify(body);
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Content-Length': Buffer.byteLength(s),
  });
  res.end(s);
}

function pathSeguro(rel) {
  const abs = path.resolve(RAIZ, rel || '.');
  if (!abs.startsWith(RAIZ + path.sep) && abs !== RAIZ) return null;
  return abs;
}

async function listarDir(rel = '') {
  const abs = pathSeguro(rel);
  if (!abs) throw new Error('path_bloqueado');
  const itens = await readdir(abs, { withFileTypes: true });
  const out = [];
  for (const it of itens) {
    if (it.name.startsWith('.')) continue;
    const p = path.join(rel, it.name);
    const full = path.join(abs, it.name);
    try {
      const s = await stat(full);
      out.push({
        nome: it.name,
        path: p,
        tipo: it.isDirectory() ? 'pasta' : 'arquivo',
        bytes: it.isFile() ? s.size : null,
      });
    } catch {}
  }
  return out.sort((a, b) => (a.tipo === b.tipo ? a.nome.localeCompare(b.nome) : a.tipo === 'pasta' ? -1 : 1));
}

async function lerArquivo(rel) {
  const abs = pathSeguro(rel);
  if (!abs) throw new Error('path_bloqueado');
  const s = await stat(abs);
  if (!s.isFile()) throw new Error('nao_e_arquivo');
  const buf = await readFile(abs, 'utf8');
  return {
    path: rel,
    bytes: s.size,
    truncado: s.size > MAX_BYTES,
    conteudo: s.size > MAX_BYTES ? buf.slice(0, MAX_BYTES) : buf,
  };
}

async function buscar(query, maxResultados = 20) {
  const q = String(query || '').trim().toLowerCase();
  if (q.length < 2) throw new Error('query_curta');
  const resultados = [];
  async function varrer(rel) {
    const abs = pathSeguro(rel);
    if (!abs) return;
    for (const it of await readdir(abs, { withFileTypes: true })) {
      if (it.name.startsWith('.')) continue;
      const p = path.join(rel, it.name);
      const full = path.join(abs, it.name);
      if (it.isDirectory()) {
        await varrer(p);
      } else if (/\.(md|txt|json|jsonl)$/i.test(it.name)) {
        try {
          const s = await stat(full);
          if (s.size > MAX_BYTES) continue;
          const buf = await readFile(full, 'utf8');
          const idx = buf.toLowerCase().indexOf(q);
          if (idx >= 0) {
            resultados.push({ path: p, trecho: buf.slice(Math.max(0, idx - 80), idx + 180) });
            if (resultados.length >= maxResultados) return;
          }
        } catch {}
      }
      if (resultados.length >= maxResultados) return;
    }
  }
  await varrer('');
  return resultados;
}

function normalizarTexto(value, max = MAX_EVENT_TEXT) {
  return String(value ?? '')
    .normalize('NFC')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .slice(0, max)
    .trim();
}

function normalizarIdentificador(value, fallback, max = 96) {
  const v = String(value ?? '')
    .normalize('NFC')
    .replace(/[^\p{L}\p{N}._:/@+-]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, max);
  return v || fallback;
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function igualConstante(a, b) {
  const aa = Buffer.from(String(a || ''));
  const bb = Buffer.from(String(b || ''));
  return aa.length === bb.length && timingSafeEqual(aa, bb);
}

function autorizarIngest(req) {
  const expected = String(process.env.MEMORIA_INGEST_TOKEN || '').trim();
  if (!expected) return { ok: false, reason: 'MEMORIA_INGEST_TOKEN_UNCONFIGURED' };
  const header = String(req.headers.authorization || '');
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return { ok: false, reason: 'BEARER_REQUIRED' };
  return igualConstante(match[1].trim(), expected)
    ? { ok: true }
    : { ok: false, reason: 'BEARER_INVALID' };
}

async function lerJsonBody(req) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > MAX_INGEST_BYTES) throw new Error('payload_grande');
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  try {
    return { body: JSON.parse(raw || '{}'), raw };
  } catch {
    throw new Error('json_invalido');
  }
}

function metadataSegura(metadata) {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return {};
  const allowed = new Set([
    'branch', 'head_sha', 'pr', 'event', 'provider', 'model', 'status',
    'tags', 'source_ref', 'plugin_version', 'file_mtime', 'file_size',
    'vault', 'workspace', 'runtime', 'component', 'owner',
    'source_surface', 'session_id', 'profile_id', 'profile_display', 'next_cursor',
  ]);
  const out = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (!allowed.has(key)) continue;
    if (Array.isArray(value)) {
      out[key] = value.slice(0, 20).map((item) => normalizarTexto(item, 256));
    } else if (value === null || ['string', 'number', 'boolean'].includes(typeof value)) {
      out[key] = typeof value === 'string' ? normalizarTexto(value, 1024) : value;
    }
  }
  return out;
}

function detectarCodificacaoSuspeita(text) {
  return /\uFFFD|Ã.|Â.|â(?:€|€™|€œ|€|€“|€”)/u.test(String(text || ''));
}

function contextoContinuidade(body) {
  return {
    source_surface: normalizarIdentificador(body.source_surface, '', 128) || undefined,
    session_id: normalizarIdentificador(body.session_id, '', 160) || undefined,
    profile_id: normalizarIdentificador(body.profile_id, '', 128) || undefined,
    profile_display: normalizarTexto(body.profile_display, 256) || undefined,
    head_sha: normalizarIdentificador(body.head_sha, '', 128) || undefined,
    next_cursor: normalizarTexto(body.next_cursor, 512) || undefined,
  };
}

async function ingerirEvento(body, raw) {
  const source = normalizarIdentificador(body.source, 'unknown');
  const kind = normalizarIdentificador(body.kind, 'material.ingest');
  const title = normalizarTexto(body.title, 512);
  const text = normalizarTexto(body.text ?? body.content, MAX_EVENT_TEXT);
  const eventPath = normalizarTexto(body.path, 2048);
  const url = normalizarTexto(body.url, 4096);
  const intentGoal = normalizarTexto(body.intent_goal ?? body.intent, 2048);
  const owner = normalizarTexto(body.owner, 512);
  const provenance = normalizarTexto(body.provenance, 4096);
  const continuity = contextoContinuidade(body);
  const metadata = metadataSegura({ ...(body.metadata ?? {}), ...continuity });
  const rawChecksum = sha256(raw);
  const observedAt = new Date().toISOString();
  const stableBasis = JSON.stringify({
    source, kind, title, text, path: eventPath, url, intentGoal, owner, provenance,
    ...continuity,
  });
  const contentChecksum = sha256(stableBasis);
  const eventId = normalizarIdentificador(body.event_id, `evt-${contentChecksum.slice(0, 24)}`, 128);

  const envelope = {
    schema: 'centraldark.knowledge-event.v1',
    event_id: eventId,
    source,
    kind,
    observed_at: observedAt,
    status: 'CANDIDATE',
    canonical: false,
    title: title || undefined,
    text: text || undefined,
    path: eventPath || undefined,
    url: url || undefined,
    intent_goal: intentGoal || undefined,
    owner: owner || undefined,
    provenance: provenance || undefined,
    ...continuity,
    metadata,
    raw_checksum: rawChecksum,
    content_checksum: contentChecksum,
    encoding_suspect: detectarCodificacaoSuspeita(body.text ?? body.content ?? ''),
    next_route: 'scripts/memory-linker -> knowledge-compiler -> existing owner -> one writer -> applicable main gate',
  };

  await mkdir(INGEST_DIR, { recursive: true });
  const day = observedAt.slice(0, 10);
  const file = path.join(INGEST_DIR, `${day}.jsonl`);
  await appendFile(file, `${JSON.stringify(envelope)}\n`, { encoding: 'utf8', mode: 0o600 });

  return {
    accepted: true,
    event_id: eventId,
    status: 'CANDIDATE',
    canonical: false,
    context_preserved: true,
    source_surface: envelope.source_surface,
    session_id: envelope.session_id,
    profile_id: envelope.profile_id,
    profile_display: envelope.profile_display,
    head_sha: envelope.head_sha,
    next_cursor: envelope.next_cursor,
    raw_checksum: rawChecksum,
    content_checksum: contentChecksum,
    encoding_suspect: envelope.encoding_suspect,
    receipt_path: path.relative(RAIZ, file).split(path.sep).join('/'),
    next_route: envelope.next_route,
  };
}

const OPENAPI = {
  openapi: '3.1.0',
  info: {
    title: 'CentralDark Memória API',
    description: 'Leitura da memória viva e ingestão autenticada de matéria candidata para o Hub único de conhecimento.',
    version: '1.2.0',
  },
  servers: [{ url: 'https://api.centralldark.com/memoria' }],
  components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer' } } },
  paths: {
    '/listar': {
      get: {
        operationId: 'listar', summary: 'Lista arquivos e pastas dentro da memória',
        parameters: [{ name: 'path', in: 'query', schema: { type: 'string' } }],
        responses: { 200: { description: 'OK' } },
      },
    },
    '/ler': {
      get: {
        operationId: 'ler', summary: 'Lê o conteúdo de um arquivo da memória',
        parameters: [{ name: 'path', in: 'query', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'OK' } },
      },
    },
    '/buscar': {
      post: {
        operationId: 'buscar', summary: 'Busca por texto dentro da memória',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } } },
        },
        responses: { 200: { description: 'OK' } },
      },
    },
    '/ingest': {
      post: {
        operationId: 'ingerirMaterial',
        summary: 'Recebe evento/material como CANDIDATE; preserva contexto RANDOLF sem torná-lo autoridade',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['source', 'kind'],
                properties: {
                  source: { type: 'string' }, kind: { type: 'string' }, title: { type: 'string' },
                  text: { type: 'string' }, path: { type: 'string' }, url: { type: 'string' },
                  intent_goal: { type: 'string' }, owner: { type: 'string' }, provenance: { type: 'string' },
                  source_surface: { type: 'string' }, session_id: { type: 'string' }, profile_id: { type: 'string' },
                  profile_display: { type: 'string' }, head_sha: { type: 'string' }, next_cursor: { type: 'string' },
                  metadata: { type: 'object' },
                },
              },
            },
          },
        },
        responses: {
          202: { description: 'Evento aceito como candidato' },
          401: { description: 'Bearer ausente ou inválido' },
          503: { description: 'Token de ingestão ainda não configurado no runtime' },
        },
      },
    },
  },
};

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') return jsonResp(res, 204, {});
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const rota = url.pathname.replace(/^\/memoria/, '') || '/';

    if (rota === '/openapi.json') return jsonResp(res, 200, OPENAPI);
    if (rota === '/health' || rota === '/') {
      return jsonResp(res, 200, {
        ok: true,
        raiz: RAIZ,
        ingest: {
          enabled: Boolean(String(process.env.MEMORIA_INGEST_TOKEN || '').trim()),
          route: '/ingest',
          canonical_write: false,
          continuity_context_preserved: true,
        },
      });
    }

    if (rota === '/listar' && req.method === 'GET') {
      const p = url.searchParams.get('path') || '';
      return jsonResp(res, 200, { path: p, itens: await listarDir(p) });
    }
    if (rota === '/ler' && req.method === 'GET') {
      const p = url.searchParams.get('path');
      if (!p) return jsonResp(res, 400, { error: 'parâmetro path obrigatório' });
      return jsonResp(res, 200, await lerArquivo(p));
    }
    if (rota === '/buscar' && req.method === 'POST') {
      const { body } = await lerJsonBody(req);
      return jsonResp(res, 200, { query: body.query, resultados: await buscar(body.query, body.max || 20) });
    }
    if (rota === '/ingest' && req.method === 'POST') {
      const auth = autorizarIngest(req);
      if (!auth.ok) {
        const code = auth.reason === 'MEMORIA_INGEST_TOKEN_UNCONFIGURED' ? 503 : 401;
        return jsonResp(res, code, { error: auth.reason, canonical_write: false });
      }
      const { body, raw } = await lerJsonBody(req);
      if (!body.source || !body.kind) return jsonResp(res, 400, { error: 'source e kind são obrigatórios' });
      return jsonResp(res, 202, await ingerirEvento(body, raw));
    }
    return jsonResp(res, 404, { error: 'rota não encontrada', rota });
  } catch (e) {
    const msg = String(e.message || e);
    const code = msg === 'path_bloqueado' ? 403
      : msg === 'payload_grande' ? 413
        : ['json_invalido', 'query_curta'].includes(msg) ? 400
          : 500;
    return jsonResp(res, code, { error: msg });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[memoria-api] escutando 127.0.0.1:${PORT} — raiz: ${RAIZ}`);
});
