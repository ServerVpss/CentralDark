const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'apps/crm/atendimento-whatsapp-gateway-deploy/gateway/src/services/connectionService.js');
let content = fs.readFileSync(file, 'utf8');

const oldGetRaw = `function getRaw(connectionId) {
  const state = readAll();
  return state.connections.find((c) => c.connection_id === connectionId) || null;
}`;

const newGetRaw = `function getRaw(connectionId) {
  const state = readAll();
  // Precisamos ser tolerantes pois o Gateway cria \`connection_id\`, mas o Supabase Sync ou o Frontend 
  // pode estar usando o \`id\` UUID ou o \`wuzapi_instance_id\`.
  return state.connections.find((c) => c.connection_id === connectionId || c.wuzapi_instance_id === connectionId || c.id === connectionId) || null;
}`;

if (content.includes(oldGetRaw)) {
  content = content.replace(oldGetRaw, newGetRaw);
  fs.writeFileSync(file, content, 'utf8');
  console.log("getRaw tolerante ativado.");
}
