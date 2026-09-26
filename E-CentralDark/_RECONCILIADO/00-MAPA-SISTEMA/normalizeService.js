// Normaliza payloads brutos da WuzAPI para o formato interno do MultiZap.
// VERSION: 2026-05-21.7 — +message_fields_extracted log; jsonData/ChatPresence/HistorySync/ReadReceipt/Message/QR/Connected/Disconnected
//

// Suporta TODOS os 45 tipos oficiais do WuzAPI (constants.go) + qualquer
// evento desconhecido (preserva raw e marca como unknown:<Type>).
//
// Aceita 3 formatos de payload:
//   1) "direto":          { Info:{...}, Message:{...} }  ou { event:"message", message:{...} }
//   2) WuzAPI real:       { instanceName, userID, jsonData: "<JSON string>" }
//   3) event como objeto: { event:{ Info, Message }, type:"Message" }
//
// Famílias de evento normalizadas:
//   connection.*  (qr, connected, disconnected, error, logged_out, paired, banned, ...)
//   message.*     (received, receipt, failed, media_retry)
//   presence.*    (updated, global)
//   contact.*     (updated, blocklist, pushname_updated, about_updated)
//   profile.*     (photo.updated)
//   group.*       (updated, joined, participants.updated)
//   call.*        (offer, accept, terminate, notice, latency)
//   history.sync
//   sync.*        (offline, state)
//   identity.changed
//   privacy.updated
//   newsletter.*  (join, leave, mute, update)
//   fb.message
//   unknown:<Type> — nunca quebra, sempre preserva raw

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
    } catch (_e) { /* mantém raw original */ }
  }

  // 2) event como objeto -> achatar
  if (raw && raw.event && typeof raw.event === 'object') {
    const inner = raw.event;
    raw = { ...raw, ...inner, type: raw.type || inner.type };
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

function jidToPhone(jid) {
  if (!jid) return null;
  const digits = String(jid).split('@')[0].split(':')[0].replace(/\D/g, '');
  return digits || null;
}

// Mapa Tipo WuzAPI -> handler de normalização.
// Tudo case-insensitive na busca.
const TYPE_MAP = {
  // Mensagens
  message: normalizeMessage,
  undecryptablemessage: (raw) => ({ event: 'message.failed', reason: 'undecryptable', external_message_id: raw?.Info?.ID || null, raw }),
  receipt: normalizeReceipt,
  readreceipt: normalizeReceipt,
  mediaretry: (raw) => ({ event: 'message.media_retry', external_message_id: raw?.MessageID || raw?.Info?.ID || null, raw }),

  // Grupos
  groupinfo: normalizeGroupInfo,
  joinedgroup: (raw) => ({ event: 'group.joined', jid: raw?.JID || raw?.GroupJID || null, raw }),
  picture: normalizePicture,
  blocklistchange: (raw) => ({ event: 'contact.blocklist', jid: raw?.JID || null, action: raw?.Action || null, raw }),
  blocklist: (raw) => ({ event: 'contact.blocklist', jids: raw?.JIDs || [], raw }),

  // Conexão
  connected: () => ({ event: 'connection.connected' }),
  disconnected: () => ({ event: 'connection.disconnected' }),
  connectfailure: (raw) => ({ event: 'connection.error', reason: raw?.Reason || null, raw }),
  keepaliverestored: () => ({ event: 'connection.keepalive', state: 'restored' }),
  keepalivetimeout: () => ({ event: 'connection.keepalive', state: 'timeout' }),
  qrtimeout: () => ({ event: 'connection.qr', state: 'timeout' }),
  loggedout: (raw) => ({ event: 'connection.logged_out', reason: raw?.Reason || null, raw }),
  clientoutdated: () => ({ event: 'connection.outdated' }),
  temporaryban: (raw) => ({ event: 'connection.banned', expires_at: raw?.Expire || null, raw }),
  streamerror: (raw) => ({ event: 'connection.stream_error', code: raw?.Code || null, raw }),
  streamreplaced: () => ({ event: 'connection.stream_error', reason: 'replaced' }),
  pairsuccess: (raw) => ({ event: 'connection.paired', business_name: raw?.BusinessName || null, raw }),
  pairerror: (raw) => ({ event: 'connection.pair_error', reason: raw?.Error || null, raw }),
  qr: (raw) => ({ event: 'connection.qr', codes: raw?.Codes || (raw?.Code ? [raw.Code] : []), raw }),
  qrscannedwithoutmultidevice: () => ({ event: 'connection.qr_scanned_no_md' }),
  catrefresherror: (raw) => ({ event: 'connection.cat_error', raw }),

  // Privacidade / Settings
  privacysettings: (raw) => ({ event: 'privacy.updated', raw }),
  pushnamesetting: (raw) => ({ event: 'contact.pushname_updated', push_name: raw?.PushName || null, raw }),
  userabout: (raw) => ({ event: 'contact.about_updated', jid: raw?.JID || null, about: raw?.Status || null, raw }),

  // Sincronização
  appstate: (raw) => ({ event: 'state.sync', name: raw?.Name || null, raw }),
  appstatesynccomplete: (raw) => ({ event: 'state.sync', complete: true, name: raw?.Name || null, raw }),
  historysync: normalizeHistorySync,
  offlinesynccompleted: (raw) => ({ event: 'sync.offline', complete: true, count: raw?.Count || null, raw }),
  offlinesyncpreview: (raw) => ({ event: 'sync.offline', preview: true, count: raw?.Count || null, raw }),

  // Chamadas
  calloffer: (raw) => normalizeCall('offer', raw),
  callaccept: (raw) => normalizeCall('accept', raw),
  callterminate: (raw) => normalizeCall('terminate', raw),
  calloffernotice: (raw) => normalizeCall('notice', raw),
  callrelaylatency: (raw) => ({ event: 'call.latency', latency_ms: raw?.Latency || null, raw }),

  // Presença
  presence: (raw) => ({
    event: 'presence.global',
    jid: raw?.From || raw?.JID || null,
    is_unavailable: !!raw?.Unavailable,
    last_seen: raw?.LastSeen || null,
    raw,
  }),
  chatpresence: normalizeChatPresence,

  // Identidade
  identitychange: (raw) => ({ event: 'identity.changed', jid: raw?.JID || null, raw }),

  // Newsletter
  newsletterjoin: (raw) => ({ event: 'newsletter.join', jid: raw?.JID || null, raw }),
  newsletterleave: (raw) => ({ event: 'newsletter.leave', jid: raw?.JID || null, raw }),
  newslettermutechange: (raw) => ({ event: 'newsletter.mute', jid: raw?.JID || null, raw }),
  newsletterliveupdate: (raw) => ({ event: 'newsletter.update', jid: raw?.JID || null, raw }),

  // Meta bridge
  fbmessage: (raw) => ({ event: 'fb.message', raw }),
};

// ---------- Handlers específicos ----------
function normalizeMessage(raw) {
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

function normalizeReceipt(raw) {
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

function normalizeChatPresence(raw) {
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

function normalizeHistorySync(raw) {
  const data = raw.Data || raw.data || raw;
  return {
    event: 'history.sync',
    sync_type: raw.SyncType || raw.syncType || data.syncType || null,
    progress: raw.Progress || raw.progress || null,
    conversations: Array.isArray(data.conversations) ? data.conversations.length : undefined,
    raw,
  };
}

function normalizeGroupInfo(raw) {
  return {
    event: 'group.updated',
    jid: raw.JID || raw.GroupJID || null,
    name: raw.Name?.Name || raw.Name || null,
    subject: raw.Topic?.Topic || null,
    owner: raw.Sender || raw.OwnerJID || null,
    participants: raw.NewParticipants || raw.Participants || null,
    action: raw.Action || null,
    raw,
  };
}

function normalizePicture(raw) {
  return {
    event: 'profile.photo.updated',
    jid: raw.JID || null,
    author: raw.Author || null,
    timestamp: toIsoTs(raw.Timestamp),
    remove: !!raw.Remove,
    raw,
  };
}

function normalizeCall(kind, raw) {
  const fromJid = raw.From || raw.CallCreator || raw.Sender || null;
  return {
    event: `call.${kind}`,
    call_id: raw.CallID || raw.ID || null,
    from: fromJid,
    from_phone: jidToPhone(fromJid),
    is_video: !!raw.Video,
    is_group: !!raw.IsGroup,
    timestamp: toIsoTs(raw.Timestamp),
    raw,
  };
}

// ---------- Entry point ----------
function normalize(rawIn) {
  if (!rawIn || typeof rawIn !== 'object') return null;
  const raw = flatten(rawIn);

  // 1) Tenta pelo type (jeito oficial WuzAPI)
  const typeKey = String(raw.type || '').toLowerCase().replace(/[_-]/g, '');
  if (typeKey && TYPE_MAP[typeKey]) {
    try { return TYPE_MAP[typeKey](raw); }
    catch (_e) { return { event: `unknown:${raw.type}`, error: 'normalize_failed', raw }; }
  }

  // 2) Fallback: payload "direto" sem type (formato antigo / Baileys-like)
  const evStr = String(raw.event || '').toLowerCase();
  if (evStr.includes('qr')) return { event: 'connection.qr', raw };
  if (evStr.includes('connected')) return { event: 'connection.connected', raw };
  if (evStr.includes('disconnected') || evStr === 'logout') return { event: 'connection.disconnected', raw };
  if (evStr.includes('error')) return { event: 'connection.error', raw };

  // Message no formato "direto" (Info+Message ou message:{}/data:{})
  const hasInfo = raw.Info && typeof raw.Info === 'object';
  const hasMessage = raw.Message && typeof raw.Message === 'object';
  if (hasInfo || hasMessage || evStr.includes('message')) {
    if (hasInfo || hasMessage) return normalizeMessage(raw);
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

  // 3) Evento desconhecido — preserva raw, NÃO quebra
  return { event: `unknown:${raw.type || evStr || 'no_event'}`, raw };
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

module.exports = { normalize, _flatten: flatten, _TYPE_MAP: TYPE_MAP };
