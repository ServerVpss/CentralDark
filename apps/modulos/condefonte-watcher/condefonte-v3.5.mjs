#!/usr/bin/env node
/**
 * CONDEFONTE v2.3 — EXTRAÇÃO COM SUPORTE A JWT DO BROWSER
 * Detecta 401 e avisa para renovar o token
 */
import { appendFileSync, writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const PROJECT_ID = "85041dd2-d1da-4a30-acbc-50799ddf8668";
const BASE_DIR = "/root/CentralDark/apps/modulos/condefonte-watcher";
const RAW_FILE = join(BASE_DIR, "trajectory_v2_raw.jsonl");
const DECISIONS_FILE = join(BASE_DIR, "decisions.jsonl");
const REASONING_FILE = join(BASE_DIR, "reasoning_chains.jsonl");
const STATE_FILE = join(BASE_DIR, "state_v2.json");
const LOG_FILE = join(BASE_DIR, "condefonte_v2.log");

mkdirSync(BASE_DIR, { recursive: true });

function loadKeys() {
  const envPath = "/root/CentralDark/secrets/keys/keys.env";
  const content = readFileSync(envPath, 'utf8');
  const keys = {};
  content.split('\n').forEach(line => {
    const [k, v] = line.split('=');
    if (k && v) keys[k.trim()] = v.trim();
  });
  return keys;
}

const KEYS = loadKeys();
const WEBUI_KEY = KEYS.WEBUI_LOVABLE_KEY || "";
const LOVABLE_API_KEY = KEYS.LOVABLE_API_KEY || "";
const SESSION_JWT = process.env.LOVABLE_SESSION_JWT || "";

const NUM_WORKERS = 10;
const MAX_PAGES = 150;
let BASE_DELAY = 95;

let state = { cursors: new Array(NUM_WORKERS).fill(null), completed: false, total_items: 0, decisions_found: 0, reasoning_found: 0, errors_401: 0, started_at: new Date().toISOString() };
if (existsSync(STATE_FILE)) { try { state = { ...state, ...JSON.parse(readFileSync(STATE_FILE, 'utf8')) }; } catch {} }

function log(msg) { const line = `[${new Date().toISOString()}] ${msg}\n`; appendFileSync(LOG_FILE, line); console.log(line.trim()); }
function saveState() { writeFileSync(STATE_FILE, JSON.stringify(state, null, 2)); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function isDecisionPoint(text) {
  const t = text.toLowerCase();
  return t.includes("vou criar") || t.includes("decidi usar") || t.includes("arquitetura") || t.includes("vou estruturar") || t.includes("o problema é");
}

function isReasoningChain(text) {
  const t = text.toLowerCase();
  return t.includes("pensando") || t.includes("analisando") || t.includes("preciso entender") || t.includes("vou verificar");
}

async function fetchWithRetry(url, headers, workerId, attempt = 1) {
  try {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(30000) });

    if (res.status === 401 || res.status === 403) {
      state.errors_401++;
      saveState();
      log(`[Worker ${workerId}] ❌ 401/403 — TOKEN EXPIRADO OU INVÁLIDO`);
      log(`[Worker ${workerId}] ⚠️  Cole novo JWT do browser na variável LOVABLE_SESSION_JWT`);
      await sleep(8000);
      return null;
    }

    if (res.status === 429) {
      log(`[Worker ${workerId}] 429 Too Many Requests — reduzindo velocidade`);
      await sleep(5000);
      return fetchWithRetry(url, headers, workerId, attempt + 1);
    }

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();

  } catch (err) {
    if (attempt >= 5) throw err;
    await sleep(800 * attempt);
    return fetchWithRetry(url, headers, workerId, attempt + 1);
  }
}

async function fetchTrajectory(before = null) {
  const params = new URLSearchParams({ filter: "frontend", inclusive: "true", limit: "2000" });
  if (before) params.set("before", before);
  const url = `https://api.lovable.dev/projects/${PROJECT_ID}/trajectory?${params}`;

  const headers = { "Content-Type": "application/json", "X-Lovable-Read-After": Date.now().toString() };

  if (SESSION_JWT) {
    headers["Authorization"] = `Bearer ${SESSION_JWT}`;
  } else if (WEBUI_KEY) {
    headers["Authorization"] = `Bearer ${WEBUI_KEY}`;
    headers["X-Arsenal-Key"] = WEBUI_KEY;
  } else if (LOVABLE_API_KEY) {
    headers["Authorization"] = `Bearer ${LOVABLE_API_KEY}`;
  }

  return fetchWithRetry(url, headers);
}

async function worker(workerId) {
  log(`[Worker ${workerId}] INICIANDO`);
  let currentBefore = state.cursors[workerId] || null;
  let pages = 0;

  while (pages < MAX_PAGES) {
    try {
      const data = await fetchTrajectory(currentBefore);
      if (!data) { await sleep(10000); continue; }

      const items = data.items || data.data || [];
      if (!items.length) break;

      for (const item of items) {
        const raw = JSON.stringify(item);
        appendFileSync(RAW_FILE, raw + "\n");
        state.total_items++;

        const text = JSON.stringify(item);
        if (isDecisionPoint(text)) { appendFileSync(DECISIONS_FILE, raw + "\n"); state.decisions_found++; }
        if (isReasoningChain(text)) { appendFileSync(REASONING_FILE, raw + "\n"); state.reasoning_found++; }
      }

      const last = items[items.length - 1];
      currentBefore = last?.id || last?.cursor || null;
      if (!currentBefore) break;

      state.cursors[workerId] = currentBefore;
      if (state.total_items % 50 === 0) saveState();

      log(`[Worker ${workerId}] Página ${pages + 1} | +${items.length} | Decisões: ${state.decisions_found}`);
      pages++;
      await sleep(BASE_DELAY + Math.random() * 120);

    } catch (e) {
      log(`[Worker ${workerId}] ERRO: ${e.message}`);
      await sleep(4000);
    }
  }
  log(`[Worker ${workerId}] FINALIZADO`);
}

async function main() {
  log("🚀 CONDEFONTE v2.3 INICIADO");
  if (!SESSION_JWT) {
    log("⚠️ AVISO: LOVABLE_SESSION_JWT não definido — vai dar 401");
  }
  const workers = [];
  for (let i = 0; i < NUM_WORKERS; i++) workers.push(worker(i));
  await Promise.all(workers);
  state.completed = true;
  state.finished_at = new Date().toISOString();
  saveState();
  log(`✅ FINALIZADO | Itens: ${state.total_items} | Decisões: ${state.decisions_found} | 401s: ${state.errors_401}`);
}

main().catch(e => log("FATAL: " + e.message));
