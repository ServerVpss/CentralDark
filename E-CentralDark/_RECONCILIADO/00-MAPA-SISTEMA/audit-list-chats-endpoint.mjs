#!/usr/bin/env node
/**
 * Lote 2 — Auditoria read-only do endpoint REAL de listChats na WuzAPI.
 *
 * Modo: SOMENTE LEITURA. Não conecta, não desconecta, não envia, não muta.
 * Tenta candidatos GET conhecidos e mede: status HTTP, tamanho, e se o
 * payload "parece" lista de chats (heurística leve).
 *
 * Uso (na VPS):
 *   BASE_URL=http://127.0.0.1:8080 \
 *   TOKEN='***' \
 *   node apps/bot-server/scripts/run-once/audit-list-chats-endpoint.mjs
 *
 * Saída: JSON sanitizado no stdout (sem payload bruto).
 */
import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { URL } from 'node:url';

const BASE_URL = (process.env.BASE_URL || '').trim().replace(/\/+$/, '');
const TOKEN = (process.env.TOKEN || process.env.WUZAPI_TOKEN || '').trim();
const TIMEOUT_MS = Number(process.env.TIMEOUT_MS || 8000);

if (!BASE_URL || !TOKEN) {
  console.error(JSON.stringify({ ok: false, error: 'BASE_URL e TOKEN obrigatórios.' }));
  process.exit(2);
}

// Bloqueio explícito de fragmentos de escrita (espelha wuzapi-readonly-audit).
const WRITE_FRAGMENTS = [
  '/session/connect', '/session/disconnect', '/session/logout',
  '/chat/send/', '/chat/presence', '/chat/markread', '/chat/react',
  '/user/block', '/user/unblock',
  '/group/create', '/group/photo', '/group/name', '/group/locked',
  '/group/ephemeral', '/group/updaterequestparticipants', '/group/joinapprovalmode',
];
function isReadOnly(path) {
  const p = path.toLowerCase();
  return !WRITE_FRAGMENTS.some((f) => p.includes(f));
}

// Candidatos GET para descobrir o endpoint real de chats.
const CANDIDATES = [
  '/chat/list', '/chats', '/chat', '/chats/list',
  '/session/chats', '/user/chats', '/conversation/list',
  '/chat/all', '/chats/all',
];

function tryRequest(path) {
  return new Promise((resolve) => {
    if (!isReadOnly(path)) {
      resolve({ path, skipped: true, reason: 'fragmento de escrita bloqueado' });
      return;
    }
    const url = new URL(`${BASE_URL}${path}`);
    const lib = url.protocol === 'https:' ? httpsRequest : httpRequest;
    const started = Date.now();
    const req = lib(
      url,
      {
        method: 'GET',
        timeout: TIMEOUT_MS,
        headers: { Authorization: TOKEN, Token: TOKEN, Accept: 'application/json' },
      },
      (res) => {
        let bytes = 0;
        let firstChunk = '';
        res.on('data', (c) => {
          bytes += c.length;
          if (firstChunk.length < 512) firstChunk += c.toString('utf8').slice(0, 512 - firstChunk.length);
        });
        res.on('end', () => {
          // Heurística: parece lista de chats?
          let shape = 'unknown';
          let count;
          try {
            const j = JSON.parse(firstChunk + (bytes > firstChunk.length ? '' : ''));
            const arr = Array.isArray(j) ? j : (j?.data ?? j?.Chats ?? j?.chats);
            if (Array.isArray(arr)) {
              shape = 'array';
              count = arr.length;
            } else if (j && typeof j === 'object') {
              shape = 'object';
            }
          } catch { /* payload truncado, ok */ }
          resolve({
            path,
            httpStatus: res.statusCode,
            elapsedMs: Date.now() - started,
            bytes,
            shape,
            count,
            success: (res.statusCode ?? 0) >= 200 && (res.statusCode ?? 0) < 300,
          });
        });
      },
    );
    req.on('timeout', () => { req.destroy(); resolve({ path, error: 'timeout' }); });
    req.on('error', (e) => resolve({ path, error: e.code || e.message }));
    req.end();
  });
}

(async () => {
  const results = [];
  for (const p of CANDIDATES) {
    // sequencial pra não estressar a WuzAPI
    // eslint-disable-next-line no-await-in-loop
    results.push(await tryRequest(p));
  }
  const winners = results.filter((r) => r.success && (r.shape === 'array' || (r.shape === 'object' && r.bytes > 0)));
  const report = {
    ok: true,
    mode: 'read-only',
    baseUrlHost: new URL(BASE_URL).host,
    tried: results.length,
    candidatesSuccess: winners.map((w) => ({ path: w.path, shape: w.shape, count: w.count, bytes: w.bytes })),
    recommended: winners[0]?.path ?? null,
    raw: results,
  };
  console.log(JSON.stringify(report, null, 2));
})();
