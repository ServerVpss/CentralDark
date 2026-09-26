const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'apps/crm/atendimento-whatsapp-gateway-deploy/gateway/src/services/connectionService.js');
let content = fs.readFileSync(file, 'utf8');

const oldGetQr = `async function getQr(connectionId) {
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

const newGetQr = `async function getQr(connectionId) {
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
}`;

if (content.includes(oldGetQr)) {
  content = content.replace(oldGetQr, newGetQr);
  fs.writeFileSync(file, content, 'utf8');
  console.log("connectionService.js getQr updated for 401 handling.");
}
