# COMANDO - wuzapi-sessions-monitor.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\scripts\bots\wuzapi-sessions-monitor.mjs
**SHA:** c63ad6b943e9332b
**Timestamp:** 2026-08-26T19:32:50.705064
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- nextRun: '~15min (workflow wuzapi-sessions-monitor)',

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node
/**
 * Monitor de sessões MultiZap/WuzAPI — read-only.
 *
 * O que faz:
 *  1) SSH na VPS, consulta WuzAPI admin (/admin/users), sanitiza tudo;
 *  2) Atualiza CentralDark/apps/projeto-dashboard/wuzapi-sessions.json;
 *  3) Detecta sessão desconectada / sem login / sem JID → abre/atualiza Issue
 *     com marcador <!-- bot:wuzapi-sessions --> (deduplica, nunca cria 2).
 *
 * NÃO toca em Docker, WuzAPI, sessão WhatsApp, Caddy nem CRM.
 * NUNCA loga token, webhook secret ou JID inteiro no GitHub.
 *
 * Alertas opcionais (envia SÓ quando há mudança de estado):
 *   - Telegram: secrets TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID
 *   - Discord:  secret DISCORD_WEBHOOK_URL
 * Se nenhum estiver setado, segue só atualizando o painel + Issue do GitHub.
 */
import { execSync } from 'node:child_process';
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { findBotIssue, createIssue, updateIssue } from './lib/gh.mjs';


const MARKER = '<!-- bot:wuzapi-sessions -->';
const OUT_PATH = resolve('CentralDark/apps/projeto-dashboard/wuzapi-sessions.json');
const HOST = process.env.VPS_HOST_LOVABLE;
const USER = process.env.VPS_USER_LOVABLE || 'root';
const KEY = process.env.SSH_KEY_PATH;

function ssh(cmd) {
  const safe = cmd.replace(/'/g, `'\\''`);
  return execSync(
    `ssh -i ${KEY} -o BatchMode=yes -o StrictHostKeyChecking=no -o ConnectTimeout=20 ${USER}@${HOST} '${safe}'`,
    { encoding: 'utf8', timeout: 60_000 }
  );
}

/** Mascara JID: mantém DDI+DDD inicial e os 2 últimos dígitos antes do device id. */
function maskJid(jid) {
  if (!jid) return '-';
  const m = jid.match(/^(\d{4})\d+(\d{5})(:\d+)?(@.+)?$/);
  if (m) return `${m[1]}****${m[2]}${m[3] || ''}`;
  return jid.slice(0, 4) + '****' + jid.slice(-4);
}
function maskId(id) {
  return id ? id.slice(0, 8) + '***' : '-';
}
function maskWebhook(url) {
  if (!url) return '';
  try {
    const u = new URL(url);
    return `${u.origin}${u.pathname}?…(mascarado)`;
  } catch {
    return '(webhook presente)';
  }
}

async function main() {
  if (!HOST || !KEY) {
    console.error('⚠️  VPS_HOST_LOVABLE/SSH_KEY_PATH ausentes — pulando sem erro.');
    process.exit(0);
  }

  // 1) Buscar sessões via admin (token só vive no shell remoto)
  const raw = ssh(
    `cd /root/Multizap/wuzapi && TOKEN=$(grep -E "^WUZAPI_ADMIN_TOKEN" .env | cut -d= -f2-) && ` +
      `curl -s -H "Authorization: $TOKEN" http://127.0.0.1:8081/admin/users`
  );

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.error('❌ Resposta inválida da WuzAPI');
    process.exit(1);
  }
  const users = parsed?.data || [];

  // 2) Sanitizar
  const sessions = users.map((u) => ({
    id: maskId(u.id),
    name: u.name || '(sem nome)',
    jid: maskJid(u.jid || ''),
    connected: !!u.connected,
    loggedIn: !!u.loggedIn,
    hasQr: !!(u.qrcode && u.qrcode.length > 4),
    webhook: maskWebhook(u.webhook),
    events: u.events || '',
  }));

  const ok = sessions.filter((s) => s.connected && s.loggedIn);
  const off = sessions.filter((s) => !s.connected || !s.loggedIn);

  const payload = {
    generatedAt: new Date().toISOString(),
    total: sessions.length,
    connected: ok.length,
    disconnected: off.length,
    sessions,
    logsHint:
      'Ver logs sanitizados na VPS: docker logs multizap-gateway-wuzapi-1 --tail 200',
    nextRun: '~15min (workflow wuzapi-sessions-monitor)',
  };

  // 3) Salvar JSON
  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2) + '\n');
  console.log(`✅ Atualizado ${OUT_PATH}: ${ok.length} ok / ${off.length} off`);

  // 4) Issue de alerta (deduplicada)
  const existing = await findBotIssue(MARKER).catch(() => null);
  const severity = off.length === 0 ? 'p3' : off.length === sessions.length ? 'p1' : 'p2';

  const lines = sessions
    .map(
      (s) =>
        `- **${s.name}** — conectado: \`${s.connected}\` · logado: \`${s.loggedIn}\` · jid: \`${s.jid}\` · id: \`${s.id}\`${s.hasQr ? ' · 🔄 **QR pendente**' : ''}`
    )
    .join('\n');

  const body =
    `${MARKER}\n\n` +
    `## 📡 Monitor WuzAPI — ${new Date().toISOString()}\n\n` +
    `**Total:** ${sessions.length} · ✅ ok: ${ok.length} · ⚠️ off: ${off.length}\n\n` +
    `### Sessões (sanitizadas)\n${lines || '_nenhuma sessão cadastrada_'}\n\n` +
    `### Severidade automática\n` +
    `- **${severity.toUpperCase()}** — ${
      severity === 'p3'
        ? 'tudo conectado, nada a fazer (issue fica aberta como dashboard vivo).'
        : severity === 'p2'
          ? 'pelo menos uma sessão caiu — escanear novo QR ou checar logs.'
          : 'TODAS as sessões offline — bot fora do ar.'
    }\n\n` +
    `### Próximo passo seguro\n` +
    `${
      off.length
        ? '1. Abrir o painel em https://status.centralldark.com (seção "Sessões MultiZap").\n2. Se aparecer QR pendente, escanear no celular.\n3. Logs sanitizados: `docker logs multizap-gateway-
```

---

# COMANDO - wuzapi-sessions-monitor.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\scripts\bots\wuzapi-sessions-monitor.mjs
**SHA:** 301270bc298e3cbe
**Timestamp:** 2026-08-28T02:57:33.939828
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- nextRun: '~15min (workflow wuzapi-sessions-monitor)',

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node
/**
 * Monitor de sessões MultiZap/WuzAPI — read-only.
 *
 * O que faz:
 *  1) SSH na VPS, consulta WuzAPI admin (/admin/users), sanitiza tudo;
 *  2) Atualiza CentralDark/apps/modulos/status/wuzapi-sessions.json;
 *  3) Detecta sessão desconectada / sem login / sem JID → abre/atualiza Issue
 *     com marcador <!-- bot:wuzapi-sessions --> (deduplica, nunca cria 2).
 *
 * NÃO toca em Docker, WuzAPI, sessão WhatsApp, Caddy nem CRM.
 * NUNCA loga token, webhook secret ou JID inteiro no GitHub.
 *
 * Alertas opcionais (envia SÓ quando há mudança de estado):
 *   - Telegram: secrets TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID
 *   - Discord:  secret DISCORD_WEBHOOK_URL
 * Se nenhum estiver setado, segue só atualizando o painel + Issue do GitHub.
 */
import { execSync } from 'node:child_process';
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { findBotIssue, createIssue, updateIssue } from './lib/gh.mjs';


const MARKER = '<!-- bot:wuzapi-sessions -->';
const OUT_PATH = resolve('CentralDark/apps/modulos/status/wuzapi-sessions.json');
const HOST = process.env.VPS_HOST_LOVABLE;
const USER = process.env.VPS_USER_LOVABLE || 'root';
const KEY = process.env.SSH_KEY_PATH;

function ssh(cmd) {
  const safe = cmd.replace(/'/g, `'\\''`);
  return execSync(
    `ssh -i ${KEY} -o BatchMode=yes -o StrictHostKeyChecking=no -o ConnectTimeout=20 ${USER}@${HOST} '${safe}'`,
    { encoding: 'utf8', timeout: 60_000 }
  );
}

/** Mascara JID: mantém DDI+DDD inicial e os 2 últimos dígitos antes do device id. */
function maskJid(jid) {
  if (!jid) return '-';
  const m = jid.match(/^(\d{4})\d+(\d{5})(:\d+)?(@.+)?$/);
  if (m) return `${m[1]}****${m[2]}${m[3] || ''}`;
  return jid.slice(0, 4) + '****' + jid.slice(-4);
}
function maskId(id) {
  return id ? id.slice(0, 8) + '***' : '-';
}
function maskWebhook(url) {
  if (!url) return '';
  try {
    const u = new URL(url);
    return `${u.origin}${u.pathname}?…(mascarado)`;
  } catch {
    return '(webhook presente)';
  }
}

async function main() {
  if (!HOST || !KEY) {
    console.error('⚠️  VPS_HOST_LOVABLE/SSH_KEY_PATH ausentes — pulando sem erro.');
    process.exit(0);
  }

  // 1) Buscar sessões via admin (token só vive no shell remoto)
  const raw = ssh(
    `cd /root/Multizap/wuzapi && TOKEN=$(grep -E "^WUZAPI_ADMIN_TOKEN" .env | cut -d= -f2-) && ` +
      `curl -s -H "Authorization: $TOKEN" http://127.0.0.1:8081/admin/users`
  );

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.error('❌ Resposta inválida da WuzAPI');
    process.exit(1);
  }
  const users = parsed?.data || [];

  // 2) Sanitizar
  const sessions = users.map((u) => ({
    id: maskId(u.id),
    name: u.name || '(sem nome)',
    jid: maskJid(u.jid || ''),
    connected: !!u.connected,
    loggedIn: !!u.loggedIn,
    hasQr: !!(u.qrcode && u.qrcode.length > 4),
    webhook: maskWebhook(u.webhook),
    events: u.events || '',
  }));

  const ok = sessions.filter((s) => s.connected && s.loggedIn);
  const off = sessions.filter((s) => !s.connected || !s.loggedIn);

  const payload = {
    generatedAt: new Date().toISOString(),
    total: sessions.length,
    connected: ok.length,
    disconnected: off.length,
    sessions,
    logsHint:
      'Ver logs sanitizados na VPS: docker logs multizap-gateway-wuzapi-1 --tail 200',
    nextRun: '~15min (workflow wuzapi-sessions-monitor)',
  };

  // 3) Salvar JSON
  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2) + '\n');
  console.log(`✅ Atualizado ${OUT_PATH}: ${ok.length} ok / ${off.length} off`);

  // 4) Issue de alerta (deduplicada)
  const existing = await findBotIssue(MARKER).catch(() => null);
  const severity = off.length === 0 ? 'p3' : off.length === sessions.length ? 'p1' : 'p2';

  const lines = sessions
    .map(
      (s) =>
        `- **${s.name}** — conectado: \`${s.connected}\` · logado: \`${s.loggedIn}\` · jid: \`${s.jid}\` · id: \`${s.id}\`${s.hasQr ? ' · 🔄 **QR pendente**' : ''}`
    )
    .join('\n');

  const body =
    `${MARKER}\n\n` +
    `## 📡 Monitor WuzAPI — ${new Date().toISOString()}\n\n` +
    `**Total:** ${sessions.length} · ✅ ok: ${ok.length} · ⚠️ off: ${off.length}\n\n` +
    `### Sessões (sanitizadas)\n${lines || '_nenhuma sessão cadastrada_'}\n\n` +
    `### Severidade automática\n` +
    `- **${severity.toUpperCase()}** — ${
      severity === 'p3'
        ? 'tudo conectado, nada a fazer (issue fica aberta como dashboard vivo).'
        : severity === 'p2'
          ? 'pelo menos uma sessão caiu — escanear novo QR ou checar logs.'
          : 'TODAS as sessões offline — bot fora do ar.'
    }\n\n` +
    `### Próximo passo seguro\n` +
    `${
      off.length
        ? '1. Abrir o painel em https://status.centralldark.com (seção "Sessões MultiZap").\n2. Se aparecer QR pendente, escanear no celular.\n3. Logs sanitizados: `docker logs multizap-gateway-wuzapi
```