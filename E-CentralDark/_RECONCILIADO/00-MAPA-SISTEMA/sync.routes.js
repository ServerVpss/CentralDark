// Rotas de sincronização de dados do WhatsApp (contatos, mensagens)
const router = require('express').Router();
const connectionService = require('../services/connectionService');
const { ok, fail } = require('../utils/response');
const logger = require('../utils/logger');

let supabaseService;
try { supabaseService = require('../services/supabaseService'); } catch(e) { supabaseService = null; }

/**
 * GET /sync/contacts/:connectionId
 * Puxa contatos do WhatsApp via WuzAPI e salva no Supabase
 */
router.get('/contacts/:connectionId', async (req, res) => {
  const conn = connectionService.getRaw(req.params.connectionId);
  if (!conn) return fail(res, 'not_found', 'Conexão não encontrada', 404);
  if (conn.status !== 'connected') return fail(res, 'not_connected', 'WhatsApp não está conectado', 409);
  if (!conn.wuzapi_token) return fail(res, 'no_token', 'Conexão sem token WuzAPI', 409);

  if (!supabaseService) {
    return fail(res, 'supabase_not_configured', 'Supabase sync não configurado', 500);
  }

  const result = await supabaseService.syncContactsFromWuzapi(
    conn.connection_id,
    conn.workspace_id,
    conn.wuzapi_token
  );

  logger.info('sync_contacts_manual', { connection_id: conn.connection_id, result });
  return ok(res, result);
});

/**
 * GET /sync/messages/:connectionId
 * Puxa mensagens recentes do WhatsApp via WuzAPI e salva no Supabase
 */
router.get('/messages/:connectionId', async (req, res) => {
  const conn = connectionService.getRaw(req.params.connectionId);
  if (!conn) return fail(res, 'not_found', 'Conexão não encontrada', 404);
  if (conn.status !== 'connected') return fail(res, 'not_connected', 'WhatsApp não está conectado', 409);
  if (!conn.wuzapi_token) return fail(res, 'no_token', 'Conexão sem token WuzAPI', 409);

  if (!supabaseService) {
    return fail(res, 'supabase_not_configured', 'Supabase sync não configurado', 500);
  }

  const result = await supabaseService.syncRecentMessages(
    conn.connection_id,
    conn.workspace_id,
    conn.wuzapi_token
  );

  logger.info('sync_messages_manual', { connection_id: conn.connection_id, result });
  return ok(res, result);
});

/**
 * POST /sync/full/:connectionId
 * Sincronização completa: conexão + contatos + mensagens recentes
 */
router.post('/full/:connectionId', async (req, res) => {
  const conn = connectionService.getRaw(req.params.connectionId);
  if (!conn) return fail(res, 'not_found', 'Conexão não encontrada', 404);
  if (conn.status !== 'connected') return fail(res, 'not_connected', 'WhatsApp não está conectado', 409);
  if (!conn.wuzapi_token) return fail(res, 'no_token', 'Conexão sem token WuzAPI', 409);

  if (!supabaseService) {
    return fail(res, 'supabase_not_configured', 'Supabase sync não configurado', 500);
  }

  const contactsResult = await supabaseService.syncContactsFromWuzapi(
    conn.connection_id, conn.workspace_id, conn.wuzapi_token
  );
  const messagesResult = await supabaseService.syncRecentMessages(
    conn.connection_id, conn.workspace_id, conn.wuzapi_token
  );

  logger.info('sync_full_complete', { 
    connection_id: conn.connection_id, 
    contacts: contactsResult,
    messages: messagesResult,
  });

  return ok(res, { contacts: contactsResult, messages: messagesResult });
});

/**
 * POST /webhook/configure/:connectionId
 * Configura o webhook do WuzAPI para apontar para o Gateway
 */
router.post('/webhook/configure/:connectionId', async (req, res) => {
  const conn = connectionService.getRaw(req.params.connectionId);
  if (!conn) return fail(res, 'not_found', 'Conexão não encontrada', 404);
  if (!conn.wuzapi_token) return fail(res, 'no_token', 'Conexão sem token WuzAPI', 409);

  const wuzapiClient = require('../services/wuzapiClient');
  const baseUrl = req.body?.callback_url || req.query?.callback_url || 
    `http://127.0.0.1:${env.PORT}/webhooks/wuzapi`;
  const secret = req.query.secret || env.WUZAPI_WEBHOOK_SECRET || '';
  
  const webhookUrl = `${baseUrl}?secret=${secret}&connection_id=${conn.connection_id}`;

  try {
    const result = await wuzapiClient.setWebhook({ 
      token: conn.wuzapi_token, 
      webhookUrl 
    });
    
    logger.info('wuzapi_webhook_configured', { 
      connection_id: conn.connection_id, 
      webhookUrl: webhookUrl.replace(/secret=[^&]+/, 'secret=***') 
    });
    
    return ok(res, { 
      configured: true, 
      webhook_url: webhookUrl.replace(/secret=[^&]+/, 'secret=***'),
      events: wuzapiClient.WUZAPI_EVENTS,
      result 
    });
  } catch (err) {
    logger.error('wuzapi_webhook_config_failed', { message: err.message });
    return fail(res, 'webhook_config_failed', err.message, 502);
  }
});

module.exports = router;