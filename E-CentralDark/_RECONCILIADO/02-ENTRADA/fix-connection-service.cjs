const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'apps/crm/atendimento-whatsapp-gateway-deploy/gateway/src/services/connectionService.js');
let content = fs.readFileSync(file, 'utf8');

// 1. Corrigir getStatus()
const oldGetStatus = `async function getStatus(connectionId) {
  const raw = getRaw(connectionId);
  if (!raw) return null;
  if (!raw.wuzapi_token) return { status: raw.status };
  try {
    const r = await wuzapi.getStatus({ token: raw.wuzapi_token });
    return r;
  } catch (err) {
    logger.warn('wuzapi_status_failed', { connection_id: connectionId, message: err && err.message });
    return { status: 'unknown' };
  }
}`;

const newGetStatus = `async function getStatus(connectionId) {
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
}`;

// 2. Corrigir getQr() para invocar /session/connect caso a sessão esteja morta na WuzAPI
const oldGetQr = `async function getQr(connectionId) {
  const raw = getRaw(connectionId);
  if (!raw) return null;
  if (!raw.wuzapi_token) throw new Error('conexão sem token WuzAPI');
  try {
    await wuzapi.startSession({ token: raw.wuzapi_token });
  } catch (_) { /* já conectada? segue */ }
  const r = await wuzapi.getQr({ token: raw.wuzapi_token });
  updateConnection(connectionId, { last_qr_at: new Date().toISOString(), status: 'qr' });
  return r;
}`;

const newGetQr = `async function getQr(connectionId) {
  const raw = getRaw(connectionId);
  if (!raw) return null;
  if (!raw.wuzapi_token) throw new Error('conexão sem token WuzAPI');
  
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
    throw new Error('Falha ao gerar QR na WuzAPI: ' + err.message);
  }
}`;

content = content.replace(oldGetStatus, newGetStatus);
content = content.replace(oldGetQr, newGetQr);

fs.writeFileSync(file, content, 'utf8');
