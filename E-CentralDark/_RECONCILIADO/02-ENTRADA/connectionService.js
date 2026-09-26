// Gerencia conexões WhatsApp (CRUD persistido em data/connections.json).
// Estrutura preparada para depois migrar para a tabela whatsapp_connections do CRM.
const fs = require('fs');
const path = require('path');
const { v4: uuid } = require('uuid');
const env = require('../config/env');
const wuzapi = require('./wuzapiClient');
const logger = require('../utils/logger');

function ensureStore() {
  const dir = path.dirname(env.CONNECTION_STORE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(env.CONNECTION_STORE_PATH)) {
    fs.writeFileSync(env.CONNECTION_STORE_PATH, JSON.stringify({ connections: [] }, null, 2));
  }
}

function readAll() {
  ensureStore();
  return JSON.parse(fs.readFileSync(env.CONNECTION_STORE_PATH, 'utf8'));
}

function writeAll(state) {
  fs.writeFileSync(env.CONNECTION_STORE_PATH, JSON.stringify(state, null, 2));
}

function listConnections({ workspaceId } = {}) {
  const state = readAll();
  const all = state.connections.map(redact);
  return workspaceId ? all.filter((c) => c.workspace_id === workspaceId) : all;
}

function getRaw(connectionId) {
  const state = readAll();
  // Precisamos ser tolerantes pois o Gateway cria `connection_id`, mas o Supabase Sync ou o Frontend 
  // pode estar usando o `id` UUID ou o `wuzapi_instance_id`.
  return state.connections.find((c) => c.connection_id === connectionId || c.wuzapi_instance_id === connectionId || c.id === connectionId) || null;
}

function getConnection(connectionId) {
  const c = getRaw(connectionId);
  return c ? redact(c) : null;
}

function redact(c) {
  const { wuzapi_token, ...rest } = c;
  return rest;
}

async function createConnection({ workspace_id, name, label }) {
  if (!workspace_id) throw new Error('workspace_id obrigatório');
  if (!name) throw new Error('name obrigatório');

  const connection_id = uuid();
  const sessionName = `${workspace_id}__${connection_id}`.slice(0, 60);

  let instance = null;
  let token = null;
  try {
    instance = await wuzapi.createInstance({ name: sessionName });
    token = instance && (instance.token || instance.Token || (instance.data && instance.data.token));
  } catch (err) {
    logger.error('wuzapi_create_instance_failed', { message: err && err.message });
    // Mantém registro local com status=error para o usuário recuperar depois.
  }

  const now = new Date().toISOString();
  const newConn = {
    connection_id,
    workspace_id,
    name,
    label: label || null,
    provider: 'wuzapi',
    status: token ? 'qr' : 'error',
    phone_number: null,
    session_name: sessionName,
    wuzapi_instance_id: instance && (instance.id || instance.ID || sessionName),
    wuzapi_token: token,
    created_at: now,
    updated_at: now,
    last_qr_at: token ? now : null,
    last_connected_at: null,
    last_disconnected_at: null,
  };

  const state = readAll();
  state.connections.push(newConn);
  writeAll(state);

  return redact(newConn);
}

function updateConnection(connectionId, patch) {
  const state = readAll();
  const idx = state.connections.findIndex((c) => c.connection_id === connectionId);
  if (idx === -1) return null;
  state.connections[idx] = { ...state.connections[idx], ...patch, updated_at: new Date().toISOString() };
  writeAll(state);
  return redact(state.connections[idx]);
}

async function deleteConnection(connectionId) {
  const raw = getRaw(connectionId);
  if (!raw) return false;
  try {
    if (raw.wuzapi_instance_id) {
      await wuzapi.deleteInstance({ instanceId: raw.wuzapi_instance_id });
    }
  } catch (err) {
    logger.warn('wuzapi_delete_instance_failed', { message: err && err.message });
  }
  const state = readAll();
  state.connections = state.connections.filter((c) => c.connection_id !== connectionId);
  writeAll(state);
  return true;
}

async function getStatus(connectionId) {
  const raw = getRaw(connectionId);
  if (!raw) return null;
  
  if (!raw.wuzapi_token) return { status: 'disconnected', saved_status: raw.status, wuzapi_state: null };
  
  try {
    const wuzapiResponse = await wuzapi.getStatus({ token: raw.wuzapi_token });
    const state = wuzapiResponse ? String(wuzapiResponse.state || wuzapiResponse.Status || wuzapiResponse.status || '').toLowerCase() : '';
    
    // WuzAPI Whatsmeow returns typically 'connected', 'unpaired', 'timeout', etc.
    const isConnected = state === 'connected' || state === 'logged_in' || state === 'loggedin';
    
    // Auto-update internal JSON state to reflect reality
    if (isConnected && raw.status !== 'connected') {
       updateConnection(connectionId, { status: 'connected' });
    } else if (!isConnected && raw.status === 'connected') {
       updateConnection(connectionId, { status: 'disconnected' });
    }

    return { 
      status: isConnected ? 'connected' : 'disconnected', 
      wuzapi_state: state, 
      details: wuzapiResponse 
    };
  } catch (err) {
    logger.warn('wuzapi_status_failed', { connection_id: connectionId, message: err && err.message });
    
    if (raw.status === 'connected') updateConnection(connectionId, { status: 'disconnected' });
    
    return { status: 'disconnected', wuzapi_state: 'error', error: err.message };
  }
}

async function getQr(connectionId) {
  const raw = getRaw(connectionId);
  if (!raw) return null;
  if (!raw.wuzapi_token) {
    // Se ainda não temos o token no connections.json, tentamos ler do Supabase se configurado, ou disparamos erro.
    // O Bridge vai sincronizar esse token.
    throw new Error('conexão sem token WuzAPI. Aguarde a sincronização.');
  }
  
  try {
    // Sempre forçar a inicialização do Socket na WuzAPI antes do QR
    await wuzapi.startSession({ token: raw.wuzapi_token });
  } catch (err) {
    logger.warn('wuzapi_start_session_failed', { message: err.message });
  }

  try {
    const r = await wuzapi.getQr({ token: raw.wuzapi_token });
    updateConnection(connectionId, { last_qr_at: new Date().toISOString(), status: 'qr' });
    return r;
  } catch (err) {
    // Se a WuzAPI retornar 401 Unauthorized para o token local
    if (err.message && err.message.includes('401')) {
      logger.error('wuzapi_token_rejected_401', { connectionId });
      // Marcamos como inválido para forçar recriação na UI ou no Bridge
      updateConnection(connectionId, { status: 'invalid_token' });
      throw new Error('401: Token inválido ou sessão não autorizada na WuzAPI.');
    }
    throw new Error('Falha ao gerar QR na WuzAPI: ' + err.message);
  }
}

async function restart(connectionId) {
  const raw = getRaw(connectionId);
  if (!raw) return null;
  if (!raw.wuzapi_token) throw new Error('conexão sem token WuzAPI');
  return wuzapi.startSession({ token: raw.wuzapi_token });
}

async function logoutConnection(connectionId) {
  const raw = getRaw(connectionId);
  if (!raw) return null;
  if (!raw.wuzapi_token) return null;
  const r = await wuzapi.logout({ token: raw.wuzapi_token });
  updateConnection(connectionId, { status: 'disconnected', last_disconnected_at: new Date().toISOString() });
  return r;
}

function getTokenFor(connectionId) {
  const raw = getRaw(connectionId);
  return raw ? raw.wuzapi_token : null;
}

module.exports = {
  listConnections,
  getConnection,
  getRaw,
  createConnection,
  updateConnection,
  deleteConnection,
  getStatus,
  getQr,
  restart,
  logoutConnection,
  getTokenFor,
};
