const fs = require('fs');
const path = require('path');

const bridgeFile = path.join(__dirname, 'apps/bot/server/src/bridge/supabase-sync.js');
let bridgeContent = fs.readFileSync(bridgeFile, 'utf8');

const oldCreateInstance = `         if (createRes && createRes.token) {
           instanceToken = createRes.token;
           // Guarda o token gerado no Supabase para nunca perdê-lo
           await updateInstance(instance.id, { wuzapi_token: instanceToken, wuzapi_instance_id: wuzapiId });
         } else if (createRes && createRes.Token) {
           instanceToken = createRes.Token;
           await updateInstance(instance.id, { wuzapi_token: instanceToken, wuzapi_instance_id: wuzapiId });
         }`;

const newCreateInstance = `         if (createRes && createRes.token) {
           instanceToken = createRes.token;
         } else if (createRes && createRes.Token) {
           instanceToken = createRes.Token;
         }

         if (instanceToken) {
           // Guarda o token gerado no Supabase para nunca perdê-lo
           await updateInstance(instance.id, { wuzapi_token: instanceToken, wuzapi_instance_id: wuzapiId });
           
           // SOLUÇÃO DE SPLIT-BRAIN: O Gateway Node (proxy) precisa desse token no arquivo de cache local
           // para que a rota /qr e /status funcionem quando o frontend chamar a API do proxy.
           try {
             const fs = require('fs');
             const path = require('path');
             const connPath = '/root/Multizap/gateway/data/connections.json';
             if (fs.existsSync(connPath)) {
               const state = JSON.parse(fs.readFileSync(connPath, 'utf8'));
               const existing = state.connections.find(c => c.connection_id === wuzapiId || c.id === wuzapiId);
               if (existing) {
                 existing.wuzapi_token = instanceToken;
               } else {
                 state.connections.push({
                   connection_id: wuzapiId,
                   workspace_id: instance.workspace_id,
                   name: instance.name,
                   provider: 'wuzapi',
                   status: 'disconnected',
                   wuzapi_instance_id: wuzapiId,
                   wuzapi_token: instanceToken,
                   created_at: new Date().toISOString(),
                   updated_at: new Date().toISOString()
                 });
               }
               fs.writeFileSync(connPath, JSON.stringify(state, null, 2), 'utf8');
               log('INFO', \`\${instance.name}: token injetado no connections.json do Gateway.\`);
             }
           } catch(e) {
             log('WARN', \`Falha ao injetar token no connections.json do Gateway: \${e.message}\`);
           }
         }`;

if (bridgeContent.includes(oldCreateInstance)) {
  bridgeContent = bridgeContent.replace(oldCreateInstance, newCreateInstance);
  fs.writeFileSync(bridgeFile, bridgeContent, 'utf8');
  console.log("Bridge worker updated to sync connection.json cache");
} else {
  console.log("Old createInstance block not found in bridge.");
}
