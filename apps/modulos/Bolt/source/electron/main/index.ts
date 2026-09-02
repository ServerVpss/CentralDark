/// <reference types="vite/client" />
import { createRequestHandler } from '@remix-run/node';
import electron, { app, BrowserWindow, globalShortcut, ipcMain, protocol, session } from 'electron';
import log from 'electron-log';
import { existsSync } from 'node:fs';
import path from 'node:path';
import * as pkg from '../../package.json';
import { setupAutoUpdater } from './utils/auto-update';
import {
  CENTRALDARK_PUBLIC_URL,
  DEFAULT_HOUSE_ROOT,
  DEFAULT_PORT,
  HERMES_BASE_URL,
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
    hermes_base_url: HERMES_BASE_URL,
    screenpipe_base_url: SCREENPIPE_BASE_URL,
    public_url: CENTRALDARK_PUBLIC_URL,
    widget_shortcut: SOL_WIDGET_SHORTCUT,
    one_system_only: true,
  }));

  register('centraldark:hermes:health', async () => probeHealth(HERMES_BASE_URL, ['/health', '/api/health']));

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
