#!/usr/bin/env node
// Webhook Receiver standalone — porta 5000
// Recebe eventos do Gateway e salva no Supabase via REST
// Zero dependências externas — usa http nativo + https nativo

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Carregar env
function loadEnv(f) {
  try {
    fs.readFileSync(f, 'utf-8').split('\n').forEach(l => {
      const m = l.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.+)/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    });
  } catch {}
}
loadEnv('/root/Multizap/secrets/wabot.env');

const SUPA_URL = process.env.SUPABASE_URL || '';
const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';
const WS_ID = '468167fc-8e84-4795-ab56-4e066b4f0f4f';

if (!SUPA_URL || !SUPA_KEY) {
  console.error('[Receiver] SUPABASE vars ausentes');
  process.exit(1);
}

const { logTimeBR } = require('../lib/log-time.cjs');
function log(msg) { console.log(`[${logTimeBR()}] [Receiver] ${msg}`); }

// Supabase REST via https nativo
function supaRequest(method, pathStr, body) {
  return new Promise((resolve) => {
    const url = new URL(`${SUPA_URL}/rest/v1/${pathStr}`);
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'apikey': SUPA_KEY,
        'Authorization': `Bearer ${SUPA_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      timeout: 10000,
    };
    if (data) opts.headers['Content-Length'] = Buffer.byteLength(data);

    const req = https.request(opts, (res) => {
      let body = '';
      res.on('data', c => { body += c; });
      res.on('end', () => {
        try { resolve(JSON.parse(body)); } catch { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
    if (data) req.write(data);
    req.end();
  });
}

function jidToPhone(jid) {
  if (!jid) return '';
  return String(jid).split('@')[0].split(':')[0].replace(/\D/g, '');
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, service: 'CloneDeck-Receiver', port: 5000 }));
  }

  if (req.method !== 'POST') { res.writeHead(404); return res.end(); }

  let body = '';
  req.on('data', c => { body += c; });
  req.on('end', async () => {
    res.writeHead(200);
    res.end('OK');

    try {
      const p = JSON.parse(body);
      const event = p.event || '';

      if (event === 'message.received') {
        const text = p.body || '';
        const phone = jidToPhone(p.is_group ? (p.sender_id || p.from) : (p.chat_id || p.from));
        const isFromMe = !!p.is_from_me;
        const pushName = p.push_name || '';
        const extId = p.external_message_id || '';

        if (!text || !phone) return;

        // Deduplicação
        if (extId) {
          const existing = await supaRequest('GET', `messages?external_message_id=eq.${extId}&limit=1`);
          if (existing && existing.length > 0) return;
        }

        log(`MSG: ${pushName} (${phone}) → ${text.slice(0, 50)}`);

        // Contato
        let contacts = await supaRequest('GET', `contacts?phone=eq.${phone}&limit=1`) || [];
        let contactId = contacts[0] && contacts[0].id;
        if (!contactId) {
          const c = await supaRequest('POST', 'contacts', {
            workspace_id: WS_ID, name: pushName || phone, phone,
            tags: p.is_group ? ['grupo'] : [],
          });
          contactId = c && c[0] && c[0].id;
          if (contactId) log(`Contato: ${pushName || phone}`);
        }

        if (!contactId) return;

        // Instância
        const insts = await supaRequest('GET', 'instances?select=id&limit=1') || [];
        const instId = insts[0] && insts[0].id;

        // Mensagem
        await supaRequest('POST', 'messages', {
          workspace_id: WS_ID, instance_id: instId, contact_id: contactId,
          text, direction: isFromMe ? 'outbound' : 'inbound',
          status: 'delivered', external_message_id: extId || null,
        });
        log(`Salva: ${text.slice(0, 40)}`);

        // Chat
        const chats = await supaRequest('GET', `chats?contact_id=eq.${contactId}&workspace_id=eq.${WS_ID}&limit=1`) || [];
        if (chats.length > 0) {
          await supaRequest('PATCH', `chats?id=eq.${chats[0].id}`, {
            last_message: text.slice(0, 200),
            last_message_at: new Date().toISOString(),
            unread_count: (chats[0].unread_count || 0) + (isFromMe ? 0 : 1),
            updated_at: new Date().toISOString(),
          });
        } else {
          await supaRequest('POST', 'chats', {
            workspace_id: WS_ID, contact_id: contactId, instance_id: instId,
            last_message: text.slice(0, 200),
            last_message_at: new Date().toISOString(),
            unread_count: isFromMe ? 0 : 1,
          });
        }
      }

      if (event === 'connection.connected') {
        log('WhatsApp CONECTADO');
        await supaRequest('PATCH', 'instances?select=id&limit=1', {
          status: 'connected', qr_code_base64: '',
          last_seen_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        });
      }

      if (event === 'connection.disconnected') {
        log('WhatsApp DESCONECTADO');
        await supaRequest('PATCH', 'instances?status=eq.connected', {
          status: 'disconnected', updated_at: new Date().toISOString(),
        });
      }

    } catch (e) {
      log(`ERRO: ${e.message}`);
    }
  });
});

server.listen(5000, '0.0.0.0', () => {
  log(`Escutando na porta 5000`);
  log(`Supabase: ${SUPA_URL}`);
});
