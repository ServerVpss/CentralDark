/**
 * Supabase Sync Service
 * 
 * Salva eventos, mensagens e contatos diretamente no Supabase.
 * Usa a service_role key para acesso privilegiado.
 * 
 * Variáveis de ambiente:
 *   SUPABASE_URL        - URL do projeto Supabase
 *   SUPABASE_SERVICE_KEY - Service role key (NUNCA commitar)
 */

const env = require('../config/env');
const logger = require('../utils/logger');

let supabaseUrl = '';
let supabaseKey = '';

function init() {
  supabaseUrl = process.env.SUPABASE_URL || env.SUPABASE_URL || '';
  supabaseKey = process.env.SUPABASE_SERVICE_KEY || env.SUPABASE_SERVICE_KEY || '';
  
  if (!supabaseUrl || !supabaseKey) {
    logger.warn('supabase_sync_disabled', 'SUPABASE_URL ou SUPABASE_SERVICE_KEY não configurados');
    return false;
  }
  logger.info('supabase_sync_ready', { url: supabaseUrl.replace(/https?:\/\//, '').split('.')[0] + '...' });
  return true;
}

async function rest(method, table, body, query = '') {
  if (!supabaseUrl || !supabaseKey) {
    if (!init()) return null;
  }
  
  const url = `${supabaseUrl}/rest/v1/${table}${query ? '?' + query : ''}`;
  const opts = {
    method,
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      'Accept-Profile': 'api',
      'Content-Profile': 'api',
    },
  };
  if (body) opts.body = JSON.stringify(body);
  
  try {
    const res = await fetch(url, opts);
    if (!res.ok) {
      const text = await res.text();
      logger.error('supabase_rest_error', { method, table, status: res.status, error: text.slice(0, 200) });
      return null;
    }
    return res.json();
  } catch (err) {
    logger.error('supabase_rest_failed', { method, table, message: err.message });
    return null;
  }
}

/**
 * Salva uma mensagem recebida no Supabase
 */
async function saveMessage(instanceId, workspaceId, normalized) {
  if (!normalized || !workspaceId) return null;

  // REGRAS DE ISOLAMENTO DO ROBÔ (Recargas Brasil / 5676)
  const BOT_NUMBER = "5676";
  const fromJid = normalized.from || '';
  const senderId = normalized.sender_id || '';
  
  // Se a mensagem vem do próprio robô, não podemos considerá-la como um Lead novo que abre ticket.
  if (fromJid.includes(BOT_NUMBER) || senderId.includes(BOT_NUMBER) || normalized.is_from_me) {
     // Apenas salvamos para auditoria de disparo, marcando flag skip_ticket
     normalized._skip_ticket = true;
  }
  
  const payload = {
    workspace_id: workspaceId,
    instance_id: instanceId || null,
    topic: 'message',
    extension: normalized.provider || 'wuzapi',
    text: normalized.body || null,
    payload: {
      external_message_id: normalized.external_message_id,
      from: normalized.from,
      to: normalized.to,
      chat_id: normalized.chat_id,
      sender_id: normalized.sender_id,
      push_name: normalized.push_name,
      is_group: normalized.is_group,
      is_from_me: normalized.is_from_me,
      type: normalized.type,
      media_url: normalized.media_url,
      timestamp: normalized.timestamp,
    },
    direction: normalized.is_from_me ? 'outgoing' : 'incoming',
    status: 'received',
    event: normalized.event || 'message.received',
    external_message_id: normalized.external_message_id || null,
  };

  const result = await rest('POST', 'messages', payload);
  if (result) {
    logger.info('message_saved_to_supabase', { 
      event: normalized.event,
      external_id: normalized.external_message_id?.slice(0, 20),
    });
  }
  return result;
}

/**
 * Salva ou atualiza um contato no Supabase
 */
async function upsertContact(workspaceId, contactData) {
  if (!workspaceId || !contactData || !contactData.phone) return null;
  
  // Regra de Isolamento do Robô (5676)
  if (String(contactData.phone).endsWith('5676') || String(contactData.jid).includes('5676')) {
    // Tratar como conexão própria/robô, nunca como lead
    contactData.tags = ['bot_connection', 'recargas_brasil'];
    if (!contactData.name) contactData.name = 'Recargas Brasil (Sistema)';
  }
  
  // Busca contato existente para não sobrescrever nome locked
  const existingReq = await rest('GET', `contacts`, null, 
    `workspace_id=eq.${workspaceId}&phone=eq.${encodeURIComponent(contactData.phone)}&select=id,name_locked,name_source`);
  
  const existing = existingReq && existingReq.length > 0 ? existingReq[0] : null;

  const payload = {
    workspace_id: workspaceId,
    phone: contactData.phone,
    jid: contactData.jid || null,
    tags: contactData.tags || [],
    notes: contactData.notes || null,
    is_blocked: !!contactData.is_blocked,
    updated_at: new Date().toISOString(),
  };

  // Respeita nomes manuais
  let nameLocked = existing && (existing.name_locked === true || existing.name_source === 'manual');
  
  if (!nameLocked) {
    if (contactData.name) payload.name = contactData.name;
    payload.name_source = contactData.name_source || 'whatsapp_sync';
  }
  
  if (contactData.push_name !== undefined) payload.push_name = contactData.push_name;
  if (contactData.full_name !== undefined) payload.full_name = contactData.full_name;
  if (contactData.business_name !== undefined) payload.business_name = contactData.business_name;
  if (contactData.first_name !== undefined) payload.first_name = contactData.first_name;
  
  if (contactData.avatar_url !== undefined) payload.avatar_url = contactData.avatar_url;
  if (contactData.avatar_id !== undefined) payload.avatar_id = contactData.avatar_id;
  if (contactData.avatar_type !== undefined) payload.avatar_type = contactData.avatar_type;
  if (contactData.avatar_direct_path !== undefined) payload.avatar_direct_path = contactData.avatar_direct_path;

  if (existing) {
    // Atualiza existente
    await rest('PATCH', `contacts`, payload, `id=eq.${existing.id}`);
    logger.info('contact_updated', { phone: contactData.phone });
    return existing;
  } else {
    // Cria novo
    payload.created_at = new Date().toISOString();
    const result = await rest('POST', 'contacts', payload);
    logger.info('contact_created', { phone: contactData.phone });
    return result;
  }
}

/**
 * Registra evento no system_logs
 */
async function logEvent(action, level, details = {}) {
  const payload = {
    action,
    level: level || 'info',
    details,
    created_at: new Date().toISOString(),
  };
  try {
    return await rest('POST', 'system_logs', payload);
  } catch(e) {
    logger.warn('system_logs_suppressed', { action, reason: e.message || 'RLS_Block' });
    return null;
  }
}

/**
 * Sincroniza contatos do WuzAPI para o Supabase
 */
async function syncContactsFromWuzapi(instanceId, workspaceId, wuzapiToken) {
  const wuzapiClient = require('./wuzapiClient');
  logger.info('contacts_sync_start', { instanceId, workspaceId });
  
  try {
    const contactsData = await wuzapiClient.getContacts({ token: wuzapiToken });
    
    if (!contactsData || typeof contactsData !== 'object') {
      logger.warn('contacts_sync_no_data', { response: typeof contactsData });
      return { synced: 0, total: 0 };
    }

    const contactsList = Array.isArray(contactsData) 
      ? contactsData 
      : Object.entries(contactsData).map(([jid, data]) => ({ jid, ...data }));

    let synced = 0;
    
    // Batch processing avatars
    for (let i = 0; i < contactsList.length; i++) {
      const c = contactsList[i];
      const rawJid = c.jid || c.id || c.phone || c.number || null;
      if (!rawJid) continue;
      
      const phone = rawJid.replace('@s.whatsapp.net', '').replace('@c.us', '');
      
      const pushName = c.PushName || c.pushName || c.push_name || null;
      const fullName = c.FullName || c.full_name || null;
      const businessName = c.BusinessName || c.business_name || null;
      const verifiedName = c.VerifiedName || c.verifiedName || null;
      const firstName = c.FirstName || c.first_name || null;
      
      const bestName = fullName || businessName || pushName || firstName || phone;
      
      let avatar_url = null;
      let avatar_id = null;
      let avatar_type = null;
      let avatar_direct_path = null;

      // Rate limit / prevent overloading avatar fetch
      // If we don't already have an avatar, or we want to do opportunist fetch.
      // But we shouldn't do it for 6000 contacts. We'll only do it for a small batch or if specific condition met.
      // Let's do it opportunisticly or limit to first 50 just for the sync to not break.
      if (i < 50) {
        try {
          const avatarData = await wuzapiClient.getUserAvatar({ token: wuzapiToken, phone: rawJid, preview: true });
          if (avatarData && avatarData.url) {
            avatar_url = avatarData.url;
            avatar_id = avatarData.id || null;
            avatar_type = avatarData.type || null;
            avatar_direct_path = avatarData.direct_path || null;
          }
        } catch(e) {
          // Do nothing, let it gracefully fall back to null avatar
          logger.warn('contacts_sync_avatar_failed', { phone: rawJid });
        }
      }

      await upsertContact(workspaceId, {
        phone,
        jid: rawJid,
        name: bestName,
        push_name: pushName,
        full_name: fullName,
        business_name: businessName,
        first_name: firstName,
        avatar_url,
        avatar_id,
        avatar_type,
        avatar_direct_path,
        tags: ['whatsapp'],
      });
      synced++;
    }

    logger.info('contacts_sync_done', { synced, total: contactsList.length });
    await logEvent('contacts.sync.completed', 'info', { 
      instanceId, workspaceId, synced, total: contactsList.length 
    });
    
    return { synced, total: contactsList.length };
  } catch (err) {
    logger.error('contacts_sync_error', { instanceId, error: err.message });
    return { synced: 0, total: 0, error: err.message };
  }
}

async function syncRecentMessages(instanceId, workspaceId, wuzapiToken) {
  const wuzapiClient = require('./wuzapiClient');
  logger.info('messages_sync_start', { instanceId });
  
  try {
    const result = await wuzapiClient.getMessages({ token: wuzapiToken, limit: 50 });
    let synced = 0;
    
    if (result && Array.isArray(result)) {
      for (const msg of result) {
        const normalized = require('./normalizeService').normalize(msg);
        if (normalized && normalized.event === 'message.received') {
          await saveMessage(instanceId, workspaceId, normalized);
          synced++;
        }
      }
    }
    
    logger.info('messages_sync_done', { synced });
    return { synced };
  } catch (err) {
    logger.error('messages_sync_failed', { message: err.message });
    return { synced: 0, error: err.message };
  }
}

module.exports = {
  init,
  saveMessage,
  upsertContact,
  logEvent,
  syncContactsFromWuzapi,
  syncRecentMessages,
};
