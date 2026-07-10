// auth-audit.mjs — stub mínimo (shadow mode) com log estruturado JSON.
// Substituir depois pela versão completa com validação de api_keys no HUB.
import { randomUUID } from 'node:crypto';
import { appendFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

const LOG_PATH = process.env.ARSENAL_AUDIT_LOG || '/var/log/arsenal-adapter-audit.jsonl';
const MODE = (process.env.ARSENAL_AUTH_MODE || 'shadow').toLowerCase(); // shadow | enforce | off

export function newRequestId() { return randomUUID(); }
export function enforceMode() { return MODE; }

// Em shadow: aceita qualquer chave; em enforce: exige AUTH_KEY / ARSENAL_ADAPTER_KEY.
export async function authenticate(req) {
  const auth = (req.headers.authorization || '').toString();
  const xkey = (req.headers['x-api-key'] || req.headers['api-key'] || '').toString();
  const bearer = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7).trim() : '';
  const raw = bearer || xkey;
  const prefix = raw ? raw.slice(0, 10) + '…' : 'anon';
  const scheme = bearer ? 'bearer' : (xkey ? 'x-api-key' : 'none');
  return { decision: raw ? 'ok' : 'missing', prefix, scheme };
}

export function shouldBlock(authResult) {
  if (MODE !== 'enforce') return null;
  if (authResult.decision === 'ok') return null;
  return { status: 401, error: 'missing_api_key' };
}

let warned = false;
export async function audit(entry) {
  const line = JSON.stringify({ ts: new Date().toISOString(), ...entry }) + '\n';
  try {
    await appendFile(LOG_PATH, line);
  } catch (e) {
    if (e.code === 'ENOENT') {
      try { await mkdir(dirname(LOG_PATH), { recursive: true }); await appendFile(LOG_PATH, line); return; }
      catch {}
    }
    if (!warned) { console.error('[audit] falha ao escrever log:', e.message); warned = true; }
  }
}
