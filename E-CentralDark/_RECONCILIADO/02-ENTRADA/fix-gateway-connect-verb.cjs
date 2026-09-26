const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'apps/crm/atendimento-whatsapp-gateway-deploy/gateway/src/services/wuzapiClient.js');
let content = fs.readFileSync(file, 'utf8');

const oldStartSession = `async function startSession({ token }) {
  const body = { Subscribe: WUZAPI_EVENTS, events: WUZAPI_EVENTS_CSV, Immediate: true };
  const { data } = await client.post('/session/connect', body, { headers: userHeaders(token) });
  return data;
}`;

const newStartSession = `async function startSession({ token }) {
  const body = { Subscribe: WUZAPI_EVENTS, events: WUZAPI_EVENTS_CSV, Immediate: true };
  try {
    const { data } = await client.post('/session/connect', body, { headers: userHeaders(token) });
    return data;
  } catch (e) {
    if (e.response && e.response.status === 405) {
      const { data } = await client.get('/session/connect?Immediate=true', { headers: userHeaders(token) });
      return data;
    }
    throw e;
  }
}`;

if(content.includes(oldStartSession)) {
  content = content.replace(oldStartSession, newStartSession);
  fs.writeFileSync(file, content, 'utf8');
}
