// Normaliza payloads brutos da WuzAPI para o formato interno do MultiZap.
// VERSION: 2026-05-21.7 — +message_fields_extracted log; jsonData/ChatPresence/HistorySync/ReadReceipt/Message/QR/Connected/Disconnected
//

// Aceita três formatos:
//   1) Payload "direto":   { Info:{...}, Message:{...} }  ou  { event:"message", message:{...} }
//   2) Payload WuzAPI real: { instanceName, userID, jsonData: "<JSON string com event/type>" }
//   3) Payload com event objeto: { event:{ Info, Message }, type:"Message" }
//
// Tipos de evento suportados (WuzAPI):
//   - Message       -> message.received
//   - ChatPresence  -> presence.updated
//   - ReadReceipt   -> message.receipt
//   - HistorySync   -> history.sync
//   - QR/Connected/Disconnected/Error -> connection.*

function flatten(rawIn) {
  let raw = rawIn && typeof rawIn === 'object' ? { ...rawIn } : rawIn;
  if (!raw || typeof raw !== 'object') return raw;

  // 1) jsonData string (formato real da WuzAPI)
  if (typeof raw.jsonData === 'string') {
    try {
      const parsed = JSON.parse(raw.jsonData);
      raw = {
        ...raw,
        ...parsed,
        ...(parsed && parsed.event && typeof parsed.event === 'object' ? parsed.event : {}),
        type: parsed.type || raw.type,
      };
    } catch (_e) {
      // mantém raw original
    }
  }

  // 2) event como objeto -> achatar
  if (raw && raw.event && typeof raw.event === 'object') {
    const inner = raw.event;
    raw = {
      ...raw,
      ...inner,
      type: raw.type || inner.type,
    };
    // após achatar, "event" como string fica indefinido (queremos que type defina o caminho)
    if (typeof raw.event !== 'string') delete raw.event;
  }

  return raw;
}

function toIsoTs(ts) {
  if (!ts) return new Date().toISOString();
  if (typeof ts === 'number') {
    const ms = ts < 1e12 ? ts * 1000 : ts;
    return new Date(ms).toISOString();
  }
  try { return new Date(ts).toISOString(); } catch (_e) { return new Date().toISOString(); }
}

function normalize(rawIn) {
  if (!rawIn || typeof rawIn !== 'object') return null;
  const raw = flatten(rawIn);

  const evStr = String(raw.event || '').toLowerCase();
  const typeStr = String(raw.type || '').toLowerCase();

  // Conexão
  if (evStr.includes('qr') || typeStr.includes('qr')) {
    return { event: 'connection.qr', raw };
  }
  if (evStr.includes('connected') || typeStr === 'connected') {
    return { event: 'connection.connected', raw };
  }
  if (evStr.includes('disconnected') || typeStr === 'disconnected' || typeStr === 'logout') {
    return { event: 'connection.disconnected', raw };
  }
  if (evStr.includes('error')) {
    return { event: 'connection.error', raw };
  }

  // ChatPresence -> presence.updated
  if (typeStr === 'chatpresence' || evStr.includes('presence')) {
    const chatId = raw.Chat || raw.chat || raw.from || null;
    const senderId = raw.Sender || raw.sender || raw.SenderAlt || null;
    const stateRaw = String(raw.State || raw.state || raw.presence || '').toLowerCase();
    const map = {
      composing: 'composing', typing: 'composing', recording: 'recording',
      paused: 'paused', available: 'available', online: 'online',
      unavailable: 'unavailable', offline: 'offline',
    };
    return {
      event: 'presence.updated',
      chat_id: chatId,
      sender_id: senderId,
      state: map[stateRaw] || stateRaw || 'unavailable',
      is_group: !!(raw.IsGroup || raw.is_group),
      timestamp: toIsoTs(raw.Timestamp || raw.timestamp),
      raw,
    };
  }

  // ReadReceipt -> message.receipt
  if (typeStr === 'readreceipt' || evStr.includes('receipt') || evStr.includes('read')) {
    const ids = raw.MessageIDs || raw.MessageIds || raw.message_ids || null;
    const messageId = raw.MessageID || raw.MessageId || raw.message_id || (Array.isArray(ids) ? ids[0] : null);
    return {
      event: 'message.receipt',
      message_id: messageId,
      message_ids: Array.isArray(ids) ? ids : (messageId ? [messageId] : []),
      chat_id: raw.Chat || raw.ChatId || raw.chat_id || null,
      sender_id: raw.Sender || raw.sender_id || null,
      status: String(raw.Type || raw.Status || raw.status || '').toLowerCase() || 'delivered',
      timestamp: toIsoTs(raw.Timestamp || raw.timestamp),
      raw,
    };
  }

  // HistorySync -> history.sync (encaminha cru; processamento em lote fica no MultiZap)
  if (typeStr === 'historysync' || evStr.includes('history')) {
    const data = raw.Data || raw.data || raw;
    return {
      event: 'history.sync',
      sync_type: raw.SyncType || raw.syncType || data.syncType || null,
      progress: raw.Progress || raw.progress || null,
      conversations: Array.isArray(data.conversations) ? data.conversations.length : undefined,
      raw,
    };
  }

  // Message (formato real WuzAPI: Info + Message)
  const hasInfo = raw.Info && typeof raw.Info === 'object';
  const hasMessage = raw.Message && typeof raw.Message === 'object';
  if (typeStr === 'message' || evStr === 'message' || evStr.includes('message') || hasInfo || hasMessage) {
    if (hasInfo || hasMessage) {
      const info = raw.Info || {};
      const msg = raw.Message || {};
      return {
        event: 'message.received',
        external_message_id: info.ID || info.Id || null,
        from: info.SenderAlt || info.Sender || info.Chat || null,
        chat_id: info.Chat || null,
        sender_id: info.Sender || null,
        is_group: !!info.IsGroup,
        is_from_me: !!info.IsFromMe,
        push_name: info.PushName || null,
        timestamp: toIsoTs(info.Timestamp),
        type: (info.Type ? String(info.Type).toLowerCase() : null) || pickType({ message: msg }),
        body: pickBody({ message: msg }),
        media_url: pickMediaUrl({ message: msg }),
        raw,
      };
    }
    // Fallback formato antigo
    const m = raw.message || raw.data || raw;
    return {
      event: 'message.received',
      external_message_id: m.id || m.ID || (m.key && m.key.id) || null,
      from: m.from || m.From || (m.key && m.key.remoteJid) || null,
      to: m.to || m.To || null,
      push_name: m.pushName || m.push_name || null,
      type: pickType(m),
      body: pickBody(m),
      media_url: pickMediaUrl(m),
      timestamp: toIsoTs(m.timestamp || m.messageTimestamp),
      raw,
    };
  }

  return { event: `unknown:${evStr || typeStr || 'no_event'}`, raw };
}

function pickType(m) {
  const msg = m.message || {};
  if (m.text || m.body || msg.conversation || msg.extendedTextMessage) return 'text';
  if (m.image || msg.imageMessage) return 'image';
  if (m.video || msg.videoMessage) return 'video';
  if (m.audio || msg.audioMessage) return 'audio';
  if (m.document || msg.documentMessage) return 'document';
  if (msg.stickerMessage) return 'sticker';
  if (msg.locationMessage) return 'location';
  if (msg.contactMessage) return 'contact';
  return 'unknown';
}

function pickBody(m) {
  if (typeof m.body === 'string') return m.body;
  if (typeof m.text === 'string') return m.text;
  const msg = m.message || {};
  if (msg.conversation) return msg.conversation;
  if (msg.extendedTextMessage && msg.extendedTextMessage.text) return msg.extendedTextMessage.text;
  if (msg.imageMessage && msg.imageMessage.caption) return msg.imageMessage.caption;
  if (msg.videoMessage && msg.videoMessage.caption) return msg.videoMessage.caption;
  if (msg.documentMessage && msg.documentMessage.caption) return msg.documentMessage.caption;
  return null;
}

function pickMediaUrl(m) {
  if (m.media_url || m.mediaUrl) return m.media_url || m.mediaUrl;
  const msg = m.message || {};
  return (
    (msg.imageMessage && msg.imageMessage.URL) ||
    (msg.videoMessage && msg.videoMessage.URL) ||
    (msg.audioMessage && msg.audioMessage.URL) ||
    (msg.documentMessage && msg.documentMessage.URL) ||
    null
  );
}


const EVENT_REGISTRY = {
  'message.received': {
    domain: "message",
    label: "Mensagem Recebida",
    laymanDescription: "Quando alguém envia ou recebe uma mensagem no WhatsApp.",
    opensTicket: true,
    updatesContact: true,
    savesMessage: true
  },
  'presence.updated': {
    domain: "chat",
    label: "Status de Digitação",
    laymanDescription: "Quando o usuário está 'digitando...' ou 'gravando áudio...'.",
    opensTicket: false,
    updatesContact: false,
    savesMessage: false
  },
  'message.receipt': {
    domain: "message",
    label: "Confirmação de Leitura",
    laymanDescription: "Os 'tiques azuis' avisando se a pessoa recebeu ou leu a mensagem.",
    opensTicket: false,
    updatesContact: false,
    savesMessage: false
  },
  'history.sync': {
    domain: "system",
    label: "Sincronização de Histórico",
    laymanDescription: "Quando o celular empurra todas as mensagens antigas para o nosso sistema.",
    opensTicket: false,
    updatesContact: false,
    savesMessage: true
  },
  'connection.qr': {
    domain: "system",
    label: "Código QR",
    laymanDescription: "Quando o sistema pede o QR Code para conectar um celular novo.",
    opensTicket: false,
    updatesContact: false,
    savesMessage: false
  },
  'connection.connected': {
    domain: "system",
    label: "Aparelho Conectado",
    laymanDescription: "Quando o WhatsApp conecta com sucesso no servidor e está pronto para uso.",
    opensTicket: false,
    updatesContact: false,
    savesMessage: false
  },
  'connection.disconnected': {
    domain: "system",
    label: "Aparelho Desconectado",
    laymanDescription: "Quando a conexão com a Meta cai, ou o celular fica sem internet.",
    opensTicket: false,
    updatesContact: false,
    savesMessage: false
  },
  'connection.error': {
    domain: "system",
    label: "Erro na Conexão",
    laymanDescription: "Qualquer problema técnico que a WuzAPI ou os servidores do Facebook enfrentem.",
    opensTicket: false,
    updatesContact: false,
    savesMessage: false
  }
};

function enrichWithLaymanRegistry(normalizedPayload) {
  if (!normalizedPayload || !normalizedPayload.event) return normalizedPayload;
  const ev = normalizedPayload.event;
  if (EVENT_REGISTRY[ev]) {
    normalizedPayload._meta = EVENT_REGISTRY[ev];
  }
  return normalizedPayload;
}

module.exports = { normalize: (raw) => enrichWithLaymanRegistry(normalize(raw)), _flatten: flatten, EVENT_REGISTRY };
