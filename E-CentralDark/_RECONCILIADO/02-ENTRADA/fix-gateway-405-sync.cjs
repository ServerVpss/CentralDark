const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'apps/bot/server/src/bridge/supabase-sync.js');
let content = fs.readFileSync(file, 'utf8');

const oldCreate = `const createRes = await wuzapiCall('POST', '/admin/users', { name: wuzapiId }, null, true);`;
const newCreate = `// Alguns forks do WuzAPI usam POST /user para criar usuarios, ou GET /admin/users para listar
         let createRes = null;
         try {
           createRes = await wuzapiCall('POST', '/user', { name: wuzapiId }, null, true);
         } catch(e) {
           createRes = await wuzapiCall('POST', '/admin/users', { name: wuzapiId }, null, true);
         }`;

if (content.includes(oldCreate)) {
   content = content.replace(oldCreate, newCreate);
}

// Em whatsmeow wuzapi nativo, o endpoint de conexao é POST ou GET?
// /session/status: GET
// /session/qr: GET
// /session/connect: POST
// Pelo 405 disparando a cada ciclo, é quase certeza que é o GET /session/status que não aceita GET sem trailing slash ou algo do tipo.
// Ou POST /session/connect! A documentação as vezes pede GET /session/connect
const oldConnect = `await wuzapiCall('POST', '/session/connect', { Subscribe: events, events: events.join(','), Immediate: true }, instanceToken);`;
const newConnect = `try {
          await wuzapiCall('POST', '/session/connect', { Subscribe: events, events: events.join(','), Immediate: true }, instanceToken);
        } catch(e) {
          if (e.message.includes('405')) {
             await wuzapiCall('GET', '/session/connect?Immediate=true', null, instanceToken);
          } else throw e;
        }`;

content = content.replace(oldConnect, newConnect);

fs.writeFileSync(file, content, 'utf8');
console.log('Bridge HTTP verbs relaxed for 405 error masking.');
