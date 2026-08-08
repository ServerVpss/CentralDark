import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_NOTIFY_PATH = path.resolve(HERE, '../../apps/modulos/HERMES-CORE/utils/notify.mjs');

function clean(value, max = 180) {
  return String(value ?? '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

export function formatHermesEvent(event) {
  const type = event?.type;
  if (type !== 'ALERT' && type !== 'RECOVERY') {
    throw new TypeError('event.type deve ser ALERT ou RECOVERY');
  }

  const area = clean(event?.area || 'Sentinela');
  const title = clean(event?.title || event?.titulo || 'mudança de estado');
  const issue = Number(event?.issueNumber || 0);
  const url = clean(event?.url || '', 240);

  const prefix = type === 'ALERT' ? '🔴 SENTINELA' : '🟢 RECUPERAÇÃO';
  const lines = [
    `${prefix} · ${area}`,
    title,
    issue > 0 ? `Issue: #${issue}` : null,
    url ? `Ref: ${url}` : null,
  ].filter(Boolean);

  return {
    title: type === 'ALERT' ? 'Sentinela — mudança real' : 'Sentinela — recuperação',
    message: lines.join('\n'),
  };
}

export function notifyViaHermes(event, {
  spawn = spawnSync,
  notifyPath = DEFAULT_NOTIFY_PATH,
  nodePath = process.execPath,
} = {}) {
  const card = formatHermesEvent(event);
  const result = spawn(nodePath, [notifyPath, card.title, card.message], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const output = `${result?.stdout || ''}\n${result?.stderr || ''}`;
  if (result?.error || result?.status !== 0) {
    return { status: 'FAILED', output: clean(output, 300) };
  }
  if (/\[notify\] enviado/i.test(output)) {
    return { status: 'SENT' };
  }
  if (/sem token válido/i.test(output)) {
    return { status: 'UNAVAILABLE' };
  }
  if (/telegram falhou|\[notify\] erro:/i.test(output)) {
    return { status: 'FAILED', output: clean(output, 300) };
  }
  return { status: 'UNKNOWN', output: clean(output, 300) };
}
