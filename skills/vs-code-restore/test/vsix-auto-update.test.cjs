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


test('same CentralDark extension owns a separate Activity Bar icon, not native Explorer', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
  const c = pkg.contributes;
  assert.equal(pkg.name, 'centraldark-vscode-restore');
  assert.equal(pkg.publisher, 'centraldark');
  assert.equal(lock.version, pkg.version);
  assert.equal(lock.packages[''].version, pkg.version);
  assert.equal(c.views.explorer, undefined, 'native Explorer must not be occupied by CentralDark');
  assert.equal(c.viewsContainers.activitybar.length, 1);
  const container = c.viewsContainers.activitybar[0];
  assert.equal(container.id, 'centraldarkVibe');
  assert.ok(fs.existsSync(path.join(root, container.icon)), 'activity icon must ship with the same VSIX');
  assert.deepEqual(c.views[container.id].map(v => v.id), ['centraldarkVibeCoding', 'centraldarkWorkspaceFolders']);
  assert.equal(c.views[container.id][0].type, 'webview');
});
