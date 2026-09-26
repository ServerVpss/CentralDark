const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'apps/crm/atendimento-whatsapp-gateway-deploy/gateway/src/routes/messages.routes.js');
let content = fs.readFileSync(file, 'utf8');

const oldPostText = `router.post('/send-text', async (req, res) => {
  try {
    const r = await messageService.sendText(req.body || {});
    return ok(res, r);
  } catch (err) {
    return fail(res, err.code || 'send_failed', err.message, err.status || 500);
  }
});`;

const newPostText = `router.post('/send-text', async (req, res) => {
  const body = req.body || {};
  if (!body.connection_id || !body.to || !body.message) {
    return fail(res, 'invalid_payload', 'Parâmetros connection_id, to, e message são obrigatórios.', 400);
  }
  try {
    const r = await messageService.sendText(body);
    return ok(res, r);
  } catch (err) {
    return fail(res, err.code || 'send_failed', err.message, err.status || 500);
  }
});`;

if (content.includes(oldPostText)) {
  content = content.replace(oldPostText, newPostText);
  fs.writeFileSync(file, content, 'utf8');
  console.log('messages.routes.js updated');
} else {
  console.log('messages.routes.js already updated or pattern not found');
}
