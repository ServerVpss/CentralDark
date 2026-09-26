const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'apps/bot/server/src/bridge/supabase-sync.js');
let content = fs.readFileSync(file, 'utf8');

const wuzapiAdminToken = `const WUZAPI_TOKEN = process.env.WUZAPI_TOKEN || '';`;
const newWuzapiAdminToken = `const WUZAPI_TOKEN = process.env.WUZAPI_TOKEN || process.env.WUZAPI_ADMIN_TOKEN || '';`;

content = content.replace(wuzapiAdminToken, newWuzapiAdminToken);
fs.writeFileSync(file, content, 'utf8');
