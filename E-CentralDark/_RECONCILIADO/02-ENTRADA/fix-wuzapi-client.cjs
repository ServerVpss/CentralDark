const fs = require('fs');
const path = require('path');

const clientPath = path.join(__dirname, 'apps/crm/atendimento-whatsapp-gateway-deploy/gateway/src/services/wuzapiClient.js');
let content = fs.readFileSync(clientPath, 'utf8');

content = content.replace(
  `async function sendText({ token, to, message }) {
  const { data } = await client.post('/chat/send/text', { Phone: to, Body: message }, { headers: userHeaders(token) });
  return data;
}`,
  `async function sendText({ token, to, message, messageId = '' }) {
  const payload = { Phone: to, Body: message };
  if (messageId) payload.Id = messageId;
  const { data } = await client.post('/chat/send/text', payload, { headers: userHeaders(token) });
  return data;
}`
);

content = content.replace(
  `async function getContacts({ token }) {
  try {
    const { data } = await client.get('/contacts', { headers: userHeaders(token) });
    return data;
  } catch (err) {
    logger.warn('wuzapi_get_contacts_failed', { message: err.message });
    return [];
  }
}`,
  `async function getContacts({ token }) {
  try {
    const { data } = await client.get('/user/contacts', { headers: userHeaders(token) });
    return data;
  } catch (err) {
    logger.warn('wuzapi_get_contacts_failed', { message: err.message });
    return {};
  }
}

async function getUserAvatar({ token, phone, preview = true }) {
  try {
    const { data } = await client.post('/user/avatar', { Phone: phone, Preview: preview }, { headers: userHeaders(token) });
    return data;
  } catch (err) {
    logger.warn('wuzapi_get_avatar_failed', { phone, message: err.message });
    return null;
  }
}`
);

content = content.replace(
  'getContacts,\n  getMessages,',
  'getContacts,\n  getUserAvatar,\n  getMessages,'
);

fs.writeFileSync(clientPath, content, 'utf8');
console.log('wuzapiClient updated');
