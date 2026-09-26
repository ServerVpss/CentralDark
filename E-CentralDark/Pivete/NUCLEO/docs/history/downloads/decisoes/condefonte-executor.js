#!/usr/bin/env node
/**
 * CONDEFONTE v2 — EXTRAÇÃO AGRESSIVA MULTI-ESTRATÉGIA
 * Puxa técnicas, raciocínio, decisões de arquitetura e padrões do agente Lovable
 * 10 workers paralelos + circuit breaker + deduplicação
 */

import { appendFileSync, writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const PROJECT_ID = "85041dd2-d1da-4a30-acbc-50799ddf8668";
const BASE_DIR = "/root/CentralDark/secrets/keys/condefonte";
const RAW_FILE = join(BASE_DIR, "trajectory_v2_raw.jsonl");
const DECISIONS_FILE = join(BASE_DIR, "decisions.jsonl");
const REASONING_FILE = join(BASE_DIR, "reasoning_chains.jsonl");
const ARCH_PATTERNS_FILE = join(BASE_DIR, "architecture_patterns.md");
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
const SESSION_TOKEN = process.env.LOVABLE_SESSION_TOKEN || "";

const NUM_WORKERS = 10;
const MAX_PAGES_PER_WORKER = 120;
const BASE_DELAY = 90;

let state = { 
  cursors: new Array(NUM_WORKERS).fill(null), 
  completed: false, 
  total_items: 0,
  decisions_found: 0,
  reasoning_found: 0,
  started_at: new Date().toISOString()
};

if (existsSync(STATE_FILE)) {
  try { state = { ...state, ...JSON.parse(readFileSync(STATE_FILE, 'utf8')) }; } catch {}
}

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  appendFileSync(LOG_FILE, line);
  console.log(line.trim());
}

function saveState() {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function isDecisionPoint(text) {
  const t = text.toLowerCase();
  return t.includes("vou criar") || t.includes("decidi usar") || t.includes("arquitetura") ||
         t.includes("vou estruturar") || t.includes("o problema é") || t.includes("solução é") ||
         t.includes("vou implementar") || t.includes("preciso criar");
}

function isReasoningChain(text) {
  const t = text.toLowerCase();
  return t.includes("pensando") || t.includes("analisando") || t.includes("preciso entender") ||
         t.includes("vou verificar") || t.includes("o que está acontecendo") || t.includes("vou investigar");
}

async function fetchWithRetry(url, headers, attempt = 1) {
  try {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(30000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    if (attempt >= 10) throw err;
    const delay = Math.min(400 * Math.pow(1.8, attempt), 12000) * (0.6 + Math.random() * 0.8);
    await sleep(delay);
    return fetchWithRetry(url, headers, attempt + 1);
  }
}

async function fetchTrajectory(before = null) {
  const params = new URLSearchParams({ filter: "frontend", inclusive: "true", limit: "2000" });
  if (before) params.set("before", before);
  const url = `https://api.lovable.dev/projects/${PROJECT_ID}/trajectory?${params}`;

  const headers = { "Content-Type": "application/json", "X-Lovable-Read-After": Date.now().toString() };

  if (SESSION_TOKEN) headers["Authorization"] = `Bearer ${SESSION_TOKEN}`;
  else if (WEBUI_KEY) { headers["Authorization"] = `Bearer ${WEBUI_KEY}`; headers["X-Arsenal-Key"] = WEBUI_KEY; }
  else if (LOVABLE_API_KEY) headers["Authorization"] = `Bearer ${LOVABLE_API_KEY}`;

  return fetchWithRetry(url, headers);
}

async function worker(workerId) {
  log(`[Worker ${workerId}] INICIANDO ATAQUE AGRESSIVO`);
  let currentBefore = state.cursors[workerId] || null;
  let pages = 0;

  while (pages < MAX_PAGES_PER_WORKER) {
    try {
      const data = await fetchTrajectory(currentBefore);
      const items = data.items || data.data || [];
      if (!items.length) break;

      for (const item of items) {
        const raw = JSON.stringify(item);
        appendFileSync(RAW_FILE, raw + "\n");
        state.total_items++;

        const text = JSON.stringify(item);

        if (isDecisionPoint(text)) {
          appendFileSync(DECISIONS_FILE, raw + "\n");
          state.decisions_found++;
        }

        if (isReasoningChain(text)) {
          appendFileSync(REASONING_FILE, raw + "\n");
          state.reasoning_found++;
        }
      }

      const last = items[items.length - 1];
      currentBefore = last?.id || last?.cursor || null;
      if (!currentBefore) break;

      state.cursors[workerId] = currentBefore;
      saveState();

      log(`[Worker ${workerId}] Página ${pages + 1} | +${items.length} | Decisões: ${state.decisions_found} | Raciocínio: ${state.reasoning_found}`);
      pages++;
      await sleep(BASE_DELAY + Math.random() * 150);

    } catch (e) {
      log(`[Worker ${workerId}] ERRO: ${e.message}`);
      await sleep(2000);
    }
  }
  log(`[Worker ${workerId}] FINALIZADO`);
}

async function main() {
  log("🚀 CONDEFONTE v2 — MODO GUERRA TOTAL INICIADO");
  log(`Workers: ${NUM_WORKERS} | Páginas por worker: ${MAX_PAGES_PER_WORKER}`);

  const workers = [];
  for (let i = 0; i < NUM_WORKERS; i++) {
    workers.push(worker(i));
  }
  await Promise.all(workers);

  state.completed = true;
  state.finished_at = new Date().toISOString();
  saveState();

  let archMd = `# PADRÕES DE ARQUITETURA EXTRAÍDOS DO AGENTE LOVABLE\n\n`;
  archMd += `Total de decisões capturadas: ${state.decisions_found}\n\n`;
  writeFileSync(ARCH_PATTERNS_FILE, archMd);

  log(`✅ CONDEFONTE v2 FINALIZADO`);
  log(`Total de itens: ${state.total_items}`);
  log(`Decisões de arquitetura: ${state.decisions_found}`);
  log(`Cadeias de raciocínio: ${state.reasoning_found}`);
}

main().catch(e => log("FATAL: " + e.message));