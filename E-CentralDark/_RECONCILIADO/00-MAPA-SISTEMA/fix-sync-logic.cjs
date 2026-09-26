const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'apps/bot/server/src/bridge/supabase-sync.js');
let content = fs.readFileSync(file, 'utf8');

const oldCall = `async function wuzapiCall(method, pathStr, body) {
  const url = \`\${WUZAPI_URL}\${pathStr}\`;
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', 'token': WUZAPI_TOKEN },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  return res.json();
}`;

const newCall = `async function wuzapiCall(method, pathStr, body, customToken = null, isAdmin = false) {
  const url = \`\${WUZAPI_URL}\${pathStr}\`;
  
  // Se for admin, passa via 'Authorization'. Se for normal, via 'Token' ou o customToken da instancia
  const headers = { 'Content-Type': 'application/json' };
  
  if (isAdmin) {
    headers['Authorization'] = WUZAPI_TOKEN;
  } else {
    headers['Token'] = customToken || WUZAPI_TOKEN;
  }

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  
  const res = await fetch(url, opts);
  
  if (!res.ok) {
     const txt = await res.text().catch(()=>'');
     throw new Error(\`HTTP \${res.status} - \${txt}\`);
  }
  
  return res.json().catch(() => ({}));
}`;

content = content.replace(oldCall, newCall);

const oldSync = `async function syncInstance(instance) {
  try {
    const wuzapiId = instance.wuzapi_instance_id || instance.id;
    let statusData;

    try {
      statusData = await wuzapiCall('GET', \`/session/status/\${wuzapiId}\`);
    } catch (err) {
      log('INFO', \`\${instance.name}: criando sessão WuzAPI...\`);
      try {
        await wuzapiCall('POST', '/session/connect', { id: wuzapiId });
        statusData = await wuzapiCall('GET', \`/session/status/\${wuzapiId}\`);
      } catch (createErr) {
        log('WARN', \`\${instance.name}: falha criar sessão: \${createErr.message}\`);
        return;
      }
    }`;

const newSync = `async function syncInstance(instance) {
  try {
    // 1. Precisamos garantir que a instância existe na WuzAPI.
    // O id do supabae é mapeado para a wuzapi_instance_id
    const wuzapiId = instance.wuzapi_instance_id || instance.id;
    let statusData;
    let instanceToken = instance.wuzapi_token || null;

    // 2. Se o backend ainda não tem um token da WuzAPI, devemos criar o user lá via porta Admin
    if (!instanceToken) {
       try {
         log('INFO', \`\${instance.name}: registrando user na WuzAPI...\`);
         const createRes = await wuzapiCall('POST', '/admin/users', { name: wuzapiId }, null, true);
         if (createRes && createRes.token) {
           instanceToken = createRes.token;
           // Guarda o token gerado no Supabase para nunca perdê-lo
           await updateInstance(instance.id, { wuzapi_token: instanceToken, wuzapi_instance_id: wuzapiId });
         } else if (createRes && createRes.Token) {
           instanceToken = createRes.Token;
           await updateInstance(instance.id, { wuzapi_token: instanceToken, wuzapi_instance_id: wuzapiId });
         } else {
           throw new Error("Token não retornado pela WuzAPI");
         }
       } catch (err) {
         log('WARN', \`\${instance.name}: erro ao registrar user na WuzAPI: \${err.message}\`);
         return; // Nao tenta conectar se nao tem token
       }
    }

    // 3. Avaliando Status Real na WuzAPI
    try {
      statusData = await wuzapiCall('GET', \`/session/status\`, null, instanceToken);
    } catch (err) {
      // 401 ou 500. Se 401, a sessão não tá montada no websocket do GO.
      log('INFO', \`\${instance.name}: iniciando socket /session/connect...\`);
      try {
        const events = ['Message', 'ReadReceipt', 'HistorySync', 'ChatPresence'];
        await wuzapiCall('POST', '/session/connect', { Subscribe: events, events: events.join(','), Immediate: true }, instanceToken);
        // Tenta buscar o QR (que também devolve status se não logado) ou o status novamente
        statusData = await wuzapiCall('GET', \`/session/status\`, null, instanceToken);
      } catch (createErr) {
        log('WARN', \`\${instance.name}: falha socket: \${createErr.message}\`);
        
        // Se a chamada explodiu (ex: token inválido de vez), marca desconectado
        await updateInstance(instance.id, { status: 'disconnected', qr_code_base64: '' });
        return;
      }
    }
    
    // 4. Se ele tá connectado, mas precisa de QR Code (state = unpaired)
    if (statusData && (statusData.state === 'unpaired' || statusData.state === 'UNPAIRED')) {
       try {
         const qrRes = await wuzapiCall('GET', '/session/qr', null, instanceToken);
         if (qrRes && (qrRes.qrcode || qrRes.qr)) {
            statusData.qrcode = qrRes.qrcode || qrRes.qr;
         }
       } catch(e) {
         // ignora, mantem status normal
       }
    }`;

content = content.replace(oldSync, newSync);

const oldStatusCheck = `    if (statusData.connected === true || statusData.status === 'CONNECTED') {`;
const newStatusCheck = `    // WuzAPI Whatsmeow returns state
    const realState = String(statusData.state || statusData.status || '').toLowerCase();
    const isConnected = realState === 'connected' || realState === 'logged_in' || realState === 'loggedin' || statusData.connected === true;

    if (isConnected) {`;
content = content.replace(oldStatusCheck, newStatusCheck);

fs.writeFileSync(file, content, 'utf8');
console.log('supabase-sync updated');
