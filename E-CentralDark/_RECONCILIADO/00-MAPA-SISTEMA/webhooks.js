/**
 * Webhook receiver — WuzAPI/Whatsmeow events → Supabase
 * 
 * Formato WuzAPI real (via whatsmeow):
 *   { type: "Message", Info: { ID, Chat, Sender, IsGroup, PushName, Timestamp }, Message: { conversation, ... } }
 *   { type: "Connected" }
 *   { type: "Disconnected" }  
 *   { type: "QR", Codes: [...] }
 *   { type: "ReadReceipt", MessageIDs: [...], Chat, Status }
 *   { jsonData: "<JSON string>" } (formato alternativo)
 * 
 * Documentação: https://github.com/tulir/whatsmeow
 *               https://github.com/asternic/wuzapi
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Carregar envs
function loadEnv(f) {
  try {
    fs.readFileSync(f, 'utf-8').split('\n').forEach(l => {
      const m = l.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.+)/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    });
  } catch {}
}
loadEnv('/root/Multizap/secrets/wabot.env');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

// Supabase REST helper
async function supaInsert(table, data) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json', 'Prefer': 'return=representation',
      },
      body: JSON.stringify(data),
    });
    return res.ok ? await res.json() : null;
  } catch { return null; }
}

async function supaUpdate(table, filter, data) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json', 'Prefer': 'return=representation',
      },
      body: JSON.stringify(data),
    });
    return res.ok ? await res.json() : null;
  } catch { return null; }
}

async function supaSelect(table, filter) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
    });
    return res.ok ? await res.json() : [];
  } catch { return []; }
}

// JID → phone number
function jidToPhone(jid) {
  if (!jid) return '';
  return String(jid).split('@')[0].split(':')[0].replace(/\D/g, '');
}

// Flatten WuzAPI payload (pode vir como jsonData string)
function flattenPayload(body) {
  let raw = body;
  if (raw && typeof raw.jsonData === 'string') {
    try { raw = { ...raw, ...JSON.parse(raw.jsonData) }; } catch {}
  }
  if (raw && raw.event && typeof raw.event === 'object') {
    raw = { ...raw, ...raw.event };
  }
  return raw;
}

// Extrair texto da mensagem (whatsmeow Message structure)
function extractText(msg) {
  if (!msg) return '';
  return msg.conversation || msg.extendedTextMessage?.text || 
         msg.imageMessage?.caption || msg.videoMessage?.caption ||
         msg.documentMessage?.caption || msg.listResponseMessage?.title ||
         msg.buttonsResponseMessage?.selectedDisplayText || '';
}

// Extrair tipo de mídia
function extractMediaType(msg) {
  if (!msg) return 'text';
  if (msg.imageMessage) return 'image';
  if (msg.videoMessage) return 'video';
  if (msg.audioMessage) return 'audio';
  if (msg.documentMessage) return 'document';
  if (msg.stickerMessage) return 'sticker';
  if (msg.contactMessage || msg.contactsArrayMessage) return 'contact';
  if (msg.locationMessage) return 'location';
  if (msg.conversation || msg.extendedTextMessage) return 'text';
  return 'text';
}

/**
 * POST /api/webhooks/wuzapi
 * Recebe TODOS os eventos do WuzAPI (whatsmeow)
 */
router.post('/wuzapi', async (req, res) => {
  const raw = flattenPayload(req.body);
  const eventType = (raw.type || raw.Type || raw.event || '').toLowerCase();
  const instanceId = raw.instanceName || raw.userID || raw.instance_id || '';

  console.log(`[WH] ${eventType} | instance: ${instanceId || '?'}`);

  try {
    switch (eventType) {
      // ═══════════════════════════════════
      // MENSAGEM RECEBIDA (privada ou grupo)
      // ═══════════════════════════════════
      case 'message': {
        const info = raw.Info || {};
        const msg = raw.Message || {};
        const text = extractText(msg);
        const chatJid = info.Chat || info.chat || '';
        const senderJid = info.Sender || info.SenderAlt || info.sender || '';
        const isGroup = !!info.IsGroup;
        const isFromMe = !!info.IsFromMe;
        const pushName = info.PushName || '';
        const msgId = info.ID || info.Id || '';
        const timestamp = info.Timestamp ? new Date(info.Timestamp * 1000).toISOString() : new Date().toISOString();

        const phone = jidToPhone(isGroup ? senderJid : chatJid);
        const chatPhone = jidToPhone(chatJid);

        console.log(`[WH] MSG ${isGroup ? 'GRUPO' : 'PRIVADA'} | ${pushName} (${phone}) | ${text.slice(0, 50)}`);

        // Buscar ou criar contato
        let contacts = await supaSelect('contacts', `phone=eq.${phone}&limit=1`);
        let contactId = contacts[0]?.id;

        if (!contactId && phone) {
          // Buscar workspace
          const instances = await supaSelect('instances', `select=workspace_id&limit=1`);
          const wsId = instances[0]?.workspace_id || '468167fc-8e84-4795-ab56-4e066b4f0f4f';

          const newContact = await supaInsert('contacts', {
            workspace_id: wsId,
            name: pushName || phone,
            phone: phone,
            tags: isGroup ? ['grupo'] : [],
          });
          contactId = newContact?.[0]?.id;
          console.log(`[WH] Contato criado: ${pushName || phone} (${contactId?.slice(0, 8)})`);
        }

        // Salvar mensagem
        if (contactId && text) {
          const instances = await supaSelect('instances', `select=id,workspace_id&limit=1`);
          const wsId = instances[0]?.workspace_id || '468167fc-8e84-4795-ab56-4e066b4f0f4f';
          const instId = instances[0]?.id || null;

          await supaInsert('messages', {
            workspace_id: wsId,
            instance_id: instId,
            contact_id: contactId,
            text: text,
            direction: isFromMe ? 'outbound' : 'inbound',
            status: 'delivered',
          });
          console.log(`[WH] MSG salva: ${text.slice(0, 40)}`);
        }

        // Emitir via Socket.io (se disponível)
        if (req.io) {
          req.io.emit('whatsapp_event', {
            event: 'message.received',
            phone, text, pushName, isGroup, isFromMe, chatPhone, msgId, timestamp,
          });
        }
        break;
      }

      // ═══════════════════════════════════
      // CONEXÃO
      // ═══════════════════════════════════
      case 'connected': {
        console.log('[WH] WhatsApp CONECTADO');
        const phone = jidToPhone(raw.Jid || raw.jid || '');
        await supaUpdate('instances', `wuzapi_instance_id=eq.${instanceId}`, {
          status: 'connected', phone, qr_code_base64: '',
          last_seen_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        });
        if (req.io) req.io.emit('whatsapp_event', { event: 'connection.connected', phone });
        break;
      }

      case 'disconnected': {
        console.log('[WH] WhatsApp DESCONECTADO');
        await supaUpdate('instances', `wuzapi_instance_id=eq.${instanceId}`, {
          status: 'disconnected', qr_code_base64: '',
          updated_at: new Date().toISOString(),
        });
        if (req.io) req.io.emit('whatsapp_event', { event: 'connection.disconnected' });
        break;
      }

      case 'qr': {
        const codes = raw.Codes || (raw.Code ? [raw.Code] : []);
        const qr = codes[codes.length - 1] || '';
        console.log(`[WH] QR Code (${qr.length} chars)`);
        await supaUpdate('instances', `wuzapi_instance_id=eq.${instanceId}`, {
          status: 'qr_code', qr_code_base64: qr,
          updated_at: new Date().toISOString(),
        });
        if (req.io) req.io.emit('whatsapp_event', { event: 'connection.qr', qr });
        break;
      }

      // ═══════════════════════════════════
      // RECIBOS DE LEITURA
      // ═══════════════════════════════════
      case 'receipt':
      case 'readreceipt': {
        const status = String(raw.Type || raw.Status || 'delivered').toLowerCase();
        const msgIds = raw.MessageIDs || raw.MessageIds || [];
        console.log(`[WH] Receipt: ${status} (${msgIds.length} msgs)`);
        // Atualizar status das mensagens se necessário
        break;
      }

      // ═══════════════════════════════════
      // PRESENÇA (digitando, online)
      // ═══════════════════════════════════
      case 'chatpresence':
      case 'presence': {
        const presenceState = (raw.State || raw.state || '').toLowerCase();
        if (req.io) {
          req.io.emit('whatsapp_event', {
            event: 'presence.updated',
            chat: raw.Chat || raw.chat,
            state: presenceState,
          });
        }
        break;
      }

      default:
        console.log(`[WH] Evento não mapeado: ${eventType}`);
    }
  } catch (err) {
    console.error(`[WH] ERRO: ${err.message}`);
  }

  res.status(200).send('OK');
});

module.exports = router;
