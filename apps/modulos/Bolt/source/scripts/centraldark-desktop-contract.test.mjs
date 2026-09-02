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

test('Screenpipe entra como sensor local, não como autoridade no renderer', () => {
  const constants = read(`${root}/electron/main/utils/constants.ts`);
  const main = read(`${root}/electron/main/index.ts`);
  const preload = read(`${root}/electron/preload/index.ts`);

  assert.match(constants, /http:\/\/127\.0\.0\.1:3030/);
  assert.match(main, /centraldark:screenpipe:health/);
  assert.match(main, /SCREENPIPE_BASE_URL/);
  assert.match(preload, /getScreenpipeHealth/);
  assert.doesNotMatch(preload, /search-content|activity-summary|frame-context|cookie|token/i);
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

test('painel único projeta contas, Telegram e Cloudflare sem inventar runtime verde', () => {
  const cockpit = read(`${root}/app/components/centraldark/CentralDarkCockpitShell.client.tsx`);

  assert.match(cockpit, /Contas \/ Hub/);
  assert.match(cockpit, /apps\/modulos\/oauth-broker\/server\.mjs/);
  assert.match(cockpit, /Bot Telegram/);
  assert.match(cockpit, /apps\/bot-telegram\/ \+ checker existente/);
  assert.match(cockpit, /Cloudflare \/ DNS/);
  assert.match(cockpit, /scripts\/cloudflare\/cf-sync\.sh/);
  assert.match(cockpit, /RUNTIME UNKNOWN/);
  assert.match(cockpit, /source mapeado não vira saúde runtime nem cria backend paralelo/);
  assert.doesNotMatch(cockpit, /ACCOUNTS_HUB[^\n]*ONLINE|CLOUDFLARE[^\n]*ONLINE|TELEGRAM[^\n]*ONLINE/);
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
