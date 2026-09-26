const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'apps/crm/atendimento-whatsapp-gateway-deploy/gateway/src/services/wuzapiClient.js');
let content = fs.readFileSync(file, 'utf8');

const oldGetQr = `async function getQr({ token }) {
  const { data } = await client.get('/session/qr', { headers: userHeaders(token) });
  return data;
}`;

const newGetQr = `async function getQr({ token }) {
  try {
    const { data } = await client.get('/session/qr', { headers: userHeaders(token) });
    return data;
  } catch (e) {
    if (e.response && e.response.status === 405) {
      // Tenta fallback com POST se GET retornar 405 Method Not Allowed
      const { data } = await client.post('/session/qr', {}, { headers: userHeaders(token) });
      return data;
    }
    throw e;
  }
}`;

if(content.includes(oldGetQr)) {
  content = content.replace(oldGetQr, newGetQr);
  fs.writeFileSync(file, content, 'utf8');
}
