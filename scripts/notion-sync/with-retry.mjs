/**
 * 🛡️ Notion Retry Wrapper
 *
 * Envelopa o cliente @notionhq/client com:
 *   1. Throttle global (min ~350ms entre chamadas → ~3 req/s, o teto do Notion).
 *   2. Retry exponencial com jitter em 429 / 5xx / erros de rede.
 *   3. Respeito ao header `Retry-After` quando o Notion mandar.
 *
 * Uso:
 *   import { wrap } from "./with-retry.mjs";
 *   const notion = wrap(new Client({ auth: TOKEN }));
 *
 * Envelopa só os 3 métodos que a gente usa:
 *   notion.databases.query
 *   notion.pages.create
 *   notion.pages.update
 */

const MIN_INTERVAL_MS = Number(process.env.NOTION_MIN_INTERVAL_MS || 350);
const MAX_RETRIES = Number(process.env.NOTION_MAX_RETRIES || 6);
const BASE_BACKOFF_MS = Number(process.env.NOTION_BASE_BACKOFF_MS || 1000);
const MAX_BACKOFF_MS = Number(process.env.NOTION_MAX_BACKOFF_MS || 30_000);

// Fila serial global — garante intervalo mínimo entre QUALQUER chamada.
let queue = Promise.resolve();
let lastCallAt = 0;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function schedule(task) {
  const run = async () => {
    const now = Date.now();
    const wait = Math.max(0, lastCallAt + MIN_INTERVAL_MS - now);
    if (wait > 0) await sleep(wait);
    lastCallAt = Date.now();
    return task();
  };
  const next = queue.then(run, run);
  // Não deixa a fila quebrar se uma tarefa der erro.
  queue = next.catch(() => {});
  return next;
}

function isRetriable(err) {
  const status = err?.status || err?.statusCode || err?.code;
  if (status === 429) return true;
  if (typeof status === "number" && status >= 500 && status < 600) return true;
  // Erros de rede/DNS/socket
  const code = err?.code;
  if (["ETIMEDOUT", "ECONNRESET", "ECONNREFUSED", "EAI_AGAIN", "ENOTFOUND"].includes(code)) return true;
  const msg = String(err?.message || "");
  if (/rate.?limit|timeout|socket hang up|fetch failed/i.test(msg)) return true;
  return false;
}

function retryAfterMs(err) {
  // SDK do Notion expõe headers em err.headers em alguns casos; tenta várias formas.
  const h =
    err?.headers?.get?.("retry-after") ||
    err?.headers?.["retry-after"] ||
    err?.response?.headers?.get?.("retry-after") ||
    err?.body?.retry_after;
  if (!h) return null;
  const n = Number(h);
  if (Number.isFinite(n) && n > 0) return Math.min(n * 1000, MAX_BACKOFF_MS);
  return null;
}

async function callWithRetry(label, fn) {
  let attempt = 0;
  while (true) {
    try {
      return await schedule(fn);
    } catch (err) {
      const canRetry = attempt < MAX_RETRIES && isRetriable(err);
      if (!canRetry) throw err;
      const forced = retryAfterMs(err);
      const backoff =
        forced ??
        Math.min(MAX_BACKOFF_MS, BASE_BACKOFF_MS * 2 ** attempt) +
          Math.floor(Math.random() * 400);
      const status = err?.status || err?.code || "?";
      console.warn(
        `[notion-retry] ${label} falhou (status=${status}, tentativa ${attempt + 1}/${MAX_RETRIES}), aguardando ${backoff}ms…`
      );
      await sleep(backoff);
      attempt++;
    }
  }
}

export function wrap(notion) {
  const origDbQuery = notion.databases.query.bind(notion.databases);
  const origPageCreate = notion.pages.create.bind(notion.pages);
  const origPageUpdate = notion.pages.update.bind(notion.pages);

  notion.databases.query = (args) => callWithRetry("databases.query", () => origDbQuery(args));
  notion.pages.create = (args) => callWithRetry("pages.create", () => origPageCreate(args));
  notion.pages.update = (args) => callWithRetry("pages.update", () => origPageUpdate(args));

  return notion;
}
