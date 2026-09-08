import logger from 'electron-log';
import type { MessageBoxOptions } from 'electron';
import { app, dialog } from 'electron';
import type { AppUpdater, UpdateDownloadedEvent, UpdateInfo } from 'electron-updater';
import path from 'node:path';

// NOTE: workaround to use electron-updater.
import * as electronUpdater from 'electron-updater';
import { isDev } from './constants';
import {
  markPendingUpdate,
  reconcilePendingUpdateCheckpoint,
  recordUpdateCheckpoint,
} from './update-checker';

const autoUpdater: AppUpdater = (electronUpdater as any).default.autoUpdater;

export async function setupAutoUpdater() {
  logger.transports.file.level = 'debug';
  autoUpdater.logger = logger;

  const currentVersion = app.getVersion();
  await reconcilePendingUpdateCheckpoint(currentVersion);
  await recordUpdateCheckpoint({
    phase: 'APP_START',
    status: 'PROVED',
    currentVersion,
    detail: '[CHECKER] DELTA ÚTIL aplicado, fluxo anterior continua',
  });

  const resourcePath = isDev
    ? path.join(process.cwd(), 'electron-update.yml')
    : path.join(app.getAppPath(), 'electron-update.yml');
  logger.info('Update config path:', resourcePath);
  autoUpdater.updateConfigPath = resourcePath;

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => {
    logger.info('checking-for-update...');
    void recordUpdateCheckpoint({
      phase: 'CHECK_FOR_UPDATE',
      status: 'UNKNOWN',
      currentVersion: app.getVersion(),
      detail: 'consulta iniciada; UNKNOWN até resposta do provider',
    });
  });

  autoUpdater.on('update-available', async (info: UpdateInfo) => {
    logger.info('Update available.', info);
    await recordUpdateCheckpoint({
      phase: 'UPDATE_AVAILABLE',
      status: 'PROVED',
      currentVersion: app.getVersion(),
      targetVersion: info.version,
      detail: 'provider informou atualização disponível',
    });

    const dialogOpts: MessageBoxOptions = {
      type: 'info' as const,
      buttons: ['Update', 'Later'],
      title: 'Application Update',
      message: `Version ${info.version} is available.`,
      detail: 'A new version is available. Would you like to update now?',
    };

    const response = await dialog.showMessageBox(dialogOpts);

    if (response.response === 0) {
      await recordUpdateCheckpoint({
        phase: 'PRE_DOWNLOAD',
        status: 'PROVED',
        currentVersion: app.getVersion(),
        targetVersion: info.version,
        detail: 'usuário autorizou download; aplicação ainda não atualizada',
      });
      void autoUpdater.downloadUpdate().catch(async (err) => {
        logger.error('Failed to download update:', err);
        await recordUpdateCheckpoint({
          phase: 'DOWNLOAD',
          status: 'BROKEN',
          currentVersion: app.getVersion(),
          targetVersion: info.version,
          detail: err?.message || String(err),
        });
      });
    }
  });

  autoUpdater.on('update-not-available', () => {
    logger.info('Update not available.');
    void recordUpdateCheckpoint({
      phase: 'CHECK_FOR_UPDATE',
      status: 'PROVED',
      currentVersion: app.getVersion(),
      detail: 'provider respondeu sem atualização disponível',
    });
  });

  autoUpdater.on('error', (err) => {
    logger.error('Error in auto-updater:', err);
    void recordUpdateCheckpoint({
      phase: 'AUTO_UPDATE',
      status: 'BROKEN',
      currentVersion: app.getVersion(),
      detail: err?.message || String(err),
    });
  });

  autoUpdater.on('download-progress', (progressObj) => {
    logger.info('Download progress:', progressObj);
  });

  autoUpdater.on('update-downloaded', async (event: UpdateDownloadedEvent) => {
    logger.info('Update downloaded:', formatUpdateDownloadedEvent(event));
    await recordUpdateCheckpoint({
      phase: 'DOWNLOAD_COMPLETE',
      status: 'PROVED',
      currentVersion: app.getVersion(),
      targetVersion: event.version,
      detail: 'download concluído pelo electron-updater; instalação ainda não provada',
    });

    const dialogOpts: MessageBoxOptions = {
      type: 'info' as const,
      buttons: ['Restart', 'Later'],
      title: 'Application Update',
      message: 'Update Downloaded',
      detail: 'A new version has been downloaded. Restart the application to apply the updates.',
    };

    const response = await dialog.showMessageBox(dialogOpts);

    if (response.response === 0) {
      await markPendingUpdate(app.getVersion(), event.version);
      autoUpdater.quitAndInstall(false);
    }
  });

  try {
    logger.info('Checking for updates. Current version:', app.getVersion());
    await autoUpdater.checkForUpdates();
  } catch (err: any) {
    logger.error('Failed to check for updates:', err);
    await recordUpdateCheckpoint({
      phase: 'CHECK_FOR_UPDATE',
      status: 'BROKEN',
      currentVersion: app.getVersion(),
      detail: err?.message || String(err),
    });
  }

  setInterval(
    () => {
      autoUpdater.checkForUpdates().catch((err: any) => {
        logger.error('Periodic update check failed:', err);
        void recordUpdateCheckpoint({
          phase: 'PERIODIC_UPDATE_CHECK',
          status: 'BROKEN',
          currentVersion: app.getVersion(),
          detail: err?.message || String(err),
        });
      });
    },
    4 * 60 * 60 * 1000,
  );
}

function formatUpdateDownloadedEvent(event: UpdateDownloadedEvent): string {
  return JSON.stringify({
    version: event.version,
    downloadedFile: event.downloadedFile,
    files: event.files.map((e) => ({ files: { url: e.url, size: e.size } })),
  });
}
