// #OBSERVACOES#
// @owner: apps/modulos/Bolt/source/scripts/centraldark-desktop-contract.test.mjs
// @doc_ref: docs/receipts/2026-10-22-COCKPIT-UI-OWNERS.md
// @last_updated: 2026-11-03T18:41:00.000Z
// @implementado: asserts de source para builder Windows/Linux no mesmo Electron.
// @pendente: execução dos testes no HEAD da PR #1977; runtime não requisitado.
// @estado: SOURCE_ONLY; TEST_NOT_EXECUTED
// @next_cursor: rodar node --test quando checkout do HEAD estiver disponível.
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

test('Obsidian original tem launch fixo e bloqueia renderer não autorizado', () => {
  const main = read(`${root}/electron/main/index.ts`);
  const preload = read(`${root}/electron/preload/index.ts`);
  assert.match(main, /centraldark:obsidian:open/);
  assert.match(main, /CENTRALDARK_OBSIDIAN_UNTRUSTED_RENDERER/);
  assert.match(main, /event\.sender\.id !== current\.webContents\.id/);
  assert.match(main, /shell\.openExternal\('obsidian:\/\/open\?vault=BRAIN'\)/);
  assert.match(preload, /openObsidianDesktop/);
  assert.doesNotMatch(preload, /process\.env|readFileSync|spawn\(/);
});

test('cockpit projeta Linear pela rota segura do MCP sem secret no renderer', () => {
  const cockpit = read(`${root}/app/components/centraldark/CentralDarkCockpitShell.client.tsx`);

  assert.match(cockpit, /Linear \/ Coding/);
  assert.match(cockpit, /https:\/\/mcp\.centralldark\.com\/linear\/status/);
  assert.match(cockpit, /apps\/modulos\/mcp\/src\/tools\/integrations\.js/);
  assert.match(cockpit, /Abrir Linear no Admin/);
  assert.doesNotMatch(cockpit, /LINEAR_API_KEY\s*=/);
});

test('painel único projeta contas, Telegram e Cloudflare sem inventar runtime verde', () => {
  const cockpit = read(`${root}/app/components/centraldark/CentralDarkCockpitShell.client.tsx`);
  const inventory = read(`${root}/app/components/centraldark/centraldark-hub-inventory.ts`);

  assert.match(cockpit, /Contas \/ Hub/);
  assert.match(cockpit, /apps\/modulos\/oauth-broker\/server\.mjs/);
  assert.match(cockpit, /Gmail/);
  assert.match(inventory, /id: 'GMAIL'/);
  assert.match(inventory, /oauth-broker canônico/);
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

test('o instalador carrega uma capsula de runtime e nao depende de instalacao global aleatoria', () => {
  const builder = read(`${root}/electron-builder.yml`);
  const runtime = JSON.parse(read(`${root}/resources/runtime/manifest.json`));

  assert.match(builder, /- resources\/\*\*/);
  assert.equal(runtime.schema, 'centraldark.runtime-capsule/v1');
  assert.equal(runtime.owner, 'apps/modulos/Bolt/source');
  assert.equal(runtime.policy.one_system_only, true);
  assert.equal(runtime.policy.user_machine_package_install, false);
  assert.equal(runtime.policy.external_global_runtime_fallback, false);
  assert.equal(runtime.policy.external_appdata_hermes_venv_allowed, false);
  assert.equal(runtime.policy.release_must_fail_closed_if_required_sidecar_missing, true);
  assert.equal(runtime.components.electron_node.mode, 'embedded-by-electron');
  assert.equal(runtime.components.hermes.mode, 'bundled-sidecar');
  assert.equal(runtime.components.hermes.bundle_status, 'UNKNOWN');
  assert.equal(runtime.components.hermes.required_for_fixed_point, true);
});

test('providers externos entram por capability sem virar dependencias rigidas do exe', () => {
  const runtime = JSON.parse(read(`${root}/resources/runtime/manifest.json`));
  const desktop = runtime.capability_providers.desktop_commander;
  const screenpipe = runtime.capability_providers.screenpipe;

  assert.equal(runtime.capability_router, '.agents/skills/capability-contract-router/SKILL.md');
  assert.equal(runtime.policy.optional_provider_failure_must_not_kill_core, true);
  assert.equal(runtime.policy.selected_provider_requires_fresh_health, true);
  assert.equal(runtime.policy.third_party_binary_bundle_requires_license_version_and_hash_proof, true);

  assert.equal(desktop.mode, 'external-mcp-provider');
  assert.equal(desktop.required_for_core_start, false);
  assert.equal(desktop.package_pin, '@wonderwhy-er/desktop-commander@0.2.48');
  assert.match(desktop.remote_mcp, /^https:\/\//);
  assert.equal(desktop.login_url, 'https://mcp.desktopcommander.app/device/verify');
  assert.equal(desktop.account_model, 'MULTI_ACCOUNT_ISOLATED_HOME');
  assert.deepEqual(desktop.profiles.map((profile) => profile.id), ['principal', 'conta2']);
  assert.match(desktop.profiles[0].service, /centraldark-desktop-commander\.service/);
  assert.match(desktop.profiles[1].home, /desktop-commander-profiles\/conta2/);
  assert.match(desktop.profiles[1].watchdog_timer, /conta2-watchdog\.timer/);
  assert.ok(desktop.capabilities.includes('FILESYSTEM_READ'));
  assert.ok(desktop.capabilities.includes('TERMINAL_EXECUTION'));
  assert.ok(desktop.capabilities.includes('REMOTE_DEVICE_CONTROL'));

  assert.equal(screenpipe.mode, 'local-sensor-provider');
  assert.equal(screenpipe.required_for_core_start, false);
  assert.equal(screenpipe.local_api, 'http://127.0.0.1:3030');
  assert.ok(screenpipe.capabilities.includes('LIVE_DESKTOP_OBSERVATION'));
  assert.ok(screenpipe.capabilities.includes('ACCESSIBILITY_CONTEXT'));
  assert.ok(screenpipe.capabilities.includes('AUTOMATION_TARGETING_CONTEXT'));
});

test('HUD unificado reusa o cockpit, move, redimensiona e nao inventa quota', () => {
  const index = read(`${root}/app/routes/_index.tsx`);
  const hud = read(`${root}/app/components/centraldark/CentralDarkUnifiedHud.client.tsx`);
  const inventory = read(`${root}/app/components/centraldark/centraldark-hub-inventory.ts`);
  const styles = read(`${root}/app/components/centraldark/centraldark-unified-hud.scss`);

  assert.match(index, /CentralDarkCockpitShell/);
  assert.match(index, /CentralDarkUnifiedHud/);
  assert.match(hud, /centraldark\.unifiedHud\.layout\.v1/);
  assert.match(hud, /ResizeObserver/);
  assert.match(hud, /pointermove/);
  assert.match(hud, /snapshot operacional mudou/);
  assert.match(hud, /Limites, plano, reset e tempo só ficam verdes/);
  assert.match(hud, /HUD_IS_CURRENT_PROJECTION/);
  assert.match(hud, /CHECKLIST_DAILY_OWNER/);
  assert.match(hud, /activeLanes/);
  assert.match(hud, /receiptsFingerprint/);
  assert.match(hud, /nextCursor/);
  assert.match(styles, /resize: both/);
  assert.match(styles, /cd-uhud-current-grid/);
  assert.match(inventory, /Dependabot/);
  assert.match(inventory, /CodeRabbit/);
  assert.match(inventory, /POSTHOG/);
  assert.match(inventory, /DATADOG/);
  assert.match(inventory, /ADAPTER_REQUIRED/);
  assert.match(inventory, /id: 'CHATGPT'[\s\S]*?quota: 'ADAPTER_REQUIRED'/);
});


test('Unigram original entra no leque por abertura nativa restrita, sem copiar aplicativo ou conta', () => {
  const main = read(`${root}/electron/main/index.ts`);
  const preload = read(`${root}/electron/preload/index.ts`);
  const nativeCockpit = read(`${root}/app/components/centraldark/CentralDarkCockpitShell.client.tsx`);
  const webCockpit = read(`${root}/../../../instinto-superior/src/components/central/CockpitShell.tsx`);

  assert.ok(main.includes("const UNIGRAM_WINDOWS_APP_ID = '38833FF26BA1D.UnigramPreview_g9c9v27vpyspw!App'"));
  assert.ok(main.includes("register('centraldark:unigram:open'"));
  assert.ok(main.includes('CENTRALDARK_UNIGRAM_UNTRUSTED_RENDERER'));
  assert.ok(main.includes('event.senderFrame?.url'));
  assert.ok(main.includes('shell:AppsFolder'));
  assert.ok(main.includes('shell: false'));
  assert.ok(main.includes("status: 'REQUESTED'"));
  assert.ok(!main.includes('Unigram-13.0.1'));
  assert.ok(!main.includes('Telegram_TemporaryKey'));

  assert.ok(preload.includes("openUnigramDesktop: () => ipcRenderer.invoke('centraldark:unigram:open')"));
  assert.ok(nativeCockpit.includes('bridge.openUnigramDesktop()'));
  assert.ok(nativeCockpit.includes('Abertura solicitada · janela ainda não comprovada'));
  assert.ok(webCockpit.includes('TabsTrigger value="unigram"'));
  assert.ok(webCockpit.includes('Esta ação requer o CentralDark.exe no Windows'));
  assert.ok(!webCockpit.includes('Start-Process'));
  assert.ok(!webCockpit.includes('Get-AppxPackage'));
});

test('builder híbrido usa a mesma receita para Windows x64 e Linux x64', () => {
  const pkg = JSON.parse(read(`${root}/package.json`));
  const builder = read(`${root}/electron-builder.yml`);
  const main = read(`${root}/electron/main/index.ts`);
  const recipe = read(`${root}/scripts/centraldark-rebuild.mjs`);
  const ledger = read(`${root}/scripts/centraldark-build-ledger.mjs`);
  const installer = read(`${root}/../../../../install.sh`);
  const capsule = JSON.parse(read(`${root}/resources/runtime/manifest.json`));

  assert.equal(pkg.desktopName, 'com.centraldark.desktop');
  assert.match(builder, /syncDesktopName: true/);
  assert.match(builder, /executableName: centraldark-desktop/);
  assert.equal(capsule.entrypoint, 'CentralDark.exe');
  assert.equal(capsule.entrypoints['win32-x64'], 'CentralDark.exe');
  assert.equal(capsule.entrypoints['linux-x64'], 'centraldark-desktop');
  assert.match(pkg.scripts['electron:build:linux'], /electron-builder --linux/);
  assert.match(pkg.scripts['centraldark:build:win'], /electron-builder --win/);
  assert.match(builder, /linux:[\s\S]*?- AppImage[\s\S]*?- deb/);
  assert.ok(main.includes("['win32', 'linux'].includes(process.platform)"));
  assert.ok(main.includes("process.platform === 'win32' ? 'node.exe' : 'node'"));
  assert.ok(main.includes('CENTRALDARK_BUILD_WORKSPACE_MUST_BE_ABSOLUTE'));
  assert.ok(recipe.includes("['win32', 'linux'].includes(process.platform)"));
  assert.ok(recipe.includes("process.arch !== 'x64'"));
  assert.ok(recipe.includes("pnpm.cmd centraldark:build:win"));
  assert.ok(recipe.includes("['electron:build:linux']"));
  assert.ok(recipe.includes("selectLinux('.deb')"));
  assert.ok(recipe.includes("selectLinux('.AppImage')"));
  assert.ok(recipe.includes("windows ? 'win32-x64' : 'linux-x64'"));
  assert.ok(recipe.includes('fileProof(installer), fileProof(exe)'));
  assert.ok(recipe.includes('appendSuccessful(ledger, entry)'));
  assert.ok(ledger.includes('LEDGER_SCHEMA ='));
  assert.doesNotMatch(recipe, /WINDOWS_BUILD_ONLY/);
  assert.match(installer, /desktop_source_check\(\)/);
  assert.match(installer, /desktop_package_receipt\(\)/);
  assert.match(installer, /desktop_install_deb\(\)/);
  assert.match(installer, /ARTIFACT_HASH_MISMATCH/);
  assert.match(installer, /--desktop-install-deb --yes/);
  assert.match(installer, /--desktop-check\) desktop_source_check/);
  assert.match(installer, /--desktop-build\) desktop_source_check/);
  assert.match(installer, /case "\$\{1:-\}" in/);
  assert.ok(installer.indexOf('Desktop: opções isoladas antes do auto-update') < installer.indexOf('self_update "$@"', installer.indexOf('Desktop: opções isoladas antes do auto-update')));
});
