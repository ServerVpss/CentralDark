const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'apps/crm/atendimento-whatsapp-gateway-deploy/gateway/src/routes/connections.routes.js');
let content = fs.readFileSync(file, 'utf8');

const oldGetQr = `router.get('/:connection_id/qr', async (req, res) => {
  try {
    const r = await connectionService.getQr(req.params.connection_id);
    return ok(res, r);
  } catch (err) {
    return fail(res, 'qr_failed', err.message, 500);
  }
});`;

const newGetQr = `router.get('/:connection_id/qr', async (req, res) => {
  try {
    const conn = connectionService.getRaw(req.params.connection_id);
    if (!conn) {
      return fail(res, 'not_found', 'Conexão não localizada no Gateway.', 404);
    }
    if (!conn.wuzapi_token) {
      return fail(res, 'no_token', 'A conexão ainda não possui token validado na WuzAPI.', 409);
    }
    const r = await connectionService.getQr(req.params.connection_id);
    return ok(res, r);
  } catch (err) {
    // Retornamos 409 Conflict ou 502 Bad Gateway se o GoLang rejeitar para dar um aviso melhor no front.
    const status = err.message.includes('token WuzAPI') ? 409 : 502;
    return fail(res, 'qr_failed', err.message, status);
  }
});`;

if (content.includes(oldGetQr)) {
  content = content.replace(oldGetQr, newGetQr);
  fs.writeFileSync(file, content, 'utf8');
  console.log("connections.routes.js get QR updated.");
}
