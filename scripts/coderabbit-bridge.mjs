#!/usr/bin/env node
/* coderabbit-bridge.mjs
   Lightweight bridge: poll two "rabbit" systems, aggregate balance, post to CentralDark API
   Deterministic fallback: if any error or missing data, use balance=0 (zero-regression)
*/
import fs from 'fs';
import axios from 'axios';

const RABBIT_A = process.env.RABBIT_A_URL || 'http://localhost:3001/status';
const RABBIT_B = process.env.RABBIT_B_URL || 'http://localhost:3002/status';
const CENTRAL_URL = process.env.CENTRALDARK_API_URL || '';
const DEPENDA_URL = process.env.DEPENDA_BOT_URL || '';
const LOGDIR = process.env.LOGDIR || './logs';
const LOGFILE = `${LOGDIR}/coderabbit-bridge.log`;

if (!fs.existsSync(LOGDIR)) fs.mkdirSync(LOGDIR, { recursive: true });

function log(...args) {
  const line = `[${new Date().toISOString()}] ${args.join(' ')}\n`;
  fs.appendFileSync(LOGFILE, line);
  console.log(...args);
}

async function fetchBalance(url) {
  try {
    const res = await axios.get(url, { timeout: 8000 });
    // expected shape: { balance: number } or { data: { balance: number } }
    const b = res.data && (res.data.balance ?? res.data.data?.balance);
    if (typeof b === 'number') return b;
    throw new Error('invalid-balance-shape');
  } catch (err) {
    log('fetchBalance error for', url, err.message || err.toString());
    throw err;
  }
}

async function notifyCentral(payload) {
  if (!CENTRAL_URL) { log('CENTRALDARK_API_URL not set, skipping central notify'); return; }
  try {
    const r = await axios.post(CENTRAL_URL, payload, { timeout: 8000 });
    log('central response', r.status);
  } catch (err) {
    log('central notify failed', err.message || err.toString());
  }
}

async function notifyDependa(payload) {
  if (!DEPENDA_URL) { log('DEPENDA_BOT_URL not set, skipping dependa notify'); return; }
  try {
    const r = await axios.post(DEPENDA_URL, payload, { timeout: 8000 });
    log('dependa response', r.status);
  } catch (err) {
    log('dependa notify failed', err.message || err.toString());
  }
}

async function runOnce() {
  let balA, balB;
  try {
    balA = await fetchBalance(RABBIT_A);
  } catch (e) { balA = null; }
  try {
    balB = await fetchBalance(RABBIT_B);
  } catch (e) { balB = null; }

  let aggregated;
  if (typeof balA === 'number' || typeof balB === 'number') {
    aggregated = (Number(balA || 0) + Number(balB || 0));
  } else {
    // Deterministic fallback: zero to avoid regression
    aggregated = 0;
    log('Both balances missing — deterministic fallback to 0');
  }

  const payload = {
    source: 'coderabbit-bridge',
    timestamp: new Date().toISOString(),
    balances: { a: balA, b: balB },
    aggregated
n  };

  log('payload', JSON.stringify(payload));
  await notifyCentral(payload);
  await notifyDependa(payload);
}

(async function main(){
  try {
    if (process.argv.includes('--once')) {
      await runOnce();
      process.exit(0);
    }
    // otherwise run continuously every interval (default 5m)
    const interval = Number(process.env.INTERVAL_SECONDS || 300) * 1000;
    log('coderabbit-bridge starting, interval', interval);
    await runOnce();
    setInterval(runOnce, interval);
  } catch (err) {
    log('bridge fatal', err.message || err.toString());
    process.exit(1);
  }
})();
