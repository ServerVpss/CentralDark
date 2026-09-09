import { app } from 'electron';

export const isDev = !(global.process.env.NODE_ENV === 'production' || app.isPackaged);
export const DEFAULT_PORT = 5173;

// Porta única do cérebro/roteador. Hermes é um braço atrás do Omni, não a entrada da superfície.
export const OMNI_ROUTER_BASE_URL = global.process.env.CENTRALDARK_OMNI_URL ?? 'http://127.0.0.1:8099';
export const HERMES_BASE_URL = global.process.env.CENTRALDARK_HERMES_URL ?? 'http://127.0.0.1:8645';
export const SCREENPIPE_BASE_URL = global.process.env.CENTRALDARK_SCREENPIPE_URL ?? 'http://127.0.0.1:3030';
export const CENTRALDARK_PUBLIC_API_URL = global.process.env.CENTRALDARK_PUBLIC_API_URL ?? 'http://127.0.0.1:8099/v1';
export const CENTRALDARK_PUBLIC_URL = global.process.env.CENTRALDARK_PUBLIC_URL ?? 'http://127.0.0.1:5173';
export const CENTRALDARK_BRIDGE_STATE_FILE = global.process.env.CENTRALDARK_BRIDGE_STATE_FILE ?? 'E:\\CentralDark\\_MAPA_CASA\\GARIMPO-CHEFE\\context\\centraldark-live-state.json';
export const DEFAULT_HOUSE_ROOT = 'E:\\CentralDark';
export const SOL_WIDGET_SHORTCUT = 'CommandOrControl+Shift+Space';
