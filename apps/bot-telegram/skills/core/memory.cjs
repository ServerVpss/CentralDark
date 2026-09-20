const fs = require('fs');
const path = require('path');

const MEMORY_FILE = path.join(__dirname, '..', 'config', 'memory.json');
const MAX = 500;

function normalizeStore(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.records)) return raw.records;
  return [];
}

function loadRawStore() {
  try { return JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf-8')); }
  catch { return []; }
}

function loadStore() {
  return normalizeStore(loadRawStore());
}

function saveStore(store) {
  const safeStore = normalizeStore(store).slice(-MAX);
  try {
    fs.writeFileSync(MEMORY_FILE, JSON.stringify({ records: safeStore }, null, 2));
  } catch {}
}

const memoryStore = loadStore();

function save(entry) {
  memoryStore.push(entry);
  saveStore(memoryStore);
}

function getAll() {
  return memoryStore;
}

function getLast(n) {
  n = n || 5;
  return memoryStore.slice(-n);
}

function size() {
  return memoryStore.length;
}

function clear() {
  memoryStore.length = 0;
  saveStore(memoryStore);
}

function successRate() {
  if (memoryStore.length === 0) return { rate: 0, total: 0 };
  const ok = memoryStore.filter(r => r.result === 'success').length;
  return { rate: Math.round((ok / memoryStore.length) * 100), total: memoryStore.length, successes: ok };
}

module.exports = { save, getAll, getLast, size, clear, successRate };
