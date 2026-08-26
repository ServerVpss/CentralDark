import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import { isDev } from '../utils/constants';
import { store } from '../utils/store';

function preloadPath() {
  return path.join(isDev ? process.cwd() : app.getAppPath(), 'build', 'electron', 'preload', 'index.cjs');
}

function secureWebPreferences() {
  return {
    preload: preloadPath(),
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: true,
    webSecurity: true,
    allowRunningInsecureContent: false,
  };
}

function lockNavigation(win: BrowserWindow, rendererURL: string) {
  const rendererOrigin = new URL(rendererURL).origin;

  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (event, target) => {
    if (new URL(target).origin !== rendererOrigin) event.preventDefault();
  });
}

export function createWindow(rendererURL: string) {
  console.log('Creating CentralDark window with URL:', rendererURL);

  const bounds = store.get('bounds');
  const win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 980,
    minHeight: 680,
    ...bounds,
    title: 'CentralDark',
    backgroundColor: '#07110d',
    vibrancy: 'under-window',
    visualEffectState: 'active',
    webPreferences: secureWebPreferences(),
  });

  lockNavigation(win, rendererURL);
  win.loadURL(rendererURL).catch((error) => console.error('CENTRALDARK_MAIN_LOAD_FAILED', error));
  win.webContents.on('did-fail-load', (_, code, description) => {
    console.error('CENTRALDARK_MAIN_RENDERER_FAILED', { code, description });
  });

  if (isDev) win.webContents.openDevTools();

  const persistBounds = () => store.set('bounds', win.getBounds());
  win.on('moved', persistBounds);
  win.on('resized', persistBounds);

  return win;
}

export function createSolWidget(rendererURL: string) {
  const widgetBounds = store.get('solWidgetBounds');
  const win = new BrowserWindow({
    width: 390,
    height: 610,
    minWidth: 340,
    minHeight: 480,
    ...widgetBounds,
    title: 'SOL — CentralDark',
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: true,
    minimizable: false,
    maximizable: false,
    show: false,
    hasShadow: true,
    webPreferences: secureWebPreferences(),
  });

  win.setAlwaysOnTop(true, 'floating');
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  lockNavigation(win, rendererURL);

  const widgetURL = new URL('/sol-widget', rendererURL).toString();
  win.loadURL(widgetURL).catch((error) => console.error('SOL_WIDGET_LOAD_FAILED', error));
  win.once('ready-to-show', () => win.showInactive());

  const persistBounds = () => store.set('solWidgetBounds', win.getBounds());
  win.on('moved', persistBounds);
  win.on('resized', persistBounds);

  return win;
}
