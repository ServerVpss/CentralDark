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
        ? '1. Abrir o painel em https://status.centralldark.com (seção "Sessões MultiZap").\n2. Se aparecer QR pendente, escanear no celular.\n3. Logs sanitizados: `docker logs multizap-gateway-wuzapi-1 --tail 200` (apenas humano, NÃO automatizar).\n'
        : '_Sem ação necessária._ O monitor reabre a issue só quando algo cair.\n'
    }\n` +
    `---\n_Atualizado automaticamente pelo workflow \`wuzapi-sessions-monitor\`. Read-only._`;

  const labels = ['auto', 'revisao-humana', 'assign:grok', `severidade:${severity}`, 'multizap'];

  if (existing) {
    await updateIssue(existing.number, { body, labels });
    console.log(`📝 Issue #${existing.number} atualizada (${severity}).`);
  } else if (off.length > 0) {
    // só CRIA se houver alerta real
    const issue = await createIssue({
      title: `[multizap] ${off.length}/${sessions.length} sessão(ões) desconectada(s)`,
      body,
      labels,
    });
    console.log(`🚨 Issue #${issue.number} criada (${severity}).`);
  } else {
    console.log('🟢 Nada a abrir — todas as sessões ok.');
  }

  // 5) Alertas push (Telegram/Discord) — só em mudança de estado
  await pushAlertsIfChanged({ sessions, ok: ok.length, off: off.length, severity });
}

/* ============= alertas push sanitizados ============= */
const STATE_PATH = resolve('CentralDark/apps/projeto-dashboard/wuzapi-sessions.state.json');

function loadPrevState() {
  try { return JSON.parse(readFileSync(STATE_PATH, 'utf8')); } catch { return null; }
}
function saveState(state) {
  try {
    mkdirSync(dirname(STATE_PATH), { recursive: true });
    writeFileSync(STATE_PATH, JSON.stringify(state, null, 2) + '\n');
  } catch (e) { console.warn('estado nao salvo:', e.message); }
}

async function pushAlertsIfChanged({ sessions, ok, off, severity }) {
  const fingerprint = sessions
    .map((s) => `${s.name}:${s.connected?1:0}:${s.loggedIn?1:0}:${s.hasQr?1:0}`)
    .sort()
    .join('|');
  const prev = loadPrevState();
  saveState({ fingerprint, severity, at: new Date().toISOString() });

  // Sem mudança de estado nem severidade nova: silêncio.
  if (prev && prev.fingerprint === fingerprint) {
    console.log('🔕 sem mudança de estado, sem push.');
    return;
  }
  // Estado ok → ok: também não notifica (evita spam de "tudo certo").
  if (severity === 'p3' && (!prev || prev.severity === 'p3')) {
    console.log('🔕 estado ok desde sempre, sem push inicial.');
    return;
  }

  const emoji = severity === 'p1' ? '🚨' : severity === 'p2' ? '⚠️' : '✅';
  const transition = prev
    ? `${(prev.severity || '?').toUpperCase()} → ${severity.toUpperCase()}`
    : `novo · ${severity.toUpperCase()}`;
  const linhas = sessions.map((s) => {
    const tag = s.connected && s.loggedIn ? '🟢' : s.hasQr ? '🟡 QR pendente' : '🔴 off';
    return `${tag} ${s.name} · ${s.jid}`;
  });

  const titulo = `${emoji} MultiZap — ${ok} ok / ${off} off (${transition})`;
  const corpo =
    `${titulo}\n\n` +
    linhas.join('\n') +
    `\n\nPainel: https://status.centralldark.com (seção "Sessões do bot")`;

  await Promise.allSettled([sendTelegram(titulo, corpo), sendDiscord(titulo, corpo, severity)]);
}

async function sendTelegram(titulo, corpo) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: corpo, disable_web_page_preview: true }),
    });
    if (!r.ok) console.warn('telegram fail', r.status, (await r.text()).slice(0, 200));
    else console.log('📨 telegram enviado.');
  } catch (e) {
    console.warn('telegram erro:', e.message);
  }
}

async function sendDiscord(titulo, corpo, severity) {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) return;
  const color = severity === 'p1' ? 0xe50914 : severity === 'p2' ? 0xffd166 : 0x2cff88;
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{ title: titulo, description: corpo, color, timestamp: new Date().toISOString() }],
      }),
    });
    if (!r.ok) console.warn('discord fail', r.status, (await r.text()).slice(0, 200));
    else console.log('📨 discord enviado.');
  } catch (e) {
    console.warn('discord erro:', e.message);
  }
}


main().catch((e) => {
  console.error('❌ Monitor falhou:', e.message);
  process.exit(1);
});
