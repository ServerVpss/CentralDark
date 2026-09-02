import { app } from 'electron';

export const isDev = !(global.process.env.NODE_ENV === 'production' || app.isPackaged);
export const DEFAULT_PORT = 5173;
export const HERMES_BASE_URL = global.process.env.CENTRALDARK_HERMES_URL ?? 'http://127.0.0.1:8787';
export const SCREENPIPE_BASE_URL = global.process.env.CENTRALDARK_SCREENPIPE_URL ?? 'http://127.0.0.1:3030';
export const CENTRALDARK_PUBLIC_URL = global.process.env.CENTRALDARK_PUBLIC_URL ?? 'https://centralldark.com';
export const DEFAULT_HOUSE_ROOT = 'E:\\CentralDark';
export const SOL_WIDGET_SHORTCUT = 'CommandOrControl+Shift+Space';
