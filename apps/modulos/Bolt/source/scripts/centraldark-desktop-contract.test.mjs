import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(path, 'utf8');
const root = '.';

test('a casca existente vira CentralDark sem criar segundo app', () => {
  const pkg = JSON.parse(read(`${root}/package.json`));
  const builder = read(`${root}/electron-builder.yml`);
  assert.equal(pkg.name, 'centraldark-desktop');
  assert.match(builder, /appId: com\.centraldark\.desktop/);
  assert.match(builder, /productName: CentralDark/);
  assert.match(builder, /owner: ServerVpss/);
  assert.match(builder, /repo: CentralDark/);
});

test('site, app e widget usam a mesma alma Hermes', () => {
  const constants = read(`${root}/electron/main/utils/constants.ts`);
  const windowSource = read(`${root}/electron/main/ui/window.ts`);
  const main = read(`${root}/electron/main/index.ts`);
  const widget = read(`${root}/app/routes/sol-widget.tsx`);
  assert.match(constants, /http:\/\/127\.0\.0\.1:8787/);
  assert.match(windowSource, /createSolWidget/);
  assert.match(windowSource, /alwaysOnTop: true/);
  assert.match(main, /centraldark:intent:open/);
  assert.match(widget, /openIntent/);
});

test('a ponte Electron é estreita e o renderer não ganha Node', () => {
  const windowSource = read(`${root}/electron/main/ui/window.ts`);
  const preload = read(`${root}/electron/preload/index.ts`);
  assert.match(windowSource, /contextIsolation: true/);
  assert.match(windowSource, /nodeIntegration: false/);
  assert.doesNotMatch(windowSource, /nodeIntegration: true/);
  assert.match(preload, /exposeInMainWorld\('centraldark'/);
  assert.doesNotMatch(preload, /process\.env/);
});

test('o build da CentralDark funciona no Windows sem depender de rm Unix', () => {
  const pkg = JSON.parse(read(`${root}/package.json`));
  const clean = read(`${root}/scripts/clean-electron-output.mjs`);
  assert.doesNotMatch(pkg.scripts['centraldark:build:win'], /rm -rf/);
  assert.match(pkg.scripts['centraldark:build:win'], /clean-electron-output\.mjs/);
  assert.match(clean, /rmSync/);
  assert.match(clean, /recursive: true/);
  assert.match(clean, /force: true/);
});
