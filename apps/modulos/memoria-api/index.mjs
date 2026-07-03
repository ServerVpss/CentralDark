// CentralDark — Memoria API
// Servidor HTTP simples que expõe a memória viva (docs/)
// pro Open WebUI consumir como Tool OpenAPI.
// Rotas: GET /openapi.json, GET /listar, GET /ler, POST /buscar
// Whitelist absoluta em /root/CentralDark/docs/ — bloqueia path traversal.

import http from 'node:http';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const PORT = Number(process.env.PORT || 3101);
const RAIZ = path.resolve('/root/CentralDark/docs');
const MAX_BYTES = 200 * 1024; // 200KB máx por arquivo

function jsonResp(res, code, body) {
  const s = JSON.stringify(body);
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Length': Buffer.byteLength(s),
  });
  res.end(s);
}

// Whitelist: resolve o path e confirma que está DENTRO da raiz
function pathSeguro(rel) {
  const abs = path.resolve(RAIZ, rel || '.');
  if (!abs.startsWith(RAIZ + path.sep) && abs !== RAIZ) {
    return null;
  }
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
  if (s.size > MAX_BYTES) {
    const buf = await readFile(abs, { encoding: 'utf8' });
    return { path: rel, bytes: s.size, truncado: true, conteudo: buf.slice(0, MAX_BYTES) };
  }
  const buf = await readFile(abs, 'utf8');
  return { path: rel, bytes: s.size, truncado: false, conteudo: buf };
}

async function buscar(query, maxResultados = 20) {
  const q = String(query || '').trim().toLowerCase();
  if (q.length < 2) throw new Error('query_curta');
  const resultados = [];
  async function varrer(rel) {
    const abs = pathSeguro(rel);
    if (!abs) return;
    const itens = await readdir(abs, { withFileTypes: true });
    for (const it of itens) {
      if (it.name.startsWith('.')) continue;
      const p = path.join(rel, it.name);
      const full = path.join(abs, it.name);
      if (it.isDirectory()) {
        await varrer(p);
      } else if (it.name.match(/\.(md|txt|json)$/i)) {
        try {
          const s = await stat(full);
          if (s.size > MAX_BYTES) continue;
          const buf = await readFile(full, 'utf8');
          const lower = buf.toLowerCase();
          const idx = lower.indexOf(q);
          if (idx >= 0) {
            const trecho = buf.slice(Math.max(0, idx - 80), idx + 180);
            resultados.push({ path: p, trecho });
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

const OPENAPI = {
  openapi: '3.1.0',
  info: {
    title: 'CentralDark Memoria API',
    description: 'Acesso somente-leitura à memória viva (docs/) — regras, aprendizados, pendências, decisões.',
    version: '1.0.0',
  },
  servers: [{ url: 'https://api.centralldark.com/memoria' }],
  paths: {
    '/listar': {
      get: {
        operationId: 'listar',
        summary: 'Lista arquivos e pastas dentro da memória',
        parameters: [{ name: 'path', in: 'query', schema: { type: 'string' }, description: 'Caminho relativo (opcional)' }],
        responses: { 200: { description: 'OK' } },
      },
    },
    '/ler': {
      get: {
        operationId: 'ler',
        summary: 'Lê o conteúdo de um arquivo da memória',
        parameters: [{ name: 'path', in: 'query', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'OK' } },
      },
    },
    '/buscar': {
      post: {
        operationId: 'buscar',
        summary: 'Busca por texto dentro da memória',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } } },
        },
        responses: { 200: { description: 'OK' } },
      },
    },
  },
};

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') return jsonResp(res, 204, {});
    const url = new URL(req.url, `http://localhost:${PORT}`);
    // remove prefixo /memoria (Caddy pode ou não repassar)
    let rota = url.pathname.replace(/^\/memoria/, '') || '/';

    if (rota === '/openapi.json') return jsonResp(res, 200, OPENAPI);
    if (rota === '/health' || rota === '/') return jsonResp(res, 200, { ok: true, raiz: RAIZ });

    if (rota === '/listar' && req.method === 'GET') {
      const p = url.searchParams.get('path') || '';
      const itens = await listarDir(p);
      return jsonResp(res, 200, { path: p, itens });
    }

    if (rota === '/ler' && req.method === 'GET') {
      const p = url.searchParams.get('path');
      if (!p) return jsonResp(res, 400, { error: 'param path obrigatório' });
      const data = await lerArquivo(p);
      return jsonResp(res, 200, data);
    }

    if (rota === '/buscar' && req.method === 'POST') {
      let raw = '';
      req.on('data', (c) => (raw += c));
      req.on('end', async () => {
        try {
          const body = JSON.parse(raw || '{}');
          const r = await buscar(body.query, body.max || 20);
          jsonResp(res, 200, { query: body.query, resultados: r });
        } catch (e) {
          jsonResp(res, 400, { error: String(e.message || e) });
        }
      });
      return;
    }

    return jsonResp(res, 404, { error: 'rota não encontrada', rota });
  } catch (e) {
    const msg = String(e.message || e);
    const code = msg === 'path_bloqueado' ? 403 : 500;
    return jsonResp(res, code, { error: msg });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[memoria-api] escutando 127.0.0.1:${PORT} — raiz: ${RAIZ}`);
});
