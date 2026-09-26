const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'apps/bot/server/src/bridge/supabase-sync.js');
let content = fs.readFileSync(file, 'utf8');

const oldWuzapiId = `const wuzapiId = instance.wuzapi_instance_id || instance.id;`;
// O Supabase Sync worker deve mapear connection_id que o FrontEnd cria! O front tá enviando um "mz_conn_XXXX".
const newWuzapiId = `// Extrai o identificador fiel (O Gateway deve sempre rastrear via connection_id)
    const wuzapiId = instance.connection_id || instance.wuzapi_instance_id || instance.id;`;

if(content.includes(oldWuzapiId)) {
    content = content.replace(oldWuzapiId, newWuzapiId);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Bridge worker sync mapped to connection_id directly.');
}
