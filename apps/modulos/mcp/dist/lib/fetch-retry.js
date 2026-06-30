// Fetch com retry exponencial pra erros transitórios.
// Retenta em: erros de rede, HTTP 408/425/429/500/502/503/504.
// Respeita header Retry-After (segundos) quando presente.
import { log } from "../log.js";
const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);
export async function fetchWithRetry(url, opts = {}) {
    const retries = opts.retries ?? 3;
    const baseDelay = opts.baseDelayMs ?? 400;
    const label = opts.label ?? "fetch";
    let lastErr;
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const res = await fetch(url, opts);
            if (!RETRYABLE_STATUS.has(res.status) || attempt === retries) {
                return res;
            }
            const retryAfter = Number(res.headers.get("retry-after") ?? "0");
            const delay = retryAfter > 0 ? retryAfter * 1000 : baseDelay * Math.pow(2, attempt);
            log.warn("fetch_retry_http", { label, status: res.status, attempt, delay });
            await sleep(delay);
        }
        catch (err) {
            lastErr = err;
            if (attempt === retries)
                throw err;
            const delay = baseDelay * Math.pow(2, attempt);
            log.warn("fetch_retry_network", { label, attempt, delay, error: String(err) });
            await sleep(delay);
        }
    }
    throw lastErr ?? new Error("fetch failed");
}
function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}
//# sourceMappingURL=fetch-retry.js.map