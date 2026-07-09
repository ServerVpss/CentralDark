// Arsenal OpenAI Adapter — Módulo de autenticação + auditoria (SHADOW-safe)
// Autor: Pivete via Lovable (PR#2 Bootstrap Admin-Only)
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

function extractBearer(req) {
  const raw = req.headers?.authorization || req.headers?.Authorization || '';
  const m = /^Bearer\s+(.+)$/i.exec(raw.trim());
  return m ? m[1].trim() : '';
}

// Sanitizador: remove qualquer segredo comum (cdk_live_, sk-, service_role JWT, Bearer, Authorization) de strings antes de logar.
export function sanitize(s) {
  if (typeof s !== 'string') return s;
  return s
    .replace(/Bearer\s+[A-Za-z0-9._\-]+/gi, 'Bearer <redacted>')
    .replace(/cdk_live_[A-Za-z0-9._\-]{10,}/g, 'cdk_live_<redacted>')
    .replace(/sk-[A-Za-z0-9._\-]{10,}/g, 'sk-<redacted>')
    .replace(/eyJ[A-Za-z0-9._\-]{20,}/g, '<jwt-redacted>')
    .slice(0, 500);
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
    if (!r.ok) return null;
    const rows = await r.json();
    const row = Array.isArray(rows) && rows[0] ? rows[0] : null;
    cache.set(hash, { row, exp: Date.now() + CACHE_TTL });
    return row;
  } catch { return null; }
}

// Autentica (sem bloquear em shadow). Retorna { keyId, prefix, scopes, decision, reason }.
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

// Registra uma entrada em api.audit_log_api. Nunca lança — falha silenciosa.
export async function audit(entry) {
  if (!HUB_URL || !HUB_KEY) return;
  try {
    const body = {
      request_id:                entry.request_id,
      key_prefix:                entry.key_prefix || null,
      path:                      entry.path,
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
    await fetch(`${HUB_URL}/rest/v1/audit_log_api`, {
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
  } catch { /* silencioso — auditoria nunca derruba requisição */ }
}

export function newRequestId() { return randomUUID(); }
export function enforceMode() { return ENFORCE; }
