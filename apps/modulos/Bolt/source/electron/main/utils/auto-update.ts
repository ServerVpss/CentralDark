import logger from 'electron-log';
import { app } from 'electron';
import type { AppUpdater, UpdateDownloadedEvent, UpdateInfo } from 'electron-updater';
import path from 'node:path';

import * as electronUpdater from 'electron-updater';
import { isDev } from './constants';

const autoUpdater: AppUpdater = (electronUpdater as any).default.autoUpdater;

export type CentralDarkUpdateStatus = 'IDLE' | 'CHECKING' | 'UP_TO_DATE' | 'AVAILABLE' | 'DOWNLOADING' | 'DOWNLOADED' | 'ERROR';
export type CentralDarkUpdateState = {
  status: CentralDarkUpdateStatus;
  currentVersion: string;
  availableVersion?: string;
  progress?: number;
  error?: string;
};

let updateState: CentralDarkUpdateState = { status: 'IDLE', currentVersion: app.getVersion() };

function setUpdateState(patch: Partial<CentralDarkUpdateState>) {
  updateState = { ...updateState, ...patch, currentVersion: app.getVersion() };
  logger.info('CENTRALDARK_UPDATE_STATE', updateState);
}

export function getUpdateState(): CentralDarkUpdateState {
  return { ...updateState };
}

export async function checkForUpdatesNow(): Promise<CentralDarkUpdateState> {
  if (isDev) {
    setUpdateState({ status: 'UP_TO_DATE', availableVersion: undefined, error: undefined });
    return getUpdateState();
  }
  try {
    setUpdateState({ status: 'CHECKING', error: undefined, progress: undefined });
    await autoUpdater.checkForUpdates();
  } catch (error) {
    setUpdateState({ status: 'ERROR', error: error instanceof Error ? error.message : String(error) });
  }
  return getUpdateState();
}

export async function downloadUpdateNow(): Promise<CentralDarkUpdateState> {
  if (updateState.status !== 'AVAILABLE') return getUpdateState();
  try {
    setUpdateState({ status: 'DOWNLOADING', progress: 0, error: undefined });
    await autoUpdater.downloadUpdate();
  } catch (error) {
    setUpdateState({ status: 'ERROR', error: error instanceof Error ? error.message : String(error) });
  }
  return getUpdateState();
}

export function installDownloadedUpdate(): CentralDarkUpdateState {
  if (updateState.status !== 'DOWNLOADED') return getUpdateState();
  autoUpdater.quitAndInstall(false, true);
  return getUpdateState();
}

export async function setupAutoUpdater() {
  logger.transports.file.level = 'debug';
  autoUpdater.logger = logger;

  const resourcePath = isDev
    ? path.join(process.cwd(), 'electron-update.yml')
    : path.join(app.getAppPath(), 'electron-update.yml');
  logger.info('Update config path:', resourcePath);
  autoUpdater.updateConfigPath = resourcePath;
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => {
    setUpdateState({ status: 'CHECKING', error: undefined });
  });

  autoUpdater.on('update-available', (info: UpdateInfo) => {
    setUpdateState({ status: 'AVAILABLE', availableVersion: info.version, error: undefined });
  });

  autoUpdater.on('update-not-available', (info: UpdateInfo) => {
    setUpdateState({ status: 'UP_TO_DATE', availableVersion: info.version, error: undefined, progress: undefined });
  });

  autoUpdater.on('download-progress', (progress) => {
    setUpdateState({ status: 'DOWNLOADING', progress: Math.max(0, Math.min(100, Math.round(progress.percent))) });
  });

  autoUpdater.on('update-downloaded', (event: UpdateDownloadedEvent) => {
    logger.info('Update downloaded:', formatUpdateDownloadedEvent(event));
    setUpdateState({ status: 'DOWNLOADED', availableVersion: event.version, progress: 100, error: undefined });
  });

  autoUpdater.on('error', (error) => {
    setUpdateState({ status: 'ERROR', error: error?.message || String(error) });
  });

  await checkForUpdatesNow();
  setInterval(() => { void checkForUpdatesNow(); }, 4 * 60 * 60 * 1000);
}

function formatUpdateDownloadedEvent(event: UpdateDownloadedEvent): string {
  return JSON.stringify({
    version: event.version,
    downloadedFile: event.downloadedFile,
    files: event.files.map((entry) => ({ url: entry.url, size: entry.size })),
  });
}
