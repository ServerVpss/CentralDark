const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'apps/bot/server/src/bridge/supabase-sync.js');
let content = fs.readFileSync(file, 'utf8');

const oldWuzapiCall = `async function wuzapiCall(method, pathStr, body) {
  const url = \`\${WUZAPI_URL}\${pathStr}\`;
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', 'token': WUZAPI_TOKEN },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  return res.json();
}`;

const newWuzapiCall = `async function wuzapiCall(method, pathStr, body) {
  // ATENÇÃO: Desviando o fluxo primitivo para a Gateway.
  // O WuzAPI nativo usa Header 'token', a Gateway usa Bearer TOKEN.
  // A Gateway esta em 127.0.0.1:3100. Precisaríamos refatorar completamente a Bridge se
  // fôssemos migrar tudo. Mas a regra atual é: "Gateway /qr ainda tem 401... O QR só vai funcionar
  // quando o fluxo criar/usar token WuzAPI válido."
  
  // Vamos preservar a chamada na WuzAPI direta (localhost:8081) mas corrigindo os tokens.
  const url = \`\${WUZAPI_URL}\${pathStr}\`;
  
  // O Supabase Sync deve passar um token único por workspace/instância na WuzAPI,
  // mas atualmente o bridge envia o WUZAPI_TOKEN global do .env.
  // Se a WuzAPI responde 401 para a session, o \`/session/connect\` precisa de "token: <id-da-sessão-criada>"
  // O Bridge atual não passa o \`token: instance.wuzapi_instance_id\`, passa o WUZAPI_TOKEN do env.
  // Vamos corrigir \`wuzapiCall\` para aceitar headers customizados.
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', 'token': WUZAPI_TOKEN },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  return res.json();
}`;

// However, the rule explicitly dictates: "não matar processo PM2 no escuro... não confiar apenas no status salvo no banco... Corrigir criação de conexão WuzAPI... Criar token/usuário/instância real na WuzAPI, se necessário... salvar token somente no backend... iniciar /session/connect... buscar /session/qr"

