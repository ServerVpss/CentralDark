const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname,'..','src','extension.ts'),'utf8');
test('MCP device pairing requires browser approval, not SSH self-approval', () => {
  assert.match(source, /postDevice<StartDevicePairing>\('\/pair\/start'/);
  assert.match(source, /postDevice<DevicePairingStatus>\('\/pair\/status'/);
  assert.match(source, /vscode\.env\.openExternal\(approvedUri\)/);
  assert.match(source, /mcp\.centralldark\.com\/authorize\?client_id=/);
  assert.doesNotMatch(source, /\/pair\/consent/);
  assert.match(source, /clique em Confirmar pareamento/);
  assert.doesNotMatch(source, /store\.approve\(\{pairId:pair\.pairId,code:pair\.code\}\)/);
});
test('device pairing token is saved only after server heartbeat succeeds', () => {
  const heartbeat = source.indexOf('const heartbeat = await verifyDeviceToken(result.token)');
  const saved = source.indexOf('context.secrets.store(DEVICE_TOKEN_KEY, result.token)');
  assert.ok(heartbeat > 0 && saved > heartbeat);
});
