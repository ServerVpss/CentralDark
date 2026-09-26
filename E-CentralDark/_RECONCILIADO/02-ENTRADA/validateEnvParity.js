// [config-guard] Compara o .env em disco com o ENV REAL do processo PM2.
// Motivo: editar o .env não basta — o processo PM2 só recarrega com
// `pm2 restart MultiZap-Gateway --update-env`. Esse check pega divergência.
//
// Para secrets, comparamos só presença + hash truncado SHA256 (nunca o valor).

const fs = require('fs');
const crypto = require('crypto');

const COMPARE_VARS_PUBLIC = [
  'MULTIZAP_WEBHOOK_URL',
  'GATEWAY_PUBLIC_URL',
  'WUZAPI_BASE_URL',
  'NODE_ENV',
  'PORT',
  'LOG_LEVEL',
];

const COMPARE_VARS_SECRET = [
  'MULTIZAP_WEBHOOK_SECRET',
  'MULTIZAP_GATEWAY_TOKEN',
  'WUZAPI_WEBHOOK_SECRET',
  'WUZAPI_ADMIN_TOKEN',
];

function parseDotEnv(text) {
  const out = {};
  if (!text) return out;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function fingerprint(value) {
  if (value == null || value === '') return null;
  return crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 12);
}

function readDotEnvFile(path) {
  try {
    if (!fs.existsSync(path)) return { ok: false, reason: 'arquivo_nao_encontrado', path, vars: {} };
    const text = fs.readFileSync(path, 'utf8');
    return { ok: true, path, vars: parseDotEnv(text) };
  } catch (err) {
    return { ok: false, reason: 'erro_leitura', path, error: err && err.message, vars: {} };
  }
}

function compareEnvParity(opts = {}) {
  const path =
    opts.dotenvPath ||
    process.env.DOTENV_PATH ||
    '/root/Multizap/gateway/.env';

  const disk = readDotEnvFile(path);
  const proc = process.env;

  const divergences = [];

  for (const key of COMPARE_VARS_PUBLIC) {
    const fromDisk = disk.vars[key];
    const fromProc = proc[key];
    if (fromDisk == null && fromProc == null) continue;
    if (fromDisk !== fromProc) {
      divergences.push({
        var: key,
        kind: 'public',
        diskValue: fromDisk == null ? '(ausente)' : fromDisk,
        procValue: fromProc == null ? '(ausente)' : fromProc,
        hint: 'pm2 restart MultiZap-Gateway --update-env && pm2 save',
      });
    }
  }

  for (const key of COMPARE_VARS_SECRET) {
    const fromDisk = disk.vars[key];
    const fromProc = proc[key];
    if (fromDisk == null && fromProc == null) continue;
    const fpDisk = fingerprint(fromDisk);
    const fpProc = fingerprint(fromProc);
    if (fpDisk !== fpProc) {
      divergences.push({
        var: key,
        kind: 'secret',
        diskFingerprint: fpDisk || '(ausente)',
        procFingerprint: fpProc || '(ausente)',
        hint: 'pm2 restart MultiZap-Gateway --update-env && pm2 save',
      });
    }
  }

  return {
    ok: divergences.length === 0 && disk.ok,
    dotenvOk: disk.ok,
    dotenvPath: disk.path,
    dotenvError: disk.reason || null,
    divergences,
  };
}

module.exports = { compareEnvParity, COMPARE_VARS_PUBLIC, COMPARE_VARS_SECRET };
