// 🩸 Rate limiter (token bucket) + backoff exponencial 429/5xx.
const BUCKETS = new Map();
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export function bucketFor(modelo, { rpm = 15, burst = 5 } = {}) {
  let b = BUCKETS.get(modelo); if (b) return b;
  b = { modelo, rpm, burst, tokens: burst, ultimoRefill: Date.now(), cooldownAte: 0, strikes: 0,
    async take() {
      if (Date.now() < this.cooldownAte) await sleep(this.cooldownAte - Date.now());
      const g = ((Date.now() - this.ultimoRefill) / 1000) * (this.rpm / 60);
      if (g >= 1) { this.tokens = Math.min(this.burst, this.tokens + Math.floor(g)); this.ultimoRefill = Date.now(); }
      if (this.tokens < 1) { await sleep(Math.ceil(((1 - this.tokens) / (this.rpm / 60)) * 1000)); this.tokens += 1; }
      this.tokens -= 1;
    },
    marcar429() { this.strikes = Math.min(6, this.strikes + 1); const cd = Math.min(600000, 30000 * Math.pow(2, this.strikes - 1)); this.cooldownAte = Date.now() + cd; return cd; },
    marcarSucesso() { if (this.strikes > 0) this.strikes -= 1; },
  };
  BUCKETS.set(modelo, b); return b;
}
export async function chamarComBackoff(bucket, fn, { maxTentativas = 5, log = console.log } = {}) {
  let t = 0;
  while (t < maxTentativas) {
    t++; await bucket.take();
    try { const res = await fn(); bucket.marcarSucesso(); return { ok: true, tentativa: t, res }; }
    catch (e) {
      const s = e?.status || e?.response?.status;
      if (s === 429 || /429|rate|quota/i.test(String(e?.message))) { const cd = bucket.marcar429(); log(`⚠️  [${bucket.modelo}] 429 ${t}/${maxTentativas} cd ${(cd/1000).toFixed(0)}s`); continue; }
      if (s && s >= 500) { const w = 2000 * t; log(`⚠️  [${bucket.modelo}] ${s} aguarda ${w}ms`); await sleep(w); continue; }
      return { ok: false, tentativa: t, erro: e?.message || String(e), status: s };
    }
  }
  return { ok: false, tentativa: t, erro: 'MAX_TENTATIVAS' };
}
