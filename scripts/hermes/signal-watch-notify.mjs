#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  classifyExternalSignal,
  renderGamifiedCard,
  scanHermesCore,
} from '../../apps/modulos/HERMES-CORE/agents/Signal-Watcher/agent.mjs';
import { notifyCentralDarkSignal } from '../webhook/lib/notify-telegram.mjs';

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

async function main() {
  let result;
  if (process.argv.includes('--scan-core')) {
    result = await scanHermesCore(argValue('--core') || undefined);
  } else {
    const encoded = argValue('--event-b64');
    const eventFile = argValue('--event-file');
    let event = {};
    if (encoded) event = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    else if (eventFile) event = JSON.parse(await readFile(resolve(eventFile), 'utf8'));
    else throw new Error('use --scan-core, --event-b64 ou --event-file');
    result = classifyExternalSignal(event);
  }

  const card = renderGamifiedCard(result);
  const material = !['NO_DELTA', 'PROVEN'].includes(result.state) || process.argv.includes('--notify-proven');
  let notification = { ok: true, reason: 'not_requested' };
  if (process.argv.includes('--notify') && material) {
    notification = await notifyCentralDarkSignal({
      state: result.state,
      title: result.mode === 'hermes_core_scan' ? 'Hermes Core Watch' : 'External Signal Watch',
      card,
      source: result.source || result.mode,
    });
  }

  process.stdout.write(`${JSON.stringify({ ...result, card, notification }, null, 2)}\n`);
  if (result.state === 'FAIL') process.exitCode = 2;
}

main().catch((error) => {
  process.stderr.write(`${error?.stack || error?.message || error}\n`);
  process.exitCode = 1;
});
