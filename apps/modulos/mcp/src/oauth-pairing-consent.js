// OAuth 2.1 consent por codigo, atrelado ao PKCE/redirect do cliente.
// Codigo de pareamento NAO e prova de identidade: o admin deve ter sessao
// previamente autenticada no proprio MCP para concluir a autorizacao.
import { randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';

const PENDING_TTL_MS = 5 * 60_000;
const MAX_PENDING = 200;
const pending = new Map();
const safeEqual = (a, b) => {
  const x = Buffer.from(String(a || '')), y = Buffer.from(String(b || ''));
  return x.length === y.length && timingSafeEqual(x, y);
};
function prune() {
  for (const [id, value] of pending) {
    if (value.expiresAt <= Date.now()) pending.delete(id);
  }
  while (pending.size >= MAX_PENDING) pending.delete(pending.keys().next().value);
}
export function beginOAuthPairing(payload) {
  prune();
  const id = randomUUID();
  const raw = randomBytes(5).toString('hex').toUpperCase();
  const code = raw.slice(0, 5) + '-' + raw.slice(5);
  const nonce = randomBytes(24).toString('base64url');
  const expiresAt = Date.now() + PENDING_TTL_MS;
  pending.set(id, { code, nonce, expiresAt, payload, attempts: 0 });
  return { id, code, nonce, expiresAt };
}
export function consumeOAuthPairing(id, code, nonce) {
  prune();
  const item = pending.get(String(id || ''));
  if (!item || item.attempts >= 5) return null;
  item.attempts++;
  if (!safeEqual(item.code, String(code || '').toUpperCase()) ||
      !safeEqual(item.nonce, nonce)) return null;
  pending.delete(String(id));
  return item.payload;
}
