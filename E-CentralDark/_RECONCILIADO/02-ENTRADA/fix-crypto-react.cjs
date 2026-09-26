const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'apps/bot/src/services/instanceService.ts');
let content = fs.readFileSync(file, 'utf8');

// O crypto.randomUUID() pode quebrar em alguns browsers mais antigos se não for injetado via self.crypto ou gerado nativamente pelo Supabase
// Melhor usarmos uma string pura simples baseada no time + math random pra não travar a build JSX.
const oldUUID = `connection_id: crypto.randomUUID()`;
const newUUID = `connection_id: 'mz_conn_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9)`;

if (content.includes(oldUUID)) {
  content = content.replace(oldUUID, newUUID);
  fs.writeFileSync(file, content, 'utf8');
  console.log('UUID generation sanitized.');
}
