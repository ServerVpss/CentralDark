const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
test('native VS Code VSIX installer, no guessed CLI paths', () => {
  const source = fs.readFileSync(path.join(root,'src','autoUpdater.ts'),'utf8');
  assert.match(source, /executeCommand\('workbench\.extensions\.installExtension', vscode\.Uri\.file\(file\)\)/);
  assert.doesNotMatch(source, /VSCODE_CLI_NOT_FOUND|code\.cmd|cmd\.exe|--install-extension/);
});
test('existing integrity gate stays before the native install', () => {
  const source = fs.readFileSync(path.join(root,'src','autoUpdater.ts'),'utf8');
  const integrity = source.indexOf("VSIX_SHA256_MISMATCH");
  const installer = source.lastIndexOf("await installVsix(file)");
  assert.ok(integrity > 0 && installer > integrity);
});
test('old K drive workspace guard persists after reload', () => {
  const source = fs.readFileSync(path.join(root,'src','extension.ts'),'utf8');
  assert.match(source, /remoteWorkspace && windowsMapped/);
  assert.match(source, /vscode\.window\.terminals\.some/);
});
