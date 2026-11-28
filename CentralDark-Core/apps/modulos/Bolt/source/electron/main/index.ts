// #OBSERVACOES#
// @owner: apps/modulos/Bolt/source/electron/main/index.ts
// @doc_ref: docs/receipts/2026-10-22-COCKPIT-UI-OWNERS.md
// @last_updated: 2026-11-03T18:20:00.000Z
// @implementado: ponte builder unico seleciona workspace e Node por plataforma Windows/Linux.
// @pendente: testes e gates de source no mesmo HEAD; runtime fora de escopo.
// @estado: SOURCE_ONLY; HYBRID_BUILDER_SOURCE; RUNTIME_NOT_TESTED
// @next_cursor: checar build contract e readback no PR #1977.
/// <reference types="vite/client" />
import { createRequestHandler } from '@remix-run/node';
import electron, { app, BrowserWindow, globalShortcut, ipcMain, protocol, session } from 'electron';
import log from 'electron-log';
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import * as pkg from '../../package.json';
import { setupAutoUpdater } from './utils/auto-update';
import {
  CENTRALDARK_PUBLIC_API_URL,
  CENTRALDARK_PUBLIC_URL,
  DEFAULT_HOUSE_ROOT,
  DEFAULT_PORT,
  HERMES_BASE_URL,
  OMNI_ROUTER_BASE_URL,
  SCREENPIPE_BASE_URL,
  SOL_WIDGET_SHORTCUT,
  isDev,
} from './utils/constants';
import { initViteServer, viteServer } from './utils/vite-server';
import { setupMenu } from './ui/menu';
import { createSolWidget, createWindow } from './ui/window';
import { initCookies, storeCookies } from './utils/cookie';
import { loadServerBuild, serveAsset } from './utils/serve';
import { reloadOnChange } from './utils/reload';

Object.assign(console, log.functions);
app.setName('CentralDark');
if (process.platform === 'win32') app.setAppUserModelId('com.centraldark.desktop');

process.on('uncaughtException', (error) => console.error('UNCAUGHT_EXCEPTION', error));
process.on('unhandledRejection', (error) => console.error('UNHANDLED_REJECTION', error));

const configuredRoot = global.process.env.CENTRALDARK_HOME
  ?? global.process.env.APP_PATH_ROOT
  ?? import.meta.env.VITE_APP_PATH_ROOT
  ?? (process.platform === 'win32' && existsSync(DEFAULT_HOUSE_ROOT) ? DEFAULT_HOUSE_ROOT : undefined);

if (configuredRoot) {
  if (!path.isAbsolute(configuredRoot)) throw new Error('CENTRALDARK_HOME_MUST_BE_ABSOLUTE');
  const subdirName = pkg.name;
  app.setPath('appData', configuredRoot);
  app.setPath('userData', path.join(configuredRoot, subdirName));
  app.setPath('sessionData', path.join(configuredRoot, subdirName));
  app.setAppLogsPath(path.join(configuredRoot, subdirName, 'Logs'));
}

declare global {
  // eslint-disable-next-line no-var, @typescript-eslint/naming-convention
  var __electron__: typeof electron;
}

let mainWindow: BrowserWindow | null = null;
let solWidget: BrowserWindow | null = null;
let rendererURL = '';
let builderBusy = false;
let builderActivity: { status: string; version?: string; at?: string; error?: string } = { status: 'IDLE' };

function builderWorkspace() {
  // Caminho de FONTE autorizado pelo host; jamais aceitar path vindo do renderer.
  const explicit = process.env.CENTRALDARK_BUILD_WORKSPACE;
  if (explicit && !path.isAbsolute(explicit)) throw new Error('CENTRALDARK_BUILD_WORKSPACE_MUST_BE_ABSOLUTE');
  if (explicit) return path.resolve(explicit);
  // Windows mantém sua Casa; Linux usa o checkout no dev. No pacote, exigir
  // workspace explícito se a receita não estiver no app.getAppPath().
  return process.platform === 'win32'
    ? path.join(DEFAULT_HOUSE_ROOT, 'apps', 'modulos', 'Bolt', 'source')
    : isDev ? process.cwd() : app.getAppPath();
}

function builderHistorySnapshot() {
  const workspace = builderWorkspace();
  const live = path.join(workspace, 'resources', 'build-history.json');
  const embedded = path.join(app.getAppPath(), 'resources', 'build-history.json');
  const source = existsSync(live) ? live : embedded;
  const canRebuild = ['win32', 'linux'].includes(process.platform)
    && process.arch === 'x64'
    && existsSync(path.join(workspace, 'scripts', 'centraldark-rebuild.mjs'))
    && existsSync(path.join(workspace, 'package.json'));
  if (!existsSync(source)) return {
    status: 'UNKNOWN', count: null, entries: [], last_success: null,
    can_rebuild: canRebuild, reason: 'BUILD_LEDGER_NOT_FOUND', activity: builderActivity,
  };
  try {
    const data = JSON.parse(readFileSync(source, 'utf8')) as {
      schema?: string; entries?: Array<Record<string, unknown>>;
    };
    if (data.schema !== 'centraldark.desktop-builder-ledger/v1' || !Array.isArray(data.entries)) {
      throw new Error('BUILD_LEDGER_SCHEMA_INVALID');
    }
    const entries = data.entries;
    return {
      status: 'READY', count: entries.length, entries,
      last_success: entries.length ? entries[entries.length - 1] : null,
      can_rebuild: canRebuild, reason: canRebuild ? null : 'BUILD_SOURCE_NOT_AVAILABLE',
      activity: builderActivity,
    };
  } catch (error) {
    return {
      status: 'UNKNOWN', count: null, entries: [], last_success: null,
      can_rebuild: canRebuild,
      reason: error instanceof Error ? error.message : 'BUILD_LEDGER_READ_FAILED',
      activity: builderActivity,
    };
  }
}

function trustedBuilderCaller(event: { sender: { id: number }; senderFrame?: { url: string } | null }) {
  const main = liveMainWindow();
  let sameOrigin = false;
  try { sameOrigin = new URL(event.senderFrame?.url ?? '').origin === new URL(rendererURL).origin; }
  catch { /* recusar origem inválida */ }
  return Boolean(main && event.sender.id === main.webContents.id && sameOrigin);
}


// Unigram remains an external Windows app, not a copied frontend or second runtime.
// AUMID was observed via Get-StartApps and Get-AppxPackage on SEGREDO.
const UNIGRAM_WINDOWS_APP_ID = '38833FF26BA1D.UnigramPreview_g9c9v27vpyspw!App';
type UnigramActivation = { status: 'REQUESTED' | 'UNAVAILABLE'; capability: 'UNIGRAM'; reason?: string };

function activateExistingUnigram(): Promise<UnigramActivation> {
  if (process.platform !== 'win32') {
    return Promise.resolve({ status: 'UNAVAILABLE', capability: 'UNIGRAM', reason: 'WINDOWS_ONLY' });
  }

  return new Promise((resolve, reject) => {
    // No shell: true, caller-controlled args, downloads, account access or new agent.
    // Packaged-app activation normally reuses an existing app instance.
    const explorer = path.join(process.env.WINDIR || 'C:\\Windows', 'explorer.exe');
    const child = spawn(explorer, [`shell:AppsFolder\\${UNIGRAM_WINDOWS_APP_ID}`], {
      shell: false, detached: true, windowsHide: true, stdio: 'ignore',
    });
    child.once('error', reject);
    child.once('spawn', () => {
      child.unref();
      // DISPATCHED != WINDOW_VISIBLE != ACCOUNT_AUTHENTICATED
      resolve({ status: 'REQUESTED', capability: 'UNIGRAM' });
    });
  });
}

function liveMainWindow() {
  return mainWindow && !mainWindow.isDestroyed() ? mainWindow : null;
}

function liveWidget() {
  return solWidget && !solWidget.isDestroyed() ? solWidget : null;
}

function ensureMainWindow() {
  const current = liveMainWindow();
  if (current) return current;
  mainWindow = createWindow(rendererURL);
  setupMenu(mainWindow);
  return mainWindow;
}

function ensureWidget() {
  const current = liveWidget();
  if (current) return current;
  solWidget = createSolWidget(rendererURL);
  return solWidget;
}

function toggleWidget() {
  const widget = ensureWidget();
  if (widget.isVisible()) widget.hide();
  else {
    widget.showInactive();
    widget.focus();
  }
}

async function probeHealth(endpoint: string, routes: string[]) {
  const started = Date.now();
  for (const route of routes) {
    try {
      const response = await fetch(new URL(route, endpoint), { signal: AbortSignal.timeout(2500) });
      if (response.ok) {
        return { status: 'ONLINE', endpoint, route, latency_ms: Date.now() - started };
      }
    } catch (error) {
      console.warn('CENTRALDARK_HEALTH_PROBE_FAILED', {
        endpoint,
        route,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
  return { status: 'OFFLINE', endpoint, latency_ms: Date.now() - started };
}

function registerBridge() {
  const register = (channel: string, handler: (...args: any[]) => any) => {
    ipcMain.removeHandler(channel);
    ipcMain.handle(channel, handler);
  };

  register('centraldark:runtime:get', async () => ({
    app_name: 'CentralDark',
    app_version: app.getVersion(),
    house_root: configuredRoot ?? app.getPath('userData'),
    omni_router_base_url: OMNI_ROUTER_BASE_URL,
    hermes_base_url: HERMES_BASE_URL,
    screenpipe_base_url: SCREENPIPE_BASE_URL,
    public_api_url: CENTRALDARK_PUBLIC_API_URL,
    public_url: CENTRALDARK_PUBLIC_URL,
    widget_shortcut: SOL_WIDGET_SHORTCUT,
    one_system_only: true,
    one_router_only: true,
  }));

  register('centraldark:builders:get', async (event) => {
    if (!trustedBuilderCaller(event)) throw new Error('CENTRALDARK_BUILDERS_UNTRUSTED_RENDERER');
    return builderHistorySnapshot();
  });

  register('centraldark:builders:rebuild', async (event) => {
    if (!trustedBuilderCaller(event)) throw new Error('CENTRALDARK_BUILDERS_UNTRUSTED_RENDERER');
    if (builderBusy) return { status: 'ALREADY_RUNNING' };
    const snapshot = builderHistorySnapshot();
    if (!snapshot.can_rebuild || snapshot.status !== 'READY') {
      return { status: 'UNAVAILABLE', reason: snapshot.reason ?? 'BUILD_SOURCE_NOT_AVAILABLE' };
    }
    const workspace = builderWorkspace();
    const recipe = path.join(workspace, 'scripts', 'centraldark-rebuild.mjs');
    // Nenhum comando livre do renderer; somente a receita versionada no workspace configurado.
    builderBusy = true;
    builderActivity = { status: 'REQUESTED', at: new Date().toISOString() };
    try {
      const child = spawn(process.platform === 'win32' ? 'node.exe' : 'node', [recipe, '--execute'], {
        cwd: workspace, windowsHide: true, shell: false, stdio: ['ignore', 'pipe', 'pipe'],
      });
      let lastError = '';
      child.stderr.on('data', (chunk: Buffer) => {
        lastError = (lastError + String(chunk)).slice(-300);
      });
      child.stdout.on('data', (chunk: Buffer) => {
        const line = String(chunk);
        if (line.includes('BUILD_PASS_RUNTIME_PENDING')) {
          builderActivity = { status: 'BUILD_PASS_RUNTIME_PENDING', at: new Date().toISOString() };
        }
      });
      child.once('error', (error) => {
        builderActivity = { status: 'ERROR', at: new Date().toISOString(), error: error.message };
        builderBusy = false;
      });
      child.once('close', (code) => {
        if (!builderBusy) return;
        builderActivity = code === 0
          ? { status: 'BUILD_PASS_RUNTIME_PENDING', at: new Date().toISOString() }
          : { status: 'FAILED', at: new Date().toISOString(), error: lastError || 'BUILD_EXIT_' + code };
        builderBusy = false;
      });
      return { status: 'REQUESTED', at: builderActivity.at };
    } catch (error) {
      builderBusy = false;
      builderActivity = {
        status: 'ERROR', at: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'BUILDER_START_FAILED',
      };
      return builderActivity;
    }
  });

  register('centraldark:omni:health', async () => probeHealth(OMNI_ROUTER_BASE_URL, ['/health', '/v1/models']));

  // Canal legado preservado para não quebrar consumidores antigos.
  register('centraldark:hermes:health', async () => probeHealth(OMNI_ROUTER_BASE_URL, ['/health', '/v1/models']));

  register('centraldark:screenpipe:health', async () => probeHealth(SCREENPIPE_BASE_URL, ['/health']));

  register('centraldark:main:show', async () => {
    const win = ensureMainWindow();
    win.show();
    win.focus();
    return { ok: true };
  });

  register('centraldark:widget:toggle', async () => {
    toggleWidget();
    return { ok: true };
  });

  register('centraldark:widget:hide', async () => {
    liveWidget()?.hide();
    return { ok: true };
  });

  register('centraldark:unigram:open', async (event) => {
    // Fixed capability with origin and native-window caller verification.
    const current = liveMainWindow();
    const sourceUrl = event.senderFrame?.url ?? '';
    let sameOrigin = false;
    try { sameOrigin = new URL(sourceUrl).origin === new URL(rendererURL).origin; }
    catch { /* invalid origin is rejected */ }
    if (!current || event.sender.id !== current.webContents.id || !sameOrigin) {
      throw new Error('CENTRALDARK_UNIGRAM_UNTRUSTED_RENDERER');
    }
    return activateExistingUnigram();
  });

  register('centraldark:obsidian:open', async (event) => {
    // Mesmo gate de origem/janela do Unigram; alvo é constante, sem parâmetros do renderer.
    const current = liveMainWindow();
    const sourceUrl = event.senderFrame?.url ?? '';
    let sameOrigin = false;
    try { sameOrigin = new URL(sourceUrl).origin === new URL(rendererURL).origin; }
    catch { /* origem inválida bloqueada */ }
    if (!current || event.sender.id !== current.webContents.id || !sameOrigin) {
      throw new Error('CENTRALDARK_OBSIDIAN_UNTRUSTED_RENDERER');
    }
    if (process.platform !== 'win32') {
      return { status: 'UNAVAILABLE' as const, capability: 'OBSIDIAN' as const, reason: 'WINDOWS_ONLY' };
    }
    // Usa a associação obsidian:// já instalada. Não copia binário, vault, perfil ou plugins.
    await electron.shell.openExternal('obsidian://open?vault=BRAIN');
    // Solicitação é distinta de janela realmente aberta / aplicação incorporada.
    return { status: 'REQUESTED' as const, capability: 'OBSIDIAN' as const };
  });

  register('centraldark:intent:open', async (_event, rawIntent: unknown) => {
    const intent = typeof rawIntent === 'string' ? rawIntent.trim() : '';
    if (!intent || intent.length > 8000) throw new Error('CENTRALDARK_INTENT_INVALID');
    const win = ensureMainWindow();
    const target = new URL('/', rendererURL);
    target.searchParams.set('prompt', intent);
    await win.loadURL(target.toString());
    win.show();
    win.focus();
    return { ok: true };
  });

  register('ipcTest', async (_event, ...args) => {
    console.debug('ipc: renderer -> main', args);
    return { ok: true };
  });
}

async function boot() {
  await app.whenReady();
  await initCookies();
  const serverBuild = await loadServerBuild();

  protocol.handle('http', async (req) => {
    if (isDev) return await fetch(req);

    req.headers.append('Referer', req.referrer);
    try {
      const url = new URL(req.url);
      if (url.port !== `${DEFAULT_PORT}`) return await fetch(req);

      const assetPath = path.join(app.getAppPath(), 'build', 'client');
      const assetResponse = await serveAsset(req, assetPath);
      if (assetResponse) return assetResponse;

      const cookies = await session.defaultSession.cookies.get({});
      if (cookies.length > 0) {
        req.headers.set('Cookie', cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join('; '));
        await storeCookies(cookies);
      }

      const handler = createRequestHandler(serverBuild, 'production');
      return await handler(req, {
        // @ts-ignore Cloudflare context expected by the vendored Remix application.
        cloudflare: {},
      });
    } catch (error) {
      console.error('CENTRALDARK_REQUEST_FAILED', {
        url: req.url,
        error: error instanceof Error ? error.message : String(error),
      });
      return new Response('CentralDark renderer request failed', { status: 500 });
    }
  });

  rendererURL = await (isDev
    ? (async () => {
        await initViteServer();
        if (!viteServer) throw new Error('VITE_SERVER_NOT_INITIALIZED');
        const listen = await viteServer.listen();
        global.__electron__ = electron;
        viteServer.printUrls();
        return `http://localhost:${listen.config.server.port}`;
      })()
    : `http://localhost:${DEFAULT_PORT}`);

  mainWindow = createWindow(rendererURL);
  solWidget = createSolWidget(rendererURL);
  setupMenu(mainWindow);
  registerBridge();

  const registered = globalShortcut.register(SOL_WIDGET_SHORTCUT, toggleWidget);
  if (!registered) console.warn('SOL_WIDGET_SHORTCUT_UNAVAILABLE', SOL_WIDGET_SHORTCUT);

  app.on('activate', () => ensureMainWindow());
  await setupAutoUpdater();
}

boot().catch((error) => {
  console.error('CENTRALDARK_BOOT_FAILED', error);
  app.quit();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => globalShortcut.unregisterAll());

reloadOnChange();
