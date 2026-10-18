import { app } from 'electron';

export const isDev = !(global.process.env.NODE_ENV === 'production' || app.isPackaged);
export const DEFAULT_PORT = 5173;

// Porta única do cérebro/roteador. Hermes é um braço atrás do Omni, não a entrada da superfície.
export const OMNI_ROUTER_BASE_URL = global.process.env.CENTRALDARK_OMNI_URL ?? 'http://127.0.0.1:8099';
export const HERMES_BASE_URL = global.process.env.CENTRALDARK_HERMES_URL ?? 'http://127.0.0.1:8787';
export const SCREENPIPE_BASE_URL = global.process.env.CENTRALDARK_SCREENPIPE_URL ?? 'http://127.0.0.1:3030';
export const CENTRALDARK_PUBLIC_API_URL = global.process.env.CENTRALDARK_PUBLIC_API_URL ?? 'https://api.centralldark.com/v1';
export const CENTRALDARK_PUBLIC_URL = global.process.env.CENTRALDARK_PUBLIC_URL ?? 'https://centralldark.com';
export const DEFAULT_HOUSE_ROOT = 'K:\\';
export const SOL_WIDGET_SHORTCUT = 'CommandOrControl+Shift+Space';
