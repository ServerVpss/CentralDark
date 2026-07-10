// Arsenal OpenAI Adapter — Módulo de autenticação + auditoria (SHADOW-safe)
// Autor: Pivete via Lovable (PR#147 revisão Codex)
// Comportamento:
//   AUTH_ENFORCE=shadow  → nunca bloqueia; só resolve a chave e loga em api.audit_log_api
//   AUTH_ENFORCE=enforce → bloqueia com 401/403 quando a chave não existe / está revogada / fora do escopo
// SEM chave completa em log/commit — apenas o prefixo (primeiros 12 chars) e hash sha256.

import { createHash, randomUUID } from 'node:crypto';

const HUB_URL   = process.env.HUB_SUPABASE_URL || '';
const HUB_KEY   = process.env.HUB_SUPABASE_SERVICE_ROLE_KEY || '';
const ENFORCE   = (process.env.AUTH_ENFORCE || 'shadow').toLowerCase(); // shadow | enforce
const IP_SALT   = process.env.AUDIT_IP_SALT || 'centraldark-hub-2026';
const CACHE_TTL = 60_000; // 60s

// Cache LRU simples por hash → { key row | null (miss) , exp }
const cache = new Map();

function sha256hex(s) { return createHash('sha256').update(s).digest('hex'); }

// ─────────────────────────────────────────────────────────────────────────────
// Normalização de path (fix: evita diferença falsa entre `/rota` e `/rota/`)
// ─────────────────────────────────────────────────────────────────────────────
export function normalizePath(rawUrl) {
  if (typeof rawUrl !== 'string' || rawUrl.length === 0) return '/';
  let p = rawUrl.split('#')[0].split('?')[0];
  p = p.replace(/\/{2,}/g, '/');
  if (p.length === 0) return '/';
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p;
}

// Retorna { path, query } — query sanitizada (só chaves, sem valores) pra log.
export function splitPathAndQuery(rawUrl) {
  const path = normalizePath(rawUrl);
  if (typeof rawUrl !== 'string' || !rawUrl.includes('?')) return { path, query: null };
  const rawQuery = rawUrl.split('?')[1].split('#')[0];
  const keys = rawQuery.split('&').map(kv => kv.split('=')[0]).filter(Boolean);
  return { path, query: keys.length ? keys.join(',') : null };
}

function extractBearer(req) {
  const auth = (req.headers?.authorization || req.headers?.Authorization || '').toString().trim();
  const m = /^Bearer\s+(.+)$/i.exec(auth);
  if (m) return m[1].trim();
  if (auth && !/^Bearer\b/i.test(auth)) return auth;
  const xkey = (req.headers?.['x-api-key'] || req.headers?.['X-Api-Key'] || req.headers?.['api-key'] || '').toString().trim();
  return xkey || '';
}

// Sanitizador: remove qualquer segredo comum de strings antes de logar.
export function sanitize(s) {
  if (typeof s !== 'string') return s;
  return s
    .replace(/Bearer\s+[A-Za-z0-9._\-]+/gi, 'Bearer <redacted>')
    .replace(/cdk_live_[A-Za-z0-9._\-]{10,}/g, 'cdk_live_<redacted>')
    .replace(/sk-[A-Za-z0-9._\-]{10,}/g, 'sk-<redacted>')
    .replace(/eyJ[A-Za-z0-9._\-]{20,}/g, '<jwt-redacted>')
    .replace(/apikey["'\s:=]+[A-Za-z0-9._\-]{10,}/gi, 'apikey=<redacted>')
    .replace(/authorization["'\s:=]+[A-Za-z0-9._\-]{10,}/gi, 'authorization=<redacted>')
    .slice(0, 500);
}

// ─────────────────────────────────────────────────────────────────────────────
// Log defensivo de falha de auditoria (não silencioso, mas SEM vazar segredo).
// Escreve em stderr com prefixo estruturado; nenhum token, header Authorization,
// payload, corpo de request ou service_role aparece na saída.
// Se STDERR estiver indisponível (ambientes onde process.stderr foi removido),
// cai pra console.warn — ainda sanitizado.
// ─────────────────────────────────────────────────────────────────────────────
let __auditFailCount = 0;
let __auditFailFirstAt = 0;
const AUDIT_FAIL_WINDOW_MS = 60_000; // janela de 60s pra contar falhas
function logAuditFailure(stage, err, ctx) {
  try {
    const now = Date.now();
    if (now - __auditFailFirstAt > AUDIT_FAIL_WINDOW_MS) {
      __auditFailFirstAt = now;
      __auditFailCount = 0;
    }
    __auditFailCount += 1;
    // Rate-limit: máximo 5 linhas por minuto no stderr pra não spamar em outage.
    if (__auditFailCount > 5) return;
    const msg = sanitize(err instanceof Error ? (err.message || err.name || 'unknown') : String(err ?? 'unknown'));
    const record = {
      lvl: 'warn',
      src: 'arsenal-openai-adapter.audit',
      stage,                                          // 'insert' | 'lookup' | 'build'
      err: msg,
      status: ctx?.status ?? null,                    // status HTTP recebido do PostgREST, se houver
      path: ctx?.path ?? null,                        // path já normalizado (sem query, sem host)
      method: ctx?.method ?? null,
      request_id: ctx?.request_id ?? null,
      // NUNCA logamos: HUB_URL, HUB_KEY, Authorization header, body cru, ip cru, user agent completo, token.
      ts: new Date(now).toISOString(),
    };
    const line = JSON.stringify(record);
    if (typeof process !== 'undefined' && process.stderr && typeof process.stderr.write === 'function') {
      process.stderr.write(line + '\n');
    } else if (typeof console !== 'undefined' && console.warn) {
      console.warn(line);
    }
  } catch {
    // Se até o log falhar, engolimos — auditoria nunca pode derrubar request.
  }
}

async function lookupKey(token) {
  if (!token) return null;
  const hash = sha256hex(token);
  const cached = cache.get(hash);
  if (cached && cached.exp > Date.now()) return cached.row;
  if (!HUB_URL || !HUB_KEY) return null;

  try {
    const url = `${HUB_URL}/rest/v1/api_keys?select=id,prefix,label,status,scopes,rate_limit_rpm&hash=eq.${hash}&limit=1`;
    const r = await fetch(url, {
      headers: {
        'apikey': HUB_KEY,
        'Authorization': `Bearer ${HUB_KEY}`,
        'Accept-Profile': 'api',
      },
    });
    if (!r.ok) {
      logAuditFailure('lookup', new Error(`HUB api_keys HTTP ${r.status}`), { status: r.status });
      return null;
    }
    const rows = await r.json();
    const row = Array.isArray(rows) && rows[0] ? rows[0] : null;
    cache.set(hash, { row, exp: Date.now() + CACHE_TTL });
    return row;
  } catch (err) {
    logAuditFailure('lookup', err, {});
    return null;
  }
}

// Autentica (sem bloquear em shadow).
export async function authenticate(req) {
  const token = extractBearer(req);
  if (!token) return { keyId: null, prefix: null, scopes: [], decision: 'missing', reason: 'no_bearer' };
  const row = await lookupKey(token);
  if (!row)                    return { keyId: null, prefix: token.slice(0, 12), scopes: [], decision: 'invalid',  reason: 'not_found' };
  if (row.status === 'revoked')return { keyId: row.id, prefix: row.prefix, scopes: row.scopes || [], decision: 'revoked', reason: 'revoked' };
  return { keyId: row.id, prefix: row.prefix, scopes: row.scopes || [], decision: 'ok', reason: null };
}

export function shouldBlock(authResult) {
  if (ENFORCE !== 'enforce') return null;
  if (authResult.decision === 'ok') return null;
  return { status: authResult.decision === 'missing' || authResult.decision === 'invalid' ? 401 : 403,
           error: `auth_${authResult.decision}` };
}

// Registra uma entrada em api.audit_log_api.
// Nunca derruba a request, mas AGORA emite log sanitizado quando falha —
// atende o item 3 da revisão do PR#147 (falha não pode ser 100% invisível).
export async function audit(entry) {
  if (!HUB_URL || !HUB_KEY) {
    logAuditFailure('build', new Error('HUB_URL ou HUB_SERVICE_ROLE_KEY ausentes'), { path: normalizePath(entry?.path), method: entry?.method });
    return;
  }
  let body;
  const { path, query } = splitPathAndQuery(entry?.path);
  try {
    body = {
      request_id:                entry.request_id,
      key_prefix:                entry.key_prefix || null,
      path:                      path,
      path_query_keys:           query,
      method:                    entry.method,
      status:                    entry.status,
      model:                     entry.model || null,
      tokens_in:                 entry.tokens_in ?? null,
      tokens_out:                entry.tokens_out ?? null,
      latency_ms:                entry.latency_ms ?? null,
      error_code:                entry.error_code || null,
      error_message_sanitized:   entry.error_message ? sanitize(entry.error_message) : null,
      ip_hash:                   entry.ip ? sha256hex(entry.ip + IP_SALT).slice(0, 32) : null,
      user_agent_family:         (entry.user_agent || '').split(/[\s/(]/)[0]?.slice(0, 40) || null,
    };
  } catch (err) {
    logAuditFailure('build', err, { path, method: entry?.method, request_id: entry?.request_id });
    return;
  }
  try {
    const r = await fetch(`${HUB_URL}/rest/v1/audit_log_api`, {
      method: 'POST',
      headers: {
        'apikey': HUB_KEY,
        'Authorization': `Bearer ${HUB_KEY}`,
        'Content-Type': 'application/json',
        'Content-Profile': 'api',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      // Corpo NÃO é lido/repassado pra evitar vazar detalhes do HUB. Só status.
      logAuditFailure('insert', new Error(`PostgREST HTTP ${r.status}`), {
        status: r.status,
        path,
        method: entry?.method,
        request_id: entry?.request_id,
      });
    }
  } catch (err) {
    logAuditFailure('insert', err, { path, method: entry?.method, request_id: entry?.request_id });
  }
}

export function newRequestId() { return randomUUID(); }
export function enforceMode() { return ENFORCE; }
